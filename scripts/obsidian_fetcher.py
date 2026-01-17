import urllib.request
import urllib.error
import json
import datetime
import os
import sys
import time
import xml.etree.ElementTree as ET

# ==============================================================================
# 用户配置区域 (USER CONFIGURATION AREA)
# ==============================================================================

# 1. GitHub Token 设置
# --------------------
# 强烈建议配置 Token 以提高 API 访问速率限制 (Rate Limit)。
# 在 GitHub Actions 中，将自动从 Secrets 或环境变量读取 GITHUB_TOKEN。
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# 2. API 请求头设置
# -----------------
# 模拟浏览器身份，防止被防爬虫机制拦截
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json"
}

# 3. 论坛与仓库地址配置
# ---------------------
CONFIG = {
    "chinese_forum": {
        "base_url": "https://forum-zh.obsidian.md",
        "category_url": "https://forum-zh.obsidian.md/c/8.json", # 经验分享
        "name": "Obsidian Chinese Forum"
    },
    "english_forum": {
        "base_url": "https://forum.obsidian.md",
        "category_url": "https://forum.obsidian.md/c/share-showcase/9.json", # Share & Showcase
        "name": "Obsidian English Forum"
    },
    "github_repo": "obsidianmd/obsidian-releases",
    "reddit": {
        "url": "https://www.reddit.com/r/ObsidianMD/new.rss?limit=50", # Use RSS to avoid JSON 403
        "name": "Reddit ObsidianMD"
    }
}

# ==============================================================================
# 脚本逻辑区域 (SCRIPT LOGIC) - 以下内容通常无需修改
# ==============================================================================

# 构造 GitHub 请求头
GITHUB_HEADERS = HEADERS.copy()
if GITHUB_TOKEN:
    GITHUB_HEADERS["Authorization"] = f"token {GITHUB_TOKEN}"


def get_json(url, headers=HEADERS):
    """
    通用函数：从指定 URL 获取 JSON 数据。
    Generic function to fetch JSON from a URL.
    """
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = response.read().decode('utf-8')
                return json.loads(data)
    except urllib.error.HTTPError as e:
        print(f"⚠️  HTTP Error fetching {url}: {e.code} {e.reason}")
        if e.code == 429:
             print("   (Rate Limited. Try again later or check User-Agent.)")
    except Exception as e:
        print(f"⚠️  Error fetching {url}: {e}")
    return None

def parse_iso_time(time_str):
    """
    解析 ISO 8601 时间字符串为 UTC datetime 对象。
    Parse ISO 8601 time string to UTC datetime object.
    """
    if not time_str:
        return None
    # 替换 Z 为 +00:00 以兼容 fromisoformat (Python 3.7+)
    if time_str.endswith('Z'):
        time_str = time_str[:-1] + '+00:00'
    return datetime.datetime.fromisoformat(time_str)

def get_yesterday_range():
    """
    获取昨天 UTC 的起始和结束时间。
    Get the start and end datetime for yesterday in UTC.
    """
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    today = now_utc.date()
    yesterday_date = today - datetime.timedelta(days=1)
    
    # 构造昨天的 00:00:00 到 23:59:59 (UTC)
    start_time = datetime.datetime.combine(yesterday_date, datetime.time.min).replace(tzinfo=datetime.timezone.utc)
    end_time = datetime.datetime.combine(yesterday_date, datetime.time.max).replace(tzinfo=datetime.timezone.utc)
    
    return start_time, end_time, yesterday_date

def fetch_discourse_topics(forum_name, base_url, category_api_url, start_time, end_time):
    """
    从 Discourse 论坛（如 Obsidian 官方论坛）获取昨天的帖子。
    Fetch yesterday's topics from a Discourse forum.
    """
    print(f"🔍 [{forum_name}] Checking for new topics...")
    data = get_json(category_api_url)
    if not data or 'topic_list' not in data:
        print(f"❌ [{forum_name}] Failed to fetch topic list.")
        return []

    new_topics = []
    topics = data['topic_list'].get('topics', [])
    
    for topic in topics:
        created_at_str = topic.get('created_at')
        created_at = parse_iso_time(created_at_str)
        
        # 验证是否在昨天的时间范围内
        if created_at and start_time <= created_at <= end_time:
            topic_id = topic.get('id')
            slug = topic.get('slug')
            title = topic.get('title')
            
            # 获取帖子详情以拿到内容摘要
            # Fetch topic details to get content summary
            detail_url = f"{base_url}/t/{slug}/{topic_id}.json"
            detail_data = get_json(detail_url)
            
            content = ""
            if detail_data:
                try:
                    # 获取第一条帖子（楼主）的内容
                    content = detail_data['post_stream']['posts'][0]['cooked']
                except (KeyError, IndexError):
                    content = "No content found."

            article_url = f"{base_url}/t/{slug}/{topic_id}"
            
            new_topics.append({
                "source": forum_name,
                "title": title,
                "url": article_url,
                "author": topic.get('last_poster_username'), # 或者是 user_id 对应的名字
                "created_at": created_at_str,
                "content_html": content  # 保留 HTML 内容供后续处理
            })
            print(f"  ✅ Found: {title}")
            time.sleep(0.5) # 避免请求过快
        else:
            pass
            
    return new_topics

def fetch_reddit_posts(config, start_time, end_time):
    """
    从 Reddit 获取昨日帖子 (使用 RSS/Atom API 以避免 JSON 403 错误)。
    Fetch yesterday's posts from Reddit using RSS/Atom to bypass JSON blocking.
    """
    name = config['name']
    url = config['url']
    print(f"🔍 [{name}] Checking for new posts (RSS)...")
    
    # Reddit RSS is stricter with User-Agent from cloud IPs.
    # Use a custom User-Agent to identify as a script/bot.
    reddit_headers = {
        "User-Agent": "script:obsidian-daily-reporter:v1.0 (by /u/github-actions)",
        "Accept": "application/atom+xml,application/xml,text/xml"
    }
    
    xml_data = ""
    try:
        req = urllib.request.Request(url, headers=reddit_headers)
        with urllib.request.urlopen(req) as response:
            xml_data = response.read().decode('utf-8')
    except Exception as e:
        print(f"❌ [{name}] Failed to fetch RSS: {e}")
        return []

    new_posts = []
    
    try:
        # Parse XML
        root = ET.fromstring(xml_data)
        # Atom Namespace
        # Usually Reddit RSS uses: http://www.w3.org/2005/Atom
        # We can handle namespace by {uri}tag or using namespaces dict
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        # Verify it is an atom feed
        if 'http://www.w3.org/2005/Atom' not in root.tag:
             # Fallback if specific namespace is missing or different?
             # But Reddit uses Atom. Let's try direct search if ns fails.
             pass

        entries = root.findall('atom:entry', ns)
        
        for entry in entries:
            # Extract fields
            title_elem = entry.find('atom:title', ns)
            title = title_elem.text if title_elem is not None else "No Title"
            
            link_elem = entry.find('atom:link', ns)
            link = link_elem.attrib.get('href') if link_elem is not None else ""
            
            updated_elem = entry.find('atom:updated', ns)
            if updated_elem is not None:
                updated_str = updated_elem.text
                created_at = parse_iso_time(updated_str)
            else:
                created_at = None

            author_elem = entry.find('atom:author/atom:name', ns)
            author = author_elem.text if author_elem is not None else "Unknown"

            content_elem = entry.find('atom:content', ns)
            content = content_elem.text if content_elem is not None else ""
            
            if created_at and start_time <= created_at <= end_time:
                 new_posts.append({
                    "source": "Reddit",
                    "title": title,
                    "url": link,
                    "author": author,
                    "created_at": created_at.isoformat(),
                    "content_text": content # RSS content is usually HTML
                })
                 print(f"  ✅ Found: {title}")
            
    except ET.ParseError as e:
        print(f"❌ [{name}] XML Parse Error: {e}")
        return []
            
    return new_posts

def fetch_github_prs(repo_name, start_time, end_time):
    """
    获取 GitHub 仓库昨日创建和合并的 PR。
    Fetch PRs created or merged yesterday from a GitHub repo.
    """
    print(f"🔍 [GitHub] Checking {repo_name} for PRs...")
    # 获取 Open 和 Closed 的 PR (state=all)
    url = f"https://api.github.com/repos/{repo_name}/pulls?state=all&sort=created&direction=desc&per_page=50"
    data = get_json(url, headers=GITHUB_HEADERS)
    
    if not data:
        print(f"❌ [GitHub] Failed to fetch PRs.")
        return [], []

    opened_prs = []
    merged_prs = []
    
    for pr in data:
        # 检查创建时间
        created_at_str = pr.get('created_at')
        created_at = parse_iso_time(created_at_str)
        
        # 检查合并时间
        merged_at_str = pr.get('merged_at')
        merged_at = parse_iso_time(merged_at_str)
        
        # 处理昨日创建 (Opened Yesterday)
        if created_at and start_time <= created_at <= end_time:
            # 过滤掉已关闭且未合并的 PR (忽略废弃/重复提交)
            # Filter out closed and unmerged PRs (Ignore abandoned/duplicate submissions)
            state = pr.get('state')
            is_merged = pr.get('merged_at') is not None
            
            if state == 'closed' and not is_merged:
                print(f"  🗑️ Skipped (Closed & Unmerged): {pr.get('title')}")
                continue

            opened_prs.append({
                "source": "GitHub Open",
                "title": pr.get('title'),
                "url": pr.get('html_url'),
                "author": pr.get('user', {}).get('login'),
                "created_at": created_at_str,
                "body": pr.get('body'), # PR 描述
                "state": state
            })
            print(f"  ✨ Opened: {pr.get('title')}")
            
        # 处理昨日合并 (Merged Yesterday)
        if merged_at and start_time <= merged_at <= end_time:
            merged_prs.append({
                "source": "GitHub Merged",
                "title": pr.get('title'),
                "url": pr.get('html_url'),
                "author": pr.get('user', {}).get('login'),
                "merged_at": merged_at_str,
                "body": pr.get('body'),
                "state": "merged"
            })
            print(f"  🚀 Merged: {pr.get('title')}")

    return opened_prs, merged_prs

import argparse

def main():
    parser = argparse.ArgumentParser(description="Fetch Obsidian community data")
    parser.add_argument("--date", help="Target date YYYY-MM-DD", default=None)
    args = parser.parse_args()

    if args.date:
        target_date = datetime.date.fromisoformat(args.date)
        # Calculate start/end for the SPECIFIED date
        start_time = datetime.datetime.combine(target_date, datetime.time.min).replace(tzinfo=datetime.timezone.utc)
        end_time = datetime.datetime.combine(target_date, datetime.time.max).replace(tzinfo=datetime.timezone.utc)
        yesterday_date = target_date # Variable name kept for compatibility, effectively target_date
    else:
        start_time, end_time, yesterday_date = get_yesterday_range()
    
    yesterday_str = yesterday_date.isoformat()
    
    print(f"📅 Target Date (UTC): {yesterday_str}")
    print(f"   Range: {start_time} - {end_time}")
    
    all_data = {
        "date": yesterday_str,
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "chinese_forum": [],
        "english_forum": [],
        "github_opened": [],
        "github_merged": [],
        "reddit": []
    }
    
    # 1. 中文论坛 (Chinese Forum)
    all_data["chinese_forum"] = fetch_discourse_topics(
        CONFIG["chinese_forum"]["name"],
        CONFIG["chinese_forum"]["base_url"],
        CONFIG["chinese_forum"]["category_url"],
        start_time, end_time
    )
    
    # 2. 英文论坛 (English Forum)
    all_data["english_forum"] = fetch_discourse_topics(
        CONFIG["english_forum"]["name"],
        CONFIG["english_forum"]["base_url"],
        CONFIG["english_forum"]["category_url"],
        start_time, end_time
    )
    
    # 3. GitHub PRs
    try:
        opened, merged = fetch_github_prs(
            CONFIG["github_repo"],
            start_time, end_time
        )
        all_data["github_opened"] = opened
        all_data["github_merged"] = merged
    except Exception as e:
         print(f"❌ Error in GitHub fetching: {e}")

    # 4. Reddit ObsidianMD
    all_data["reddit"] = fetch_reddit_posts(
        CONFIG["reddit"],
        start_time, end_time
    )
    
    # 输出结果到文件 (Output to file)
    # 修改：保存到 data/ 目录，并使用日期命名
    # Modify: Save to data/ directory with date in filename
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 假设 script 在 scripts/ 目录下，向上找一级到项目根目录
    project_root = os.path.dirname(script_dir) 
    
    # 确保 data/daily 目录存在
    # Ensure data/daily directory exists
    data_dir = os.path.join(project_root, "data", "daily")
    if not os.path.exists(data_dir):
        try:
            os.makedirs(data_dir, exist_ok=True)
        except OSError:
            # Fallback to local dir if permission denied or path issue
            data_dir = script_dir
    
    # 文件名格式: {YYYY-MM-DD}.json
    filename = f"{yesterday_str}.json"
    output_file = os.path.join(data_dir, filename)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, separators=(',', ':'))
        
    print(f"\n✅ Data collection complete. Saved to {output_file}")
    
    # 简单统计 (Simple stats)
    print(f"📊 Summary:")
    print(f"  - Chinese Forum Posts: {len(all_data['chinese_forum'])}")
    print(f"  - English Forum Posts: {len(all_data['english_forum'])}")
    print(f"  - GitHub Opened PRs: {len(all_data['github_opened'])}")
    print(f"  - GitHub Merged PRs: {len(all_data['github_merged'])}")
    print(f"  - Reddit Posts: {len(all_data['reddit'])}")

if __name__ == "__main__":
    main()

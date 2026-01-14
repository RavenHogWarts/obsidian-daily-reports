import os
import json
import datetime
import re
import argparse
import logging
from typing import Dict, Any, Optional, List
import httpx
from zai import ZhipuAiClient

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AI_Processor")

class DateUtils:
    @staticmethod
    def get_yesterday_str() -> str:
        """Get yesterday's date string in ISO format (YYYY-MM-DD)."""
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        today = now_utc.date()
        yesterday_date = today - datetime.timedelta(days=1)
        return yesterday_date.isoformat()

class DataFormatter:
    def __init__(self):
        self.id_map: Dict[str, Any] = {}

    def strip_html(self, text: str) -> str:
        """Simple HTML tag removal."""
        if not text:
            return ""
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)

    def truncate_text(self, text: str, max_len: int = 500) -> str:
        """Truncate text to save tokens."""
        if not text:
            return ""
        text = self.strip_html(text).strip()
        return text[:max_len] + "..." if len(text) > max_len else text

    def format_for_prompt(self, data: Dict[str, Any]) -> str:
        """Format JSON data into a prompt-friendly string and build ID map."""
        self.id_map = {}  # Reset map
        summary_text = ""
        item_id = 1

        # 1. Forums
        for source in ["chinese_forum", "english_forum"]:
            items = data.get(source, [])
            if items:
                summary_text += f"\n## {source.replace('_', ' ').title()}\n"
                for item in items[:15]:  # Limit to top 15
                    current_id = str(item_id)
                    self.id_map[current_id] = item
                    
                    title = item.get('title', 'No Title')
                    url = item.get('url', '#')
                    content = self.truncate_text(item.get('content_html') or item.get('content_text'))
                    
                    summary_text += f"[{current_id}] Title: {title}\n"
                    summary_text += f"    Link: {url}\n"
                    summary_text += f"    Content: {content}\n"
                    item_id += 1

        # 2. GitHub Merged
        github_merged = data.get("github_merged", [])
        if github_merged:
            summary_text += "\n## GitHub Merged PRs\n"
            for item in github_merged[:15]:
                current_id = str(item_id)
                self.id_map[current_id] = item
                
                summary_text += f"[{current_id}] PR: {item.get('title')}\n"
                summary_text += f"    Desc: {self.truncate_text(item.get('body'))}\n"
                item_id += 1
                
        # 3. Reddit
        reddit = data.get("reddit", [])
        if reddit:
            summary_text += "\n## Reddit Posts\n"
            for item in reddit[:15]:
                current_id = str(item_id)
                self.id_map[current_id] = item
                
                summary_text += f"[{current_id}] Post: {item.get('title')}\n"
                summary_text += f"    Content: {self.truncate_text(item.get('content_text'))}\n"
                item_id += 1
                
        return summary_text

class AIClientWrapper:
    def __init__(self, api_key: str, model: str = "glm-4.7", base_url: str = "https://open.bigmodel.cn/api/coding/paas/v4/"):
        if not api_key:
            raise ValueError("API Key is required")
        
        self.model = model
        self.api_key = api_key
        
        # httpx configuration
        httpx_client = httpx.Client(
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
            timeout=30.0
        )
        
        if ZhipuAiClient:
            self.client = ZhipuAiClient(
                api_key=api_key, 
                base_url=base_url,
                timeout=httpx.Timeout(timeout=300.0, connect=8.0),
                max_retries=3,
                http_client=httpx_client
            )
        else:
            logger.warning("zai-sdk not installed. specific client features unavailable.")
            self.client = None

    def chat_completion(self, prompt: str) -> Optional[str]:
        """Generic chat completion with thinking and streaming support."""
        if not self.client:
            logger.error("Client not initialized.")
            return None

        # logger.info(f"Calling ZhipuAI API (Model: {self.model})...")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                thinking={
                    "type": "enabled"
                }
            )
            
            full_content = ""
            for chunk in response:
                if chunk.choices:
                    delta = chunk.choices[0].delta
                    # Capture reasoning context if available
                    if getattr(delta, 'reasoning_content', None):
                        # Use logger.debug to show thinking process if debug is on
                        logger.debug(f"[Thinking] {delta.reasoning_content}")
                    
                    if delta.content:
                        full_content += delta.content
            
            return full_content.strip()
            
        except Exception as e:
            logger.error(f"Error calling AI API: {e}")
            return None

    def generate_report(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Call AI to generate the report."""
        logger.info(f"Calling ZhipuAI API (Model: {self.model})...")
        content = self.chat_completion(prompt)
        if content:
            return self._clean_json(content)
        return None

    def _clean_json(self, content: str) -> Optional[Dict[str, Any]]:
        """Clean markdown wrapping and parse JSON."""
        original_content = content
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.debug(f"Raw content: {original_content}")
            return None

import concurrent.futures
import time
import threading


class RateLimiter:
    """
    线程安全的速率限制器（令牌桶算法）。
    确保并发环境下 API 请求速率不超过限制。
    """
    def __init__(self, max_concurrent: int = 2, min_interval: float = 2.0):
        """
        Args:
            max_concurrent: 最大同时执行的请求数
            min_interval: 两次请求之间的最小间隔（秒）
        """
        self.semaphore = threading.Semaphore(max_concurrent)
        self.min_interval = min_interval
        self.last_request_time = 0.0
        self.lock = threading.Lock()
    
    def acquire(self):
        """获取执行许可（阻塞直到允许执行）"""
        self.semaphore.acquire()
        
        with self.lock:
            # 确保请求间隔
            now = time.time()
            elapsed = now - self.last_request_time
            if elapsed < self.min_interval:
                sleep_time = self.min_interval - elapsed
                time.sleep(sleep_time)
            self.last_request_time = time.time()
    
    def release(self):
        """释放执行许可"""
        self.semaphore.release()

class DailyProcessor:
    ITEM_EVAL_PROMPT = """
你是一个 Obsidian 社区日报的毒舌而专业的编辑。请分析以下单条内容，提炼其对用户的实际价值。

## 待分析内容
- 来源：{source}
- 标题：{title}
- 链接：{url}
- 正文/描述：
{content}

## 写作要求（严格遵守）
1. **价值导向**：每条亮点必须回答"在什么场景下，能帮用户节省时间/减少挫败/获得愉悦"
2. **禁止空洞**：严禁使用"更高效"、"更强大"、"更便捷"等空洞形容词，禁止纯功能罗列
3. **亮点控制**：最多3条，按重要性递减，每条控制在25-35字
4. **提炼方法**：从功能中提取 “核心价值 → 典型场景 → 具体结果”，只写前两层

## 输出 JSON 格式（不要 Markdown 代码块）
{{
  "summary": "一句话中文摘要（15-25字），直击用户痛点，避免空洞描述",
  "pain_point": "具体解决的问题场景（如：多设备同步时图片路径错乱、大文件夹加载卡顿）",
  "highlights": [
    "亮点1（25-35字）",
    "亮点2（25-35字）",
    "亮点3（25-35字）"
  ],
  "comment": "一两句带情绪的毒舌点评，可吐槽也可赞美",
  "tags": ["1-2个标签，可从参考标签选择，也可根据内容自拟更贴切的标签。参考：新手友好 / 效率党必备 / 颜值党专属 / 数据极客 / 开发者向 / 学术党福音"],
  "score": 1-10的整数，8分以上需有明确创新或解决高频痛点
}}

请直接输出 JSON。
"""

    OVERVIEW_PROMPT = """
你是一个 Obsidian 社区日报的毒舌编辑。基于以下今日精选内容，写一段 100 字左右的**毒舌总结**（Overview）。
** 目的是为用户提供价值导向的社区新鲜事概览，帮助用户快速发现实用分享、节省时间、提升 Obsidian 使用体验。**
风格要求：口语化、生活化、带情绪感（最爱、上瘾、告别xx、终于可以xx），像老朋友吐槽一样串联今日亮点。

精选内容列表：
{items_text}

请直接输出总结文本（不要JSON）。
"""

    def __init__(self, api_key: str, model_name: str = "glm-4.7"):
        self.ai_client = AIClientWrapper(api_key, model=model_name)
        self.formatter = DataFormatter()
        # 速率限制器：最多2个并发请求，每次请求间隔至少2秒
        # Thinking模式下API对并发非常敏感，需要更保守的设置
        self.rate_limiter = RateLimiter(max_concurrent=2, min_interval=2.0)

    def process(self, file_path: str, overwrite: bool = False):
        start_time = time.time()
        logger.info(f"Target File: {file_path}")
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return

        # 1. Read Data
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 2. Collect all items
        all_items = []
        for source_key in ["chinese_forum", "english_forum", "github_merged", "reddit", "github_opened"]:
            items = data.get(source_key, [])
            if not items: 
                continue
            
            # Process all items found in the source
            for item in items:
                item['_source_key'] = source_key # Marker for logic if needed
                all_items.append(item)

        logger.info(f"Total items to evaluate: {len(all_items)}")

        # 3. Process Items Parallelly with Rate Limiting
        # 使用速率限制器严格控制实际并发数和请求间隔
        valid_selections = []
        futures = {}
        
        # 预先过滤已处理的条目
        items_to_process = []
        for item in all_items:
            if not overwrite and item.get("ai_summary"):
                logger.info(f"⏭️  Skipping already processed: {item.get('title')[:30]}...")
                valid_selections.append(item)
            else:
                items_to_process.append(item)
        
        total_items = len(all_items)
        processed_count = len(valid_selections)
        items_pending = len(items_to_process)
        
        logger.info(f"Items to process: {items_pending}, Already processed: {processed_count}")
        
        # 使用更多 workers，但由 RateLimiter 控制实际并发
        # max_workers 设置更高是为了让任务队列有足够容量
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            for item in items_to_process:
                # Submit task with rate limiter wrapper
                future = executor.submit(self._evaluate_with_rate_limit, item)
                futures[future] = item

            for future in concurrent.futures.as_completed(futures):
                item = futures[future]
                processed_count += 1
                try:
                    result = future.result()
                    if result:
                        valid_selections.append(item)
                        logger.info(f"[{processed_count}/{total_items}] ✅ Summary: {item.get('title')[:30]}...")
                    else:
                        logger.info(f"[{processed_count}/{total_items}] ❌ Failed/Dropped: {item.get('title')[:30]}...")
                except Exception as exc:
                    logger.error(f"[{processed_count}/{total_items}] ❌ Exception: {exc}")

        logger.info(f"Processed {len(valid_selections)} items successfully.")

        # 4. Generate Overview
        if valid_selections:
            overview_text = self.generate_global_overview(valid_selections)
        else:
            overview_text = "今日无事发生。"

        # 5. Save Results
        data["ai"] = {
            "overview": overview_text,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "model": self.ai_client.model,
            "processed_count": len(all_items),
            "selected_count": len(valid_selections)
        }
        
        # Save file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        end_time = time.time()
        duration = end_time - start_time
        logger.info(f"AI processing complete and saved. Total time: {duration:.2f}s")

    def _evaluate_with_rate_limit(self, item: Dict[str, Any], max_retries: int = 3) -> bool:
        """
        带速率限制和重试的评估方法。
        使用 RateLimiter 控制并发，并在失败时进行指数退避重试。
        """
        retries = 0
        base_delay = 5.0  # 基础重试延迟（秒）
        
        while retries <= max_retries:
            try:
                # 获取速率限制许可
                self.rate_limiter.acquire()
                try:
                    return self.evaluate_single_item(item)
                finally:
                    # 确保释放许可
                    self.rate_limiter.release()
            except Exception as e:
                error_str = str(e)
                # 检查是否是429错误
                if "429" in error_str or "Too Many Requests" in error_str or "并发数过高" in error_str:
                    retries += 1
                    if retries <= max_retries:
                        # 指数退避
                        delay = base_delay * (2 ** (retries - 1))
                        logger.warning(f"Rate limited, retry {retries}/{max_retries} after {delay}s: {item.get('title', '')[:30]}")
                        time.sleep(delay)
                    else:
                        logger.error(f"Max retries exceeded for: {item.get('title', '')[:30]}")
                        return False
                else:
                    # 其他错误直接返回失败
                    logger.error(f"Error evaluating item: {e}")
                    return False
        
        return False

    def evaluate_single_item(self, item: Dict[str, Any]) -> bool:
        """
        Returns True if item is valuable and updated, False if dropped.
        """
        # Prepare content
        title = item.get('title', '')
        url = item.get('url', '')
        content = item.get('content_text') or item.get('body') or item.get('content_html') or ""
        content = self.formatter.truncate_text(content, max_len=800)
        source = item.get('source', 'Unknown')

        prompt = self.ITEM_EVAL_PROMPT.format(
            source=source,
            title=title,
            url=url,
            content=content
        )

        ai_res = self.ai_client.generate_report(prompt)
        
        if not ai_res:
            return False
            
        if ai_res.get("drop") is True:
            return False
            
        # Update valid item
        item["ai_summary"] = ai_res.get("summary")
        item["ai_pain_point"] = ai_res.get("pain_point")
        item["ai_highlights"] = ai_res.get("highlights")
        item["ai_comment"] = ai_res.get("comment")
        item["ai_tags"] = ai_res.get("tags")
        item["ai_score"] = ai_res.get("score")
        
        return True

    def generate_global_overview(self, items: List[Dict[str, Any]]) -> str:
        """Generate the daily overview based on selected items."""
        # Sort by score descending
        items.sort(key=lambda x: x.get('ai_score', 0), reverse=True)
        
        # Take top 10 for overview prompt to avoid token overflow
        top_items = items[:10]
        
        items_text_list = []
        for i, item in enumerate(top_items, 1):
            items_text_list.append(f"{i}. [{item.get('ai_score')}] {item.get('title')}: {item.get('ai_summary')}")
            
        items_text = "\n".join(items_text_list)
        
        prompt = self.OVERVIEW_PROMPT.format(items_text=items_text)
        
        if not self.ai_client.client:
             return "AI Client error."

        result = self.ai_client.chat_completion(prompt)
        if result:
            return result
        return "生成总结失败。"

def main():
    parser = argparse.ArgumentParser(description="AI Processor for Obsidian Daily Reports")
    parser.add_argument("--date", help="Date string YYYY-MM-DD or range YYYY-MM-DD:YYYY-MM-DD (defaults to yesterday)", default=None)
    parser.add_argument("--file", help="Specific file path to process", default=None)
    parser.add_argument("--model", help="AI Model to use", default="glm-4.7")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing AI summaries")
    args = parser.parse_args()

    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        logger.error("ZHIPU_API_KEY environment variable not set.")
        return

    processor = DailyProcessor(api_key, model_name=args.model)

    files_to_process = []
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data", "daily")

    if args.file:
        files_to_process.append(args.file)
    else:
        date_input = args.date if args.date else DateUtils.get_yesterday_str()
        
        # Check for range format "YYYY-MM-DD:YYYY-MM-DD"
        if ":" in date_input:
            try:
                start_str, end_str = date_input.split(":")
                start = datetime.datetime.strptime(start_str, "%Y-%m-%d").date()
                end = datetime.datetime.strptime(end_str, "%Y-%m-%d").date()
                
                if start > end:
                    logger.error("Start date must be before end date.")
                    return

                current = start
                while current <= end:
                    date_str = current.isoformat()
                    f_path = os.path.join(data_dir, f"{date_str}.json")
                    files_to_process.append(f_path)
                    current += datetime.timedelta(days=1)
            except ValueError:
                logger.error("Invalid date range format. Please use YYYY-MM-DD:YYYY-MM-DD.")
                return
        else:
            # Single date input or default yesterday
            files_to_process.append(os.path.join(data_dir, f"{date_input}.json"))

    total_files = len(files_to_process)
    logger.info(f"Files to process: {total_files}")
    
    for idx, file_path in enumerate(files_to_process, 1):
        logger.info(f"=== Processing file {idx}/{total_files} ===")
        processor.process(file_path, overwrite=args.overwrite)
        
        # Add cooldown between files to avoid rate limiting
        if idx < total_files:
            cooldown = 10  # 增加到10秒，确保API速率限制有足够恢复时间
            logger.info(f"Cooldown {cooldown}s before next file...")
            time.sleep(cooldown)

if __name__ == "__main__":
    main()

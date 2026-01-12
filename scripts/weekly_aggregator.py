#!/usr/bin/env python3
"""
周报聚合脚本 (Weekly Aggregator Script)

功能:
- 根据 ISO 周年和周数，聚合对应 7 天的日报数据
- 支持容错处理（缺失文件跳过）
- 数据去重（同一 URL 只保留一次，PR 保留最新状态）

用法:
- 默认聚合上周数据: python weekly_aggregator.py
- 指定日期所在周: python weekly_aggregator.py --date 2026-01-12
- 直接指定 ISO 周: python weekly_aggregator.py --week 2026-W02
"""

import argparse
import datetime
import json
import os
import sys
from typing import Dict, List, Optional, Tuple


def get_iso_week_info(date: datetime.date) -> Tuple[int, int]:
    """
    获取日期的 ISO 周年和周数。
    Get ISO week year and week number for a given date.
    
    Returns:
        Tuple[int, int]: (ISO 周年, 周数)
    """
    iso_calendar = date.isocalendar()
    return iso_calendar[0], iso_calendar[1]  # (year, week)


def get_week_date_range(iso_year: int, iso_week: int) -> Tuple[datetime.date, datetime.date]:
    """
    根据 ISO 周年和周数，计算该周的周一至周日日期范围。
    Calculate Monday to Sunday date range for given ISO week.
    
    Args:
        iso_year: ISO 周年
        iso_week: ISO 周数
        
    Returns:
        Tuple[datetime.date, datetime.date]: (周一日期, 周日日期)
    """
    # ISO 周的第一天是周一 (weekday=1)
    # 使用 ISO 周年的第一天计算
    jan_4 = datetime.date(iso_year, 1, 4)  # 1月4日一定在第1周
    iso_week_1_monday = jan_4 - datetime.timedelta(days=jan_4.weekday())
    
    # 计算目标周的周一
    target_monday = iso_week_1_monday + datetime.timedelta(weeks=iso_week - 1)
    target_sunday = target_monday + datetime.timedelta(days=6)
    
    return target_monday, target_sunday


def parse_iso_week_string(week_str: str) -> Tuple[int, int]:
    """
    解析 ISO 周字符串 (如 "2026-W02")。
    Parse ISO week string like "2026-W02".
    
    Returns:
        Tuple[int, int]: (ISO 周年, 周数)
    """
    try:
        year_str, week_part = week_str.split("-W")
        return int(year_str), int(week_part)
    except ValueError as e:
        raise ValueError(f"无效的 ISO 周格式: {week_str}，应为 YYYY-Www (如 2026-W02)") from e


def get_last_week_info() -> Tuple[int, int]:
    """
    获取上周的 ISO 周年和周数。
    Get ISO week year and week number for last week.
    """
    today = datetime.date.today()
    last_week_date = today - datetime.timedelta(days=7)
    return get_iso_week_info(last_week_date)


def load_daily_json(file_path: str) -> Optional[Dict]:
    """
    加载日报 JSON 文件。
    Load daily JSON file.
    
    Args:
        file_path: 文件路径
        
    Returns:
        Dict or None: JSON 数据或 None (文件不存在/解析失败)
    """
    if not os.path.exists(file_path):
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"⚠️  读取文件失败 {file_path}: {e}")
        return None


def merge_items_by_url(existing: List[Dict], new_items: List[Dict]) -> List[Dict]:
    """
    按 URL 去重合并数据项，保留最新状态。
    Merge items by URL, keeping the latest state.
    
    Args:
        existing: 已有数据列表
        new_items: 新数据列表
        
    Returns:
        List[Dict]: 合并后的数据列表
    """
    url_map: Dict[str, Dict] = {}
    
    # 先添加已有数据
    for item in existing:
        url = item.get('url', '')
        if url:
            url_map[url] = item
    
    # 用新数据更新（覆盖同 URL 的旧数据，保留最新状态）
    for item in new_items:
        url = item.get('url', '')
        if url:
            # 对于 GitHub PR，检查状态变化 (open -> merged)
            if url in url_map:
                old_state = url_map[url].get('state', '')
                new_state = item.get('state', '')
                # merged 状态优先级最高
                if new_state == 'merged' or old_state != 'merged':
                    url_map[url] = item
            else:
                url_map[url] = item
    
    return list(url_map.values())


def aggregate_weekly_data(
    iso_year: int, 
    iso_week: int, 
    data_dir: str
) -> Dict:
    """
    聚合指定 ISO 周的日报数据。
    Aggregate daily data for specified ISO week.
    
    Args:
        iso_year: ISO 周年
        iso_week: ISO 周数
        data_dir: 日报数据目录 (data/daily/)
        
    Returns:
        Dict: 周报数据
    """
    monday, sunday = get_week_date_range(iso_year, iso_week)
    iso_week_str = f"{iso_year}-W{iso_week:02d}"
    
    print(f"📅 聚合 ISO 周: {iso_week_str}")
    print(f"   日期范围: {monday.isoformat()} ~ {sunday.isoformat()}")
    
    # 初始化周报数据结构
    weekly_data = {
        "iso_week": iso_week_str,
        "date_range": {
            "start": monday.isoformat(),
            "end": sunday.isoformat()
        },
        "actual_dates": [],
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "daily_files_found": 0,
        "chinese_forum": [],
        "english_forum": [],
        "github_opened": [],
        "github_merged": [],
        "reddit": []
    }
    
    # 遍历周一到周日
    current_date = monday
    while current_date <= sunday:
        date_str = current_date.isoformat()
        file_path = os.path.join(data_dir, f"{date_str}.json")
        
        daily_data = load_daily_json(file_path)
        
        if daily_data:
            print(f"  ✅ 找到: {date_str}.json")
            weekly_data["daily_files_found"] += 1
            weekly_data["actual_dates"].append(date_str)
            
            # 合并各数据源
            for source in ["chinese_forum", "english_forum", "reddit"]:
                if source in daily_data:
                    weekly_data[source] = merge_items_by_url(
                        weekly_data[source], 
                        daily_data[source]
                    )
            
            # GitHub PR 需要特殊处理状态
            for source in ["github_opened", "github_merged"]:
                if source in daily_data:
                    weekly_data[source] = merge_items_by_url(
                        weekly_data[source],
                        daily_data[source]
                    )
        else:
            print(f"  ⏭️  跳过: {date_str}.json (文件不存在)")
        
        current_date += datetime.timedelta(days=1)
    
    return weekly_data


def save_weekly_json(weekly_data: Dict, output_dir: str) -> str:
    """
    保存周报 JSON 文件。
    Save weekly JSON file.
    
    Args:
        weekly_data: 周报数据
        output_dir: 输出目录 (data/weekly/)
        
    Returns:
        str: 输出文件路径
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    iso_week = weekly_data["iso_week"]
    filename = f"{iso_week}.json"
    output_path = os.path.join(output_dir, filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(weekly_data, f, indent=2, ensure_ascii=False)
    
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="周报聚合脚本 - 聚合 Obsidian 社区日报数据"
    )
    parser.add_argument(
        "--date",
        type=str,
        help="指定日期所在周 (格式: YYYY-MM-DD，如 2026-01-12)"
    )
    parser.add_argument(
        "--week",
        type=str,
        help="直接指定 ISO 周 (格式: YYYY-Www，如 2026-W02)"
    )
    
    args = parser.parse_args()
    
    # 确定目标 ISO 周
    if args.week:
        iso_year, iso_week = parse_iso_week_string(args.week)
    elif args.date:
        try:
            target_date = datetime.date.fromisoformat(args.date)
            iso_year, iso_week = get_iso_week_info(target_date)
        except ValueError as e:
            print(f"❌ 日期格式错误: {args.date}，应为 YYYY-MM-DD")
            sys.exit(1)
    else:
        # 默认: 上周
        iso_year, iso_week = get_last_week_info()
        print(f"ℹ️  未指定周数，默认聚合上周数据")
    
    # 计算路径
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    daily_dir = os.path.join(project_root, "data", "daily")
    weekly_dir = os.path.join(project_root, "data", "weekly")
    
    # 检查日报目录是否存在
    if not os.path.exists(daily_dir):
        print(f"❌ 日报目录不存在: {daily_dir}")
        sys.exit(1)
    
    # 执行聚合
    weekly_data = aggregate_weekly_data(iso_year, iso_week, daily_dir)
    
    # 保存结果
    output_path = save_weekly_json(weekly_data, weekly_dir)
    
    # 输出统计
    print(f"\n✅ 周报生成完成: {output_path}")
    print(f"📊 统计:")
    print(f"   - 找到日报文件: {weekly_data['daily_files_found']}/7")
    print(f"   - 实际日期: {', '.join(weekly_data['actual_dates']) if weekly_data['actual_dates'] else '无'}")
    print(f"   - 中文论坛帖子: {len(weekly_data['chinese_forum'])}")
    print(f"   - 英文论坛帖子: {len(weekly_data['english_forum'])}")
    print(f"   - GitHub Opened PRs: {len(weekly_data['github_opened'])}")
    print(f"   - GitHub Merged PRs: {len(weekly_data['github_merged'])}")
    print(f"   - Reddit 帖子: {len(weekly_data['reddit'])}")


if __name__ == "__main__":
    main()

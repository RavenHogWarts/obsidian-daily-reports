"""
周报 AI 处理脚本
只生成周报的整体总结，不对单条目重新处理
（单条目的 AI 总结已在日报中完成）
"""

import os
import json
import datetime
import argparse
import logging
import time
from typing import List, Dict, Any

from ai_overview_generator import OverviewGenerator

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Weekly_AI_Processor")


class DateUtils:
    @staticmethod
    def get_last_week_str() -> str:
        """获取上周的 ISO 周字符串 (YYYY-Www)"""
        today = datetime.date.today()
        last_week_date = today - datetime.timedelta(days=7)
        iso_calendar = last_week_date.isocalendar()
        return f"{iso_calendar[0]}-W{iso_calendar[1]:02d}"


class WeeklyProcessor:
    """周报 AI 处理器"""
    
    def __init__(self, api_key: str, model_name: str = "glm-4.7"):
        self.overview_generator = OverviewGenerator(api_key, model_name)

    def process(self, file_path: str, overwrite: bool = False):
        """
        处理周报文件
        
        Args:
            file_path: 周报 JSON 文件路径
            overwrite: 是否覆盖已有的 AI 总结
        """
        start_time = time.time()
        logger.info(f"Processing Weekly Report: {file_path}")
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return

        # 1. 读取周报数据
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 2. 检查是否已有 AI 总结
        if not overwrite and data.get("ai"):
            logger.info("AI summary already exists. Use --overwrite to regenerate.")
            return

        # 3. 收集所有已评分的条目
        all_items = []
        for source_key in ["chinese_forum", "english_forum", "github_merged", "reddit", "github_opened"]:
            items = data.get(source_key, [])
            for item in items:
                # 只收集已有 AI 评分的条目（来自日报）
                if item.get("ai_score") is not None:
                    item['_source_key'] = source_key
                    all_items.append(item)

        logger.info(f"Total items with AI scores: {len(all_items)}")

        if not all_items:
            logger.warning("No items with AI scores found. Skipping overview generation.")
            data["ai"] = {
                "overview": "本周无已评分内容。",
                "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "model": self.overview_generator.ai_client.model,
                "total_items": 0,
                "selected_count": 0
            }
        else:
            # 4. 生成周报总结（选取高分条目）
            logger.info("Generating weekly overview...")
            summary_result = self.overview_generator.generate_comprehensive_summary(
                all_items, 
                report_type="weekly"
            )
            
            # 5. 保存结果
            data["ai"] = {
                "overview": summary_result["overview"],
                "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "model": self.overview_generator.ai_client.model,
                "total_items": summary_result.get("total_items", 0),
                "selected_count": summary_result.get("selected_count", 0),
                "high_score_items": summary_result.get("high_score_items", 0),
                "average_score": summary_result.get("average_score", 0),
                "top_tags": summary_result.get("top_tags", [])
            }

        # 6. 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        
        end_time = time.time()
        duration = end_time - start_time
        logger.info(f"✅ Weekly AI processing complete. Total time: {duration:.2f}s")


def main():
    parser = argparse.ArgumentParser(description="Weekly Report AI Processor")
    parser.add_argument(
        "--week", 
        help="ISO week string (YYYY-Www, e.g., 2026-W02, defaults to last week)", 
        default=None
    )
    parser.add_argument(
        "--file", 
        help="Specific file path to process", 
        default=None
    )
    parser.add_argument(
        "--model", 
        help="AI Model to use", 
        default="glm-4.7"
    )
    parser.add_argument(
        "--overwrite", 
        action="store_true", 
        help="Overwrite existing AI summaries"
    )
    args = parser.parse_args()

    # 获取 API Key
    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        logger.error("ZHIPU_API_KEY environment variable not set.")
        return

    processor = WeeklyProcessor(api_key, model_name=args.model)

    # 确定要处理的文件
    if args.file:
        file_path = args.file
    else:
        # 计算路径
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        weekly_dir = os.path.join(project_root, "data", "weekly")
        
        # 确定周数
        week_str = args.week if args.week else DateUtils.get_last_week_str()
        file_path = os.path.join(weekly_dir, f"{week_str}.json")

    # 处理文件
    processor.process(file_path, overwrite=args.overwrite)


if __name__ == "__main__":
    main()

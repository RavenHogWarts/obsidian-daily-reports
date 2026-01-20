"""
日报 AI 处理脚本（重构版 v2）

支持细粒度控制：
1. 处理步骤控制：可选择执行单条目分析、overview生成，或两者都执行
2. 覆盖策略控制：可选择覆盖已有内容或仅补全缺失内容

使用模块化的 AI 处理组件
"""

import os
import json
import datetime
import argparse
import logging
import time
from typing import List, Dict, Any

from ai_item_processor import ItemProcessor
from ai_overview_generator import OverviewGenerator

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Daily_AI_Processor")


class DateUtils:
    @staticmethod
    def get_yesterday_str() -> str:
        """获取昨天的日期字符串 (YYYY-MM-DD)"""
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        today = now_utc.date()
        yesterday_date = today - datetime.timedelta(days=1)
        return yesterday_date.isoformat()


class DailyProcessor:
    """
    日报 AI 处理器
    
    支持细粒度控制的处理选项
    """
    
    def __init__(self, api_key: str, model_name: str = "glm-4.7"):
        # 条目处理器：用于单条目 AI 分析
        self.item_processor = ItemProcessor(
            api_key, 
            model_name, 
            max_concurrent=3, 
            min_interval=2.0
        )
        # 总结生成器：用于生成整体 overview
        self.overview_generator = OverviewGenerator(api_key, model_name)

    def process(self, 
                file_path: str, 
                skip_analysis: bool = False,
                skip_overview: bool = False,
                overwrite_items: bool = False,
                overwrite_overview: bool = False):
        """
        处理日报文件
        
        Args:
            file_path: 日报 JSON 文件路径
            skip_analysis: 是否跳过单条目 AI 分析
            skip_overview: 是否跳过 overview 生成
            overwrite_items: 是否覆盖已有的单条目 AI 分析
            overwrite_overview: 是否覆盖已有的 overview
        """
        start_time = time.time()
        logger.info(f"=== Processing Daily Report ===")
        logger.info(f"Target File: {file_path}")
        logger.info(f"Options:")
        logger.info(f"  - Skip Item Analysis: {skip_analysis}")
        logger.info(f"  - Skip Overview: {skip_overview}")
        logger.info(f"  - Overwrite Items: {overwrite_items}")
        logger.info(f"  - Overwrite Overview: {overwrite_overview}")
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return

        # 1. 读取日报数据
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 2. 收集所有条目
        all_items = []
        for source_key in ["chinese_forum", "english_forum", "github_merged", "reddit", "github_opened"]:
            items = data.get(source_key, [])
            if not items:
                continue
            
            for item in items:
                item['_source_key'] = source_key
                all_items.append(item)

        logger.info(f"Total items found: {len(all_items)}")

        # 3. 单条目 AI 分析（可选）
        valid_items = []
        if not skip_analysis:
            logger.info("=== Step 1: Item Analysis ===")
            valid_items = self.item_processor.batch_evaluate_items(
                all_items, 
                report_type="daily", 
                overwrite=overwrite_items
            )
            logger.info(f"Items with AI analysis: {len(valid_items)}")
        else:
            logger.info("=== Step 1: Item Analysis (SKIPPED) ===")
            # 收集已有 AI 分析的条目
            for item in all_items:
                if item.get("ai_score") is not None:
                    valid_items.append(item)
            logger.info(f"Items with existing AI analysis: {len(valid_items)}")

        # 4. 生成整体总结（可选）
        if not skip_overview:
            logger.info("=== Step 2: Overview Generation ===")
            
            # 检查是否需要生成 overview
            should_generate = True
            if not overwrite_overview and data.get("ai", {}).get("overview"):
                logger.info("Overview already exists. Use --overwrite-overview to regenerate.")
                should_generate = False
            
            if should_generate:
                if valid_items:
                    logger.info("Generating daily overview...")
                    overview_text = self.overview_generator.generate_overview_with_rate_limit(
                        valid_items, 
                        report_type="daily",
                        top_n=10
                    )
                else:
                    overview_text = "今日无事发生。"
                    logger.warning("No items with AI scores, using default overview.")
                
                # 更新或创建 ai 字段
                if "ai" not in data:
                    data["ai"] = {}
                
                data["ai"]["overview"] = overview_text
                data["ai"]["generated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
                data["ai"]["model"] = self.item_processor.ai_client.model
                data["ai"]["processed_count"] = len(all_items)
                data["ai"]["selected_count"] = len(valid_items)
                
                logger.info("Overview generated successfully.")
            else:
                logger.info("Overview generation skipped (already exists).")
        else:
            logger.info("=== Step 2: Overview Generation (SKIPPED) ===")

        # 5. 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        
        end_time = time.time()
        duration = end_time - start_time
        logger.info(f"✅ Processing complete. Total time: {duration:.2f}s")


def main():
    parser = argparse.ArgumentParser(
        description="Daily Report AI Processor with Fine-Grained Control",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 完整处理（分析 + 总结）
  python ai_daily_processor.py
  
  # 仅重新生成 overview（单条目分析已完成）
  python ai_daily_processor.py --skip-analysis --overwrite-overview
  
  # 仅补全缺失的单条目分析
  python ai_daily_processor.py --skip-overview
  
  # 强制重新分析所有条目但不覆盖 overview
  python ai_daily_processor.py --overwrite-items
  
  # 覆盖所有内容（条目 + overview）
  python ai_daily_processor.py --overwrite-all
        """
    )
    
    # 文件/日期参数
    parser.add_argument(
        "--date", 
        help="Date string YYYY-MM-DD or range YYYY-MM-DD:YYYY-MM-DD (defaults to yesterday)", 
        default=None
    )
    parser.add_argument(
        "--file", 
        help="Specific file path to process", 
        default=None
    )
    
    # 处理步骤控制
    parser.add_argument(
        "--skip-analysis",
        action="store_true",
        help="Skip item-level AI analysis (use existing scores)"
    )
    parser.add_argument(
        "--skip-overview",
        action="store_true",
        help="Skip overview generation"
    )
    
    # 覆盖策略控制
    parser.add_argument(
        "--overwrite-items",
        action="store_true",
        help="Overwrite existing item AI analysis"
    )
    parser.add_argument(
        "--overwrite-overview",
        action="store_true",
        help="Overwrite existing overview"
    )
    parser.add_argument(
        "--overwrite-all",
        action="store_true",
        help="Overwrite all AI content (items + overview)"
    )
    
    # 模型选择
    parser.add_argument(
        "--model", 
        help="AI Model to use", 
        default="glm-4.7"
    )
    
    # 兼容旧参数
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="[DEPRECATED] Use --overwrite-all instead"
    )
    
    args = parser.parse_args()

    # 处理兼容参数
    if args.overwrite:
        logger.warning("--overwrite is deprecated, using --overwrite-all instead")
        args.overwrite_all = True
    
    # --overwrite-all 展开为两个独立选项
    if args.overwrite_all:
        args.overwrite_items = True
        args.overwrite_overview = True

    # 获取 API Key
    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        logger.error("ZHIPU_API_KEY environment variable not set.")
        return

    processor = DailyProcessor(api_key, model_name=args.model)

    # 确定要处理的文件列表
    files_to_process = []
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data", "daily")

    if args.file:
        # 处理指定文件
        files_to_process.append(args.file)
    else:
        date_input = args.date if args.date else DateUtils.get_yesterday_str()
        
        # 检查是否是日期范围 "YYYY-MM-DD:YYYY-MM-DD"
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
            # 处理单个日期
            files_to_process.append(os.path.join(data_dir, f"{date_input}.json"))

    total_files = len(files_to_process)
    logger.info(f"Files to process: {total_files}")
    
    # 处理每个文件
    for idx, file_path in enumerate(files_to_process, 1):
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing file {idx}/{total_files}")
        logger.info(f"{'='*60}")
        
        processor.process(
            file_path, 
            skip_analysis=args.skip_analysis,
            skip_overview=args.skip_overview,
            overwrite_items=args.overwrite_items,
            overwrite_overview=args.overwrite_overview
        )
        
        # 文件间冷却时间
        if idx < total_files:
            cooldown = 10
            logger.info(f"Cooldown {cooldown}s before next file...")
            time.sleep(cooldown)

    logger.info(f"\n{'='*60}")
    logger.info(f"All done! Processed {total_files} file(s).")
    logger.info(f"{'='*60}")


if __name__ == "__main__":
    main()

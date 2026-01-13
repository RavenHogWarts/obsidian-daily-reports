import os
import json
import datetime
import re
import argparse
import logging
from typing import Dict, Any, Optional, List

import httpx
try:
    from zai import ZhipuAiClient
except ImportError:
    # Fallback or mock for environments without zai installed during dev/test if needed
    ZhipuAiClient = None

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

    def generate_report(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Call AI to generate the report."""
        if not self.client:
            logger.error("Client not initialized.")
            return None

        logger.info(f"Calling ZhipuAI API (Model: {self.model})...")
        try:
            # Check if using thinking model parameters
            # Note: For now, using standard create. Adapting based on scripts/test.py insights might happen here.
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                stream=False,
                # If we wanted to enable thinking:
                # thinking={"type": "enabled"} 
                # ensuring the model supports it and we handle response correctly.
            )
            
            content = response.choices[0].message.content.strip()
            return self._clean_json(content)
            
        except Exception as e:
            logger.error(f"Error calling AI API: {e}")
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

class DailyProcessor:
    ITEM_EVAL_PROMPT = """
你是一个 Obsidian 社区日报的毒舌而专业的编辑。请分析以下单条内容，并撰写总结。
**重要：不需要你判断内容的价值，所有给定的内容都需要进行总结和输出，不要丢弃任何内容。**

内容来源：{source}
标题：{title}
链接：{url}
正文/描述：
{content}

请直接返回以下 JSON 格式（不要 Markdown 代码块）：
{{
  "summary": "一句话中文摘要，切中痛点",
  "pain_point": "具体解决的痛点（如：图片丢失、同步冲突）",
  "highlights": ["亮点1（场景+结果）", "亮点2"],
  "comment": "一两句带情绪的毒舌点评",
  "tags": ["从列表选1-2个: [新手友好] [效率党] [颜值党] [数据极客] [开发者] [学术党]"],
  "score": 8
}}

请直接输出 JSON，不要 Markdown 代码块。
"""

    OVERVIEW_PROMPT = """
你是一个 Obsidian 社区日报的毒舌编辑。基于以下今日精选内容，写一段 100 字左右的**毒舌总结**（Overview）。
风格要求：口语化、辛辣、幽默，像老朋友吐槽一样串联今日亮点。

精选内容列表：
{items_text}

请直接输出总结文本（不要JSON）。
"""

    def __init__(self, api_key: str, model_name: str = "glm-4.7"):
        self.ai_client = AIClientWrapper(api_key, model=model_name)
        self.formatter = DataFormatter()

    def process(self, file_path: str):
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

        # 3. Process Items Parallelly
        valid_selections = []
        
        # Adjust max_workers based on account rate limits. 5 is conservative.
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_item = {executor.submit(self.evaluate_single_item, item): item for item in all_items}
            
            processed_count = 0
            for future in concurrent.futures.as_completed(future_to_item):
                item = future_to_item[future]
                processed_count += 1
                try:
                    result = future.result()
                    if result:
                        valid_selections.append(item)
                        logger.info(f"[{processed_count}/{len(all_items)}] ✅ Summary: {item.get('title')[:30]}...")
                    else:
                        logger.info(f"[{processed_count}/{len(all_items)}] ❌ Failed/Dropped: {item.get('title')[:30]}...")
                except Exception as exc:
                    logger.error(f"Item generated an exception: {exc}")

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

        try:
            response = self.ai_client.client.chat.completions.create(
                model=self.ai_client.model,
                messages=[{"role": "user", "content": prompt}],
                stream=False
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Overview generation failed: {e}")
            return "生成总结失败。"

def main():
    parser = argparse.ArgumentParser(description="AI Processor for Obsidian Daily Reports")
    parser.add_argument("--date", help="Date string YYYY-MM-DD (defaults to yesterday)", default=None)
    parser.add_argument("--file", help="Specific file path to process", default=None)
    parser.add_argument("--model", help="AI Model to use", default="glm-4.7")
    args = parser.parse_args()

    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        logger.error("ZHIPU_API_KEY environment variable not set.")
        return

    processor = DailyProcessor(api_key, model_name=args.model)

    if args.file:
        file_path = args.file
    else:
        date_str = args.date if args.date else DateUtils.get_yesterday_str()
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        data_dir = os.path.join(project_root, "data", "daily")
        file_path = os.path.join(data_dir, f"{date_str}.json")

    processor.process(file_path)

if __name__ == "__main__":
    main()

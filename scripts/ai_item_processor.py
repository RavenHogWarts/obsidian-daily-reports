"""
单条目 AI 处理模块
负责对单个条目进行 AI 分析和评分
支持日报和周报的条目处理
"""

import re
import logging
from typing import Dict, Any, Optional
from ai_client_base import AIProcessorBase

logger = logging.getLogger("AI_Item_Processor")


class DataFormatter:
    """数据格式化工具类"""
    
    def strip_html(self, text: str) -> str:
        """移除 HTML 标签"""
        if not text:
            return ""
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)

    def truncate_text(self, text: str, max_len: int = 500) -> str:
        """截断文本以节省 token"""
        if not text:
            return ""
        text = self.strip_html(text).strip()
        return text[:max_len] + "..." if len(text) > max_len else text


class ItemProcessor(AIProcessorBase):
    """
    单条目处理器
    负责对单个内容条目进行 AI 分析、评分和价值提炼
    """
    
    # 日报条目评估提示词
    DAILY_ITEM_PROMPT = """
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
4. **提炼方法**：从功能中提取 "核心价值 → 典型场景 → 具体结果"，只写前两层

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

    # 周报条目评估提示词（可以与日报不同）
    WEEKLY_ITEM_PROMPT = """
你是一个 Obsidian 社区周报的资深编辑。请分析以下单条内容，提炼其在一周时间维度下的价值。

## 待分析内容
- 来源：{source}
- 标题：{title}
- 链接：{url}
- 正文/描述：
{content}

## 写作要求（严格遵守）
1. **长期价值**：关注内容的持续影响力和长期实用性
2. **趋势洞察**：识别社区讨论热点和技术趋势
3. **亮点控制**：最多3条，突出周度级别的重要性
4. **场景化描述**：用实际使用场景说明价值

## 输出 JSON 格式（不要 Markdown 代码块）
{{
  "summary": "一句话中文摘要（15-30字），突出周度价值",
  "pain_point": "解决的核心问题或满足的需求",
  "highlights": [
    "亮点1（25-35字）",
    "亮点2（25-35字）",
    "亮点3（25-35字）"
  ],
  "comment": "简短点评，可以包含趋势观察",
  "tags": ["1-2个标签"],
  "score": 1-10的整数，周报视角下的重要性评分
}}

请直接输出 JSON。
"""

    def __init__(self, api_key: str, model_name: str = "glm-4.7", 
                 max_concurrent: int = 3, min_interval: float = 2.0):
        """
        初始化条目处理器
        
        Args:
            api_key: API 密钥
            model_name: 模型名称
            max_concurrent: 最大并发请求数
            min_interval: 最小请求间隔（秒）
        """
        super().__init__(api_key, model_name, max_concurrent, min_interval)
        self.formatter = DataFormatter()

    def evaluate_item(self, item: Dict[str, Any], report_type: str = "daily") -> bool:
        """
        评估单个条目
        
        Args:
            item: 待评估的条目数据
            report_type: 报告类型，"daily" 或 "weekly"
            
        Returns:
            True 表示条目有价值并已更新，False 表示条目被丢弃
        """
        # 准备内容
        title = item.get('title', '')
        url = item.get('url', '')
        content = item.get('content_text') or item.get('body') or item.get('content_html') or ""
        content = self.formatter.truncate_text(content, max_len=800)
        source = item.get('source', 'Unknown')

        # 选择提示词模板
        if report_type == "weekly":
            prompt_template = self.WEEKLY_ITEM_PROMPT
        else:
            prompt_template = self.DAILY_ITEM_PROMPT

        prompt = prompt_template.format(
            source=source,
            title=title,
            url=url,
            content=content
        )

        # 调用 AI
        ai_res = self.ai_client.generate_json_response(prompt, enable_thinking=True)
        
        if not ai_res:
            return False
            
        if ai_res.get("drop") is True:
            return False
            
        # 更新条目的 AI 分析结果
        item["ai_summary"] = ai_res.get("summary")
        item["ai_pain_point"] = ai_res.get("pain_point")
        item["ai_highlights"] = ai_res.get("highlights")
        item["ai_comment"] = ai_res.get("comment")
        item["ai_tags"] = ai_res.get("tags")
        item["ai_score"] = ai_res.get("score")
        
        return True

    def evaluate_item_with_rate_limit(self, item: Dict[str, Any], 
                                     report_type: str = "daily", 
                                     max_retries: int = 3) -> bool:
        """
        带速率限制和重试的条目评估
        
        Args:
            item: 待评估的条目数据
            report_type: 报告类型，"daily" 或 "weekly"
            max_retries: 最大重试次数
            
        Returns:
            True 表示条目有价值并已更新，False 表示条目被丢弃或失败
        """
        try:
            return self.call_with_rate_limit(
                self.evaluate_item, 
                item, 
                report_type, 
                max_retries=max_retries
            )
        except Exception as e:
            logger.error(f"Error evaluating item: {e}")
            return False

    def batch_evaluate_items(self, items: list, report_type: str = "daily", 
                           overwrite: bool = False) -> list:
        """
        批量评估条目（支持并发）
        
        Args:
            items: 待评估的条目列表
            report_type: 报告类型，"daily" 或 "weekly"
            overwrite: 是否覆盖已有的 AI 分析结果
            
        Returns:
            成功评估的条目列表
        """
        import concurrent.futures
        
        valid_items = []
        futures = {}
        
        # 预先过滤已处理的条目
        items_to_process = []
        for item in items:
            if not overwrite and item.get("ai_summary"):
                logger.info(f"⏭️  Skipping already processed: {item.get('title', '')[:30]}...")
                valid_items.append(item)
            else:
                items_to_process.append(item)
        
        total_items = len(items)
        processed_count = len(valid_items)
        items_pending = len(items_to_process)
        
        logger.info(f"Items to process: {items_pending}, Already processed: {processed_count}")
        
        # 使用线程池并发处理
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            for item in items_to_process:
                future = executor.submit(
                    self.evaluate_item_with_rate_limit, 
                    item, 
                    report_type
                )
                futures[future] = item

            for future in concurrent.futures.as_completed(futures):
                item = futures[future]
                processed_count += 1
                try:
                    result = future.result()
                    if result:
                        valid_items.append(item)
                        logger.info(f"[{processed_count}/{total_items}] ✅ Summary: {item.get('title', '')[:30]}...")
                    else:
                        logger.info(f"[{processed_count}/{total_items}] ❌ Failed/Dropped: {item.get('title', '')[:30]}...")
                except Exception as exc:
                    logger.error(f"[{processed_count}/{total_items}] ❌ Exception: {exc}")

        logger.info(f"Processed {len(valid_items)} items successfully.")
        return valid_items

"""
汇总总结生成模块
负责根据已评估的条目生成整体总结（Overview）
支持日报和周报的总结生成
"""

import logging
from typing import List, Dict, Any, Optional
from ai_client_base import AIProcessorBase

logger = logging.getLogger("AI_Overview_Generator")


class OverviewGenerator(AIProcessorBase):
    """
    总结生成器
    根据已评估的条目列表生成整体性的总结文本
    """
    
    # 日报总结提示词
    DAILY_OVERVIEW_PROMPT = """
你是一个 Obsidian 社区日报的毒舌编辑。基于以下今日精选内容，写一段 100 字左右的**毒舌总结**（Overview）。
** 目的是为用户提供价值导向的社区新鲜事概览，帮助用户快速发现实用分享、节省时间、提升 Obsidian 使用体验。**
风格要求：口语化、生活化、带情绪感（最爱、上瘾、告别xx、终于可以xx），像老朋友吐槽一样串联今日亮点。

精选内容列表：
{items_text}

请直接输出总结文本（不要JSON）。
"""

    # 周报总结提示词
    WEEKLY_OVERVIEW_PROMPT = """
你是一个 Obsidian 社区周报的资深编辑。基于以下本周精选内容，写一段 150-200 字的**周报总结**（Weekly Overview）。
** 目的是帮助用户了解本周社区的主要趋势、重要更新和值得关注的讨论。**
风格要求：
1. 专业而不失轻松，点出本周的关键主题和趋势
2. 突出对用户有长期价值的内容
3. 可以包含一些观察和洞见
4. 用简洁有力的语言串联本周亮点

本周精选内容列表：
{items_text}

请直接输出总结文本（不要JSON）。
"""

    def __init__(self, api_key: str, model_name: str = "glm-4.7"):
        """
        初始化总结生成器
        
        Args:
            api_key: API 密钥
            model_name: 模型名称
        """
        super().__init__(api_key, model_name, max_concurrent=1, min_interval=1.0)

    def generate_overview(self, items: List[Dict[str, Any]], 
                         report_type: str = "daily",
                         top_n: int = 10) -> str:
        """
        生成总结文本
        
        Args:
            items: 已评估的条目列表
            report_type: 报告类型，"daily" 或 "weekly"
            top_n: 用于生成总结的条目数量（取评分最高的前 N 个）
            
        Returns:
            总结文本
        """
        if not items:
            return "今日无事发生。" if report_type == "daily" else "本周无事发生。"
        
        # 按评分降序排序
        items.sort(key=lambda x: x.get('ai_score', 0), reverse=True)
        
        # 取前 N 个条目
        top_items = items[:top_n]
        
        # 构建条目文本列表
        items_text_list = []
        for i, item in enumerate(top_items, 1):
            score = item.get('ai_score', 0)
            title = item.get('title', 'No Title')
            summary = item.get('ai_summary', '')
            items_text_list.append(f"{i}. [{score}] {title}: {summary}")
            
        items_text = "\n".join(items_text_list)
        
        # 选择提示词模板
        if report_type == "weekly":
            prompt_template = self.WEEKLY_OVERVIEW_PROMPT
        else:
            prompt_template = self.DAILY_OVERVIEW_PROMPT
            
        prompt = prompt_template.format(items_text=items_text)
        
        # 调用 AI 生成总结
        if not self.ai_client.client:
            return "AI Client 初始化失败。"

        result = self.ai_client.chat_completion(prompt, enable_thinking=True)
        if result:
            return result
        
        return "生成总结失败。"

    def generate_overview_with_rate_limit(self, items: List[Dict[str, Any]], 
                                         report_type: str = "daily",
                                         top_n: int = 10,
                                         max_retries: int = 3) -> str:
        """
        带速率限制和重试的总结生成
        
        Args:
            items: 已评估的条目列表
            report_type: 报告类型，"daily" 或 "weekly"
            top_n: 用于生成总结的条目数量
            max_retries: 最大重试次数
            
        Returns:
            总结文本
        """
        try:
            return self.call_with_rate_limit(
                self.generate_overview,
                items,
                report_type,
                top_n,
                max_retries=max_retries
            )
        except Exception as e:
            logger.error(f"Error generating overview: {e}")
            return "生成总结时发生错误。"

    def generate_weekly_stats(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        生成周报统计信息
        
        Args:
            items: 已评估的条目列表
            
        Returns:
            统计信息字典
        """
        if not items:
            return {
                "total_items": 0,
                "high_score_items": 0,
                "average_score": 0,
                "top_tags": []
            }
        
        # 计算统计信息
        total = len(items)
        high_score = len([item for item in items if item.get('ai_score', 0) >= 8])
        avg_score = sum(item.get('ai_score', 0) for item in items) / total if total > 0 else 0
        
        # 统计标签
        tag_counts = {}
        for item in items:
            tags = item.get('ai_tags', [])
            for tag in tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # 取前5个最常见的标签
        top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_items": total,
            "high_score_items": high_score,
            "average_score": round(avg_score, 2),
            "top_tags": [{"tag": tag, "count": count} for tag, count in top_tags]
        }

    def generate_comprehensive_summary(self, items: List[Dict[str, Any]], 
                                      report_type: str = "daily") -> Dict[str, Any]:
        """
        生成综合性的总结（包含文本总结和统计信息）
        
        Args:
            items: 已评估的条目列表
            report_type: 报告类型，"daily" 或 "weekly"
            
        Returns:
            包含总结文本和统计信息的字典
        """
        overview_text = self.generate_overview_with_rate_limit(items, report_type)
        
        summary = {
            "overview": overview_text,
            "total_items": len(items),
            "selected_count": len([item for item in items if item.get('ai_summary')])
        }
        
        # 周报额外添加统计信息
        if report_type == "weekly":
            stats = self.generate_weekly_stats(items)
            summary.update(stats)
        
        return summary

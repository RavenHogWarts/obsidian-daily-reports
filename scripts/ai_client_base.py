"""
基础 AI 客户端模块
提供通用的 AI API 调用功能，支持日报和周报处理
"""

import json
import logging
import time
import threading
from typing import Optional, Dict, Any
import httpx
from zai import ZhipuAiClient

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AI_Client")


class RateLimiter:
    """
    线程安全的速率限制器（令牌桶算法）。
    确保并发环境下 API 请求速率不超过限制。
    """
    def __init__(self, max_concurrent: int = 3, min_interval: float = 5.0):
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


class AIClientWrapper:
    """
    AI 客户端封装类
    提供统一的 AI API 调用接口
    """
    def __init__(self, api_key: str, model: str = "glm-4.7", 
                 base_url: str = "https://open.bigmodel.cn/api/coding/paas/v4/"):
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

    def chat_completion(self, prompt: str, enable_thinking: bool = True) -> Optional[str]:
        """
        通用的对话补全接口
        
        Args:
            prompt: 输入提示词
            enable_thinking: 是否启用思考模式
            
        Returns:
            AI 响应内容（纯文本）
        """
        if not self.client:
            logger.error("Client not initialized.")
            return None

        try:
            messages = [{"role": "user", "content": prompt}]
            
            # 构建请求参数
            request_params = {
                "model": self.model,
                "messages": messages,
                "stream": True
            }
            
            # 如果启用思考模式
            if enable_thinking:
                request_params["thinking"] = {"type": "enabled"}
            
            response = self.client.chat.completions.create(**request_params)
            
            full_content = ""
            for chunk in response:
                if chunk.choices:
                    delta = chunk.choices[0].delta
                    # Capture reasoning context if available
                    if getattr(delta, 'reasoning_content', None):
                        logger.debug(f"[Thinking] {delta.reasoning_content}")
                    
                    if delta.content:
                        full_content += delta.content
            
            return full_content.strip()
            
        except Exception as e:
            logger.error(f"Error calling AI API: {e}")
            return None

    def generate_json_response(self, prompt: str, enable_thinking: bool = True) -> Optional[Dict[str, Any]]:
        """
        调用 AI 生成 JSON 响应
        
        Args:
            prompt: 输入提示词
            enable_thinking: 是否启用思考模式
            
        Returns:
            解析后的 JSON 对象
        """
        logger.info(f"Calling ZhipuAI API (Model: {self.model})...")
        content = self.chat_completion(prompt, enable_thinking=enable_thinking)
        if content:
            return self._clean_json(content)
        return None

    def _clean_json(self, content: str) -> Optional[Dict[str, Any]]:
        """
        清理 markdown 包装并解析 JSON
        
        Args:
            content: AI 返回的原始内容
            
        Returns:
            解析后的 JSON 对象
        """
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


class AIProcessorBase:
    """
    AI 处理器基类
    提供通用的处理功能和速率限制
    """
    def __init__(self, api_key: str, model_name: str = "glm-4.7", 
                 max_concurrent: int = 3, min_interval: float = 2.0):
        """
        Args:
            api_key: API 密钥
            model_name: 模型名称
            max_concurrent: 最大并发请求数
            min_interval: 最小请求间隔（秒）
        """
        self.ai_client = AIClientWrapper(api_key, model=model_name)
        self.rate_limiter = RateLimiter(max_concurrent=max_concurrent, min_interval=min_interval)
        
    def call_with_rate_limit(self, func, *args, max_retries: int = 3, **kwargs):
        """
        带速率限制和重试的函数调用
        
        Args:
            func: 要调用的函数
            max_retries: 最大重试次数
            *args, **kwargs: 传递给函数的参数
            
        Returns:
            函数执行结果
        """
        retries = 0
        base_delay = 5.0  # 基础重试延迟（秒）
        
        while retries <= max_retries:
            try:
                # 获取速率限制许可
                self.rate_limiter.acquire()
                try:
                    return func(*args, **kwargs)
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
                        logger.warning(f"Rate limited, retry {retries}/{max_retries} after {delay}s")
                        time.sleep(delay)
                    else:
                        logger.error(f"Max retries exceeded")
                        raise
                else:
                    # 其他错误直接抛出
                    raise
        
        raise Exception("Failed after all retries")

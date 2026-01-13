/**
 * 工具函数：从 HTML 或纯文本中提取摘要
 * @param htmlOrText - HTML 或纯文本内容
 * @param maxLength - 最大长度，默认 200
 * @returns 处理后的摘要文本
 */
export const getSummary = (
  htmlOrText: string | undefined,
  maxLength: number = 200
): string => {
  if (!htmlOrText) return "";
  const text = htmlOrText.replace(/<[^>]*>?/gm, "");
  const cleanText = text.replace(/&nbsp;/g, " ").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + "...";
};

/**
 * 从标题中自动检测项目类型
 * @param title - 项目标题
 * @returns 项目类型：'plugin' | 'theme' | null
 */
export const detectProjectType = (title: string): "plugin" | "theme" | null => {
  const lower = title.toLowerCase();
  if (lower.includes("theme")) return "theme";
  if (lower.includes("plugin")) return "plugin";
  return null;
};

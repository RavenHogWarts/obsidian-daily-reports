export type CalloutType = "forum" | "pr" | "merged" | "reddit";

export interface CalloutStyle {
  color: string;
  icon: string;
  bg: string;
}

/**
 * 根据 Callout 类型获取对应的样式配置
 * @param type - Callout 类型
 * @returns 样式配置对象
 */
export const getCalloutStyles = (type: CalloutType): CalloutStyle => {
  switch (type) {
    case "pr":
      return { color: "#3b82f6", icon: "⚡", bg: "rgba(59, 130, 246, 0.04)" };
    case "merged":
      return { color: "#10b981", icon: "🚀", bg: "rgba(16, 185, 129, 0.04)" };
    case "reddit":
      return { color: "#ff4500", icon: "🔥", bg: "rgba(255, 69, 0, 0.04)" };
    case "forum":
    default:
      return { color: "#64748b", icon: "💬", bg: "rgba(100, 116, 139, 0.04)" };
  }
};

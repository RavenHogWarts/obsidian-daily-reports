export type CalloutType = "forum" | "pr" | "merged" | "reddit";

export interface CalloutStyle {
  /** 图标 emoji */
  icon: string;
  /** 卡片背景色 */
  bgClass: string;
  /** 左侧边框色 */
  borderClass: string;
  /** 头部/底部背景色 */
  headerBgClass: string;
  /** 文字强调色 */
  textClass: string;
  /** 标签背景色 */
  tagBgClass: string;
}

/**
 * 根据 Callout 类型获取对应的 Tailwind 类名配置
 * @param type - Callout 类型
 * @returns 样式配置对象
 */
export const getCalloutStyles = (type: CalloutType): CalloutStyle => {
  switch (type) {
    case "pr":
      return {
        icon: "⚡",
        bgClass: "bg-blue-50/60 dark:bg-blue-950/20",
        borderClass: "border-l-blue-400 dark:border-l-blue-500",
        headerBgClass: "bg-blue-100/50 dark:bg-blue-900/30",
        textClass: "text-blue-600 dark:text-blue-400",
        tagBgClass: "bg-blue-100 dark:bg-blue-900/50",
      };
    case "merged":
      return {
        icon: "🚀",
        bgClass: "bg-emerald-50/60 dark:bg-emerald-950/20",
        borderClass: "border-l-emerald-400 dark:border-l-emerald-500",
        headerBgClass: "bg-emerald-100/50 dark:bg-emerald-900/30",
        textClass: "text-emerald-600 dark:text-emerald-400",
        tagBgClass: "bg-emerald-100 dark:bg-emerald-900/50",
      };
    case "reddit":
      return {
        icon: "🔥",
        bgClass: "bg-orange-50/60 dark:bg-orange-950/20",
        borderClass: "border-l-orange-400 dark:border-l-orange-500",
        headerBgClass: "bg-orange-100/50 dark:bg-orange-900/30",
        textClass: "text-orange-600 dark:text-orange-400",
        tagBgClass: "bg-orange-100 dark:bg-orange-900/50",
      };
    case "forum":
    default:
      return {
        icon: "💬",
        bgClass: "bg-violet-50/60 dark:bg-violet-950/20",
        borderClass: "border-l-violet-400 dark:border-l-violet-500",
        headerBgClass: "bg-violet-100/50 dark:bg-violet-900/30",
        textClass: "text-violet-600 dark:text-violet-400",
        tagBgClass: "bg-violet-100 dark:bg-violet-900/50",
      };
  }
};

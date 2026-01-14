import React from 'react';

/** Badge 类型定义 */
export type BadgeType = 
  | 'merged'   // 已合并 PR - 绿色
  | 'opened'   // 已开启 PR - 蓝色
  | 'plugin'   // 插件 - 紫色
  | 'theme'    // 主题 - 粉色
  | 'enforum'  // 英文论坛 - 灰色
  | 'cnforum'  // 中文论坛 - 黄色
  | 'reddit'   // Reddit - 橙红色
  | 'score'    // AI 评分 - 靛青色
  | 'default'; // 默认 - 灰色

/** 预定义颜色配置 */
const BADGE_STYLES: Record<BadgeType, { text: string; bg: string; border: string }> = {
  merged:  { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-300 dark:border-emerald-700' },
  opened:  { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-300 dark:border-blue-700' },
  plugin:  { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-900/40', border: 'border-violet-300 dark:border-violet-700' },
  theme:   { text: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-300 dark:border-pink-700' },
  enforum: { text: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-700/80', border: 'border-slate-300 dark:border-slate-600' },
  cnforum: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-300 dark:border-amber-700' },
  reddit:  { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300 dark:border-orange-700' },
  score:   { text: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-100 dark:bg-cyan-900/40', border: 'border-cyan-300 dark:border-cyan-700' },
  default: { text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-700/80', border: 'border-slate-200 dark:border-slate-600' },
};

export interface BadgeProps {
  text: string;
  type?: BadgeType;
}

/**
 * Badge 组件 - 用于显示标签徽章
 * 通过 type 属性选择预定义颜色主题
 */
export const Badge: React.FC<BadgeProps> = ({ text, type = 'default' }) => {
  const style = BADGE_STYLES[type];
  return (
    <span 
      className={`callout-badge inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}
    >
      {text}
    </span>
  );
};

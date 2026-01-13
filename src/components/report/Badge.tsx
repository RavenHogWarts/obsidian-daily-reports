import React from 'react';

export interface BadgeProps {
  text: string;
  color: string;
  bg?: string;
}

/**
 * Badge 组件 - 用于显示标签徽章
 */
export const Badge: React.FC<BadgeProps> = ({ text, color, bg }) => (
  <span 
    className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider mr-2 align-middle border"
    style={{
      color: color,
      backgroundColor: bg || `${color}15`,
      borderColor: `${color}40`
    }}
  >
    {text}
  </span>
);

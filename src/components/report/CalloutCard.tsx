import React from 'react';
import { getCalloutStyles, type CalloutType } from '../../utils/calloutStyles';

export interface CalloutCardProps {
  title: string;
  summary: string;
  meta: React.ReactNode;
  link: string;
  type: CalloutType;
  badges?: React.ReactNode[];
}

/**
 * CalloutCard 组件 - 用于显示论坛帖子、PR、Reddit 等内容卡片
 */
export const CalloutCard: React.FC<CalloutCardProps> = ({ 
  title, 
  summary, 
  meta, 
  link, 
  type, 
  badges = [] 
}) => {
  const style = getCalloutStyles(type);
  
  return (
    <div 
      className="group relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: style.color,
        backgroundColor: style.bg
      }}
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-start gap-3">
        <span className="text-xl leading-tight" role="img" aria-label="icon">{style.icon}</span>
        <div className="flex-1">
            <div className="mb-1">
                {badges.map((badge, i) => <span key={i}>{badge}</span>)}
            </div>
            <h3 className="text-lg font-bold leading-snug m-0">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white no-underline hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                {title}
              </a>
            </h3>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2 pb-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
        {summary}
      </div>

      {/* Footer / Meta */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center bg-white/30 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          {meta}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" 
          className="font-semibold no-underline flex items-center gap-1 hover:underline transition-colors"
          style={{ color: style.color }}
        >
          Read <span className="text-lg">›</span>
        </a>
      </div>
    </div>
  );
};

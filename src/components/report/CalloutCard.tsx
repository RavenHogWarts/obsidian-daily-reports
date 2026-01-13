import React from 'react';
import { getCalloutStyles, type CalloutType } from '../../utils/calloutStyles';
import type { AIAnalysis } from '../../types/data';

export interface CalloutCardProps {
  title: string;
  summary?: string;
  meta: React.ReactNode;
  link: string;
  type: CalloutType;
  badges?: React.ReactNode[];
  aiAnalysis?: AIAnalysis;
}

/**
 * CalloutCard Component - Displays posts, PRs, Reddit items with AI insights
 */
export const CalloutCard: React.FC<CalloutCardProps> = ({ 
  title, 
  summary, 
  meta, 
  link, 
  type, 
  badges = [],
  aiAnalysis
}) => {
  const style = getCalloutStyles(type);
  
  // Decide what to show
  const showAIContent = !!aiAnalysis?.ai_summary;

  return (
    <div 
      className="group relative rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-slate-800/40 backdrop-blur-sm"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: style.color,
      }}
    >
      {/* Header */}
      <div className="p-5 pb-3 flex items-start gap-4">
        <span className="text-2xl leading-tight opacity-90 filter drop-shadow-sm" role="img" aria-label="icon">{style.icon}</span>
        <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
                {badges.map((badge, i) => <span key={i} className="transform hover:scale-105 transition-transform">{badge}</span>)}
                {aiAnalysis?.ai_score && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    Score: {aiAnalysis.ai_score}/10
                  </span>
                )}
            </div>
            <h3 className="text-xl font-bold leading-snug m-0 tracking-tight">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-gray-100 no-underline hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-2">
                {title}
              </a>
            </h3>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-2 flex-1 relative">
        {showAIContent ? (
           <div className="space-y-4">
              {/* Summary */}
              {aiAnalysis.ai_summary && (
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {aiAnalysis.ai_summary}
                </div>
              )}

              {/* Pain Point */}
              {aiAnalysis.ai_pain_point && (
                 <div className="flex gap-2 items-start bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/20">
                    <span className="text-rose-500 mt-0.5">😣</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">Pain Point</strong>
                      {aiAnalysis.ai_pain_point}
                    </span>
                 </div>
              )}

              {/* Highlights */}
              {aiAnalysis.ai_highlights && aiAnalysis.ai_highlights.length > 0 && (
                <ul className="list-none space-y-2 m-0 p-0">
                  {aiAnalysis.ai_highlights.map((highlight, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-sm text-slate-600 dark:text-slate-400">
                       <span className="text-emerald-500 mt-1 shrink-0">✓</span>
                       <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* AI Comment */}
              {aiAnalysis.ai_comment && (
                <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border-l-2 border-violet-500 italic text-sm text-slate-600 dark:text-slate-400">
                   <span className="text-violet-500 font-semibold not-italic mr-2">🤖 AI Opinion:</span>
                   {aiAnalysis.ai_comment}
                </div>
              )}
              
              {/* Tags */}
              {aiAnalysis.ai_tags && aiAnalysis.ai_tags.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    {aiAnalysis.ai_tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        #{tag}
                      </span>
                    ))}
                 </div>
              )}
           </div>
        ) : (
          <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-4">
            {summary}
          </div>
        )}
      </div>

      {/* Footer / Meta */}
      <div className="mt-4 px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2 font-medium">
          {meta}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" 
          className="group/link font-semibold no-underline flex items-center gap-1 hover:underline transition-all"
          style={{ color: style.color }}
        >
          Read Source <span className="text-lg transition-transform group-hover/link:translate-x-0.5">›</span>
        </a>
      </div>
    </div>
  );
};

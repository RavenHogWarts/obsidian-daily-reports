import React from 'react';
import { getCalloutStyles, type CalloutType } from '../../utils/calloutStyles';
import type { AIAnalysis } from '../../types/data';
import { Badge } from '.';

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
  const s = getCalloutStyles(type);
  
  // Decide what to show
  const showAIContent = !!aiAnalysis?.ai_summary;

  return (
    <div 
      className={`callout group relative rounded-xl overflow-hidden flex flex-col h-full 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 
        border-l-4 shadow-sm ${s.bgClass} ${s.borderClass}`}
    >
      {/* Header */}
      <div className={`callout-header flex items-center gap-2.5 px-5 py-3 text-base font-semibold ${s.headerBgClass}`}>
        <span className='callout-icon text-lg'>{s.icon}</span>
        <div className='callout-header-inner flex flex-1 items-center gap-2 justify-between min-w-0'>
          <span className='callout-title truncate text-slate-800 dark:text-slate-100'>{title}</span>
          <div className='callout-badges flex items-center gap-1.5 flex-shrink-0'>
            {badges.filter(Boolean).map((badge) => badge)}
            {aiAnalysis?.ai_score && (
              <Badge key="score" text={`Score: ${aiAnalysis.ai_score}/10`} type="score" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='callout-content px-5 py-4 flex-1 text-sm text-slate-600 dark:text-slate-300 space-y-3'>
        {showAIContent ? (<>
          {/* AI Summary */}
          <div className='callout-content-summary'>
            <p className='leading-relaxed'>
              <span className={`font-semibold mr-1.5 ${s.textClass}`}>📝 摘要：</span>
              <span className='text-slate-700 dark:text-slate-200'>{aiAnalysis.ai_summary}</span>
            </p>
          </div>

          {/* Pain Point */}
          {aiAnalysis.ai_pain_point && (
            <div className='callout-content-pain-point'>
              <p className='leading-relaxed'>
                <span className={`font-semibold mr-1.5 ${s.textClass}`}>🎯 痛点：</span>
                <span className='text-slate-700 dark:text-slate-200'>{aiAnalysis.ai_pain_point}</span>
              </p>
            </div>
          )}

          {/* Highlights */}
          {aiAnalysis.ai_highlights && aiAnalysis.ai_highlights.length > 0 && (
            <div className='callout-content-highlights'>
              <span className={`font-semibold ${s.textClass}`}>💡 亮点：</span>
              <ul className='list-none mt-2 space-y-1.5 pl-8'>
                {aiAnalysis.ai_highlights.map((highlight, i) => (
                  <li 
                    key={i} 
                    className='relative text-slate-700 dark:text-slate-200 before:content-["•"] before:absolute before:-left-3 before:text-slate-400 dark:before:text-slate-500'
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Comment */}
          {aiAnalysis.ai_comment && (
            <div className={`callout-content-ai-comment mt-3 p-3 rounded-lg text-slate-700 dark:text-slate-200 ${s.headerBgClass}`}>
              <span className={`font-semibold mr-1.5 ${s.textClass}`}>💬 点评：</span>
              <span className='italic'>{aiAnalysis.ai_comment}</span>
            </div>
          )}

          {/* Tags */}
          {aiAnalysis.ai_tags && aiAnalysis.ai_tags.length > 0 && (
            <div className='callout-content-tags flex flex-wrap gap-1.5 pt-2'>
              {aiAnalysis.ai_tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className={`text-xs px-2 py-0.5 rounded-full ${s.tagBgClass} ${s.textClass}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </>) : (<>
          <p className='leading-relaxed'>
            <span className='font-semibold text-slate-500 dark:text-slate-400 mr-1.5'>原始内容：</span>
            <span className='text-slate-700 dark:text-slate-200'>{summary}</span>
          </p>
        </>)}
      </div>

      {/* Footer */}
      <div className={`callout-footer px-5 py-2.5 text-xs flex justify-between items-center ${s.headerBgClass}`}>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          {meta}
        </div>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`group/link font-semibold no-underline flex items-center gap-0.5 transition-all hover:gap-1 ${s.textClass}`}
        >
          查看原文 
          <span className="text-base transition-transform group-hover/link:translate-x-0.5">→</span>
        </a>
      </div>
    </div>
  );
};



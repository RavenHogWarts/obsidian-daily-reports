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
  const style = getCalloutStyles(type);
  
  // Decide what to show
  const showAIContent = !!aiAnalysis?.ai_summary;

  return (
    <div 
      className="callout group relative rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-slate-800/40 backdrop-blur-sm"
    >
      <div className='callout-header flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700/50 text-lg font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30'>
        <div className='callout-icon'>{style.icon}</div>
        <div className='callout-header-inner flex flex-1 items-center gap-2 justify-between'>
          <div className='callout-title'>{title}</div>
          <div className='callout-badges flex items-center gap-2'>
            {badges.filter(Boolean).map((badge, i) => badge)}
            {aiAnalysis?.ai_score && (
              <Badge key="score" text={`Score: ${aiAnalysis.ai_score}/10`} type="score" />
            )}
          </div>
        </div>
      </div>

      <div className='callout-content px-5 py-2 flex-1 relative'>
        {showAIContent ? (<>
          <div className='callout-content-summary mb-4'>
            <p>
              <span className='font-bold'>一句话摘要：</span>
              {aiAnalysis.ai_summary && (<span>{aiAnalysis.ai_summary}</span>)}
            </p>
          </div>

          <div className='callout-content-pain-point'>
            <p>
              <span className='font-bold'>主要痛点：</span>
              {aiAnalysis.ai_pain_point && (<span>{aiAnalysis.ai_pain_point}</span>)}
            </p>
          </div>

          <div className='callout-content-highlights'>
            <p>
              <span className='font-bold'>💡 核心亮点：</span>
              {aiAnalysis.ai_highlights && aiAnalysis.ai_highlights.length > 0 && (
                <ul className='list-disc list-inside my-4'>
                  {aiAnalysis.ai_highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              )}
            </p>
          </div>

          <div className='callout-content-ai-comment'>
            <p>
              <span className='font-bold'>💬 AI 锐评：</span>
              {aiAnalysis.ai_comment && (<span>{aiAnalysis.ai_comment}</span>)}
            </p>
          </div>

          <div className='callout-content-tags'>
            <p>
              {aiAnalysis.ai_tags && aiAnalysis.ai_tags.length > 0 && (
                aiAnalysis.ai_tags.map((tag, tIdx) => (
                  <span key={tIdx} className="callout-content-tag">
                    #{tag}
                  </span>
                ))
          )}
            </p>
          </div>
        </>) : (<>
          <p>
            <span>原始内容：</span>
            <span>{summary}</span>
          </p>
        </>)}
      </div>

      <div className='callout-footer mt-4 px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30'>
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

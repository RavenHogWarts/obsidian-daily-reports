import React from 'react';

export interface EmptyStateProps {
  message?: string;
  period?: 'day' | 'week';
}

/**
 * EmptyState 组件 - 空状态显示
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message,
  period = 'day'
}) => {
  const defaultMessage = period === 'day' 
    ? '💤 No community activity recorded for this day.'
    : '💤 No community activity recorded for this week.';
    
  return (
    <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl">
      <p className="text-lg text-slate-500 dark:text-slate-400">{message || defaultMessage}</p>
    </div>
  );
};

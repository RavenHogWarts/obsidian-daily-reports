import React from 'react';

export interface LoadingSpinnerProps {
  message?: string;
}

/**
 * LoadingSpinner 组件 - 加载状态指示器
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => (
  <div className="py-24 text-center text-slate-500 dark:text-slate-400">
    <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-violet-600 dark:border-t-violet-400 rounded-full mx-auto mb-4 animate-spin"></div>
    <p>{message}</p>
  </div>
);

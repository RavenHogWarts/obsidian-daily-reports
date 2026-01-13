import React from 'react';
import { Link } from 'react-router-dom';

export interface ErrorMessageProps {
  title?: string;
  message: string;
}

/**
 * ErrorMessage 组件 - 错误状态显示
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Report Not Found', 
  message 
}) => (
  <div className="py-24 text-center">
    <h2 className="text-red-500 dark:text-red-400 text-3xl mb-4">{title}</h2>
    <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
    <Link to="/" className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors">
      Return Home
    </Link>
  </div>
);

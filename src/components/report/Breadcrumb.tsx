import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbProps {
  currentPage: string;
}

/**
 * Breadcrumb 组件 - 面包屑导航
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage }) => (
  <div className="mb-8 text-sm">
    <Link to="/" className="text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
      Home
    </Link>
    <span className="mx-2 text-slate-400 dark:text-slate-500">/</span>
    <span className="text-slate-900 dark:text-white">{currentPage}</span>
  </div>
);

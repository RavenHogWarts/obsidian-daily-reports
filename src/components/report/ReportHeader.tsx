import React from 'react';
import { Minus } from 'lucide-react';

export interface ReportHeaderProps {
  title: React.ReactNode;
  subtitle: string;
  dateInfo?: React.ReactNode;
}

/**
 * ReportHeader 组件 - 报告页面头部
 */
export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, subtitle, dateInfo }) => (
  <div className="text-center mb-12 pt-4">
    <Minus size={60} strokeWidth={4} className="mx-auto text-slate-900 dark:text-slate-100 opacity-80" />
    <h1 className="text-3xl md:text-4xl font-normal tracking-wide mt-4 mb-2 text-slate-900 dark:text-white">
      {title}
    </h1>
    {dateInfo && (
      <div className="text-base text-slate-600 dark:text-slate-300 font-medium mt-2">
        {dateInfo}
      </div>
    )}
    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase mt-4">
      {subtitle}
    </p>
  </div>
);

import React from 'react';
import { TableOfContents } from './TableOfContents';
import type { TocSection } from '../../hooks/useTableOfContents';

export interface ReportLayoutProps {
  children: React.ReactNode;
  tocSections: TocSection[];
  showToc?: boolean;
}

/**
 * ReportLayout Component - 报告页面统一布局
 * 
 * 提供主内容区域和侧边TOC的布局容器
 * - 左侧：主要内容（带最大宽度限制）
 * - 右侧：固定TOC导航
 */
export const ReportLayout: React.FC<ReportLayoutProps> = ({ 
  children, 
  tocSections,
  showToc = true 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-8">
        {/* 主内容区 */}
        <div className="flex-1 min-w-0 max-w-5xl">
          {children}
        </div>
        
        {/* TOC 导航 */}
        {showToc && tocSections.length > 0 && (
          <div className="hidden lg:block w-72 flex-shrink-0">
            <TableOfContents sections={tocSections} />
          </div>
        )}
      </div>
    </div>
  );
};

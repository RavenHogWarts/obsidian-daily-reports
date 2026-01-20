import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useTableOfContents, type TocSection } from '../../hooks/useTableOfContents';

export interface TableOfContentsProps {
  sections: TocSection[];
}

/**
 * TableOfContents Component - 侧边导航目录
 * 
 * Features:
 * - 滚动监听自动高亮
 * - 点击平滑跳转
 * - 响应式设计（移动端可收起）
 * - 显示章节内容数量
 * - 支持二级目录（卡片级别导航）
 * - 自动展开/折叠章节
 * - 随页面滚动
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  const { activeId, scrollToSection, expandedSections, toggleSection } = useTableOfContents(sections);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const tocContentRef = useRef<HTMLDivElement>(null);

  // 当 activeId 变化时，自动滚动到当前条目
  useEffect(() => {
    if (!activeId || !tocContentRef.current) return;
    
    const activeElement = tocContentRef.current.querySelector(`[data-toc-id="${activeId}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeId]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {/* 移动端切换按钮 */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-3 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-colors"
        aria-label="Toggle Table of Contents"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* TOC 容器 */}
      <aside className="sticky top-24 self-start w-72">
        <nav 
          className="
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
            rounded-xl border border-slate-200 dark:border-slate-700
            shadow-lg overflow-hidden
          "
        >
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-2">
              目录导航
            </h3>
          </div>
          
          {/* 可滚动内容区 */}
          <div 
            ref={tocContentRef}
            className="max-h-[60dvh] overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
          >
          <ul className="space-y-1">
            {sections.map((section) => {
              const isActive = activeId === section.id;
              const isExpanded = expandedSections.has(section.id);
              const hasChildren = section.children && section.children.length > 0;
              
              return (
                <li key={section.id}>
                  {/* 章节标题 */}
                  <div className="flex items-center gap-1">
                    {hasChildren && (
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-slate-400" />
                        ) : (
                          <ChevronRight size={14} className="text-slate-400" />
                        )}
                      </button>
                    )}
                    <button
                      data-toc-id={section.id}
                      onClick={() => {
                        scrollToSection(section.id);
                        setIsMobileOpen(false);
                      }}
                      className={`
                        flex-1 text-left px-3 py-2 rounded-lg text-sm
                        transition-all duration-200
                        flex items-center justify-between gap-2
                        group
                        ${!hasChildren ? 'ml-6' : ''}
                        ${isActive 
                          ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-medium shadow-sm' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{section.icon}</span>
                        <span className="break-words">{section.label}</span>
                      </span>
                      
                      {section.count !== undefined && section.count > 0 && (
                        <span 
                          className={`
                            shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium
                            ${isActive
                              ? 'bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                            }
                          `}
                        >
                          {section.count}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* 子项列表 */}
                  {hasChildren && isExpanded && (
                    <ul className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                      {section.children!.map((child) => {
                        const isChildActive = activeId === child.id;
                        return (
                          <li key={child.id}>
                            <button
                              data-toc-id={child.id}
                              onClick={() => {
                                scrollToSection(child.id);
                                setIsMobileOpen(false);
                              }}
                              className={`
                                w-full text-left px-3 py-1.5 rounded text-xs
                                transition-all duration-200
                                break-words
                                ${isChildActive
                                  ? 'bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 font-medium'
                                  : 'text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                                }
                              `}
                            >
                              {child.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          </div>

          {/* 进度指示器 */}
          <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2">
              <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 dark:bg-violet-400 transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${sections.length > 0 
                      ? ((sections.findIndex(s => s.id === activeId || s.children?.some(c => c.id === activeId)) + 1) / sections.length) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <span className="shrink-0">
                {sections.findIndex(s => s.id === activeId || s.children?.some(c => c.id === activeId)) + 1} / {sections.length}
              </span>
            </div>
          </div>
        </nav>
      </aside>

      {/* 移动端 TOC 弹出层 */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed top-20 right-4 left-4 z-50 max-h-[80vh] overflow-y-auto">
            <nav 
              className="
                bg-white dark:bg-slate-900 
                rounded-xl border border-slate-200 dark:border-slate-700
                shadow-lg p-4
              "
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 px-2">
                目录导航
              </h3>
              
              <ul className="space-y-1">
                {sections.map((section) => {
                  const isActive = activeId === section.id;
                  const isExpanded = expandedSections.has(section.id);
                  const hasChildren = section.children && section.children.length > 0;
                  
                  return (
                    <li key={section.id}>
                      {/* 章节标题 */}
                      <div className="flex items-center gap-1">
                        {hasChildren && (
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} className="text-slate-400" />
                            ) : (
                              <ChevronRight size={14} className="text-slate-400" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            scrollToSection(section.id);
                            setIsMobileOpen(false);
                          }}
                          className={`
                            flex-1 text-left px-3 py-2 rounded-lg text-sm
                            transition-all duration-200
                            flex items-center justify-between gap-2
                            group
                            ${!hasChildren ? 'ml-6' : ''}
                            ${isActive 
                              ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-medium shadow-sm' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                            }
                          `}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{section.icon}</span>
                            <span className="break-words">{section.label}</span>
                          </span>
                          
                          {section.count !== undefined && section.count > 0 && (
                            <span 
                              className={`
                                shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium
                                ${isActive
                                  ? 'bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                                }
                              `}
                            >
                              {section.count}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* 子项列表 */}
                      {hasChildren && isExpanded && (
                        <ul className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                          {section.children!.map((child) => {
                            const isChildActive = activeId === child.id;
                            return (
                              <li key={child.id}>
                                <button
                                  onClick={() => {
                                    scrollToSection(child.id);
                                    setIsMobileOpen(false);
                                  }}
                                  className={`
                                    w-full text-left px-3 py-1.5 rounded text-xs
                                    transition-all duration-200
                                    break-words
                                    ${isChildActive
                                      ? 'bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 font-medium'
                                      : 'text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                                    }
                                  `}
                                >
                                  {child.label}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* 进度指示器 */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2">
                  <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 dark:bg-violet-400 transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${sections.length > 0 
                          ? ((sections.findIndex(s => s.id === activeId || s.children?.some(c => c.id === activeId)) + 1) / sections.length) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <span className="shrink-0">
                    {sections.findIndex(s => s.id === activeId || s.children?.some(c => c.id === activeId)) + 1} / {sections.length}
                  </span>
                </div>
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

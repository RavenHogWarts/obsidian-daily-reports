import { useState, useEffect, useCallback } from 'react';

export interface TocItem {
  id: string;
  label: string;
  children?: TocItem[];
}

export interface TocSection {
  id: string;
  label: string;
  icon: string;
  count?: number;
  children?: TocItem[];
}

/**
 * Table of Contents Hook
 * 监听滚动位置，自动高亮当前可见章节
 */
export const useTableOfContents = (sections: TocSection[]) => {
  const [activeId, setActiveId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // 切换章节展开/收起
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // 滚动到指定章节或卡片
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // 顶部偏移（避免被 header 遮挡）
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ 
        top: y, 
        behavior: 'smooth' 
      });
      
      // 手动设置激活状态（避免滚动时闪烁）
      setActiveId(id);
    }
  }, []);

  // 获取所有可滚动的 ID（包括章节和子项）
  const getAllIds = useCallback(() => {
    const ids: string[] = [];
    sections.forEach(section => {
      ids.push(section.id);
      if (section.children) {
        section.children.forEach(child => {
          ids.push(child.id);
        });
      }
    });
    return ids;
  }, [sections]);

  // 监听滚动，更新激活章节
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const allIds = getAllIds();
      
      // 获取所有元素
      const elements = allIds
        .map(id => ({
          id,
          element: document.getElementById(id)
        }))
        .filter(item => item.element !== null);

      // 找到当前在视口中的元素
      const scrollPosition = window.scrollY + 150; // 顶部偏移
      
      let currentId = '';
      
      for (let i = elements.length - 1; i >= 0; i--) {
        const { id, element } = elements[i];
        if (element && element.offsetTop <= scrollPosition) {
          currentId = id;
          break;
        }
      }

      // 如果没有找到，默认第一个
      if (!currentId && elements.length > 0) {
        currentId = elements[0].id;
      }

      // 自动折叠/展开章节 - 只显示当前激活的章节
      if (currentId) {
        const newExpandedSections = new Set<string>();
        
        sections.forEach(section => {
          // 如果当前激活的是章节本身，展开它
          if (section.id === currentId) {
            newExpandedSections.add(section.id);
          }
          // 如果当前激活的是子项，展开对应的章节
          else if (section.children?.some(child => child.id === currentId)) {
            newExpandedSections.add(section.id);
          }
          // 其他章节保持折叠状态
        });
        
        setExpandedSections(newExpandedSections);
      }

      setActiveId(currentId);
    };

    // 初始化
    handleScroll();

    // 添加滚动监听（节流处理）
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, [sections, getAllIds]);

  return { 
    activeId, 
    scrollToSection,
    expandedSections,
    toggleSection
  };
};

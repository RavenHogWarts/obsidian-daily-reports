import { useParams } from 'react-router-dom';
import { useWeeklyData } from '../hooks/useData';
import type { ForumPost, PullRequest, RedditPost } from '../types/data';
import { getSummary, detectProjectType } from '../utils/textUtils';
import type { TocSection } from '../hooks/useTableOfContents';
import {
  Badge,
  CalloutCard,
  Breadcrumb,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  ReportHeader,
  ReportFooter,
  ReportLayout
} from '../components/report';
import { Bot, Sparkles } from 'lucide-react';

const WeeklyReport = () => {
  const { week } = useParams<{ week: string }>();
  const { data, loading, error } = useWeeklyData(week || 'latest');

  // Loading State
  if (loading) {
    return <LoadingSpinner message={`Loading weekly report for ${week}...`} />;
  }

  // Error State
  if (error || !data) {
    return (
      <ErrorMessage 
        message={`We couldn't find the data for ${week}. It might not be generated yet.`}
      />
    );
  }

  // Data Aggregation
  const totalForum = (data.chinese_forum?.length || 0) + (data.english_forum?.length || 0);
  const totalReddit = data.reddit?.length || 0;
  const totalPRs = (data.github_opened?.length || 0) + (data.github_merged?.length || 0);
  const hasContent = totalForum + totalReddit + totalPRs > 0;

  // 构建 TOC 章节
  const tocSections: TocSection[] = [];

  if (data.ai?.overview) {
    tocSections.push({
      id: 'ai-overview',
      label: '本周概览',
      icon: '✨',
    });
  }
  
  if (totalForum > 0) {
    const forumChildren = [
      ...(data.english_forum || []).map((post, idx) => ({
        id: `forum-en-${idx}`,
        label: post.title
      })),
      ...(data.chinese_forum || []).map((post, idx) => ({
        id: `forum-cn-${idx}`,
        label: post.title
      }))
    ];
    
    tocSections.push({
      id: 'community-forum',
      label: 'Community Forum',
      icon: '💬',
      count: totalForum,
      children: forumChildren
    });
  }
  
  if (totalPRs > 0) {
    const prChildren = [
      ...(data.github_merged || []).map((pr, idx) => ({
        id: `pr-merged-${idx}`,
        label: pr.title
      })),
      ...(data.github_opened || []).map((pr, idx) => ({
        id: `pr-opened-${idx}`,
        label: pr.title
      }))
    ];
    
    tocSections.push({
      id: 'development-activity',
      label: 'Development Activity',
      icon: '🛠️',
      count: totalPRs,
      children: prChildren
    });
  }
  
  if (totalReddit > 0) {
    const redditChildren = (data.reddit || []).map((post, idx) => ({
      id: `reddit-${idx}`,
      label: post.title
    }));
    
    tocSections.push({
      id: 'reddit-highlights',
      label: 'Reddit Highlights',
      icon: '🔴',
      count: totalReddit,
      children: redditChildren
    });
  }

  return (
    <ReportLayout tocSections={tocSections}>
      <div>
      <Breadcrumb currentPage="Weekly Report" />

      <ReportHeader 
        title={
          <>
            社区周刊 <span className="text-violet-600 dark:text-violet-400">·</span> {data.iso_week}
          </>
        }
        subtitle="Curated Highlights from Obsidian Community"
        dateInfo={
          <>{data.actual_dates[0]} — {data.actual_dates[data.actual_dates.length - 1]}</>
        }
      />

      {data.ai?.overview && (
        <div id="ai-overview" className="mb-10 scroll-mt-24">
          {/* 主要概览卡片 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 dark:from-violet-900/10 dark:to-fuchsia-900/10 border border-violet-100 dark:border-violet-800/30 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm ring-1 ring-slate-900/5 text-violet-600 dark:text-violet-400">
                <Sparkles size={24} />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  本周概览
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                    AI 生成
                  </span>
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.ai.overview}
                </p>
              </div>
            </div>
          </div>

          {/* 统计数据卡片 */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 总项目数 */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">总项目数</div>
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {data.ai.total_items}
              </div>
            </div>

            {/* 精选项目数 */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">精选项目</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.ai.selected_count}
              </div>
            </div>

            {/* 高分项目数 */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">高分项目</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {data.ai.high_score_items}
              </div>
            </div>

            {/* 平均分数 */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">平均评分</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {data.ai.average_score.toFixed(1)}
              </div>
            </div>
          </div>

          {/* 热门标签 */}
          {data.ai.top_tags && data.ai.top_tags.length > 0 && (
            <div className="mt-4 p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">热门标签</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Top Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.ai.top_tags.map((tagItem, idx) => (
                  <div 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {tagItem.tag}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold">
                      {tagItem.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 模型信息 */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 px-1">
            <Bot size={12} />
            <span>{data.ai.model}</span>
          </div>
        </div>
      )}

      {!hasContent && <EmptyState period="week" />}

      <div className="flex flex-col gap-16">
        {/* Community Forum */}
        {(data.english_forum?.length > 0 || data.chinese_forum?.length > 0) && (
          <section id="community-forum" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
                💬 Community Forum
            </h2>
            <div className="grid grid-cols-1 gap-6">
                {data.english_forum?.map((post: ForumPost, idx: number) => (
                    <CalloutCard 
                        key={`en-${idx}`}
                        id={`forum-en-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        badges={[<Badge key="lang" text="EN" type="enforum" />]}
                        meta={<span>{post.author}</span>}
                        aiAnalysis={post}
                    />
                ))}
                {data.chinese_forum?.map((post: ForumPost, idx: number) => (
                    <CalloutCard 
                        key={`cn-${idx}`}
                        id={`forum-cn-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        badges={[<Badge key="lang" text="CN" type="cnforum" />]}
                        meta={<span>{post.author}</span>}
                        aiAnalysis={post}
                    />
                ))}
            </div>
          </section>
        )}

        {/* Development Activity */}
        {((data.github_merged && data.github_merged.length > 0) || (data.github_opened && data.github_opened.length > 0)) && (
          <section id="development-activity" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
                🛠️ Development Activity
            </h2>
            <div className="grid grid-cols-1 gap-6">
                {data.github_merged?.map((pr: PullRequest, idx: number) => {
                    const projectType = detectProjectType(pr.title);
                    return (
                    <CalloutCard 
                        key={`merged-${idx}`}
                        id={`pr-merged-${idx}`}
                        type="merged"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        badges={[
                            <Badge key="status" text="Merged" type="merged" />,
                            projectType === 'plugin' && <Badge key="type" text="Plugin" type="plugin" />,
                            projectType === 'theme' && <Badge key="type" text="Theme" type="theme" />
                        ]}
                        meta={<span>by <strong>{pr.author}</strong></span>}
                        aiAnalysis={pr}
                    />
                );})}
                {data.github_opened?.map((pr: PullRequest, idx: number) => {
                    const projectType = detectProjectType(pr.title);
                    return (
                    <CalloutCard 
                        key={`opened-${idx}`}
                        id={`pr-opened-${idx}`}
                        type="pr"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        badges={[
                            <Badge key="status" text="Opened" type="opened" />,
                            projectType === 'plugin' && <Badge key="type" text="Plugin" type="plugin" />,
                            projectType === 'theme' && <Badge key="type" text="Theme" type="theme" />
                        ]}
                        meta={<span>by <strong>{pr.author}</strong></span>}
                        aiAnalysis={pr}
                    />
                );})}
            </div>
          </section>
        )}

        {/* Reddit */}
        {data.reddit && data.reddit.length > 0 && (
          <section id="reddit-highlights" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
                🔴 Reddit Highlights
            </h2>
            <div className="grid grid-cols-1 gap-6">
                {data.reddit.map((post: RedditPost, idx: number) => (
                    <CalloutCard 
                        key={`reddit-${idx}`}
                        id={`reddit-${idx}`}
                        type="reddit"
                        title={post.title}
                        summary={getSummary(post.content_text)}
                        link={post.url}
                        badges={[<Badge key='type' text='Reddit' type='reddit'/>]}
                        meta={<span>u/{post.author}</span>}
                        aiAnalysis={post}
                    />
                ))}
            </div>
          </section>
        )}
      </div>
      
      <ReportFooter />
    </div>
    </ReportLayout>
  );
};

export default WeeklyReport;

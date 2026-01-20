import { useParams } from 'react-router-dom';
import { Sparkles, Bot } from 'lucide-react';
import { useDailyData } from '../hooks/useData';
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

const DailyReport = () => {
  const { date } = useParams<{ date: string }>();
  const { data, loading, error } = useDailyData(date || 'latest');

  // Loading State
  if (loading) {
    return <LoadingSpinner message={`Loading report for ${date}...`} />;
  }

  // Error State
  if (error || !data) {
    return (
      <ErrorMessage 
        message={`We couldn't find the data for ${date}. It might not be generated yet.`}
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
      label: '今日导读',
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
      <Breadcrumb currentPage="Daily Report" />

      <ReportHeader 
        title={
          <>
            社区速递 <span className="text-violet-600 dark:text-violet-400">·</span> {data.date}
          </>
        }
        subtitle="Curated Highlights from Obsidian Community"
      />

      {data.ai?.overview && (
        <div id="ai-overview" className="mb-10 p-6 rounded-2xl bg-linear-to-br from-violet-50/50 to-fuchsia-50/50 dark:from-violet-900/10 dark:to-fuchsia-900/10 border border-violet-100 dark:border-violet-800/30 shadow-sm scroll-mt-24">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm ring-1 ring-slate-900/5 text-violet-600 dark:text-violet-400">
              <Sparkles size={24} />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                今日导读
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                  AI 生成
                </span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.ai.overview}
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Bot size={12} />
                  {data.ai.model}
                </span>
                <span>•</span>
                <span>Processed {data.ai.processed_count} items</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasContent && <EmptyState period="day" />}

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
        {(data.github_merged?.length > 0 || data.github_opened?.length > 0) && (
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
        {data.reddit?.length > 0 && (
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

export default DailyReport;

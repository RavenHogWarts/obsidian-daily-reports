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
          <>{data.date_range.start} — {data.date_range.end}</>
        }
      />

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

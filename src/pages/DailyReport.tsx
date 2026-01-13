import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus } from 'lucide-react';
import { useDailyData } from '../hooks/useData';
import type { ForumPost, PullRequest, RedditPost } from '../types/data';

// --- Helper Functions ---

const getSummary = (htmlOrText: string | undefined, maxLength: number = 200): string => {
  if (!htmlOrText) return '';
  const text = htmlOrText.replace(/<[^>]*>?/gm, ''); 
  const cleanText = text.replace(/&nbsp;/g, ' ').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};

// Auto-detect type from title (simple heuristic)
const detectProjectType = (title: string): 'plugin' | 'theme' | null => {
  const lower = title.toLowerCase();
  if (lower.includes('theme')) return 'theme';
  if (lower.includes('plugin')) return 'plugin';
  return null;
};

// --- Components ---

const ReportHeader = ({ date }: { date: string }) => (
  <div className="text-center mb-12 pt-4">
    <Minus size={60} strokeWidth={4} className="mx-auto text-slate-900 dark:text-slate-100 opacity-80" />
    <h1 className="text-3xl md:text-4xl font-normal tracking-wide mt-4 mb-2 text-slate-900 dark:text-white">
      社区速递 <span className="text-violet-600 dark:text-violet-400">·</span> {date}
    </h1>
    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase mt-0">
      Curated Highlights from Obsidian Community
    </p>
  </div>
);

// Badge Component
const Badge = ({ text, color, bg }: { text: string, color: string, bg?: string }) => (
  <span 
    className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider mr-2 align-middle border"
    style={{
      color: color,
      backgroundColor: bg || `${color}15`,
      borderColor: `${color}40`
    }}
  >
    {text}
  </span>
);

type CalloutType = 'forum' | 'pr' | 'merged' | 'reddit';

const getCalloutStyles = (type: CalloutType) => {
  switch (type) {
    case 'pr': 
      return { color: '#3b82f6', icon: '⚡', bg: 'rgba(59, 130, 246, 0.04)' };
    case 'merged': 
      return { color: '#10b981', icon: '🚀', bg: 'rgba(16, 185, 129, 0.04)' };
    case 'reddit':
      return { color: '#ff4500', icon: '🔥', bg: 'rgba(255, 69, 0, 0.04)' };
    case 'forum':
    default:
      return { color: '#64748b', icon: '💬', bg: 'rgba(100, 116, 139, 0.04)' };
  }
};

const CalloutCard = ({ title, summary, meta, link, type, badges = [] }: {
  title: string,
  summary: string,
  meta: React.ReactNode,
  link: string,
  type: CalloutType,
  badges?: React.ReactNode[]
}) => {
  const style = getCalloutStyles(type);
  
  return (
    <div 
      className="group relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: style.color,
        backgroundColor: style.bg
      }}
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-start gap-3">
        <span className="text-xl leading-tight" role="img" aria-label="icon">{style.icon}</span>
        <div className="flex-1">
            <div className="mb-1">
                {badges.map((badge, i) => <span key={i}>{badge}</span>)}
            </div>
            <h3 className="text-lg font-bold leading-snug m-0">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white no-underline hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                {title}
              </a>
            </h3>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2 pb-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
        {summary}
      </div>

      {/* Footer / Meta */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center bg-white/30 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          {meta}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" 
          className="font-semibold no-underline flex items-center gap-1 hover:underline transition-colors"
          style={{ color: style.color }}
        >
          Read <span className="text-lg">›</span>
        </a>
      </div>
    </div>
  );
}

// --- Main Page Component ---

const DailyReport = () => {
  const { date } = useParams<{ date: string }>();
  const { data, loading, error } = useDailyData(date || 'latest');

  // Loading State
  if (loading) return (
    <div className="py-24 text-center text-slate-500 dark:text-slate-400">
      <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-violet-600 dark:border-t-violet-400 rounded-full mx-auto mb-4 animate-spin"></div>
      <p>Loading report for {date}...</p>
    </div>
  );

  // Error State
  if (error || !data) return (
    <div className="py-24 text-center">
      <h2 className="text-red-500 dark:text-red-400 text-3xl mb-4">Report Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        We couldn't find the data for {date}. It might not be generated yet.
      </p>
      <Link to="/" className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors">
        Return Home
      </Link>
    </div>
  );

  // Data Aggregation
  const totalForum = (data.chinese_forum?.length || 0) + (data.english_forum?.length || 0);
  const totalReddit = data.reddit?.length || 0;
  const totalPRs = (data.github_opened?.length || 0) + (data.github_merged?.length || 0);
  const hasContent = totalForum + totalReddit + totalPRs > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      
      <div className="mb-8 text-sm">
        <Link to="/" className="text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Home</Link>
        <span className="mx-2 text-slate-400 dark:text-slate-500">/</span>
        <span className="text-slate-900 dark:text-white">Daily Report</span>
      </div>

      <ReportHeader date={data.date} />

      {!hasContent && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <p className="text-lg text-slate-500 dark:text-slate-400">💤 No community activity recorded for this day.</p>
        </div>
      )}

      <div className="flex flex-col gap-16">
        
        {/* Development Activity */}
        {(data.github_merged?.length > 0 || data.github_opened?.length > 0) && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
                🛠️ Development Activity
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.github_merged?.map((pr: PullRequest, idx: number) => {
                    const projectType = detectProjectType(pr.title);
                    return (
                    <CalloutCard 
                        key={`merged-${idx}`}
                        type="merged"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        badges={[
                            <Badge key="status" text="Merged" color="#10b981" />,
                            projectType === 'plugin' && <Badge key="type" text="Plugin" color="#8b5cf6" />,
                            projectType === 'theme' && <Badge key="type" text="Theme" color="#ec4899" />
                        ]}
                        meta={<span>by <strong>{pr.author}</strong></span>}
                    />
                );})}
                {data.github_opened?.map((pr: PullRequest, idx: number) => {
                    const projectType = detectProjectType(pr.title);
                    return (
                    <CalloutCard 
                        key={`opened-${idx}`}
                        type="pr"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        badges={[
                            <Badge key="status" text="Opened" color="#3b82f6" />,
                            projectType === 'plugin' && <Badge key="type" text="Plugin" color="#8b5cf6" />,
                            projectType === 'theme' && <Badge key="type" text="Theme" color="#ec4899" />
                        ]}
                        meta={<span>by <strong>{pr.author}</strong></span>}
                    />
                )})}
            </div>
          </section>
        )}

        {/* Community Forum */}
        {(data.english_forum?.length > 0 || data.chinese_forum?.length > 0) && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
                💬 Community Forum
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.english_forum?.map((post: ForumPost, idx: number) => (
                    <CalloutCard 
                        key={`en-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        badges={[<Badge key="lang" text="English" color="#64748b" />]}
                        meta={<span>{post.author}</span>}
                    />
                ))}
                {data.chinese_forum?.map((post: ForumPost, idx: number) => (
                    <CalloutCard 
                        key={`cn-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        badges={[<Badge key="lang" text="中文" color="#eab308" />]}
                        meta={<span>{post.author}</span>}
                    />
                ))}
            </div>
          </section>
        )}

        {/* Reddit */}
        {data.reddit?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
                🔴 Reddit Highlights
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.reddit.map((post: RedditPost, idx: number) => (
                    <CalloutCard 
                        key={`reddit-${idx}`}
                        type="reddit"
                        title={post.title}
                        summary={getSummary(post.content_text)}
                        link={post.url}
                        meta={<span>u/{post.author}</span>}
                    />
                ))}
            </div>
          </section>
        )}
      </div>
      
      {/* Footer Note */}
      <div className="mt-16 text-center text-slate-400 dark:text-slate-500 text-sm italic">
        Generated by Obsidian Community Report System
      </div>
    </div>
  );
};

export default DailyReport;

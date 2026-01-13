import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDailyData } from '../hooks/useData';
import type { ForumPost, PullRequest, RedditPost } from '../types/data';

// --- Helper Functions ---

const getSummary = (htmlOrText: string | undefined, maxLength: number = 200): string => {
  if (!htmlOrText) return '';
  const text = htmlOrText.replace(/<[^>]*>?/gm, ''); // Strip HTML
  const cleanText = text.replace(/&nbsp;/g, ' ').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};

// --- Components ---

// 1. Decorative Header mimicking the SKILL.md SVG style
const ReportHeader = ({ date }: { date: string }) => (
  <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
    <svg width="60" height="4" viewBox="0 0 60 4" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      <rect width="60" height="4" rx="2" fill="var(--text-primary)" opacity="0.8" />
    </svg>
    <h1 style={{
      fontSize: '2rem',
      fontWeight: '400', // Lighter weight for elegance
      letterSpacing: '1px',
      margin: '1rem 0 0.5rem 0',
      color: 'var(--text-primary)'
    }}>
      社区速递 <span style={{ color: 'var(--accent)' }}>·</span> {date}
    </h1>
    <p style={{
      fontSize: '0.8rem',
      color: 'var(--text-secondary)',
      fontWeight: '600',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginTop: '0'
    }}>
      Curated Highlights from Obsidian Community
    </p>
  </div>
);

// 2. Obsidian Callout Style Card
type CalloutType = 'forum' | 'pr' | 'reddit' | 'merged';

const getCalloutStyles = (type: CalloutType) => {
  switch (type) {
    case 'pr': // Opened
      return { color: '#3b82f6', icon: '⚡', bg: 'rgba(59, 130, 246, 0.04)' };
    case 'merged': // Merged
      return { color: '#10b981', icon: '🚀', bg: 'rgba(16, 185, 129, 0.04)' };
    case 'reddit':
      return { color: '#ff4500', icon: '🔥', bg: 'rgba(255, 69, 0, 0.04)' };
    case 'forum':
    default:
      return { color: 'var(--text-primary)', icon: '💬', bg: 'var(--bg-tertiary)' };
  }
};

const CalloutCard = ({ title, summary, meta, link, type }: {
  title: string,
  summary: string,
  meta: React.ReactNode,
  link: string,
  type: CalloutType
}) => {
  const style = getCalloutStyles(type);
  
  return (
    <div style={{
      borderLeft: `4px solid ${style.color}`,
      backgroundColor: style.bg,
      borderRadius: '4px', // Sqaure-ish look like Obsidian callouts
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid var(--border-light)', // Outer border
      borderLeftWidth: '4px', // Override left
      borderLeftColor: style.color,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    className="hover-card" // Class for hover effects if added to CSS
    >
      {/* Header */}
      <div style={{
        padding: '1rem 1rem 0.5rem',
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '1.2em' }} role="img" aria-label="icon">{style.icon}</span>
        <h3 style={{ 
          fontSize: '1.1rem', 
          margin: 0, 
          fontWeight: 700,
          lineHeight: 1.4,
          flex: 1
        }}>
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            {title}
          </a>
        </h3>
      </div>

      {/* Content */}
      <div style={{
        padding: '0.5rem 1rem 1rem',
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        flex: 1
      }}>
        {summary}
      </div>

      {/* Footer / Meta */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-light)',
        fontSize: '0.8rem',
        color: 'var(--text-tertiary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)' // Subtle footer bg
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {meta}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ 
          color: style.color, 
          fontWeight: 600,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          Read <span style={{ fontSize: '1.1em' }}>›</span>
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
    <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ 
        width: '40px', height: '40px', 
        border: '3px solid var(--border-light)', 
        borderTopColor: 'var(--accent)', 
        borderRadius: '50%', 
        margin: '0 auto 1rem',
        animation: 'spin 1s linear infinite' 
      }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p>Loading report for {date}...</p>
    </div>
  );

  // Error State
  if (error || !data) return (
    <div style={{ padding: '6rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--error)', fontSize: '2rem', marginBottom: '1rem' }}>Report Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        We couldn't find the data for {date}. It might not be generated yet.
      </p>
      <Link to="/" style={{ 
        padding: '0.75rem 1.5rem', 
        backgroundColor: 'var(--accent)', 
        color: 'white', 
        borderRadius: '8px', 
        fontWeight: 600 
      }}>Return Home</Link>
    </div>
  );

  // Data Aggregation
  const totalForum = (data.chinese_forum?.length || 0) + (data.english_forum?.length || 0);
  const totalReddit = data.reddit?.length || 0;
  const totalPRs = (data.github_opened?.length || 0) + (data.github_merged?.length || 0);
  const hasContent = totalForum + totalReddit + totalPRs > 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
        <Link to="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Daily Report</span>
      </div>

      <ReportHeader date={data.date} />

      {/* No Content State */}
      {!hasContent && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>💤 No community activity recorded for this day.</p>
        </div>
      )}

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Development Activity */}
        {(data.github_merged?.length > 0 || data.github_opened?.length > 0) && (
          <section>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.75rem'
            }}>
                🛠️ Development Activity
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {data.github_merged?.map((pr: PullRequest, idx: number) => (
                    <CalloutCard 
                        key={`merged-${idx}`}
                        type="merged"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        meta={<span>Merged by <strong>{pr.author}</strong></span>}
                    />
                ))}
                {data.github_opened?.map((pr: PullRequest, idx: number) => (
                    <CalloutCard 
                        key={`opened-${idx}`}
                        type="pr"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        meta={<span>Opened by <strong>{pr.author}</strong></span>}
                    />
                ))}
            </div>
          </section>
        )}

        {/* Community Forum */}
        {(data.english_forum?.length > 0 || data.chinese_forum?.length > 0) && (
          <section>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.75rem'
            }}>
                💬 Community Forum
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {data.english_forum?.map((post: ForumPost, idx: number) => (
                    <CalloutCard 
                        key={`en-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        meta={<span>{post.author} • <span style={{opacity: 0.7}}>English Forum</span></span>}
                    />
                ))}
                {data.chinese_forum?.map((post: ForumPost, idx: number) => (
                    <CalloutCard 
                        key={`cn-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        meta={<span>{post.author} • <span style={{opacity: 0.7}}>Chinese Forum</span></span>}
                    />
                ))}
            </div>
          </section>
        )}

        {/* Reddit */}
        {data.reddit?.length > 0 && (
          <section>
            <h2 style={{ 
               fontSize: '1.5rem', 
               marginBottom: '1.5rem', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.75rem',
               color: 'var(--text-primary)',
               borderBottom: '1px solid var(--border-light)',
               paddingBottom: '0.75rem'
            }}>
                🔴 Reddit Highlights
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
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
      <div style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        Generated by Obsidian Community Report System
      </div>
    </div>
  );
};

export default DailyReport;

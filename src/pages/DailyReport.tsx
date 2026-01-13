import { useParams, Link } from 'react-router-dom';
import { useDailyData } from '../hooks/useData';
import type { ForumPost, PullRequest, RedditPost } from '../types/data';

// Helper to strip HTML and truncate text
const getSummary = (htmlOrText: string | undefined, maxLength: number = 200): string => {
  if (!htmlOrText) return '';
  // Remove HTML tags
  const text = htmlOrText.replace(/<[^>]*>?/gm, '');
  // Decode confusing entities if simple regex missed them or just trim
  const cleanText = text.replace(/&nbsp;/g, ' ').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};

const Card = ({ title, summary, meta, link, type }: { 
  title: string, 
  summary: string, 
  meta: React.ReactNode, 
  link: string,
  type: 'forum' | 'pr' | 'reddit'
}) => (
  <div style={{
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--card-shadow)',
    padding: '1.5rem',
    border: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    transition: 'transform 0.2s',
  }}>
    <div style={{ marginBottom: '1rem' }}>
        <span style={{ 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            color: type === 'pr' ? '#3b82f6' : type === 'reddit' ? '#ff4500' : 'var(--accent)',
            fontWeight: 700
        }}>
            {type}
        </span>
    </div>
    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="hover-link">
            {title}
        </a>
    </h3>
    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>
      {summary}
    </p>
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--text-tertiary)',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '1rem'
    }}>
      {meta}
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Read &rarr;</a>
    </div>
  </div>
);

const DailyReport = () => {
  const { date } = useParams<{ date: string }>();
  // Handle case where date might be "latest" in URL for some reason, though logic is in hook
  const { data, loading, error } = useDailyData(date || 'latest');

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem' }}>Loading report for {date}...</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--error)' }}>Could not load report</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error || 'Unknown error'}</p>
      <Link to="/" style={{ color: 'var(--accent)' }}>&larr; Back to Home</Link>
    </div>
  );

  // Calculate stats dynamically
  const totalForum = (data.chinese_forum?.length || 0) + (data.english_forum?.length || 0);
  const totalReddit = data.reddit?.length || 0;
  const totalPRs = (data.github_opened?.length || 0) + (data.github_merged?.length || 0);
  
  const hasContent = totalForum + totalReddit + totalPRs > 0;

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Home</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Daily Report</span>
      </div>

      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Daily Report: {data.date}</h1>
        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem', flexWrap: 'wrap' }}>
           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></span>
             {totalForum} Forum Discussions
           </span>
           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4500' }}></span>
             {totalReddit} Reddit Posts
           </span>
           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
             {totalPRs} Changes
           </span>
        </div>
      </header>
      
      {!hasContent && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '16px' }}>
          <p>No activity recorded for this day.</p>
        </div>
      )}

      {/* GitHub Section */}
      {(data.github_merged?.length > 0 || data.github_opened?.length > 0) && (
        <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🛠️</span> Development Activity
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {data.github_merged?.map((pr: PullRequest, idx: number) => (
                    <Card 
                        key={`merged-${idx}`}
                        type="pr"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        meta={
                            <span style={{ color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                Merged by {pr.author}
                            </span>
                        }
                    />
                ))}
                {data.github_opened?.map((pr: PullRequest, idx: number) => (
                    <Card 
                        key={`opened-${idx}`}
                        type="pr"
                        title={pr.title}
                        summary={getSummary(pr.body)}
                        link={pr.url}
                        meta={
                            <span style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                Opened by {pr.author}
                            </span>
                        }
                    />
                ))}
            </div>
        </section>
      )}

      {/* Forum Section */}
      {(data.english_forum?.length > 0 || data.chinese_forum?.length > 0) && (
        <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💬</span> Community Forum
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {data.english_forum?.map((post: ForumPost, idx: number) => (
                    <Card 
                        key={`en-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        meta={<span>{post.author} • English</span>}
                    />
                ))}
                {data.chinese_forum?.map((post: ForumPost, idx: number) => (
                    <Card 
                        key={`cn-${idx}`}
                        type="forum"
                        title={post.title}
                        summary={getSummary(post.content_html)}
                        link={post.url}
                        meta={<span>{post.author} • Chinese</span>}
                    />
                ))}
            </div>
        </section>
      )}

      {/* Reddit Section */}
      {data.reddit?.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔴</span> Reddit
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {data.reddit.map((post: RedditPost, idx: number) => (
                    <Card 
                        key={`reddit-${idx}`}
                        type="reddit"
                        title={post.title}
                        summary={getSummary(post.content_text)}
                        link={post.url}
                        meta={<span>{post.author}</span>}
                    />
                ))}
            </div>
        </section>
      )}
    </div>
  );
};

export default DailyReport;

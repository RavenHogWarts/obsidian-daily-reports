import { useParams, Link } from 'react-router-dom';
import { useDailyData } from '../hooks/useData';
import type { ForumPost, PullRequest } from '../types/data';

const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--card-shadow)',
    padding: '1.5rem',
    border: '1px solid var(--border-light)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
    {children}
  </div>
);

const DailyReport = () => {
  const { date } = useParams<{ date: string }>();
  const { data, loading, error } = useDailyData(date || '');

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      Loading report for {date}...
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--error)' }}>Could not load report</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error || 'Unknown error'}</p>
      <Link to="/" style={{ color: 'var(--accent)' }}>&larr; Back to Home</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Home</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Daily Report</span>
      </div>

      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Daily Report: {data.date}</h1>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)' }}>
           <span>📝 {data.stats.total_posts} Posts</span>
           <span>twisted_rightwards_arrows {data.stats.total_prs} PRs</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Forum Section */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            Community Discussions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.posts.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>No updates today.</p>}
            {data.posts.map((post: ForumPost, idx: number) => (
              <Card key={idx} title={post.title}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                  {post.summary}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  <span>{post.author}</span>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Read More &rarr;</a>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* PR Section */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            Developer Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {data.pull_requests.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>No updates today.</p>}
             {data.pull_requests.map((pr: PullRequest, idx: number) => (
               <Card key={idx} title={pr.title}>
                 <div style={{ marginBottom: '0.5rem' }}>
                   <span style={{ 
                     display: 'inline-block', 
                     padding: '0.1rem 0.5rem', 
                     borderRadius: '4px', 
                     fontSize: '0.75rem',
                     backgroundColor: pr.status === 'merged' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                     color: pr.status === 'merged' ? 'var(--success)' : '#3b82f6'
                   }}>
                     {pr.status}
                   </span>
                 </div>
                 <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                   {pr.summary}
                 </p>
                 <a href={pr.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8rem', textAlign: 'right' }}>
                   View PR &rarr;
                 </a>
               </Card>
             ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DailyReport;

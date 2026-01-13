import { Link } from 'react-router-dom';

const Home = () => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '2rem 1rem' }}>
      <section style={{ 
        textAlign: 'center', 
        padding: '4rem 1rem',
        background: 'linear-gradient(to bottom right, var(--bg-secondary), var(--bg-primary))',
        borderRadius: '16px',
        marginBottom: '3rem',
        border: '1px solid var(--border-light)'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 800, 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          Obsidian Community<br/>Daily Reports
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '600px', 
          margin: '0 auto 2rem' 
        }}>
          Stay updated with the latest plugins, themes, and discussions from the Obsidian ecosystem.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to={`/daily/${today}`} style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
          }}>
            View Today's Report
          </Link>
          <a href="https://github.com/RavenHogWarts/obsidian-daily-reports" target="_blank" rel="noopener noreferrer" style={{
             padding: '0.75rem 1.5rem',
             backgroundColor: 'var(--bg-tertiary)',
             color: 'var(--text-primary)',
             borderRadius: '8px',
             fontWeight: 600
          }}>
            GitHub Repo
          </a>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Placeholder cards since we don't have an index of reports yet */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-light)'
          }}>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Daily Report</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{today}</p>
             <Link to={`/daily/${today}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>Read Report &rarr;</Link>
          </div>
          
           <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-light)'
          }}>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Weekly Summary</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Coming Soon</p>
             <span style={{ color: 'var(--text-tertiary)' }}>No data available</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import { Link } from 'react-router-dom';
import { useIndex } from '../hooks/useData';

const Home = () => {
  const { data: index, loading, error } = useIndex();
  
  // Default to today if index fails (though it might 404, it's a fallback)
  // But preferably show loading state
  
  if (loading) {
     return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  if (error || !index) {
     return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--error)' }}>Failed to load directory.</div>;
  }

  const latestDaily = index.latest.daily;
  const latestWeekly = index.latest.weekly;

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
          {latestDaily ? (
            <Link to={`/daily/${latestDaily}`} style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
            }}>
              View Latest Report ({latestDaily})
            </Link>
          ) : (
             <button disabled style={{ opacity: 0.5 }}>No reports available</button>
          )}
          
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
          
          {/* Daily Report Card */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-light)'
          }}>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Latest Daily Report</h3>
             {latestDaily ? (
                <>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{latestDaily}</p>
                   <Link to={`/daily/${latestDaily}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>Read Report &rarr;</Link>
                </>
             ) : (
                <p style={{ color: 'var(--text-tertiary)' }}>No data available</p>
             )}
          </div>
          
           {/* Weekly Report Card */}
           <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-light)'
          }}>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Weekly Summary</h3>
             {latestWeekly ? (
                <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{latestWeekly}</p>
                    <Link to={`/weekly/${latestWeekly}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>Read Summary &rarr;</Link>
                </>
             ) : (
                <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No weekly reports yet</p>
                    <span style={{ color: 'var(--text-tertiary)' }}>No data available</span>
                </>
             )}
          </div>
        </div>
      </section>
      
      {/* List recent archives */}
      {index.daily.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Daily Archive</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {index.daily.slice(0, 5).map(date => (
                    <Link key={date} to={`/daily/${date}`} style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {date}
                    </Link>
                ))}
            </div>
        </section>
      )}

      {index.weekly.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Weekly Archive</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {index.weekly.slice(0, 5).map(week => (
                    <Link key={week} to={`/weekly/${week}`} style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {week}
                    </Link>
                ))}
            </div>
        </section>
      )}
    </div>
  );
};

export default Home;

import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header style={{
      height: 'var(--nav-height)',
      borderBottom: '1px solid var(--border-light)',
      backgroundColor: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backdropFilter: 'blur(8px)',
      background: 'rgba(var(--bg-primary), 0.8)' // Needs rgb var helper to work with opacity, simplified for now
    }}>
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: '0 1rem',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontSize: '1.25rem', 
          fontWeight: 700,
          color: 'var(--text-primary)'
        }}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M50 5L15 25V75L50 95L85 75V25L50 5Z" fill="var(--accent)" fillOpacity="0.2" stroke="var(--accent)" strokeWidth="4"/>
             <path d="M50 25L25 40V65L50 80L75 65V40L50 25Z" fill="var(--accent)"/>
          </svg>
          Obsidian Reports
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
            <Link to="/daily/latest" style={{ color: 'var(--text-secondary)' }}>Latest Report</Link>
          </nav>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-medium)' }} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;

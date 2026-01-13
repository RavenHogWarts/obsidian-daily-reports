const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-light)',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-secondary)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        <p>© {new Date().getFullYear()} Obsidian Daily Reports. Community driven.</p>
        <p style={{ marginTop: '0.5rem' }}>
          Powered by <a href="https://github.com/RavenHogWarts/obsidian-daily-reports" target="_blank" rel="noopener noreferrer">GitHub Actions</a> & Vercel
        </p>
      </div>
    </footer>
  );
};

export default Footer;

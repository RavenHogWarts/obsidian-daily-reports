const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Obsidian Daily Reports. Community driven.</p>
        <p className="mt-2">
          Powered by <a href="https://github.com/RavenHogWarts/obsidian-daily-reports" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">GitHub Actions</a> & Vercel
        </p>
      </div>
    </footer>
  );
};

export default Footer;

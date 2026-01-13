import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useIndex } from '../hooks/useData';

const Home = () => {
  const { data: index, loading, error } = useIndex();
  
  // Default to today if index fails (though it might 404, it's a fallback)
  // But preferably show loading state
  
  if (loading) {
     return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !index) {
     return <div className="flex items-center justify-center h-screen">Failed to load directory.</div>;
  }

  const latestDaily = index.latest.daily;
  const latestWeekly = index.latest.weekly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <section className="relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-16 text-center mb-16 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-900/10">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="block text-slate-900 dark:text-white">Obsidian Community</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">Daily Reports</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stay updated with the latest plugins, themes, and discussions from the Obsidian ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {latestDaily ? (
              <Link to={`/daily/${latestDaily}`} className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-lg hover:shadow-violet-500/30 transition-all duration-200 hover:-translate-y-0.5">
                View Latest Report ({latestDaily})
              </Link>
            ) : (
               <button disabled className="px-8 py-3 text-base font-semibold text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-not-allowed">No reports available</button>
            )}
            
            <a href="https://github.com/RavenHogWarts/obsidian-daily-reports" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
              GitHub Repo
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Daily Report Card */}
          <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow duration-300">
             <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Latest Daily Report</h3>
             {latestDaily ? (
                <div className="relative z-10">
                   <p className="text-slate-500 dark:text-slate-400 mb-4">{latestDaily}</p>
                   <Link to={`/daily/${latestDaily}`} className="inline-flex items-center text-violet-600 dark:text-violet-400 font-medium hover:underline">
                     Read Report
                     <ArrowRight size={16} className="ml-1" />
                   </Link>
                </div>
             ) : (
                <p className="text-slate-400 dark:text-slate-500">No data available</p>
             )}
          </div>
          
           {/* Weekly Report Card */}
           <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow duration-300">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Weekly Summary</h3>
             {latestWeekly ? (
                <div className="relative z-10">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">{latestWeekly}</p>
                    <Link to={`/weekly/${latestWeekly}`} className="inline-flex items-center text-violet-600 dark:text-violet-400 font-medium hover:underline">
                      Read Summary
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>
             ) : (
                <div className="relative z-10">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">No weekly reports yet</p>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">No data available</span>
                </div>
             )}
          </div>
        </div>
      </section>
      
      {/* List recent archives */}
      {index.daily.length > 0 && (
        <section className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Daily Archive</h2>
            <div className="flex flex-wrap gap-3">
                {index.daily.slice(0, 5).map((date: string) => (
                    <Link key={date} to={`/daily/${date}`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                        {date}
                    </Link>
                ))}
            </div>
        </section>
      )}

      {index.weekly.length > 0 && (
        <section className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Weekly Archive</h2>
            <div className="flex flex-wrap gap-3">
                {index.weekly.slice(0, 5).map((week: string) => (
                    <Link key={week} to={`/weekly/${week}`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
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

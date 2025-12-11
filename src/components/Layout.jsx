import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Moon, Sun } from 'lucide-react';

const Layout = ({ tabs, activeTab, setActiveTab, role, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 text-gray-800 dark:text-gray-100">
      {/* Top Bar */}
      <header className="backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-gray-900/70 sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="sm:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-800" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
                <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-200" />
                <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-200 mt-1" />
                <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-200 mt-1" />
              </button>
              <Droplets className="h-7 w-7 text-red-600" />
              <h1 className="text-xl font-bold">BloodBank</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Welcome, {role || 'user'}</span>
                <button onClick={onLogout} className="text-sm text-red-600 hover:underline">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 py-6">
          {/* Sidebar */}
          <aside className={`sm:sticky sm:top-20 sm:self-start ${sidebarOpen ? 'block' : 'hidden sm:block'}`}>
            <nav className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2 shadow-sm">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main>
            <div className="space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

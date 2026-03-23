'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Home as HomeIcon, GitBranch, Search as SearchIcon, Heart, Users } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'tree' | 'search' | 'tawasul' | 'generasi';
  onViewChange: (view: 'home' | 'tree' | 'search' | 'tawasul' | 'generasi') => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ currentView, onViewChange, isDark, onToggleTheme }: NavbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
        {/* Brand - Clickable to go to home */}
        <button
          onClick={() => onViewChange('home')}
          className="flex items-center gap-3 min-w-fit hover:opacity-75 transition-opacity cursor-pointer"
          title="Kembali ke Beranda"
        >
          <div className="text-2xl">🌳</div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Silsilah Keluarga</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Abdur Rochman & Fathmiyah</p>
          </div>
        </button>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center flex-1">
          <button
            onClick={() => onViewChange('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              currentView === 'home'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Beranda"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Beranda</span>
          </button>
          
          <button
            onClick={() => onViewChange('tree')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              currentView === 'tree'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Pohon Silsilah"
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Pohon Silsilah</span>
          </button>
          
          <button
            onClick={() => onViewChange('generasi')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              currentView === 'generasi'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Generasi Silsilah"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Generasi Silsilah</span>
          </button>

          <button
            onClick={() => onViewChange('tawasul')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              currentView === 'tawasul'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Tawasul"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Tawasul</span>
          </button>
          
          <button
            onClick={() => onViewChange('search')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              currentView === 'search'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Cari"
          >
            <SearchIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Cari</span>
          </button>
          
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors min-w-fit"
          title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>
    </nav>
  );
}

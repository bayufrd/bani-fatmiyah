'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Home as HomeIcon, Settings } from 'lucide-react';
import Link from 'next/link';

interface AdminNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AdminNavbar({ isDark, onToggleTheme }: AdminNavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Back to Home */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors font-semibold"
          title="Kembali ke Beranda"
        >
          <HomeIcon className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Kembali</span>
        </Link>

        {/* Title */}
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>

        {/* Settings & Dark Mode */}
        <div className="flex items-center gap-2 min-w-fit relative">
          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Pengaturan"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                <Link
                  href="/"
                  onClick={() => setShowMenu(false)}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-t-lg transition-colors"
                >
                  Kembali ke Beranda
                </Link>
                <button
                  onClick={() => {
                    onToggleTheme();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2 rounded-b-lg"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4 text-yellow-500" />
                      Mode Terang
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-700" />
                      Mode Gelap
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle (Desktop Only) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors hidden sm:block"
            title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </nav>
  );
}

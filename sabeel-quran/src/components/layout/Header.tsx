/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Menu, Moon, Sun, BookOpen } from 'lucide-react';
import { QuranSettings } from '../../types/quran';

export type ActiveTab = 'dashboard' | 'mushaf' | 'hifz' | 'tasmee' | 'tajweed';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  settings: QuranSettings;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenSearch,
  settings,
  onToggleTheme
}) => {
  const isDarkMode = settings.theme === 'babyblue-dark' || settings.theme === 'night-emerald';

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 bg-white/95 border-sky-100 dark:bg-stone-900/95 dark:border-sky-950/60 shadow-xs" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Right side: Sidebar Toggle & Wordmark Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-sky-50 dark:hover:bg-stone-800 hover:text-sky-600 transition-colors border border-transparent hover:border-sky-200 dark:hover:border-sky-900"
            title="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white font-serif block leading-tight">
                سَبِيل القُرآن
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-sans tracking-wide block">
                مصحف تعليمي تفاعلي
              </span>
            </div>
          </div>
        </div>

        {/* Left side: Search & Baby Blue Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 bg-sky-50/80 dark:bg-stone-800/80 hover:bg-sky-100 dark:hover:bg-stone-700 rounded-xl border border-sky-200/60 dark:border-stone-700 transition-colors"
            title="البحث في القرآن الكريم (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">ابحث في القرآن...</span>
            <kbd className="hidden lg:inline px-1 py-0.5 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-400">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-800 rounded-xl transition-colors border border-sky-100 dark:border-stone-800"
            title={isDarkMode ? 'التحويل إلى الثيم الفاتح' : 'التحويل إلى الثيم الداكن'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-sky-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

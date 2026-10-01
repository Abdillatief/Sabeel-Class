/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  BookOpen, 
  Bookmark, 
  Mic, 
  Sparkles, 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  Home, 
  FileText,
  ChevronLeft
} from 'lucide-react';
import { QuranSettings } from '../../types/quran';

export type ActiveTab = 'dashboard' | 'mushaf' | 'hifz' | 'tasmee' | 'tajweed';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  settings: QuranSettings;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenSettings,
  settings,
  onToggleTheme
}) => {
  if (!isOpen) return null;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'الفهرس والبحث',
      icon: <Home className="w-5 h-5" />,
      desc: 'فهرس سور القرآن، الأجزاء، والبحث المباشر'
    },
    {
      id: 'mushaf',
      label: 'المصحف الشريف',
      icon: <BookOpen className="w-5 h-5" />,
      desc: 'القراءة بالرسم العثماني وأحكام التجويد الملونة'
    },
    {
      id: 'hifz',
      label: 'استوديو الحفظ والمراجعة',
      icon: <Bookmark className="w-5 h-5" />,
      desc: 'جدول الورد، التكرار، واختبارات الذاكرة'
    },
    {
      id: 'tasmee',
      label: 'التسميع الذكي بالمايك',
      icon: <Mic className="w-5 h-5" />,
      desc: 'اختبار شفهي مع تصويب الكلمات والأخطاء صوتياً'
    },
    {
      id: 'tajweed',
      label: 'أطلس وقواعد التجويد',
      icon: <Palette className="w-5 h-5" />,
      desc: 'دليل شامل لجميع أحكام التجويد ومخارج الحروف'
    }
  ];

  const isDarkMode = settings.theme === 'babyblue-dark' || settings.theme === 'night-emerald';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-stone-900 border-l border-sky-200/80 dark:border-sky-900/50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-sky-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-serif text-stone-900 dark:text-white">
                  سَبِيل القُرآن
                </h2>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-sans block">
                  المصحف والتعليم الذكي
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-right transition-all group ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 text-sky-900 dark:text-sky-300 font-bold shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-sky-800 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:text-sky-600 group-hover:bg-sky-100 dark:group-hover:bg-sky-950'
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-sm block">{item.label}</span>
                      <span className="text-[10px] text-stone-400 font-normal line-clamp-1">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isActive ? 'text-sky-600' : 'text-stone-300'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Settings & Baby Blue Theme toggle */}
        <div className="p-4 border-t border-sky-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 space-y-2">
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-sky-200/80 dark:border-stone-700/80 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 hover:border-sky-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : (
                <Sun className="w-4 h-4 text-sky-500" />
              )}
              <span className="font-medium">المظهر (طابع بيبي بلو)</span>
            </div>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950">
              {isDarkMode ? 'داكن هادئ' : 'فاتح ناصع'}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-900 hover:text-sky-700 transition-colors"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>إعدادات الخط والقراءة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

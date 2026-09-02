import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'labeled';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'icon'
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'التبديل إلى الوضع الفاتح (النهاري)' : 'التبديل إلى الوضع الداكن (الليلي)'}
      aria-label={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700 shadow-sm'
          : 'bg-sky-50 text-slate-600 hover:text-sky-700 hover:bg-sky-100 border border-sky-100 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <div className="flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          {variant === 'labeled' && (
            <span className="text-xs font-bold text-slate-200">الوضع الفاتح</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
          {variant === 'labeled' && (
            <span className="text-xs font-bold text-slate-700">الوضع الداكن</span>
          )}
        </div>
      )}
    </button>
  );
};

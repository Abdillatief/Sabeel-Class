import React from 'react';

interface SabeelLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SabeelLogo: React.FC<SabeelLogoProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-sky-300 text-white shadow-md shadow-sky-500/20 ${iconSizes[size]} shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Subtle Path and Book Icon */}
          <path
            d="M8 36C8 36 14 33 24 33C34 33 40 36 40 36V12C40 12 34 9 24 9C14 9 8 12 8 12V36Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path
            d="M24 10V33M24 33C14 33 8 36 8 36V12C8 12 14 9 24 9C34 9 40 12 40 12V36C40 36 34 33 24 33Z"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Radiant star above */}
          <path
            d="M24 4L25.5 7L28.5 8L25.5 9L24 12L22.5 9L19.5 8L22.5 7L24 4Z"
            fill="white"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5" dir="ltr">
            <span className={`font-black text-slate-800 dark:text-slate-100 tracking-tight ${textSizes[size]}`}>
              Sabeel
            </span>
            <span className={`font-bold text-sky-500 dark:text-sky-400 tracking-tight ${textSizes[size]}`}>
              Class
            </span>
          </div>
          <span className="text-[11px] font-semibold text-sky-700/80 dark:text-sky-300/80 -mt-0.5">
            أكاديمية سبيل للتعليم
          </span>
        </div>
      )}
    </div>
  );
};

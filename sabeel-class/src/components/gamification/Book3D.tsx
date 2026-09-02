import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, Star } from 'lucide-react';
import { getBookProgress } from '../../services/unlockSystem';

interface Book3DProps {
  studentName: string;
  totalPoints: number;
  size?: 'sm' | 'md' | 'lg';
  isGleaming?: boolean;
  recentPointsAdded?: number | null;
  onClick?: () => void;
  className?: string;
  showProgress?: boolean;
  interactive?: boolean;
}

export const Book3D: React.FC<Book3DProps> = ({
  studentName,
  totalPoints,
  size = 'md',
  isGleaming = false,
  recentPointsAdded = null,
  onClick,
  className = '',
  showProgress = true,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const progress = getBookProgress(totalPoints);

  // Size dimensions
  const dims = {
    sm: { w: 84, h: 104, font: 'text-[10px]', lock: 'w-3.5 h-3.5', ring: 100 },
    md: { w: 108, h: 136, font: 'text-xs', lock: 'w-4 h-4', ring: 130 },
    lg: { w: 170, h: 215, font: 'text-sm', lock: 'w-6 h-6', ring: 200 },
  }[size];

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Recent Points Floating Animation (+5 نقطة) */}
      <AnimatePresence>
        {recentPointsAdded !== null && recentPointsAdded > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -24, scale: 1.2 }}
            exit={{ opacity: 0, y: -45, scale: 0.8 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute -top-3 z-30 pointer-events-none flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-full shadow-lg border border-white/60 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>+{recentPointsAdded} نقطة!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Perspective Wrapper */}
      <div
        style={{ perspective: 1000 }}
        className="relative flex items-center justify-center py-1"
      >
        {/* Glow Aura when nearing 50 points or on hover */}
        <div
          className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none blur-xl ${
            progress.isReadyToOpen
              ? 'bg-gradient-to-r from-amber-400/40 via-sky-400/50 to-blue-500/40 opacity-90 animate-pulse'
              : isHovered || isGleaming
              ? 'bg-sky-400/30 dark:bg-sky-500/25 opacity-70'
              : 'bg-sky-400/10 opacity-30'
          }`}
        />

        {/* 3D Book Container */}
        <motion.div
          animate={{
            rotateY: isHovered && interactive ? -14 : -6,
            rotateX: isHovered && interactive ? 8 : 4,
            scale: isHovered && interactive ? 1.04 : 1,
            y: isHovered && interactive ? -4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            transformStyle: 'preserve-3d',
            width: dims.w,
            height: dims.h,
          }}
          className="relative cursor-pointer transition-shadow"
        >
          {/* Back Cover / Pages Edge (3D depth layers) */}
          <div
            style={{
              transform: 'translateZ(-14px)',
              width: dims.w,
              height: dims.h,
            }}
            className="absolute inset-0 bg-slate-800 rounded-r-xl rounded-l-sm shadow-xl"
          />

          {/* Book Pages Stack (Realistic Paper Edge on the right/opening side) */}
          <div
            style={{
              transform: 'translateX(6px) translateZ(-6px) rotateY(90deg)',
              transformOrigin: 'right center',
              width: '12px',
              height: `${dims.h - 6}px`,
              top: '3px',
              right: '2px',
            }}
            className="absolute bg-amber-50/90 border-t border-b border-amber-200/80 shadow-inner flex flex-col justify-between"
          >
            {/* Page texture lines */}
            <div className="w-full h-full bg-[repeating-linear-gradient(0deg,#fff,#fff_2px,#e2e8f0_2px,#e2e8f0_4px)] opacity-60" />
          </div>

          {/* Front Book Cover */}
          <div
            style={{
              transform: 'translateZ(0px)',
              width: dims.w,
              height: dims.h,
            }}
            className="relative rounded-r-2xl rounded-l-md overflow-hidden bg-gradient-to-br from-sky-800 via-sky-900 to-slate-950 border-t-2 border-r-2 border-sky-400/40 shadow-2xl p-2.5 flex flex-col justify-between"
          >
            {/* Shimmer Light Sweep Effect (يلمع الكتاب) */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full transition-transform duration-1000 pointer-events-none ${
                isGleaming || isHovered ? 'translate-x-full' : ''
              }`}
            />

            {/* Book Spine Fold (Left side leather crease) */}
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-sky-950 via-slate-900 to-transparent border-r border-sky-600/30" />
            <div className="absolute top-0 bottom-0 left-1 w-px bg-amber-400/30" />

            {/* Arabesque / Islamic Corner Filigree */}
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-amber-400/70 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-amber-400/70 rounded-br-lg pointer-events-none" />
            <div className="absolute top-1.5 left-4 w-3 h-3 border-t border-l border-amber-400/40 rounded-tl pointer-events-none" />
            <div className="absolute bottom-1.5 left-4 w-3 h-3 border-b border-l border-amber-400/40 rounded-bl pointer-events-none" />

            {/* Central Emblem & Student Name Emboss */}
            <div className="flex-1 flex flex-col items-center justify-center px-1 text-center relative z-10">
              {/* Sabeel Mini Star Emblem */}
              <div className="w-5 h-5 mb-1 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
                <Star className="w-3 h-3 fill-amber-300" />
              </div>

              {/* Student Name */}
              <p
                className={`font-black text-amber-200 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2 w-full px-1 ${dims.font}`}
              >
                {studentName}
              </p>

              {/* Decorative Arabic Label */}
              <span className="text-[8px] font-bold text-sky-300/80 mt-0.5 tracking-wider">
                كتاب المعرفة
              </span>
            </div>

            {/* Golden Ribbon Bookmark at the bottom */}
            <div className="absolute bottom-0 left-6 w-3 h-4 bg-gradient-to-b from-amber-500 to-amber-600 shadow-md transform translate-y-1">
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-sky-950 clip-v" />
            </div>

            {/* Golden Lock (قفل ذهبي ثلاثي الأبعاد على حافة الكتاب) */}
            <div
              style={{
                transform: 'translateZ(10px)',
              }}
              className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
            >
              <div className="relative group/lock">
                {/* Lock Clasp Strap */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-2 bg-gradient-to-r from-sky-900 to-amber-600 rounded-l-sm border-t border-b border-amber-400/60" />

                {/* Golden Padlock Body */}
                <div className="w-6 h-7 rounded-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-lg flex flex-col items-center justify-center relative">
                  {/* Shackle */}
                  <div className="w-3.5 h-3 -mt-2.5 rounded-t-full border-2 border-amber-200 bg-transparent border-b-0" />
                  {/* Keyhole */}
                  <div className="w-1.5 h-2 bg-amber-950 rounded-full mt-0.5 relative">
                    <div className="w-0.5 h-1 bg-amber-950 mx-auto mt-0.5" />
                  </div>
                </div>

                {/* Lock Glint */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white/80 animate-ping opacity-75" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Section (0 / 50 نقطة) */}
      {showProgress && (
        <div className="w-full mt-2.5 flex flex-col items-center">
          {/* Progress Bar Container */}
          <div className="w-full max-w-[130px] h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-900/[0.08] dark:border-slate-700 shadow-inner relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all duration-300 ${
                progress.isReadyToOpen
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 animate-pulse'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'
              }`}
            />
          </div>

          {/* Points Counter (37 / 50 نقطة) */}
          <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-black">
            <span className="text-slate-800 dark:text-slate-100">{progress.current}</span>
            <span className="text-slate-400 dark:text-slate-500">/</span>
            <span className="text-amber-600 dark:text-amber-400">{progress.target}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">نقطة</span>
          </div>

          {/* Status Label */}
          {progress.isReadyToOpen ? (
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>جاهز للفتح! اضغط هنا</span>
            </motion.span>
          ) : (
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              بقي {progress.remaining} لفتح الشخصية 🔓
            </span>
          )}
        </div>
      )}
    </div>
  );
};

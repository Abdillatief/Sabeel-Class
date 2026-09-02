import React from 'react';
import { Plus, Star, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '../../types';
import { AnimeAvatar } from '../common/AnimeAvatar';
import { getStudentLevel } from '../../utils/levels';
import { soundManager } from '../../utils/sound';

interface StudentCardProps {
  student: Student;
  rank: number;
  onAddPoints: (student: Student) => void;
  onOpenProfile: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  rank,
  onAddPoints,
  onOpenProfile,
}) => {
  const levelInfo = getStudentLevel(student.totalPoints || 0);

  const getRankBadge = (r: number) => {
    if (r === 1) return { icon: '🥇', label: '1', bg: 'bg-amber-400 text-slate-900 ring-2 ring-amber-300' };
    if (r === 2) return { icon: '🥈', label: '2', bg: 'bg-slate-300 text-slate-900 ring-2 ring-slate-200' };
    if (r === 3) return { icon: '🥉', label: '3', bg: 'bg-amber-600 text-white ring-2 ring-amber-500' };
    return { icon: '#', label: `${r}`, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' };
  };

  const rankInfo = getRankBadge(rank);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => {
        soundManager.playClickPop();
        onOpenProfile(student);
      }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border-2 border-sky-100 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center cursor-pointer select-none"
    >
      {/* Top Rank Badge */}
      <div className="w-full flex items-center justify-between gap-1 mb-2">
        <span
          title={`المركز ${rank}`}
          className={`inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${rankInfo.bg}`}
        >
          <span>{rankInfo.icon}</span>
          <span>{rankInfo.label}</span>
        </span>

        {/* Level Emoji Mini Pill */}
        <span
          title={levelInfo.title}
          className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        >
          {levelInfo.emoji}
        </span>
      </div>

      {/* Avatar Container */}
      <div className="relative my-1 group/avatar">
        <AnimeAvatar
          avatarId={student.avatar}
          photoUrl={student.photoUrl || student.photo}
          cartoonPhotoUrl={student.cartoonPhotoUrl}
          useCartoonAvatar={student.useCartoonAvatar}
          studentName={student.name}
          size="4x4"
          showBadge={true}
          className="ring-3 ring-sky-300 dark:ring-sky-600 shadow-xs transition-transform duration-200 group-hover:scale-105"
        />

        {/* Hover View Properties Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
          <Eye className="w-5 h-5 drop-shadow-md" />
        </div>
      </div>

      {/* Student Name */}
      <h3 className="mt-2 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1 w-full">
        {student.name}
      </h3>

      {/* Points Badge */}
      <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl shadow-2xs">
        <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
        <span className="font-black text-slate-800 dark:text-slate-100 text-xs">{student.totalPoints}</span>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">نقطة</span>
      </div>

      {/* Quick Click / Tap hint */}
      <span className="mt-2 text-[10px] font-bold text-sky-600 dark:text-sky-400 opacity-80 group-hover:opacity-100">
        عرض الخواص
      </span>

      {/* Floating Quick Add Points Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundManager.playClickPop();
          onAddPoints(student);
        }}
        title="إضافة نقاط سريعة"
        className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ring-2 ring-white dark:ring-slate-900"
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
      </button>
    </motion.div>
  );
};


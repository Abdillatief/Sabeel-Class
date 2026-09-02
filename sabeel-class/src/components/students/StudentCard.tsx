import React from 'react';
import { Plus, Star, Eye, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '../../types';
import { AnimeAvatar } from '../common/AnimeAvatar';
import { Book3D } from '../gamification/Book3D';
import { Character3DAvatar } from '../gamification/Character3DAvatar';
import { getStudentLevel } from '../../utils/levels';
import { soundManager } from '../../utils/sound';
import { isCharacterUnlocked, canOpenBook } from '../../services/unlockSystem';

interface StudentCardProps {
  student: Student;
  rank: number;
  onAddPoints: (student: Student) => void;
  onOpenProfile: (student: Student) => void;
  onOpenBookUnlock?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  rank,
  onAddPoints,
  onOpenProfile,
  onOpenBookUnlock,
}) => {
  const levelInfo = getStudentLevel(student.totalPoints || 0);
  const unlocked = isCharacterUnlocked(
    student.totalPoints || 0,
    student.unlockedCharacterId,
    student.isBookOpened
  );
  const readyToOpen = canOpenBook(student.totalPoints || 0, student.isBookOpened);

  const getRankBadge = (r: number) => {
    if (r === 1) return { icon: '🥇', label: '1', bg: 'bg-amber-400 text-slate-900 ring-2 ring-amber-300' };
    if (r === 2) return { icon: '🥈', label: '2', bg: 'bg-slate-300 text-slate-900 ring-2 ring-slate-200' };
    if (r === 3) return { icon: '🥉', label: '3', bg: 'bg-amber-600 text-white ring-2 ring-amber-500' };
    return {
      icon: '#',
      label: `${r}`,
      bg: 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-900/[0.08] dark:border-slate-700',
    };
  };

  const rankInfo = getRankBadge(rank);

  const handleCardClick = () => {
    soundManager.playClickPop();
    // If ready to open the book (reached 50 points), prioritize celebratory unlock modal
    if (readyToOpen && onOpenBookUnlock) {
      onOpenBookUnlock(student);
    } else {
      onOpenProfile(student);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={handleCardClick}
      className={`group relative card-depth card-depth-hover rounded-2xl p-3.5 sm:p-4 transition-all duration-200 flex flex-col items-center text-center cursor-pointer select-none ${
        readyToOpen ? 'ring-2 ring-amber-400/80 dark:ring-amber-500/80 shadow-amber-500/20' : ''
      }`}
    >
      {/* Top Rank Badge & Level Pill */}
      <div className="w-full flex items-center justify-between gap-1 mb-2">
        <span
          title={`المركز ${rank}`}
          className={`inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shadow-2xs ${rankInfo.bg}`}
        >
          <span>{rankInfo.icon}</span>
          <span>{rankInfo.label}</span>
        </span>

        {/* Level Emoji or Book Ready Pill */}
        {readyToOpen ? (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse flex items-center gap-1 shadow-xs">
            <Sparkles className="w-2.5 h-2.5" />
            <span>افتح الكتاب!</span>
          </span>
        ) : (
          <span
            title={levelInfo.title}
            className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-900/[0.07] dark:border-slate-700 shadow-2xs"
          >
            {levelInfo.emoji}
          </span>
        )}
      </div>

      {/* Main Avatar Area: 3D Closed Book vs Unlocked 3D Character */}
      <div className="relative my-1 w-full flex flex-col items-center">
        {!unlocked ? (
          // ==========================================
          // 📚 STAGE 1: 3D Closed Book with Progress
          // ==========================================
          <div className="py-1">
            <Book3D
              studentName={student.name}
              totalPoints={student.totalPoints || 0}
              size="sm"
              showProgress={true}
              interactive={true}
            />
          </div>
        ) : (
          // ==========================================
          // ✨ STAGE 2: Unlocked 3D Character
          // ==========================================
          <div className="relative group/avatar my-1">
            {student.unlockedCharacterId ? (
              <Character3DAvatar
                characterId={student.unlockedCharacterId}
                size="md"
                showRarityBadge={true}
                showStars={true}
              />
            ) : (
              <AnimeAvatar
                avatarId={student.avatar}
                photoUrl={student.photoUrl || student.photo}
                cartoonPhotoUrl={student.cartoonPhotoUrl}
                useCartoonAvatar={student.useCartoonAvatar}
                studentName={student.name}
                size="4x4"
                showBadge={true}
                className="ring-2 ring-sky-300/80 dark:ring-sky-600 shadow-2xs transition-transform duration-200 group-hover:scale-105"
              />
            )}

            {/* Hover View Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
              <Eye className="w-5 h-5 drop-shadow-md" />
            </div>
          </div>
        )}
      </div>

      {/* Student Name */}
      <h3 className="mt-2 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1 w-full">
        {student.name}
      </h3>

      {/* Total Points Badge */}
      <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 rounded-xl shadow-2xs">
        <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
        <span className="font-black text-slate-800 dark:text-slate-100 text-xs">{student.totalPoints}</span>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">نقطة</span>
      </div>

      {/* Quick Click Hint */}
      <span className="mt-2 text-[10px] font-bold text-sky-600 dark:text-sky-400 opacity-75 group-hover:opacity-100">
        {readyToOpen ? 'اضغط لفتح الشخصية 🎁' : unlocked ? 'عرض الخواص' : 'تفاصيل رحلة الحفظ'}
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
        className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ring-2 ring-white dark:ring-slate-900"
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
      </button>
    </motion.div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Trophy,
  Award,
  Plus,
  Flame,
  Star,
  ChevronLeft,
  Settings,
  Pencil,
  Check,
  Crown,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Student, ActiveTab, Competition } from '../../types';
import { CARTOON_AVATARS } from '../../utils/constants';
import { getStudentDisplayPhoto } from '../../services/cartoonService';
import { getStudentLevel } from '../../utils/levels';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { soundManager } from '../../utils/sound';

import { getCharacterById, Character3D } from '../../services/characterSystem';
import { isCharacterUnlocked } from '../../services/unlockSystem';

interface TeacherDashboardProps {
  students: Student[];
  competition: Competition;
  onUpdateCompetitionTitle: (title: string) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddStudent: () => void;
  onOpenAddPoints: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  competition,
  onUpdateCompetitionTitle,
  setActiveTab,
  onOpenAddStudent,
  onOpenAddPoints,
  onSelectStudent
}) => {
  const { profile } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(competition.title);

  const isTeacherMale = profile?.gender === 'male';
  const greeting = isTeacherMale ? 'أهلاً بك يا أستاذ' : 'أهلاً بكِ يا أستاذة';

  const totalPoints = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const sortedStudents = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const top1Student = sortedStudents[0];
  const topStudents = sortedStudents.slice(0, 3);
  const highestScore = top1Student?.totalPoints || 0;

  // Calculate days remaining in current month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());

  // Monthly challenge target (e.g. 500 points or scalable goal)
  const challengeTarget = Math.max(500, Math.ceil((highestScore + 50) / 100) * 100);
  const challengeProgress = Math.min(100, Math.round((highestScore / challengeTarget) * 100));

  const handleSaveTitle = async () => {
    if (tempTitle.trim()) {
      await onUpdateCompetitionTitle(tempTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const getAvatarDisplay = (student: Student) => {
    const isUnlocked = isCharacterUnlocked(
      student.totalPoints || 0,
      student.unlockedCharacterId,
      student.isBookOpened
    );

    if (isUnlocked && student.unlockedCharacterId) {
      const char = getCharacterById(student.unlockedCharacterId);
      return (
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center text-3xl shadow-inner"
          style={{
            background: `linear-gradient(135deg, ${char.primaryColor}22, ${char.accentColor}44)`,
          }}
        >
          {char.emoji}
        </div>
      );
    }

    if (!isUnlocked) {
      return (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-sky-900 to-slate-950 flex flex-col items-center justify-center text-amber-300 text-xl shadow-inner">
          <span>📚</span>
        </div>
      );
    }

    const displayPhoto = getStudentDisplayPhoto(student);
    if (displayPhoto.url) {
      return (
        <img
          src={displayPhoto.url}
          alt={student.name}
          className="w-full h-full object-cover rounded-2xl"
          referrerPolicy="no-referrer"
        />
      );
    }
    const av = CARTOON_AVATARS.find((a) => a.id === student.avatar);
    return (
      <div className="w-full h-full rounded-2xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
        {av ? av.emoji : '👦'}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Welcoming Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-sky-500 via-sky-600 to-sky-700 p-6 sm:p-8 text-white shadow-lg shadow-sky-600/15 border border-sky-400/25"
      >
        {/* Floating subtle decorative element */}
        <div className="absolute top-2 left-6 text-white/10 text-6xl pointer-events-none select-none font-serif">
          ✨
        </div>
        <div className="absolute -bottom-6 left-1/3 text-white/10 text-9xl pointer-events-none select-none">
          ⭐
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black shadow-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="flex items-center gap-1.5">
                <span dir="ltr" className="inline-block font-bold">Sabeel Class</span>
                <span>• تجربة التعليم التفاعلية</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {greeting} {profile?.name || 'أحمد'} 🌟
            </h1>

            <div className="flex items-center gap-2 pt-1 text-sky-100 font-bold text-xs sm:text-sm">
              <span>تحدي شهر {competition.month || 'سبتمبر'} مستمر 🏆</span>
              <span>•</span>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/20">
                باقي {daysRemaining} يوم في السباق
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClickPop();
                onOpenAddStudent();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer border border-white/80"
            >
              <Plus className="w-4 h-4 text-sky-600 stroke-[3]" />
              <span>+ إضافة طالب جديد</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Animated Stats Cards (Visual Depth & Pure White with 1px border) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1: Students Count */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="card-depth card-depth-hover rounded-3xl p-5 sm:p-6 flex items-center gap-4"
        >
          <div className="w-13 h-13 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">👨‍🎓 عدد الطلاب</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              <AnimatedCounter value={students.length} /> <span className="text-xs sm:text-sm font-bold text-slate-400">طالب</span>
            </p>
          </div>
        </motion.div>

        {/* Stat 2: Total Points */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="card-depth card-depth-hover rounded-3xl p-5 sm:p-6 flex items-center gap-4"
        >
          <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0 shadow-2xs">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">⭐ مجموع النقاط</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              <AnimatedCounter value={totalPoints} /> <span className="text-xs sm:text-sm font-bold text-amber-500">نقطة</span>
            </p>
          </div>
        </motion.div>

        {/* Stat 3: Top Student */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="card-depth card-depth-hover rounded-3xl p-5 sm:p-6 flex items-center gap-4"
        >
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0 shadow-2xs">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">🏆 المتصدر الحالي</p>
            {top1Student ? (
              <div className="truncate mt-0.5">
                <p className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate">
                  {top1Student.name}
                </p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <AnimatedCounter value={top1Student.totalPoints} /> نقطة
                </p>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 mt-1">لا يوجد نقاط بعد</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 3. Month Challenge Card (تحدي الشهر) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-depth rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Subtle accent bar at top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-sky-400 to-sky-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 border border-amber-200/70 dark:border-amber-900/50 flex items-center justify-center shadow-2xs">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 tracking-wide">
                  التحدي التنافسي الرسمي
                </span>
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="input-premium px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl"
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="p-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 cursor-pointer active:scale-95 transition-all shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                        {competition.title}
                      </h2>
                      <button
                        onClick={() => {
                          setTempTitle(competition.title);
                          setIsEditingTitle(true);
                        }}
                        className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="تعديل اسم التحدي"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Leader Info */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المتصدر:</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-900/[0.08] dark:border-slate-700 shadow-2xs">
                  🥇 {top1Student ? top1Student.name : 'في انتظار أول إنجاز'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{highestScore} نقطة</span>
              </div>
            </div>

            {/* Countdown & Target */}
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>المدة المتبقية: <strong className="text-sky-600 dark:text-sky-400">{daysRemaining} أيام</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>الهدف التنافسي: {challengeTarget} نقطة</span>
              </span>
            </div>
          </div>

          {/* Progress Box */}
          <div className="w-full md:w-64 space-y-2 bg-slate-50/70 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-900/[0.06] dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-700 dark:text-slate-300">نسبة التقدم نحو الهدف:</span>
              <span className="text-sky-600 dark:text-sky-400">{challengeProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${challengeProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-sky-500 shadow-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center font-semibold">
              باقي {Math.max(0, challengeTarget - highestScore)} نقطة لإتمام الهدف الكامل
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4. Top Students Showcase (Gamified Cards) */}
      <div className="card-depth rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center shadow-2xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                الفرسان الأوائل في الحلقة
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                الطلاب الأكثر تميزاً وجمعاً للنقاط لشهر {competition.month}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('students')}
            className="text-xs font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>عرض كل الطلاب ({students.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-900/[0.1] dark:border-slate-700">
            <div className="text-4xl mb-3">🎒</div>
            <h4 className="font-black text-base text-slate-800 dark:text-slate-200 mb-1">
              الحلقة جاهزة لبدء التحدي!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              أضف طلابك الآن لتبدأ بمكافأتهم بنقاط الحفظ والمراجعة والأوسمة التكريمية
            </p>
            <button
              onClick={onOpenAddStudent}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              + إضافة أول طالب
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topStudents.map((st, idx) => {
              const medal = [
                { icon: '🥇', label: 'المركز الأول', ring: 'ring-amber-400', badge: 'bg-amber-500 text-white shadow-xs' },
                { icon: '🥈', label: 'المركز الثاني', ring: 'ring-slate-300', badge: 'bg-slate-400 text-white shadow-xs' },
                { icon: '🥉', label: 'المركز الثالث', ring: 'ring-amber-600', badge: 'bg-amber-700 text-white shadow-xs' },
              ][idx];

              const level = getStudentLevel(st.totalPoints || 0);

              return (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className="card-depth card-depth-hover rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${medal.badge}`}>
                      <span>{medal.icon}</span>
                      <span>{medal.label}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/50 shadow-2xs">
                      ⭐ {st.totalPoints} نقطة
                    </span>
                  </div>

                  <div
                    onClick={() => onSelectStudent(st)}
                    className="flex items-center gap-3.5 mb-4 cursor-pointer group"
                  >
                    <div className="w-13 h-13 rounded-2xl overflow-hidden shrink-0 border border-slate-900/[0.08] dark:border-slate-700 group-hover:scale-105 transition-transform shadow-2xs">
                      {getAvatarDisplay(st)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {st.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${level.badgeBg}`}>
                          {level.emoji} {level.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>التقدم نحو {level.level < 4 ? 'المستوى القادم' : 'القمة'}:</span>
                      <span>{level.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${level.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClickPop();
                      onOpenAddPoints(st);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>إضافة نقاط سريعة</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, ShieldCheck, Sparkles, Crown, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '../../types';
import { CARTOON_AVATARS, SYSTEM_BADGES } from '../../utils/constants';
import { AnimeAvatar } from '../common/AnimeAvatar';
import { getAcademyTop3Students } from '../../services/db';
import { getStudentDisplayPhoto } from '../../services/cartoonService';
import { getStudentLevel } from '../../utils/levels';
import { soundManager } from '../../utils/sound';

interface LeaderboardViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddPoints: (student: Student) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  onSelectStudent,
  onAddPoints
}) => {
  const [activeBoard, setActiveBoard] = useState<'teacher' | 'academy'>('teacher');
  const [academyTop3, setAcademyTop3] = useState<Array<{ name: string; totalPoints: number; rank: number; avatar?: string }>>([]);
  const [loadingAcademy, setLoadingAcademy] = useState(false);

  useEffect(() => {
    if (activeBoard === 'academy') {
      setLoadingAcademy(true);
      getAcademyTop3Students()
        .then((res) => setAcademyTop3(res))
        .finally(() => setLoadingAcademy(false));
    }
  }, [activeBoard]);

  // Sort teacher's students
  const sortedStudents = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];
  const remaining = sortedStudents.slice(3);

  const getStudentAvatar = (student: Student, size: 'sm' | 'md' | 'lg' | '4x4' = '4x4') => {
    return (
      <AnimeAvatar
        avatarId={student.avatar}
        photoUrl={student.photoUrl || student.photo}
        cartoonPhotoUrl={student.cartoonPhotoUrl}
        useCartoonAvatar={student.useCartoonAvatar}
        studentName={student.name}
        size={size}
        showBadge={true}
      />
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-xs">
            🏆
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
              منصة التتويج والمتصدرين
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              سباق النقاط التنافسي والتحفيزي لأبطال حلقة القرآن الكريم
            </p>
          </div>
        </div>

        {/* Board Switcher */}
        <div className="flex items-center p-1.5 bg-sky-50 dark:bg-slate-800 rounded-2xl border border-sky-100 dark:border-slate-700 transition-colors">
          <button
            onClick={() => {
              soundManager.playClickPop();
              setActiveBoard('teacher');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeBoard === 'teacher'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            ترتيب طلاب حلقتي
          </button>
          <button
            onClick={() => {
              soundManager.playClickPop();
              setActiveBoard('academy');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeBoard === 'academy'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>أفضل 3 في أكاديمية سبيل</span>
          </button>
        </div>
      </div>

      {/* ---------------- TEACHER'S CLASS LEADERBOARD (PODIUM) ---------------- */}
      {activeBoard === 'teacher' && (
        <div className="space-y-6">
          {sortedStudents.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-sky-200 dark:border-slate-800 transition-colors">
              <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                لا يوجد طلاب مسجلين بالحلقة بعد
              </p>
            </div>
          ) : (
            <>
              {/* GAMIFIED OLYMPIC PODIUM */}
              <div className="bg-gradient-to-b from-sky-50/60 via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-slate-800 shadow-xs">
                <div className="text-center mb-6">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60">
                    ✨ فرسان المنصة الذهبية ✨
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-end justify-center gap-4 pt-8 pb-4 max-w-3xl mx-auto">
                  
                  {/* 2nd Place (Silver - Right in RTL, slightly lower than 1st) */}
                  {top2 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1"
                    >
                      {/* Avatar & Info */}
                      <div className="flex flex-col items-center text-center mb-3">
                        <div className="relative mb-2">
                          {getStudentAvatar(top2, 'lg')}
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm z-10 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full shadow-xs">
                            🥈
                          </span>
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{top2.name}</h3>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 mt-0.5">
                          {top2.totalPoints} نقطة
                        </span>
                      </div>

                      {/* Podium Pillar */}
                      <div className="w-full bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-t-3xl p-4 flex flex-col items-center justify-between h-40 shadow-md border-t-4 border-slate-300 dark:border-slate-500">
                        <span className="text-2xl font-black text-slate-600 dark:text-slate-300">2</span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">المركز الثاني</span>
                        <button
                          onClick={() => {
                            soundManager.playClickPop();
                            onAddPoints(top2);
                          }}
                          className="w-full py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black shadow-xs hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                        >
                          + إضافة نقاط
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="hidden md:block w-1/3" />
                  )}

                  {/* 1st Place (Gold - Champion - Center, Highest Pillar) */}
                  {top1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 70 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10"
                    >
                      {/* Avatar & Info */}
                      <div className="flex flex-col items-center text-center mb-3">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                          className="relative mb-2"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-md z-10">
                            👑
                          </div>
                          {getStudentAvatar(top1, 'lg')}
                        </motion.div>

                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-base line-clamp-1">{top1.name}</h3>
                        <div className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 px-3 py-0.5 rounded-full mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{top1.totalPoints} نقطة</span>
                        </div>
                      </div>

                      {/* Gold Podium Pillar */}
                      <div className="w-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 dark:from-amber-600 dark:to-amber-800 rounded-t-3xl p-4 flex flex-col items-center justify-between h-52 shadow-xl border-t-4 border-amber-200 dark:border-amber-400 text-white">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-amber-950/70 drop-shadow-xs">1</span>
                          <span className="text-xs font-black text-amber-950 drop-shadow-xs">🥇 بطل الحلقة</span>
                        </div>
                        <button
                          onClick={() => {
                            soundManager.playClickPop();
                            onAddPoints(top1);
                          }}
                          className="w-full py-2.5 bg-white text-amber-700 rounded-xl text-xs font-black shadow-md hover:bg-amber-50 cursor-pointer transition-all active:scale-95"
                        >
                          + نقاط التكريم
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* 3rd Place (Bronze - Left in RTL, lowest pillar) */}
                  {top3 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3"
                    >
                      {/* Avatar & Info */}
                      <div className="flex flex-col items-center text-center mb-3">
                        <div className="relative mb-2">
                          {getStudentAvatar(top3, 'lg')}
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm z-10 bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded-full shadow-xs">
                            🥉
                          </span>
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{top3.name}</h3>
                        <span className="text-xs font-black text-amber-800 dark:text-amber-400 mt-0.5">
                          {top3.totalPoints} نقطة
                        </span>
                      </div>

                      {/* Podium Pillar */}
                      <div className="w-full bg-gradient-to-b from-amber-700 to-amber-800 dark:from-amber-800 dark:to-amber-950 rounded-t-3xl p-4 flex flex-col items-center justify-between h-32 shadow-md border-t-4 border-amber-600 text-white">
                        <span className="text-2xl font-black text-white/80">3</span>
                        <span className="text-[11px] font-bold text-amber-200">المركز الثالث</span>
                        <button
                          onClick={() => {
                            soundManager.playClickPop();
                            onAddPoints(top3);
                          }}
                          className="w-full py-1.5 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-black shadow-xs hover:bg-amber-50 cursor-pointer"
                        >
                          + إضافة نقاط
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="hidden md:block w-1/3" />
                  )}

                </div>
              </div>

              {/* Remaining Ranks List */}
              {remaining.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-sky-100 dark:border-slate-800 shadow-xs transition-colors">
                  <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 mb-4">
                    باقي ترتيب فرسان الحلقة ({remaining.length})
                  </h3>
                  <div className="space-y-2.5">
                    {remaining.map((student, idx) => {
                      const level = getStudentLevel(student.totalPoints || 0);
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 hover:bg-sky-50/80 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-slate-700 text-sky-800 dark:text-sky-300 font-black text-xs flex items-center justify-center shrink-0">
                              #{idx + 4}
                            </span>
                            <div className="shrink-0">
                              {getStudentAvatar(student, 'sm')}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">{student.name}</h4>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                {level.emoji} {level.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                              ⭐ {student.totalPoints} نقطة
                            </span>
                            <button
                              onClick={() => {
                                soundManager.playClickPop();
                                onAddPoints(student);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              + نقاط
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------------- SABEEL ACADEMY LEADERBOARD (TOP 3 ONLY) ---------------- */}
      {activeBoard === 'academy' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-amber-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/50 text-center transition-colors">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>لوحة الشرف العامة لأكاديمية سبيل</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">
              فرسان التميز الـ 3 الأوائل على مستوى الأكاديمية
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              وفق ضوابط الخصوصية، تظهر هذه اللوحة أفضل ثلاثة متصدرين فقط في أكاديمية سبيل لتحفيز التنافس الشريف
            </p>
          </div>

          {loadingAcademy ? (
            <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
              جاري تحميل فرسان الأكاديمية...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {academyTop3.map((student, idx) => {
                const medals = [
                  { title: 'المركز الأول بالأكاديمية', icon: '🥇', bg: 'from-amber-400 to-amber-600', text: 'text-amber-600' },
                  { title: 'المركز الثاني بالأكاديمية', icon: '🥈', bg: 'from-slate-400 to-slate-600', text: 'text-slate-600' },
                  { title: 'المركز الثالث بالأكاديمية', icon: '🥉', bg: 'from-amber-700 to-amber-900', text: 'text-amber-800' },
                ][idx];

                const av = CARTOON_AVATARS.find((a) => a.id === student.avatar);

                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-sky-100 dark:border-slate-800 shadow-md flex flex-col items-center text-center relative overflow-hidden transition-colors"
                  >
                    <div className={`w-full py-1.5 text-center text-xs font-black text-white bg-gradient-to-r ${medals.bg} -mx-6 -mt-6 mb-5`}>
                      {medals.icon} {medals.title}
                    </div>

                    <div className="w-24 h-24 rounded-3xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center text-4xl shadow-md ring-4 ring-sky-100 dark:ring-slate-800 mb-3">
                      {av ? av.emoji : '👦'}
                    </div>

                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{student.name}</h3>
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">أكاديمية سبيل</p>

                    <div className="mt-4 px-5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <span className="font-black text-base text-amber-700 dark:text-amber-300">
                        ⭐ {student.totalPoints} نقطة
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

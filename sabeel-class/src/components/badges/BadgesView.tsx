import React, { useState } from 'react';
import { Award, Sparkles, Plus, Users, Star, CheckCircle2 } from 'lucide-react';
import { Student, BadgeDefinition } from '../../types';
import { SYSTEM_BADGES } from '../../utils/constants';
import { motion } from 'motion/react';

interface BadgesViewProps {
  students: Student[];
  onOpenAwardBadge: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
}

export const BadgesView: React.FC<BadgesViewProps> = ({
  students,
  onOpenAwardBadge,
  onSelectStudent,
}) => {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(SYSTEM_BADGES[0].id);

  const selectedBadge = SYSTEM_BADGES.find((b) => b.id === selectedBadgeId) || SYSTEM_BADGES[0];

  // Find students who hold this badge
  const holdingStudents = students.filter((s) => s.badges?.includes(selectedBadge.id));

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-xs">
            🏅
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
              خزانة الأوسمة والتشريفات
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              الأوسمة التحفيزية الرفيعة التي يمنحها المعلم لفرسان الحلقة المتميزين
            </p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SYSTEM_BADGES.map((badge, idx) => {
          const isCurrent = badge.id === selectedBadgeId;
          const holdersCount = students.filter((s) => s.badges?.includes(badge.id)).length;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => setSelectedBadgeId(badge.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'border-amber-400 bg-gradient-to-b from-amber-50/70 to-white dark:from-amber-950/30 dark:to-slate-900 shadow-md scale-[1.01]'
                  : 'border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              {/* Top Row: Icon & Holders count */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                      isCurrent
                        ? 'bg-amber-500 text-white shadow-amber-500/30'
                        : 'bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400'
                    }`}
                  >
                    <Award className="w-8 h-8" />
                  </div>
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-1 -right-1 text-amber-400"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-slate-700">
                  <Users className="w-3.5 h-3.5" />
                  <span>{holdersCount} طلاب</span>
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Selection indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className={isCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                  {isCurrent ? '● معروض حالياً' : 'اضغط لعرض الفائزين به'}
                </span>
                <span className="text-sky-600 dark:text-sky-400">التفاصيل ←</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Badge Showcase and Students Who Earned It */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sky-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Award className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-1">
                <span>وسام استحقاق معتمد</span>
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                وسام: {selectedBadge.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mt-0.5">
                {selectedBadge.description}
              </p>
            </div>
          </div>
        </div>

        {/* Holders List */}
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>الحاصلون على هذا الوسام في الحلقة ({holdingStudents.length} طلاب)</span>
          </h3>

          {holdingStudents.length === 0 ? (
            <div className="text-center py-10 px-4 bg-sky-50/40 dark:bg-slate-800/30 rounded-2xl border border-dashed border-sky-200 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                لم يحصل أي طالب على هذا الوسام بعد
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                يمكنك منح هذا الوسام لأي طالب متميز عبر فتح بطاقة الطالب والضغط على "منح وسام"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {holdingStudents.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onSelectStudent(st)}
                  className="p-3.5 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-700/70 hover:border-sky-300 dark:hover:border-sky-500 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-base shrink-0">
                      🏅
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {st.name}
                      </h4>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{st.totalPoints} نقطة</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-sky-600 dark:text-sky-400 font-bold shrink-0">
                    عرض الملف ←
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

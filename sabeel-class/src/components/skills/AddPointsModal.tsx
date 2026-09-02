import React, { useState } from 'react';
import { X, Star, Sparkles, Check, Plus, MessageSquare, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Skill } from '../../types';
import { SKILL_ANIMATIONS } from '../../utils/constants';
import { AnimeAvatar } from '../common/AnimeAvatar';
import { soundManager } from '../../utils/sound';

interface AddPointsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onAwardPoints: (studentId: string, skillName: string, points: number, reason?: string) => Promise<void>;
  onTriggerFlyingPoints?: (event: {
    points: number;
    studentName?: string;
    skillName?: string;
    animation?: string;
    studentAvatar?: string;
  }) => void;
}

export const AddPointsModal: React.FC<AddPointsModalProps> = ({
  student,
  isOpen,
  onClose,
  skills,
  onAwardPoints,
  onTriggerFlyingPoints
}) => {
  const [customReason, setCustomReason] = useState('');
  const [customPoints, setCustomPoints] = useState<number | ''>('');
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customAnimation, setCustomAnimation] = useState('titan_lightning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  // Preset gamified skills with cheerful icons and animations
  const defaultGamifiedSkills = [
    { name: 'حفظ جديد', points: 5, animation: 'titan_lightning', icon: '📖' },
    { name: 'مراجعة ممتازة', points: 3, animation: 'rasengan', icon: '🔄' },
    { name: 'تلاوة وترتيل متميز', points: 4, animation: 'super_saiyan', icon: '✨' },
    { name: 'انضباط وأدب وسلوك', points: 2, animation: 'diamond_shield', icon: '🛡️' },
    { name: 'تفاعل ومشاركة صفية', points: 3, animation: 'gear_joy', icon: '⚡' },
    { name: 'حل الواجب بإتقان', points: 2, animation: 'golden_trophy', icon: '🏆' },
  ];

  // Merge custom teacher skills if available
  const displaySkills: (Skill | { id: string; name: string; points: number; animation: string; icon: string; teacherId: string })[] =
    skills.length > 0
      ? skills
      : defaultGamifiedSkills.map((s, idx) => ({
          id: `skill_${idx}`,
          name: s.name,
          points: s.points,
          animation: s.animation,
          icon: s.icon,
          teacherId: ''
        }));

  const handleQuickAward = async (skill: Skill | { name: string; points: number; animation?: string; icon?: string }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    soundManager.playClickPop();

    const animToTrigger = skill.animation || 'titan_lightning';

    try {
      if (onTriggerFlyingPoints) {
        onTriggerFlyingPoints({
          points: skill.points,
          studentName: student.name,
          skillName: skill.name,
          animation: animToTrigger,
          studentAvatar: student.avatar
        });
      }

      await onAwardPoints(student.id, skill.name, skill.points, customReason.trim());

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setCustomReason('');
        setIsCustomSkill(false);
      }, 300);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillName.trim() || customPoints === '' || isSubmitting) return;

    setIsSubmitting(true);
    const pts = Number(customPoints);

    if (onTriggerFlyingPoints) {
      onTriggerFlyingPoints({
        points: pts,
        studentName: student.name,
        skillName: customSkillName.trim(),
        animation: customAnimation,
        studentAvatar: student.avatar
      });
    }

    try {
      await onAwardPoints(student.id, customSkillName.trim(), pts, customReason.trim());
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setCustomReason('');
        setCustomSkillName('');
        setCustomPoints('');
        setIsCustomSkill(false);
      }, 300);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const getAnimationLabel = (animId?: string) => {
    const matched = SKILL_ANIMATIONS.find((a) => a.id === animId);
    return matched ? matched.name.split(' ')[0] : '⚡ برق';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-sky-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Student Profile Ribbon with 4*4 Avatar */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3.5">
            <AnimeAvatar
              avatarId={student.avatar}
              photoUrl={student.photoUrl || student.photo}
              cartoonPhotoUrl={student.cartoonPhotoUrl}
              useCartoonAvatar={student.useCartoonAvatar}
              studentName={student.name}
              size="4x4"
              showBadge={true}
            />

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg">{student.name}</h3>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  بطل الحلقة
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>الرصيد الحالي: {student.totalPoints} نقطة</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>اختر المهارة لإطلاق الأنيميشن وإضافة النقاط:</span>
          </label>
          <button
            type="button"
            onClick={() => setIsCustomSkill(!isCustomSkill)}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            {isCustomSkill ? '← مهارات سبيل' : '+ إنجاز مخصص'}
          </button>
        </div>

        {/* Big Gamified Skills Grid */}
        {!isCustomSkill ? (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {displaySkills.map((skill, idx) => {
              const animName = getAnimationLabel((skill as Skill).animation);

              return (
                <motion.button
                  key={skill.id || idx}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleQuickAward(skill)}
                  disabled={isSubmitting}
                  className="p-4 rounded-3xl border-2 border-sky-100 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 bg-gradient-to-br from-white to-sky-50/40 dark:from-slate-800/90 dark:to-slate-900 shadow-xs hover:shadow-md text-right transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1 rounded-xl bg-white dark:bg-slate-800 shadow-2xs group-hover:scale-110 transition-transform">
                      {skill.icon || '⭐'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-black">
                      +{skill.points} ⭐
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                      {skill.name}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-200/50 dark:border-sky-800">
                      🎬 {animName}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Custom Skill Form */
          <form onSubmit={handleCustomSubmit} className="p-4 rounded-3xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم الإنجاز المخصص:
              </label>
              <input
                type="text"
                required
                placeholder="مثال: إتقان سورة البقرة، مبادرة تطوعية..."
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                النقاط الممنوحة:
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                placeholder="النقاط (1 - 100)"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الأنيميشن المذهل للإنجاز:
              </label>
              <select
                value={customAnimation}
                onChange={(e) => setCustomAnimation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                {SKILL_ANIMATIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.series})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-md shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>منح النقاط وإطلاق الأنيميشن 🎬</span>
            </button>
          </form>
        )}

        {/* Note / Reason Field */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            ملاحظة إضافية تظهر في سجل الطالب (اختياري):
          </label>
          <input
            type="text"
            placeholder="مثال: تميز استثنائي في أحكام التجويد والمدود..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-sky-50/40 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
      </motion.div>
    </div>
  );
};

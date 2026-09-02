import React, { useState } from 'react';
import { X, Award, Sparkles, Check, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, BadgeDefinition } from '../../types';
import { SYSTEM_BADGES } from '../../utils/constants';

interface AwardBadgeModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onAwardBadge: (studentId: string, badgeId: string, reason?: string) => Promise<void>;
}

export const AwardBadgeModal: React.FC<AwardBadgeModalProps> = ({
  student,
  isOpen,
  onClose,
  onAwardBadge,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#38bdf8', '#10b981']
      });
    } catch {
      // Ignore
    }
  };

  const handleAward = async () => {
    if (!selectedBadge) return;
    setIsSubmitting(true);
    try {
      await onAwardBadge(student.id, selectedBadge.id, reason.trim());
      triggerConfetti();
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setSelectedBadge(null);
        setReason('');
      }, 400);
    } catch (err) {
      console.error('Error awarding badge:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                منح وسام تكريمي للطالب
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الطالب: <strong className="text-sky-600 dark:text-sky-400">{student.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges List */}
        <div className="space-y-2.5 mb-5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>اختر وسام التميز المستحق:</span>
          </label>

          {SYSTEM_BADGES.map((badge) => {
            const isSelected = selectedBadge?.id === badge.id;
            const alreadyHas = student.badges?.includes(badge.id);

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 shadow-sm scale-[1.01]'
                    : alreadyHas
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      isSelected ? 'bg-amber-500 text-white shadow-xs' : 'bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <Award className={`w-6 h-6 ${isSelected ? 'text-white' : badge.colorClass}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">{badge.name}</h4>
                      {alreadyHas && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          ممنوح مسبقاً
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{badge.description}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reason / Note */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>سبب منح الوسام وملاحظة المعلم (تُحفظ في سجل الطالب):</span>
          </label>
          <textarea
            rows={2}
            placeholder="مثال: لتميزه الاستثنائي في تسميع سورة الكهف كاملة دون تردد..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-sky-50/30 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleAward}
            disabled={!selectedBadge || isSubmitting}
            className="flex-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>
              {isSubmitting ? 'جاري المنح والتسجيل...' : `منح وسام (${selectedBadge ? selectedBadge.name : 'المختار'})`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

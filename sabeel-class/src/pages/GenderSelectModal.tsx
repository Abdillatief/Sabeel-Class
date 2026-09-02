import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SabeelLogo } from '../components/common/SabeelLogo';
import { UserCheck, Sparkles } from 'lucide-react';
import { TeacherGender } from '../types';

export const GenderSelectModal: React.FC = () => {
  const { updateTeacherGender, user } = useAuth();
  const [selectedGender, setSelectedGender] = useState<TeacherGender | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedGender) return;
    setIsSubmitting(true);
    try {
      await updateTeacherGender(selectedGender);
    } catch (err) {
      console.error('Error saving role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-sky-100 dark:border-slate-800 text-center animate-in fade-in zoom-in duration-200 transition-colors">
        
        <SabeelLogo size="lg" className="justify-center mb-5" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>الخطوة الأولى</span>
        </div>

        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
          أهلاً بك في أكاديمية سبيل
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {user?.displayName ? `مرحباً بك أستاذ/ة ${user.displayName}. ` : ''}
          يرجى تحديد صفتك التدريسية لإعداد حسابك الأكاديمي:
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedGender('male')}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center cursor-pointer ${
              selectedGender === 'male'
                ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 shadow-md shadow-sky-500/10 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
              👨‍🏫
            </div>
            <div>
              <span className="block font-black text-slate-800 dark:text-slate-100 text-lg">
                مُعـلّـم
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">حلقة بنين / طلاب</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGender('female')}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center cursor-pointer ${
              selectedGender === 'female'
                ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 shadow-md shadow-sky-500/10 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
              👩‍🏫
            </div>
            <div>
              <span className="block font-black text-slate-800 dark:text-slate-100 text-lg">
                مُعـلّـمة
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">حلقة فتيات / طالبات</span>
            </div>
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedGender || isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-base shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-5 h-5" />
          <span>{isSubmitting ? 'جاري تجهيز الحساب...' : 'تأكيد والدخول للنظام'}</span>
        </button>

      </div>
    </div>
  );
};

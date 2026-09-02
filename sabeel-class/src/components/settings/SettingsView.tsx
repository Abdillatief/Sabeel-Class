import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Trophy, UserCheck, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { soundManager } from '../../utils/sound';
import { Competition } from '../../types';

interface SettingsViewProps {
  competition: Competition;
  onUpdateCompetitionTitle: (title: string) => Promise<void>;
  onSeedSampleStudents: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  competition,
  onUpdateCompetitionTitle,
  onSeedSampleStudents,
}) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [compTitle, setCompTitle] = useState(competition.title);
  const [isSavingComp, setIsSavingComp] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle.trim()) return;
    setIsSavingComp(true);
    await onUpdateCompetitionTitle(compTitle.trim());
    setIsSavingComp(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await onSeedSampleStudents();
    setIsSeeding(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="card-depth p-6 sm:p-7 rounded-3xl flex items-center gap-3 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl shadow-2xs">
          ⚙️
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            إعدادات النظام والتفضيلات
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تخصيص تجربة التفاعل، الأصوات، الثيم، وتفاصيل التحديات في Sabeel Class
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Gamification Audio Settings */}
        <div className="card-depth rounded-3xl p-6 transition-colors space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                المؤثرات الصوتية والتحفيز
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أصوات حيوية للأطفال عند إضافة النقاط ومنح الأوسمة
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-900/[0.08] dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              تفعيل الأصوات التفاعلية
            </span>
            <button
              onClick={handleToggleSound}
              className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                soundEnabled ? 'bg-sky-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-6 h-6 rounded-full shadow-md transition-transform" />
            </button>
          </div>

          <button
            onClick={() => soundManager.playBadgeFanfare()}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-900/[0.08] dark:border-slate-700 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🎵 تجربة صوت الاحتفال</span>
          </button>
        </div>

        {/* 2. Theme Settings */}
        <div className="card-depth rounded-3xl p-6 transition-colors space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                المظهر والعرض
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                التبديل بين النمط الفاتح الهادئ والنمط الليلي المريح
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-900/[0.08] dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              النمط الحالي: {theme === 'dark' ? 'الوضع الليلي (Dark)' : 'الوضع الفاتح (Light)'}
            </span>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-900/[0.08] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              تبديل
            </button>
          </div>
        </div>

        {/* 3. Monthly Challenge Title */}
        <div className="card-depth rounded-3xl p-6 transition-colors space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                عنوان التحدي الشهري الحالي
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يظهر هذا العنوان في واجهة الطلاب واللوحة الرئيسية وعلى الشهادات الصادرة
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveTitle} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={compTitle}
              onChange={(e) => setCompTitle(e.target.value)}
              className="input-premium flex-1 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100"
              placeholder="اسم التحدي الشهري..."
            />
            <button
              type="submit"
              disabled={isSavingComp || !compTitle.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSavingComp ? 'جاري الحفظ...' : 'حفظ اسم التحدي'}
            </button>
          </form>

          {savedSuccess && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ عنوان التحدي الشهري بنجاح!</span>
            </p>
          )}
        </div>

        {/* 4. Sample Students Seeder */}
        <div className="card-depth rounded-3xl p-6 transition-colors space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                بيانات تجريبية سريعة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إضافة طلاب افتراضيين بنقاط وأوسمة لمعاينة المتصدرين والشهادات فوراً
              </p>
            </div>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-900/[0.08] dark:border-slate-700 transition-all cursor-pointer"
          >
            {isSeeding ? 'جاري إضافة الطلاب...' : '+ إضافة 4 طلاب افتراضيين للتجربة'}
          </button>
        </div>
      </div>
    </div>
  );
};

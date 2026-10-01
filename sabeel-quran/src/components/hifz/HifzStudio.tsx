/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Play, Eye, EyeOff, RotateCcw, Plus, Sparkles, BookOpen, Award, Flame } from 'lucide-react';
import { SURAHS_META } from '../../data/surahs-meta';
import { quranService } from '../../services/quranService';
import { storageService } from '../../services/storageService';
import { HifzGoal, QuranAyah, QuranSurah } from '../../types/quran';

interface HifzStudioProps {
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  onNavigateToMushaf: (surahNumber: number, ayahNumber: number) => void;
}

export const HifzStudio: React.FC<HifzStudioProps> = ({ onPlayAyah, onNavigateToMushaf }) => {
  const [goals, setGoals] = useState<HifzGoal[]>([]);
  const [activeGoal, setActiveGoal] = useState<HifzGoal | null>(null);
  const [surahData, setSurahData] = useState<QuranSurah | null>(null);
  const [testMode, setTestMode] = useState<'visible' | 'first-letter' | 'hidden'>('hidden');
  const [revealedWords, setRevealedWords] = useState<Record<string, boolean>>({});
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  // New goal state
  const [newSurah, setNewSurah] = useState(67); // Al-Mulk default
  const [newStartAyah, setNewStartAyah] = useState(1);
  const [newEndAyah, setNewEndAyah] = useState(10);
  const [newTargetRepetitions, setNewTargetRepetitions] = useState(10);

  useEffect(() => {
    const loadedGoals = storageService.getHifzGoals();
    setGoals(loadedGoals);
    if (loadedGoals.length > 0) {
      setActiveGoal(loadedGoals[0]);
    }
  }, []);

  useEffect(() => {
    if (activeGoal) {
      quranService.getSurah(activeGoal.surahNumber).then((data) => {
        setSurahData(data);
      });
      setRevealedWords({});
    }
  }, [activeGoal]);

  const handleIncrementRepetition = (goalId: string) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newCount = g.repetitionsCompleted + 1;
        const isDone = newCount >= g.repetitionsTarget;
        return {
          ...g,
          repetitionsCompleted: newCount,
          status: isDone ? ('completed' as const) : ('active' as const),
          updatedAt: new Date().toISOString()
        };
      }
      return g;
    });
    setGoals(updated);
    storageService.saveHifzGoals(updated);
    if (activeGoal?.id === goalId) {
      setActiveGoal(updated.find(g => g.id === goalId) || null);
    }
  };

  const handleAddGoal = () => {
    const newGoal: HifzGoal = {
      id: `goal-${Date.now()}`,
      surahNumber: newSurah,
      startAyah: newStartAyah,
      endAyah: newEndAyah,
      repetitionsCompleted: 0,
      repetitionsTarget: newTargetRepetitions,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    storageService.saveHifzGoals(updated);
    setActiveGoal(newGoal);
    setShowAddGoalModal(false);
  };

  const toggleWordReveal = (key: string) => {
    setRevealedWords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentSurahMeta = activeGoal ? SURAHS_META.find(s => s.number === activeGoal.surahNumber) : null;
  const filteredAyahs = surahData && activeGoal
    ? surahData.ayahs.filter(a => a.numberInSurah >= activeGoal.startAyah && a.numberInSurah <= activeGoal.endAyah)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28" dir="rtl">
      {/* Top Banner: Hifz Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-amber-300 font-medium">
            <Flame className="w-4 h-4 fill-current" />
            <span>استوديو التحفيظ والتثبيت القرآني</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">
            خطة الحفظ والمراجعة الذاتية
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            ردد الآيات واستمع لتلاوة الشيخ الحصري المعلم، ثم اختبر حفظك بنمط الإخفاء التفاعلي.
          </p>
        </div>

        <button
          onClick={() => setShowAddGoalModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة هدف حفظ جديد</span>
        </button>
      </div>

      {/* Main Grid: Goals list on right, Practice sandbox on left */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column: Active Goals Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              أهدافك الحالية ({goals.length}):
            </h3>
          </div>

          <div className="space-y-3">
            {goals.map((g) => {
              const surah = SURAHS_META.find(s => s.number === g.surahNumber);
              const isSelected = activeGoal?.id === g.id;
              const percent = Math.min(100, Math.round((g.repetitionsCompleted / g.repetitionsTarget) * 100));

              return (
                <div
                  key={g.id}
                  onClick={() => setActiveGoal(g)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-stone-900 dark:text-white">
                      سورة {surah?.name || `رقم ${g.surahNumber}`}
                    </span>
                    <span className="text-xs text-stone-400">
                      الآيات {g.startAyah} - {g.endAyah}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="tabular-nums">
                      التكرار: {g.repetitionsCompleted} من {g.repetitionsTarget} مرات
                    </span>
                    {g.status === 'completed' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم الإتقان
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {percent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Column: Interactive Memorization & Self-Testing Stage */}
        <div className="lg:col-span-2 space-y-6">
          {activeGoal && currentSurahMeta ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
              {/* Active Goal Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
                    سورة {currentSurahMeta.name} [الآيات {activeGoal.startAyah} - {activeGoal.endAyah}]
                  </h2>
                  <p className="text-xs text-stone-500">
                    عدد الآيات في هذا المقطع: {activeGoal.endAyah - activeGoal.startAyah + 1} آيات
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIncrementRepetition(activeGoal.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors shadow-xs"
                    title="تسجيل تكرار تم حفظه"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>سجل تكرار ({activeGoal.repetitionsCompleted + 1})</span>
                  </button>

                  <button
                    onClick={() => onNavigateToMushaf(activeGoal.surahNumber, activeGoal.startAyah)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:border-emerald-600 transition-colors"
                  >
                    عرض في المصحف
                  </button>
                </div>
              </div>

              {/* Memorization Test Mode Toggle Controls */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  نمط "اختبر حفظك":
                </span>

                <div className="flex items-center gap-1 bg-stone-200 dark:bg-stone-700 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setTestMode('visible')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      testMode === 'visible'
                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    نص ظاهر كامل
                  </button>
                  <button
                    onClick={() => setTestMode('first-letter')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      testMode === 'first-letter'
                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    الحرف الأول (مفتاح التذكر)
                  </button>
                  <button
                    onClick={() => setTestMode('hidden')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      testMode === 'hidden'
                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    إخفاء تام للكلمات
                  </button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="text-[11px] text-stone-500 flex items-center justify-between">
                <span>💡 نصيحة: انقر على أي كلمة مخفية لإظهارها إذا نسيت لفظها أثناء التسميع.</span>
                {Object.keys(revealedWords).length > 0 && (
                  <button
                    onClick={() => setRevealedWords({})}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    إعادة إخفاء الكلمات المستكشفة
                  </button>
                )}
              </div>

              {/* Ayahs Display for Active Goal */}
              <div className="space-y-6">
                {filteredAyahs.map((ayah) => {
                  const words = ayah.textUthmani.trim().split(/\s+/);

                  return (
                    <div
                      key={ayah.numberInSurah}
                      className="p-5 rounded-2xl bg-stone-50/50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800"
                    >
                      {/* Ayah Header */}
                      <div className="flex items-center justify-between mb-3 text-xs text-stone-400">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">
                          الآية {ayah.numberInSurah}
                        </span>
                        <button
                          onClick={() => onPlayAyah(activeGoal.surahNumber, ayah.numberInSurah)}
                          className="flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-emerald-700"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>استمع للمقطع</span>
                        </button>
                      </div>

                      {/* Interactive Masked/Visible Text */}
                      <div className="leading-[2.4] font-serif text-2xl text-right">
                        {words.map((word, wordIdx) => {
                          const key = `${ayah.numberInSurah}-${wordIdx}`;
                          const isRevealed = revealedWords[key];

                          if (testMode === 'hidden' && !isRevealed) {
                            return (
                              <button
                                key={wordIdx}
                                onClick={() => toggleWordReveal(key)}
                                className="inline-block mx-1 px-2.5 py-0.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-stone-300 dark:border-stone-600 transition-colors select-none text-transparent text-sm cursor-pointer"
                                title="انقر لكشف الكلمة"
                              >
                                {word}
                              </button>
                            );
                          }

                          if (testMode === 'first-letter' && !isRevealed) {
                            const firstChar = word.charAt(0);
                            return (
                              <button
                                key={wordIdx}
                                onClick={() => toggleWordReveal(key)}
                                className="inline-block mx-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer text-base"
                                title="انقر لإظهار الكلمة كاملة"
                              >
                                {firstChar}...
                              </button>
                            );
                          }

                          return (
                            <span
                              key={wordIdx}
                              onClick={() => toggleWordReveal(key)}
                              className={`inline-block mx-1 text-stone-900 dark:text-stone-100 ${
                                isRevealed ? 'text-emerald-800 dark:text-emerald-300 font-bold' : ''
                              }`}
                            >
                              {word}
                            </span>
                          );
                        })}

                        {/* End Ayah Marker */}
                        <span className="inline-flex items-center justify-center mx-1.5 text-emerald-800 dark:text-emerald-400 select-none">
                          <span className="text-xl font-serif">۝</span>
                          <span className="text-xs font-mono font-bold -mr-5 -ml-1 text-amber-700">
                            {ayah.numberInSurah}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">حدد هدفاً من القائمة الجانبية أو أضف هدف حفظ جديد للبدء.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-6 space-y-5" dir="rtl">
            <h3 className="font-bold text-lg text-stone-900 dark:text-white">
              إضافة هدف حفظ ومراجعة جديد
            </h3>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                اختر السورة الكريمة:
              </label>
              <select
                value={newSurah}
                onChange={(e) => {
                  const sNum = Number(e.target.value);
                  setNewSurah(sNum);
                  setNewStartAyah(1);
                  const meta = SURAHS_META.find(s => s.number === sNum);
                  setNewEndAyah(Math.min(10, meta?.numberOfAyahs || 10));
                }}
                className="w-full text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5"
              >
                {SURAHS_META.map(s => (
                  <option key={s.number} value={s.number}>
                    {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  من الآية:
                </label>
                <input
                  type="number"
                  min="1"
                  max={newEndAyah}
                  value={newStartAyah}
                  onChange={(e) => setNewStartAyah(Number(e.target.value))}
                  className="w-full text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  إلى الآية:
                </label>
                <input
                  type="number"
                  min={newStartAyah}
                  max={SURAHS_META.find(s => s.number === newSurah)?.numberOfAyahs || 100}
                  value={newEndAyah}
                  onChange={(e) => setNewEndAyah(Number(e.target.value))}
                  className="w-full text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                هدف التكرار لتثبيت الحفظ:
              </label>
              <select
                value={newTargetRepetitions}
                onChange={(e) => setNewTargetRepetitions(Number(e.target.value))}
                className="w-full text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5"
              >
                <option value="5">5 مرات (مراجعة سريعة)</option>
                <option value="10">10 مرات (حفظ أولي متقن)</option>
                <option value="20">20 مرة (تثبيت راسخ كالفاتحة)</option>
                <option value="40">40 مرة (طريقة حفاظ الشناقطة)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddGoal}
                className="px-5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
              >
                حفظ الهدف والبدء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Sparkles, Volume2, ArrowRight, CheckCircle2, ChevronDown, HelpCircle, Layers } from 'lucide-react';
import { TAJWEED_RULES } from '../../data/tajweed-rules';
import { TajweedRuleMeta, TajweedRuleType } from '../../types/quran';

interface TajweedGuideProps {
  onSelectRuleInMushaf?: (rule: TajweedRuleType) => void;
  onNavigateToSurah?: (surahNumber: number, ayahNumber: number) => void;
}

export const TajweedGuide: React.FC<TajweedGuideProps> = ({ onNavigateToSurah }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRule, setActiveRule] = useState<TajweedRuleMeta>(TAJWEED_RULES.ghunnah);

  const categories = [
    { id: 'all', label: 'جميع الأحكام' },
    { id: 'أحكام النون الساكنة والتنوين', label: 'النون الساكنة والتنوين' },
    { id: 'أحكام المدود', label: 'المدود وتطويل الصوت' },
    { id: 'أحكام الحروف', label: 'القلقلة وصفات الحروف' },
    { id: 'أحكام الغنن', label: 'الغنن والمشددتان' },
    { id: 'أحكام الميم الساكنة', label: 'الميم الساكنة' }
  ];

  const rulesList = Object.values(TAJWEED_RULES).filter(r => 
    selectedCategory === 'all' || r.category === selectedCategory
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28" dir="rtl">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white shadow-md mb-8">
        <div className="flex items-center gap-2 mb-2 text-xs text-amber-300 font-medium">
          <BookOpen className="w-4 h-4" />
          <span>أطلس التجويد التفاعلي الملون</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
          دليل أحكام التجويد ومخارج الحروف
        </h1>
        <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
          نظام لوني دقيق ومعتمد يساعدك على نطق كتاب الله مرتلاً مجوداً كما أُنزل على النبي ﷺ، مطابق لمتون الجزرية وتحفة الأطفال.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-emerald-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Two-Zone Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Grid (Left / Top: 5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
            قائمة الأحكام ({rulesList.length}):
          </span>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {rulesList.map((rule) => {
              const isSelected = activeRule.id === rule.id;

              return (
                <div
                  key={rule.id}
                  onClick={() => setActiveRule(rule)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full ring-2 ring-stone-200 dark:ring-stone-700 shrink-0"
                      style={{ backgroundColor: rule.color }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                        {rule.name}
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        {rule.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {rule.duration || `${rule.letters.length} حروف`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Interactive Rule Stage (Right: 7 Cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            {/* Rule Header */}
            <div className="flex items-start justify-between pb-5 border-b border-stone-200 dark:border-stone-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block"
                    style={{ backgroundColor: activeRule.color }}
                  />
                  <span className="text-xs font-semibold text-stone-400 uppercase">
                    {activeRule.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
                  {activeRule.name}
                </h2>
              </div>

              {activeRule.duration && (
                <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  {activeRule.duration}
                </div>
              )}
            </div>

            {/* Canonical Quranic Example */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-center space-y-2">
              <span className="text-xs text-stone-400 block">
                مثال تطبيقي من القرآن الكريم:
              </span>
              <p
                className="font-serif text-3xl font-bold tracking-wide"
                style={{ color: activeRule.color }}
              >
                ﴿ {activeRule.example} ﴾
              </p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                التعريف والشرح التعليمي:
              </h4>
              <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed font-sans">
                {activeRule.description}
              </p>
            </div>

            {/* Articulation & Exit (المخرج والصفة) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                المخرج وكيفية الأداء الصوتي:
              </h4>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-sans">
                {activeRule.articulation}
              </p>
            </div>

            {/* Letters Matrix */}
            <div>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                حروف هذا الحكم ({activeRule.letters.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeRule.letters.map((letter, idx) => (
                  <span
                    key={idx}
                    className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-serif font-bold text-lg flex items-center justify-center border border-stone-200 dark:border-stone-700 shadow-2xs"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Jump to Mushaf Practice */}
            {onNavigateToSurah && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                <button
                  onClick={() => onNavigateToSurah(1, 1)}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                >
                  <span>شاهد أمثلة هذا الحكم مباشرة في المصحف الشريف</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

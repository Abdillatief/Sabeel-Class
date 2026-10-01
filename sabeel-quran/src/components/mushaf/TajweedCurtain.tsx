/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Palette, Eye, EyeOff } from 'lucide-react';
import { TAJWEED_RULES, getTajweedThemeColor } from '../../data/tajweed-rules';
import { TajweedRuleType } from '../../types/quran';

interface TajweedCurtainProps {
  showColors: boolean;
  onToggleShowColors: () => void;
  onOpenRuleModal: (ruleId: TajweedRuleType, example: string) => void;
  isDarkMode?: boolean;
}

export const TajweedCurtain: React.FC<TajweedCurtainProps> = ({
  showColors,
  onToggleShowColors,
  onOpenRuleModal,
  isDarkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Exact rules requested by user without writing color names
  const rulesList: {
    id: TajweedRuleType;
    name: string;
    example: string;
  }[] = [
    {
      id: 'madd_arid',
      name: 'المد العارض للسكون',
      example: 'ٱلْعَٰلَمِينَ'
    },
    {
      id: 'madd_muttasil_munfasil',
      name: 'المد المتصل والمنفصل',
      example: 'ٱلسَّمَآءِ'
    },
    {
      id: 'madd_lazim',
      name: 'المد اللازم',
      example: 'ٱلضَّآلِّينَ'
    },
    {
      id: 'ghunnah',
      name: 'الغنة والإقلاب والإخفاء',
      example: 'إِنَّ · كُنتُمْ · مِنۢ بَعْدِ'
    },
    {
      id: 'mufakhkham',
      name: 'الحرف المفخم (خص ضغط قظ)',
      example: 'خَلَقَ · ٱلصَّٰلِحَٰتِ'
    },
    {
      id: 'muraqqaq',
      name: 'الحرف المرقق',
      example: 'بِسْمِ · ٱلرَّحْمَٰنِ'
    },
    {
      id: 'qalqalah',
      name: 'القلقلة (قطب جد)',
      example: 'ٱلْفَلَقِ · يَجْعَلُونَ'
    },
    {
      id: 'sukun',
      name: 'الحرف الساكن',
      example: 'أَنْعَمْتَ · قُلْ'
    }
  ];

  return (
    <div className="sticky top-14 sm:top-16 z-30 mb-5 transition-all duration-300" dir="rtl">
      {/* ========================================================
          CURTAIN HANDLE DIRECTLY BELOW NAVBAR (ستارة صغيرة تحت الناف بار)
         ======================================================== */}
      <div className="flex justify-center -mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-all ${
            isOpen
              ? 'bg-sky-500 text-white border-sky-600 font-bold shadow-md'
              : 'bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border-sky-200/80 dark:border-stone-800 hover:border-sky-400 hover:text-sky-600'
          }`}
          title={isOpen ? 'رفع ستارة ألوان التجويد' : 'إنزال ستارة ألوان التجويد'}
        >
          <Palette className="w-3.5 h-3.5 text-sky-500" />
          <span>مرجع ألوان التجويد</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ========================================================
          DROPDOWN CURTAIN CONTENT (بدون كتابة اسم اللون تحتها)
         ======================================================== */}
      {isOpen && (
        <div className="mt-2.5 mx-auto max-w-4xl p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-2 border-sky-300 dark:border-sky-900/80 shadow-2xl animate-in slide-in-from-top-3 duration-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-sky-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white font-serif">
                دليل ألوان أحكام التجويد المعتمدة بالمصحف
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleShowColors}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  showColors
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {showColors ? <Eye className="w-3 h-3 text-sky-600" /> : <EyeOff className="w-3 h-3" />}
                <span>{showColors ? 'الألوان مفعّلة' : 'الألوان معطلة'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs flex items-center gap-1"
                title="رفع الستارة"
              >
                <span>إغلاق الستارة</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid of Rules showing color dot, rule name, and Quranic example ONLY (No color names) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {rulesList.map((rule) => {
              const ruleColor = getTajweedThemeColor(rule.id, isDarkMode);

              return (
                <div
                  key={rule.id}
                  onClick={() => onOpenRuleModal(rule.id, rule.example)}
                  className="p-3 rounded-2xl border border-sky-100 dark:border-stone-800 bg-sky-50/40 dark:bg-stone-800/40 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-2 group"
                  title="اضغط لمعرفة حكم وتفاصيل القاعدة ومخارج الحروف"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-2 ring-white dark:ring-stone-900 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: ruleColor }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate font-serif">
                        {rule.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1.5 border-t border-sky-100/60 dark:border-stone-700/40">
                    <span 
                      className="font-serif font-bold text-xs px-2 py-0.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700 shadow-2xs"
                      style={{ color: ruleColor }}
                    >
                      {rule.example}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Volume2, BookOpen, CheckCircle2 } from 'lucide-react';
import { TAJWEED_RULES } from '../../data/tajweed-rules';
import { TajweedRuleType } from '../../types/quran';

interface TajweedModalProps {
  ruleId: TajweedRuleType | null;
  selectedWordText?: string;
  onClose: () => void;
}

export const TajweedModal: React.FC<TajweedModalProps> = ({ ruleId, selectedWordText, onClose }) => {
  if (!ruleId) return null;
  const rule = TAJWEED_RULES[ruleId];
  if (!rule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Header with Rule Color Accent */}
        <div 
          className="p-5 flex items-start justify-between border-b border-stone-100 dark:border-stone-800 text-white"
          style={{ backgroundColor: rule.color }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 text-white font-medium">
                {rule.category}
              </span>
              {rule.duration && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  {rule.duration}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold font-serif">{rule.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-right">
          {/* Target Word Example */}
          {selectedWordText && (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">
                  الكلمة المحددة من الآية:
                </span>
                <span 
                  className="text-2xl font-serif font-bold tracking-wide"
                  style={{ color: rule.color }}
                >
                  {selectedWordText}
                </span>
              </div>
              <div 
                className="w-3.5 h-3.5 rounded-full ring-4 ring-stone-200 dark:ring-stone-700"
                style={{ backgroundColor: rule.color }}
              />
            </div>
          )}

          {/* Educational Description */}
          <div>
            <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              الشرح التعليمي للحكم
            </h4>
            <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed font-sans">
              {rule.description}
            </p>
          </div>

          {/* Articulation & Exit Point (المخرج والصفة) */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              كيفية النطق والمخرج:
            </h4>
            <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-sans">
              {rule.articulation}
            </p>
          </div>

          {/* Letters belonging to the rule */}
          <div>
            <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
              حروف هذا الحكم ({rule.letters.length}):
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {rule.letters.map((letter, idx) => (
                <span
                  key={idx}
                  className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-serif font-bold text-base flex items-center justify-center border border-stone-200 dark:border-stone-700"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>

          {/* Canonical Example from Quran */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>مثال شهير في القرآن الكريم:</span>
            <span className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">
              {rule.example}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            فهمت الحكم، متابعة القراءة
          </button>
        </div>
      </div>
    </div>
  );
};

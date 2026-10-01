/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Type, Palette, Sparkles, Sliders, Check } from 'lucide-react';
import { QuranSettings } from '../../types/quran';

interface MushafSettingsModalProps {
  settings: QuranSettings;
  onUpdateSettings: (newSettings: QuranSettings) => void;
  onClose: () => void;
}

export const MushafSettingsModal: React.FC<MushafSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              إعدادات المصحف والعرض
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* Font Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-emerald-600" />
                حجم خط الآيات:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {settings.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="44"
              step="2"
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>صغير (20px)</span>
              <span>افتراضي (28px)</span>
              <span>كبير (44px)</span>
            </div>
          </div>

          {/* Font Family Selection */}
          <div>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
              نوع الخط القرآني:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Amiri Quran', label: 'أميري مصحف' },
                { id: 'Amiri', label: 'أميري كلاسيكي' },
                { id: 'Scheherazade New', label: 'شهرزاد' }
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => onUpdateSettings({ ...settings, fontFamily: font.id as any })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    settings.fontFamily === font.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-600" />
              سمة المصحف والمظهر:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'babyblue-light', label: 'بيبي بلو فاتح', bg: 'bg-[#F0F9FF] text-sky-950 border-sky-300' },
                { id: 'babyblue-dark', label: 'بيبي بلو داكن', bg: 'bg-[#0B1320] text-sky-200 border-sky-800' },
                { id: 'classic-mushaf', label: 'ورق المصحف', bg: 'bg-[#FDFBF7] text-stone-900 border-amber-200' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: theme.id as any })}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${theme.bg} ${
                    settings.theme === theme.id
                      ? 'ring-2 ring-sky-500 font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tajweed Colors Toggle */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  نظام ألوان التجويد التفاعلي
                </span>
                <span className="text-[11px] text-stone-400 block">
                  تلوين أحكام النون، المدود، القلقلة، والإدغام
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, showTajweedColors: !settings.showTajweedColors })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.showTajweedColors ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.showTajweedColors ? 'left-1' : 'left-6'
                  }`}
                />
              </button>
            </div>

            {/* Auto Scroll Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  التمرير التلقائي مع القارئ
                </span>
                <span className="text-[11px] text-stone-400 block">
                  تتبع الآية الجاري تلاوتها على الشاشة
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, autoScroll: !settings.autoScroll })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.autoScroll ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.autoScroll ? 'left-1' : 'left-6'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            تطبيق وحفظ
          </button>
        </div>
      </div>
    </div>
  );
};

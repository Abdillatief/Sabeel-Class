/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Save, Check } from 'lucide-react';
import { QuranAyah, QuranSurahMeta } from '../../types/quran';

interface TafsirModalProps {
  surah: QuranSurahMeta;
  ayah: QuranAyah;
  existingNote?: string;
  onSaveNote: (note: string) => void;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  surah,
  ayah,
  existingNote = '',
  onSaveNote,
  onClose
}) => {
  const [note, setNote] = useState(existingNote);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveNote(note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                التفسير الميسر وتدبر الآية
              </h3>
              <p className="text-xs text-stone-500">
                سورة {surah.name} · الآية {ayah.numberInSurah} · الجزء {ayah.juz}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Uthmani Ayah Box */}
          <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <p className="font-serif text-xl sm:text-2xl leading-loose text-emerald-950 dark:text-emerald-100 font-medium">
              {ayah.textUthmani}
            </p>
          </div>

          {/* Tafsir Content */}
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف):
            </span>
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
              {ayah.tafsir || 'هذه الآية الكريمة تتضمن بياناً وإرشاداً من أحكام وهدايات القرآن العظيم.'}
            </div>
          </div>

          {/* Student Note / Reflection Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                ملاحظات وتدبر شخصي على الآية:
              </span>
              {saved && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  تم الحفظ بنجاح
                </span>
              )}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب خاطرة، وقفة تدبر، أو رابطاً حفظياً لهذه الآية..."
              className="w-full h-24 p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ الملاحظة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

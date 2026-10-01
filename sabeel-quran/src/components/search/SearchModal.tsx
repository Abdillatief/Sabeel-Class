/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, ArrowLeft, CornerDownLeft, FileText } from 'lucide-react';
import { SURAHS_META } from '../../data/surahs-meta';
import { CORE_SURAHS_AYAHS } from '../../data/quran-core-data';
import { getPageInfo } from '../../services/pageService';
import { normalizeArabic, parseSurahAyahQuery } from '../../services/searchEngine';
import { QuranAyah, QuranSurahMeta } from '../../types/quran';

interface SearchModalProps {
  onSelectResult: (surahNumber: number, ayahNumber: number) => void;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectResult, onClose }) => {
  const [query, setQuery] = useState('');
  const [pageInput, setPageInput] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Direct Page Match (if user types e.g. "562" or "صفحة 562")
  const pageMatch = useMemo(() => {
    const trimmed = query.trim().replace(/^(صفحة|ص)\s*/, '');
    const pageNum = parseInt(trimmed, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
      return getPageInfo(pageNum);
    }
    return null;
  }, [query]);

  // Quick jump suggestions (surahs)
  const matchingSurahs = useMemo(() => {
    if (!query.trim()) return [];
    const norm = normalizeArabic(query.trim());
    return SURAHS_META.filter(s => 
      normalizeArabic(s.name).includes(norm) || 
      s.englishName.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number) === query.trim()
    ).slice(0, 6);
  }, [query]);

  // Ayah search results from core database
  const searchResults = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];

    const parsed = parseSurahAyahQuery(query);
    if (parsed?.surahNumber && parsed.ayahNumber) {
      const meta = SURAHS_META.find(s => s.number === parsed.surahNumber);
      if (meta) {
        return [{
          surah: meta,
          ayahNumber: parsed.ayahNumber,
          text: `انتقال مباشر إلى سورة ${meta.name} الآية ${parsed.ayahNumber}`
        }];
      }
    }

    const normQuery = normalizeArabic(query);
    const results: { surah: QuranSurahMeta; ayahNumber: number; text: string }[] = [];

    // Search across core loaded surahs
    for (const [surahNumStr, ayahs] of Object.entries(CORE_SURAHS_AYAHS)) {
      const surahNum = Number(surahNumStr);
      const meta = SURAHS_META.find(s => s.number === surahNum);
      if (!meta) continue;

      for (const ayah of ayahs) {
        if (normalizeArabic(ayah.textUthmani).includes(normQuery)) {
          results.push({
            surah: meta,
            ayahNumber: ayah.numberInSurah,
            text: ayah.textUthmani
          });
        }
      }
    }

    return results.slice(0, 15);
  }, [query]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      const info = getPageInfo(p);
      onSelectResult(info.surah.number, info.estimatedAyah);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150" dir="rtl">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh] mt-8 sm:mt-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بكلمة، اسم سورة، أو اكتب رقم الصفحة (1 - 604)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
          >
            إلغاء (Esc)
          </button>
        </div>

        {/* Dedicated Quick Page Jumper Strip */}
        <form onSubmit={handlePageSubmit} className="px-5 py-2.5 bg-amber-50/60 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>انتقال سريع برقم الصفحة:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="604"
              placeholder="رقم الصفحة (1 - 604)"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-36 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
            >
              انتقال
            </button>
          </div>
        </form>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Direct Page Jump Result */}
          {pageMatch && (
            <div
              onClick={() => {
                onSelectResult(pageMatch.surah.number, pageMatch.estimatedAyah);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700/80 flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {pageMatch.pageNumber}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white font-serif">
                    الانتقال المباشر إلى الصفحة {pageMatch.pageNumber}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    سورة {pageMatch.surah.name} · الجزء {pageMatch.juzNumber}
                  </p>
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform" />
            </div>
          )}

          {/* Surah Matches */}
          {matchingSurahs.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                السور المطابقة ({matchingSurahs.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => {
                      onSelectResult(surah.number, 1);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-right transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs flex items-center justify-center font-mono font-bold">
                        {surah.number}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-stone-900 dark:text-white block font-serif">
                          سورة {surah.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · صفحة {surah.startPage}
                        </span>
                      </div>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ayah Matches */}
          {searchResults.length > 0 ? (
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                نتائج الآيات ({searchResults.length})
              </span>
              <div className="space-y-2">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectResult(res.surah.number, res.ayahNumber);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1 text-emerald-800 dark:text-emerald-300 font-semibold font-serif">
                      <span>سورة {res.surah.name} · الآية {res.ayahNumber}</span>
                      <span className="text-[10px] text-stone-400 font-sans">صفحة {res.surah.startPage}</span>
                    </div>
                    <p className="text-sm text-stone-800 dark:text-stone-200 font-serif leading-relaxed line-clamp-2">
                      {res.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : query.trim().length >= 2 && matchingSurahs.length === 0 && !pageMatch ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              لم نعثر على نتائج مطابقة لـ "{query}". جرب البحث باسم السورة أو رقم الصفحة.
            </div>
          ) : null}

          {/* Empty Prompt */}
          {!query && (
            <div className="text-center py-8 text-stone-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-xs">
                اكتب أي كلمة، أو رقم صفحة (مثل: 562)، أو اسم سورة للانتقال المباشر.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

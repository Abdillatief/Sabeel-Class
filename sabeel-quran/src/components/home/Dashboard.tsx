/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, Target, Bookmark, ArrowLeft, Play, Search, CheckCircle2, ChevronLeft, X, FileText } from 'lucide-react';
import { SURAHS_META } from '../../data/surahs-meta';
import { getPageInfo } from '../../services/pageService';
import { LastReadPosition } from '../../services/storageService';
import { UserBookmark } from '../../types/quran';

interface DashboardProps {
  lastRead: LastReadPosition;
  bookmarks: UserBookmark[];
  onContinueReading: (surahNumber: number, ayahNumber: number) => void;
  onSelectSurah: (surahNumber: number) => void;
  onNavigateToHifz: () => void;
  onNavigateToTasmee: () => void;
  onNavigateToTajweed: () => void;
  onOpenSearch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  lastRead,
  bookmarks,
  onContinueReading,
  onSelectSurah,
  onNavigateToHifz,
  onNavigateToTasmee,
  onNavigateToTajweed,
  onOpenSearch
}) => {
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan' | 'juz30'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const lastSurahMeta = SURAHS_META.find(s => s.number === lastRead.surahNumber) || SURAHS_META[0];

  // Direct Page Match (1 - 604)
  const pageMatch = useMemo(() => {
    const trimmed = searchQuery.trim().replace(/^(صفحة|ص)\s*/, '');
    const pageNum = parseInt(trimmed, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
      return getPageInfo(pageNum);
    }
    return null;
  }, [searchQuery]);

  // Filter surahs
  const filteredSurahs = SURAHS_META.filter((s) => {
    let matchesType = true;
    if (filterType === 'meccan') matchesType = s.revelationType === 'Meccan';
    else if (filterType === 'medinan') matchesType = s.revelationType === 'Medinan';
    else if (filterType === 'juz30') matchesType = s.number >= 78;

    const trimmed = searchQuery.trim();
    if (!trimmed) return matchesType;

    const matchesSearch =
      s.name.includes(trimmed) ||
      s.englishName.toLowerCase().includes(trimmed.toLowerCase()) ||
      String(s.number) === trimmed;

    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6" dir="rtl">
      {/* Top Direct Index & Search Hero */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white shadow-lg space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
              <BookOpen className="w-4 h-4" />
              <span>فهرس سور القرآن الكريم والبحث المباشر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              المصحف الإلكتروني التعليمي (114 سورة)
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToTasmee}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors border border-emerald-500/50 shadow-xs"
            >
              <span>التسميع الذكي بالمايك</span>
            </button>

            {/* Quick Resume Last Read Button */}
            <button
              onClick={() => onContinueReading(lastRead.surahNumber, lastRead.ayahNumber)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-transform hover:scale-105 shadow-md"
            >
              <span>متابعة: سورة {lastRead.surahName} ({lastRead.ayahNumber})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Immediate Top Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم السورة، رقمها، أو اضغط للبحث الشامل في الآيات (مثال: الفاتحة، الكهف، 67)..."
            className="w-full text-sm sm:text-base bg-white/10 dark:bg-stone-800/80 backdrop-blur-md border border-white/20 dark:border-stone-700 rounded-2xl pr-11 pl-28 py-3 text-white placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all"
            autoFocus
          />
          <Search className="w-5 h-5 text-amber-300 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-24 top-1/2 -translate-y-1/2 p-1 text-stone-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
          >
            بحث الآيات
          </button>
        </div>

        {/* Filter Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-stone-400 text-xs ml-1">تصفية سريعة:</span>
          {[
            { id: 'all', label: 'كافة السور (114)' },
            { id: 'meccan', label: 'السور المكية (86)' },
            { id: 'medinan', label: 'السور المدنية (28)' },
            { id: 'juz30', label: 'جزء عمّ (78 - 114)' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-colors font-medium ${
                filterType === f.id
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Quick famous surahs shortcuts */}
          <div className="mr-auto hidden sm:flex items-center gap-1.5">
            {[
              { name: 'الفاتحة', num: 1 },
              { name: 'الكهف', num: 18 },
              { name: 'يس', num: 36 },
              { name: 'الملك', num: 67 }
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => onSelectSurah(s.num)}
                className="px-2.5 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-amber-200 text-xs border border-emerald-700/50"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookmarks bar if available */}
      {bookmarks.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 overflow-x-auto">
          <Bookmark className="w-4 h-4 text-amber-600 fill-current shrink-0" />
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 shrink-0">
            العلامات المرجعية:
          </span>
          <div className="flex items-center gap-2">
            {bookmarks.map((b) => (
              <button
                key={b.id}
                onClick={() => onContinueReading(b.surahNumber, b.ayahNumber)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-emerald-600 text-xs transition-colors whitespace-nowrap"
              >
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  سورة {b.surahName}
                </span>
                <span className="text-stone-400">· آية {b.ayahNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Direct Page Jump Result Card (if searching for a page number 1 - 604) */}
      {pageMatch && (
        <div
          onClick={() => onContinueReading(pageMatch.surah.number, pageMatch.estimatedAyah)}
          className="p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 flex items-center justify-between cursor-pointer hover:bg-amber-500/25 transition-all shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs font-mono">
              ص {pageMatch.pageNumber}
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                الانتقال المباشر إلى الصفحة {pageMatch.pageNumber} في المصحف
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                سورة {pageMatch.surah.name} · الجزء {pageMatch.juzNumber} (اضغط لفتح الصفحة وقراءتها فوراً)
              </p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:-translate-x-1.5 transition-transform" />
        </div>
      )}

      {/* Surahs Grid (114 Surahs) - Front and Center */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            السور المتاحة ({filteredSurahs.length}):
          </span>
          <span className="text-xs text-stone-400">
            اضغط على السورة لبدء القراءة فوراً
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-600 hover:shadow-xs transition-all text-right group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 flex items-center justify-center font-mono font-bold text-xs transition-colors shrink-0">
                  {surah.number}
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    سورة {surah.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-sans">
                    <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{surah.numberOfAyahs} آية</span>
                  </div>
                </div>
              </div>

              <div className="text-left text-[11px] text-stone-400 font-mono">
                ص {surah.startPage}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

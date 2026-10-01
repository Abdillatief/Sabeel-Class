/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Bookmark, 
  BookOpen, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  LayoutList, 
  AlignJustify,
  FileText,
  Search,
  ArrowRight
} from 'lucide-react';
import { SURAHS_META } from '../../data/surahs-meta';
import { getTajweedThemeColor } from '../../data/tajweed-rules';
import { getPageInfo } from '../../services/pageService';
import { quranService } from '../../services/quranService';
import { buildWordLetterSpans, playWordPronunciation } from '../../services/tajweedParser';
import { QuranAyah, QuranSettings, QuranSurah, TajweedRuleType } from '../../types/quran';
import { TajweedCurtain } from './TajweedCurtain';

interface MushafReaderProps {
  surahNumber: number;
  initialAyahNumber?: number;
  settings: QuranSettings;
  onUpdateSettings: (newSettings: QuranSettings) => void;
  activeAyahNumber: number;
  isPlaying: boolean;
  onPlayAyah: (surahNumber: number, ayahNumber: number) => void;
  onSelectSurah: (surahNumber: number) => void;
  onOpenTajweedModal: (ruleId: TajweedRuleType, wordText: string) => void;
  onOpenTafsirModal: (ayah: QuranAyah) => void;
  onToggleBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  surahNumber,
  initialAyahNumber = 1,
  settings,
  onUpdateSettings,
  activeAyahNumber,
  isPlaying,
  onPlayAyah,
  onSelectSurah,
  onOpenTajweedModal,
  onOpenTafsirModal,
  onToggleBookmark,
  isBookmarked
}) => {
  const [surah, setSurah] = useState<QuranSurah | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [pronouncingWordKey, setPronouncingWordKey] = useState<string | null>(null);
  const [hoveredAyahNumber, setHoveredAyahNumber] = useState<number | null>(null);
  const [pageJumpInput, setPageJumpInput] = useState<string>('');
  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map());

  const isDarkMode = settings.theme === 'babyblue-dark' || settings.theme === 'night-emerald';

  // Load Surah
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    quranService.getSurah(surahNumber).then((data) => {
      if (isMounted) {
        setSurah(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [surahNumber]);

  // Scroll to active or initial ayah
  useEffect(() => {
    if (!loading && settings.autoScroll) {
      const targetAyah = isPlaying ? activeAyahNumber : initialAyahNumber;
      const el = ayahRefs.current.get(targetAyah);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeAyahNumber, initialAyahNumber, loading, settings.autoScroll, isPlaying]);

  const handleCopyAyah = (ayah: QuranAyah) => {
    const textToCopy = `﴿ ${ayah.textUthmani} ﴾ [سورة ${surah?.name}: ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Play Sheikh Word-by-Word Pronunciation
  const handleWordClick = (ayahNumber: number, wordIdx: number, wordText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${ayahNumber}-${wordIdx}`;
    setPronouncingWordKey(key);
    playWordPronunciation(surahNumber, ayahNumber, wordIdx);
    setTimeout(() => {
      setPronouncingWordKey((curr) => (curr === key ? null : curr));
    }, 1400);
  };

  // Page Navigation Handlers
  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageJumpInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      handleGoToPage(p);
      setPageJumpInput('');
    }
  };

  const handleGoToPage = (pageNum: number) => {
    const target = Math.min(604, Math.max(1, pageNum));
    const info = getPageInfo(target);
    if (info.surah.number !== surahNumber) {
      onSelectSurah(info.surah.number);
    }
    setTimeout(() => {
      const el = ayahRefs.current.get(info.estimatedAyah);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'Amiri':
      case 'Scheherazade New':
      case 'Amiri Quran':
      default:
        return 'font-serif';
    }
  };

  if (loading || !surah) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4" dir="rtl">
        <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-stone-500 font-medium">
          جاري تحميل سورة {SURAHS_META.find(s => s.number === surahNumber)?.name} المباركة بالرسم العثماني الملون...
        </p>
      </div>
    );
  }

  const prevSurah = surahNumber > 1 ? surahNumber - 1 : null;
  const nextSurah = surahNumber < 114 ? surahNumber + 1 : null;
  const isContinuous = settings.displayMode === 'continuous';
  const currentPage = surah.startPage;

  let lastObservedPage = -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32" dir="rtl">
      {/* ========================================================
          TAJWEED COLORS TOP CURTAIN (ستارة ألوان التجويد المنسدلة تحت الناف بار)
         ======================================================== */}
      <TajweedCurtain
        showColors={settings.showTajweedColors}
        onToggleShowColors={() => onUpdateSettings({ ...settings, showTajweedColors: !settings.showTajweedColors })}
        onOpenRuleModal={(rule, example) => onOpenTajweedModal(rule, example)}
        isDarkMode={isDarkMode}
      />

      {/* Top Surah Switcher, View Mode, and Page Jumper Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 shadow-xs">
        {/* Surah Selector Dropdown & Arrows */}
        <div className="flex items-center gap-1.5">
          {prevSurah && (
            <button
              onClick={() => onSelectSurah(prevSurah)}
              className="p-1.5 rounded-lg border border-sky-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-800 text-xs flex items-center gap-1 transition-colors"
              title="السورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="hidden sm:inline">السابقة</span>
            </button>
          )}

          <select
            value={surahNumber}
            onChange={(e) => onSelectSurah(Number(e.target.value))}
            className="text-sm font-bold bg-sky-50/50 dark:bg-stone-800 text-stone-900 dark:text-white border border-sky-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {SURAHS_META.map((s) => (
              <option key={s.number} value={s.number} className="text-stone-900">
                {s.number}. سورة {s.name} ({s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}) - ص {s.startPage}
              </option>
            ))}
          </select>

          {nextSurah && (
            <button
              onClick={() => onSelectSurah(nextSurah)}
              className="p-1.5 rounded-lg border border-sky-200/70 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-800 text-xs flex items-center gap-1 transition-colors"
              title="السورة التالية"
            >
              <span className="hidden sm:inline">التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Page Jumper / Search by Page (1 - 604) */}
        <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleGoToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-40"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 bg-sky-50/70 dark:bg-stone-800 px-2 py-1 rounded-lg border border-sky-200/70 dark:border-stone-700">
            <span className="text-[11px] text-stone-500 font-sans">صفحة:</span>
            <input
              type="number"
              min="1"
              max="604"
              placeholder={String(currentPage)}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              className="w-12 bg-transparent text-center font-bold text-stone-900 dark:text-white focus:outline-none text-xs"
              title="اكتب رقم الصفحة (1 - 604) واضغط Enter"
            />
            <span className="text-[10px] text-stone-400">/ 604</span>
          </div>

          <button
            type="button"
            onClick={() => handleGoToPage(currentPage + 1)}
            disabled={currentPage >= 604}
            className="p-1 rounded-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-40"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Display Mode Toggle: Continuous vs Separated */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => onUpdateSettings({ ...settings, displayMode: 'continuous' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              isContinuous
                ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
            title="عرض متصل كصفحات المصحف الشريف"
          >
            <AlignJustify className="w-3.5 h-3.5" />
            <span>مصحف متصل</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ ...settings, displayMode: 'separated' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              !isContinuous
                ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
            title="عرض كل آية في بطاقة منفصلة"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>آية تلو آية</span>
          </button>
        </div>
      </div>

      {/* Ornate Surah Title Banner */}
      <div className="relative my-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-stone-50 to-sky-50/40 dark:from-stone-900 dark:to-sky-950/20 border-2 border-amber-600/30 dark:border-sky-800/40 text-center shadow-xs overflow-hidden">
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-600/40" />
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-600/40" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-600/40" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-600/40" />

        <div className="inline-block px-4 py-1 mb-1 text-xs font-semibold tracking-wider text-sky-800 dark:text-sky-300 uppercase">
          سُورَةُ
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide mb-2">
          {surah.name}
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {surah.numberOfAyahs} آية · الجزء {surah.juzNumber} · صفحة {surah.startPage}
        </p>

        {/* Bismillah Header: Appears ONCE, centered and neatly formatted above the verses (Not in Surah 9, and not in Surah 1 where it is Ayah 1) */}
        {surah.number !== 9 && surah.number !== 1 && (
          <div className="mt-5 pt-5 border-t border-amber-600/20 dark:border-sky-800/30">
            <p className="text-2xl sm:text-3xl font-serif text-stone-900 dark:text-stone-100 tracking-wide">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          MODE 1: CONTINUOUS MUSHAF VIEW (صفحة مثل المصحف الحقيقي)
         ======================================================== */}
      {isContinuous ? (
        <div className="max-w-3xl mx-auto p-6 sm:p-12 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1520] border-[3px] border-amber-600/35 dark:border-sky-900/60 shadow-2xl relative ring-8 ring-stone-100/80 dark:ring-stone-900/60">
          {/* Authentic Islamic Page Corner Ornaments */}
          <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-600/60 dark:border-sky-500/60 pointer-events-none" />
          <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-600/60 dark:border-sky-500/60 pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-600/60 dark:border-sky-500/60 pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-600/60 dark:border-sky-500/60 pointer-events-none" />

          {/* Running Physical Page Header */}
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-amber-600/20 dark:border-sky-900/40 text-xs font-serif text-amber-900/80 dark:text-sky-300/80 select-none">
            <span>الجزء {surah.juzNumber}</span>
            <span className="font-bold text-sm tracking-wide">سُورَةُ {surah.name}</span>
            <span>الحزب {surah.ayahs[0]?.hizbQuarter ? Math.ceil(surah.ayahs[0].hizbQuarter / 4) : 1}</span>
          </div>

          <div
            className={`text-justify leading-[2.6] sm:leading-[3.0] font-serif text-stone-900 dark:text-stone-100 ${getFontFamilyClass()}`}
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {surah.ayahs.map((ayah) => {
              const isCurrentActive = isPlaying && activeAyahNumber === ayah.numberInSurah;
              const words = ayah.textUthmani.trim().split(/\s+/);
              const segments = ayah.segments || [];
              const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);

              // Page Transition Divider
              const showPageDivider = ayah.page && ayah.page !== lastObservedPage;
              if (showPageDivider) {
                lastObservedPage = ayah.page;
              }

              return (
                <React.Fragment key={ayah.numberInSurah}>
                  {showPageDivider && (
                    <div className="my-8 py-2.5 px-6 rounded-2xl bg-amber-500/10 dark:bg-sky-950/40 border-y border-amber-600/30 dark:border-sky-800/40 flex items-center justify-between text-xs font-serif text-amber-950 dark:text-sky-200 select-none">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">الجزء {ayah.juz}</span>
                      <span className="font-bold text-sm tracking-widest text-amber-900 dark:text-sky-300">
                        — ۞ صـفـحـة {ayah.page} ۞ —
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                        {ayah.hizbQuarter ? `الحزب ${Math.ceil(ayah.hizbQuarter / 4)}` : ''}
                      </span>
                    </div>
                  )}

                  <span
                    ref={(el) => {
                      if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                      else ayahRefs.current.delete(ayah.numberInSurah);
                    }}
                    onMouseEnter={() => setHoveredAyahNumber(ayah.numberInSurah)}
                    onMouseLeave={() => setHoveredAyahNumber(null)}
                    className={`inline rounded-xl px-1 py-0.5 transition-colors relative group ${
                      isCurrentActive
                        ? 'bg-sky-100/70 dark:bg-sky-950/70 ring-2 ring-sky-400 dark:ring-sky-500'
                        : hoveredAyahNumber === ayah.numberInSurah
                        ? 'bg-sky-50/50 dark:bg-sky-950/30'
                        : ''
                    }`}
                  >
                    {/* Floating Mini Action Bar on Hover */}
                    {hoveredAyahNumber === ayah.numberInSurah && (
                      <span
                        contentEditable={false}
                        className="absolute -top-9 right-0 z-30 flex items-center gap-1 p-1 bg-stone-900 text-white rounded-lg shadow-lg text-xs font-sans not-italic select-none animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          onClick={() => onPlayAyah(surah.number, ayah.numberInSurah)}
                          className="p-1 hover:bg-stone-800 rounded text-sky-400"
                          title="تلاوة هذه الآية"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => onOpenTafsirModal(ayah)}
                          className="p-1 hover:bg-stone-800 rounded text-stone-300"
                          title="تفسير الآية"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleBookmark(surah.number, ayah.numberInSurah)}
                          className={`p-1 hover:bg-stone-800 rounded ${
                            bookmarked ? 'text-amber-400' : 'text-stone-300'
                          }`}
                          title="إشارة مرجعية"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-1 hover:bg-stone-800 rounded text-stone-300"
                          title="نسخ الآية"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <Check className="w-3.5 h-3.5 text-sky-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-[10px] text-stone-400 font-mono px-1">
                          آية {ayah.numberInSurah} · ص {ayah.page}
                        </span>
                      </span>
                    )}

                    {/* Words with High-Contrast Tajweed Colors so NO letter disappears */}
                    {words.map((word, wordIdx) => {
                      const letterSpans = buildWordLetterSpans(word, wordIdx, segments);
                      const wordKey = `${ayah.numberInSurah}-${wordIdx}`;
                      const isPronouncing = pronouncingWordKey === wordKey;

                      return (
                        <span
                          key={wordIdx}
                          onClick={(e) => handleWordClick(ayah.numberInSurah, wordIdx, word, e)}
                          className={`inline-block mx-1 cursor-pointer transition-transform hover:scale-105 rounded px-0.5 select-text ${
                            isPronouncing
                              ? 'bg-sky-200 dark:bg-sky-900/60 ring-2 ring-sky-400 rounded-sm'
                              : ''
                          }`}
                          title="اضغط للاستماع لنطق الكلمة بالتجويد"
                        >
                          {letterSpans.map((span, sIdx) => {
                            if (settings.showTajweedColors && span.isTajweed && span.rule) {
                              const dynamicColor = getTajweedThemeColor(span.rule, isDarkMode);
                              return (
                                <span
                                  key={sIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (span.rule) {
                                      onOpenTajweedModal(span.rule, word);
                                    }
                                  }}
                                  style={{ color: dynamicColor }}
                                  className="cursor-pointer font-bold"
                                  title="اضغط لعرض حكم التجويد"
                                >
                                  {span.text}
                                </span>
                              );
                            }
                            // Base uncolored text: ALWAYS high-contrast sharp and clear
                            return (
                              <span key={sIdx} className="text-stone-900 dark:text-stone-100">
                                {span.text}
                              </span>
                            );
                          })}
                        </span>
                      );
                    })}

                    {/* Ornate End Ayah Symbol */}
                    <span
                      onClick={() => onPlayAyah(surah.number, ayah.numberInSurah)}
                      className="inline-flex items-center justify-center mx-1.5 text-sky-600 dark:text-sky-400 select-none cursor-pointer hover:scale-110 transition-transform"
                      title={`الآية ${ayah.numberInSurah} (اضغط للاستماع)`}
                    >
                      <span className="text-xl sm:text-2xl font-serif">۝</span>
                      <span className="text-[10px] sm:text-xs font-mono font-bold -mr-5 -ml-1 text-amber-700 dark:text-amber-300">
                        {ayah.numberInSurah}
                      </span>
                    </span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
            MODE 2: SEPARATED CARDS VIEW (آية تلو آية)
           ======================================================== */
        <div className="space-y-6">
          {surah.ayahs.map((ayah) => {
            const isCurrentActive = isPlaying && activeAyahNumber === ayah.numberInSurah;
            const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);
            const words = ayah.textUthmani.trim().split(/\s+/);
            const segments = ayah.segments || [];

            return (
              <div
                key={ayah.numberInSurah}
                ref={(el) => {
                  if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                  else ayahRefs.current.delete(ayah.numberInSurah);
                }}
                className={`p-5 sm:p-7 rounded-2xl border transition-all duration-200 ${
                  isCurrentActive
                    ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 shadow-md ring-1 ring-sky-400'
                    : 'bg-white dark:bg-stone-900/80 border-stone-200/80 dark:border-stone-800 hover:border-sky-300 dark:hover:border-sky-800/80'
                }`}
              >
                {/* Ayah Top Action Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 flex items-center justify-center font-serif font-bold text-xs border border-sky-200 dark:border-sky-800">
                      {ayah.numberInSurah}
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">
                      الجزء {ayah.juz} · ص {ayah.page}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPlayAyah(surah.number, ayah.numberInSurah)}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                        isCurrentActive
                          ? 'bg-sky-600 text-white'
                          : 'text-stone-500 hover:text-sky-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={isCurrentActive ? 'جارٍ الاستماع' : 'استمع لهذه الآية'}
                    >
                      {isCurrentActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline text-[11px]">تلاوة</span>
                    </button>

                    <button
                      onClick={() => onToggleBookmark(surah.number, ayah.numberInSurah)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        bookmarked
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-stone-500 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={bookmarked ? 'محفوظة في الإشارات المرجعية' : 'إضافة إشارة مرجعية'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => onOpenTafsirModal(ayah)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-sky-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1"
                      title="التفسير الميسر والتدبر"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">تفسير</span>
                    </button>

                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-sky-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="نسخ الآية الكريمة"
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="w-3.5 h-3.5 text-sky-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Uthmani Ayah Script with High-Contrast Tajweed */}
                <div 
                  className={`leading-[2.4] sm:leading-[2.6] text-right font-serif text-stone-900 dark:text-stone-100 ${getFontFamilyClass()}`}
                  style={{ fontSize: `${settings.fontSize}px` }}
                >
                  {words.map((word, wordIdx) => {
                    const letterSpans = buildWordLetterSpans(word, wordIdx, segments);
                    const wordKey = `${ayah.numberInSurah}-${wordIdx}`;
                    const isPronouncing = pronouncingWordKey === wordKey;

                    return (
                      <span
                        key={wordIdx}
                        onClick={(e) => handleWordClick(ayah.numberInSurah, wordIdx, word, e)}
                        className={`inline-block mx-1 cursor-pointer transition-transform hover:scale-105 rounded px-0.5 select-text ${
                          isPronouncing
                            ? 'bg-sky-200 dark:bg-sky-900/60 ring-2 ring-sky-400 rounded-sm'
                            : ''
                        }`}
                        title="اضغط للاستماع لنطق الكلمة بالتجويد"
                      >
                        {letterSpans.map((span, sIdx) => {
                          if (settings.showTajweedColors && span.isTajweed && span.rule) {
                            const dynamicColor = getTajweedThemeColor(span.rule, isDarkMode);
                            return (
                              <span
                                key={sIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (span.rule) {
                                    onOpenTajweedModal(span.rule, word);
                                  }
                                }}
                                style={{ color: dynamicColor }}
                                className="cursor-pointer font-bold"
                                title="اضغط لعرض حكم التجويد"
                              >
                                {span.text}
                              </span>
                            );
                          }
                          return (
                            <span key={sIdx} className="text-stone-900 dark:text-stone-100">
                              {span.text}
                            </span>
                          );
                        })}
                      </span>
                    );
                  })}

                  <span className="inline-flex items-center justify-center mx-2 text-sky-600 dark:text-sky-400 select-none">
                    <span className="text-xl sm:text-2xl font-serif">۝</span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold -mr-5 -ml-1 text-amber-700 dark:text-amber-300">
                      {ayah.numberInSurah}
                    </span>
                  </span>
                </div>

                {/* Inline Tafsir preview if enabled */}
                {settings.showTafsirInline && ayah.tafsir && (
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans bg-stone-50/50 dark:bg-stone-800/30 p-2.5 rounded-lg">
                    <span className="font-bold text-sky-700 dark:text-sky-400 ml-1">التفسير:</span>
                    {ayah.tafsir}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

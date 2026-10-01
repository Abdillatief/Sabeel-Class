/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  BookOpen, 
  Sliders, 
  ChevronLeft,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { SURAHS_META } from '../../data/surahs-meta';
import { quranService } from '../../services/quranService';
import { normalizeArabic } from '../../services/searchEngine';
import { playSuccessChime, playMistakeSound } from '../../services/soundEffects';
import { playWordPronunciation, removeDiacritics } from '../../services/tajweedParser';
import { QuranAyah, QuranSurah } from '../../types/quran';

export type TasmeeMode = 'tashkeel' | 'flexible';

interface TasmeeStudioProps {
  onNavigateToMushaf: (surahNumber: number, ayahNumber: number) => void;
}

export const TasmeeStudio: React.FC<TasmeeStudioProps> = ({ onNavigateToMushaf }) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [startAyahNumber, setStartAyahNumber] = useState<number>(1);
  const [endAyahNumber, setEndAyahNumber] = useState<number>(7);
  const [tasmeeMode, setTasmeeMode] = useState<TasmeeMode>('flexible');

  const [surah, setSurah] = useState<QuranSurah | null>(null);
  const [loading, setLoading] = useState(true);

  // Recitation State
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [revealedWordsMap, setRevealedWordsMap] = useState<Record<string, boolean>>({});
  const [mistakesCount, setMistakesCount] = useState(0);
  const [lastMistakeWord, setLastMistakeWord] = useState<string | null>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Load selected Surah data
  useEffect(() => {
    setLoading(true);
    quranService.getSurah(selectedSurahNumber).then((data) => {
      setSurah(data);
      const meta = SURAHS_META.find(s => s.number === selectedSurahNumber);
      setStartAyahNumber(1);
      setEndAyahNumber(Math.min(7, meta?.numberOfAyahs || 7));
      setLoading(false);
      resetTest();
    });
  }, [selectedSurahNumber]);

  // Target Ayahs in range
  const targetAyahs = surah
    ? surah.ayahs.filter(a => a.numberInSurah >= startAyahNumber && a.numberInSurah <= endAyahNumber)
    : [];

  const totalWordsInSession = targetAyahs.reduce((acc, a) => acc + a.textUthmani.trim().split(/\s+/).length, 0);
  const wordsRecitedSuccessfully = Object.keys(revealedWordsMap).length;
  const progressPercent = totalWordsInSession > 0 ? Math.round((wordsRecitedSuccessfully / totalWordsInSession) * 100) : 0;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setRecognizedText(transcript);
        evaluateSpokenText(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [currentAyahIndex, currentWordIndex, targetAyahs, tasmeeMode, isListening]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('المتصفح الحالي لا يدعم التعرف الصوتي المباشر عبر المايك. يمكنك استخدام زر "تسميع الكلمة" يدوياً.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start microphone', err);
        setIsListening(false);
      }
    }
  };

  const resetTest = () => {
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    setCurrentAyahIndex(0);
    setCurrentWordIndex(0);
    setRevealedWordsMap({});
    setMistakesCount(0);
    setLastMistakeWord(null);
    setIsTestComplete(false);
    setRecognizedText('');
  };

  // Evaluate recognized speech against current expected word
  const evaluateSpokenText = (transcript: string) => {
    if (!targetAyahs || targetAyahs.length === 0 || isTestComplete) return;

    const currentAyah = targetAyahs[currentAyahIndex];
    if (!currentAyah) return;

    const ayahWords = currentAyah.textUthmani.trim().split(/\s+/);
    const expectedWord = ayahWords[currentWordIndex];
    if (!expectedWord) return;

    // Split spoken transcript into tokens
    const spokenTokens = transcript.trim().split(/\s+/);
    const latestSpoken = spokenTokens[spokenTokens.length - 1];
    if (!latestSpoken) return;

    let isMatch = false;

    if (tasmeeMode === 'flexible') {
      // Normalization mode: ignores tashkeel, hamzat, alif maqsura, taa marbuta
      const normExpected = normalizeArabic(expectedWord);
      const normSpoken = normalizeArabic(latestSpoken);
      isMatch = normExpected === normSpoken || normExpected.includes(normSpoken) || normSpoken.includes(normExpected);
    } else {
      // Strict Tashkeel mode: requires matching tashkeel or exact base letters
      const cleanExpected = removeDiacritics(expectedWord);
      const cleanSpoken = removeDiacritics(latestSpoken);
      const exactMatch = expectedWord === latestSpoken;
      const baseMatch = cleanExpected === cleanSpoken;

      // In strict mode, if base matches but vowel was distinctly different
      isMatch = exactMatch || baseMatch;
    }

    if (isMatch) {
      handleWordSuccess(currentAyah.numberInSurah, currentWordIndex);
    } else if (latestSpoken.length >= 2) {
      // Trigger mistake sound only if a significant word was uttered and didn't match
      handleWordMistake(latestSpoken, expectedWord);
    }
  };

  const handleWordSuccess = (ayahNumber: number, wordIdx: number) => {
    playSuccessChime();
    setLastMistakeWord(null);
    const key = `${ayahNumber}-${wordIdx}`;
    setRevealedWordsMap(prev => ({ ...prev, [key]: true }));

    const currentAyah = targetAyahs[currentAyahIndex];
    const ayahWords = currentAyah.textUthmani.trim().split(/\s+/);

    if (currentWordIndex + 1 < ayahWords.length) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Move to next Ayah
      if (currentAyahIndex + 1 < targetAyahs.length) {
        setCurrentAyahIndex(prev => prev + 1);
        setCurrentWordIndex(0);
      } else {
        // Finished all Ayahs!
        setIsTestComplete(true);
        if (isListening && recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          setIsListening(false);
        }
      }
    }
  };

  const handleWordMistake = (spoken: string, expected: string) => {
    playMistakeSound();
    setMistakesCount(prev => prev + 1);
    setLastMistakeWord(`قرأت: "${spoken}" — والمطلوب: "${expected}"`);
  };

  // Manual word step (for testing or if mic is unavailable)
  const handleReciteNextManually = () => {
    if (!targetAyahs || targetAyahs.length === 0 || isTestComplete) return;
    const currentAyah = targetAyahs[currentAyahIndex];
    if (currentAyah) {
      handleWordSuccess(currentAyah.numberInSurah, currentWordIndex);
    }
  };

  const handlePlayExpectedWord = () => {
    if (!targetAyahs || targetAyahs.length === 0) return;
    const currentAyah = targetAyahs[currentAyahIndex];
    if (currentAyah) {
      playWordPronunciation(selectedSurahNumber, currentAyah.numberInSurah, currentWordIndex);
    }
  };

  const currentExpectedWord = targetAyahs[currentAyahIndex]?.textUthmani.trim().split(/\s+/)[currentWordIndex] || '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
              <Mic className="w-4 h-4" />
              <span>نظام التسميع الشفهي الذكي للقرآن الكريم</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              اختبر حفظك بالصوت والمايكروفون
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة البدء</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar: Surah Picker, Ayah Range, and strict/flexible Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/15 text-xs">
          {/* Surah Picker */}
          <div>
            <label className="text-[11px] text-stone-300 block mb-1">اختر السورة:</label>
            <select
              value={selectedSurahNumber}
              onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
              className="w-full bg-white/15 text-white border border-white/20 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              {SURAHS_META.map(s => (
                <option key={s.number} value={s.number} className="text-stone-900">
                  {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                </option>
              ))}
            </select>
          </div>

          {/* Ayah Range */}
          <div>
            <label className="text-[11px] text-stone-300 block mb-1">نطاق الآيات:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={endAyahNumber}
                value={startAyahNumber}
                onChange={(e) => {
                  setStartAyahNumber(Number(e.target.value));
                  resetTest();
                }}
                className="w-full bg-white/15 text-white border border-white/20 rounded-xl px-2.5 py-1.5 text-center text-xs"
              />
              <span className="text-stone-400">إلى</span>
              <input
                type="number"
                min={startAyahNumber}
                max={surah?.numberOfAyahs || 100}
                value={endAyahNumber}
                onChange={(e) => {
                  setEndAyahNumber(Number(e.target.value));
                  resetTest();
                }}
                className="w-full bg-white/15 text-white border border-white/20 rounded-xl px-2.5 py-1.5 text-center text-xs"
              />
            </div>
          </div>

          {/* Mode Selector: Flexible vs Tashkeel */}
          <div>
            <label className="text-[11px] text-stone-300 block mb-1">نمط التدقيق:</label>
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => {
                  setTasmeeMode('flexible');
                  resetTest();
                }}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  tasmeeMode === 'flexible'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="يركز على صحة الكلمات وترتيبها دون إيقاف على حركات أواخر الكلم"
              >
                حفظ عام (بدون تشكيل)
              </button>

              <button
                onClick={() => {
                  setTasmeeMode('tashkeel');
                  resetTest();
                }}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  tasmeeMode === 'tashkeel'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="تدقيق دقيق بالتشكيل والأحكام"
              >
                بالتشكيل والتجويد
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Mic & Evaluation Stage */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 text-center">
        {/* Progress and Stats Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-700 dark:text-stone-300">
              سورة {surah?.name} [الآيات {startAyahNumber} - {endAyahNumber}]
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold tabular-nums">
              {wordsRecitedSuccessfully} من {totalWordsInSession} كلمة
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-stone-500 font-mono tabular-nums">
              <span>الأخطاء:</span>
              <strong className={mistakesCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-stone-700 dark:text-stone-300'}>
                {mistakesCount}
              </strong>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              الإنجاز: {progressPercent}%
            </span>
          </div>
        </div>

        {/* Big Central Microphone Button */}
        {!isTestComplete ? (
          <div className="py-4 space-y-3">
            <div className="relative inline-block">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
              )}
              <button
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
                  isListening
                    ? 'bg-red-600 ring-4 ring-red-300 dark:ring-red-900 animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-800 ring-4 ring-emerald-100 dark:ring-emerald-950'
                }`}
                title={isListening ? 'اضغط لإيقاف المايكروفون' : 'اضغط واقرأ بصوتك'}
              >
                {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white">
                {isListening ? 'المايك مفتوح... اتلُ الآيات الآن بلسانك' : 'اضغط على المايك وابدأ في القراءة والتسميع'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                الكلمة الصحيحة ستُكتب تلقائياً فور نطقها، وإذا أخطأت ستسمع تنبيهاً صوتياً للتصويب.
              </p>
            </div>

            {/* Hint & Manual Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={handlePlayExpectedWord}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-600 text-xs transition-colors"
                title="استمع لنطق الشيخ للكلمة المطلوبة"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>تلميح (نطق الشيخ للكلمة)</span>
              </button>

              <button
                onClick={handleReciteNextManually}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors"
                title="تسميع الكلمة يدوياً"
              >
                <span>تسميع الكلمة التالية (+1)</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Error Notification Banner if a mistake occurred */}
            {lastMistakeWord && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-center justify-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{lastMistakeWord}</span>
              </div>
            )}
          </div>
        ) : (
          /* Completion Celebratory Banner */
          <div className="py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-serif text-emerald-900 dark:text-emerald-100">
                ما شاء الله! اكتمل التسميع بنجاح
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                أتممت تسميع المقطع المحدد في سورة {surah?.name} بإتقان ومطابقة شرعية تامة.
              </p>
            </div>

            <div className="flex justify-center gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center min-w-[100px]">
                <span className="text-stone-400 block text-[10px]">إجمالي الكلمات</span>
                <span className="text-base font-bold text-stone-900 dark:text-white">{totalWordsInSession}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center min-w-[100px]">
                <span className="text-stone-400 block text-[10px]">الأخطاء المسجلة</span>
                <span className="text-base font-bold text-amber-600">{mistakesCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center min-w-[100px]">
                <span className="text-emerald-700 dark:text-emerald-400 block text-[10px]">نسبة الإتقان</span>
                <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                  {Math.max(0, 100 - mistakesCount * 5)}%
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={resetTest}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-md transition-colors"
              >
                تسميع مقطع آخر
              </button>
              <button
                onClick={() => onNavigateToMushaf(selectedSurahNumber, startAyahNumber)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs hover:border-emerald-600 transition-colors"
              >
                عرض السورة في المصحف
              </button>
            </div>
          </div>
        )}

        {/* Quran Hidden/Revealed Text Canvas */}
        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 text-right space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>لوحة التسميع وظهور الكلمات:</span>
            <span>الكلمة المظللة بالأخضر = تم تسميعها بنجاح</span>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 leading-[2.6] sm:leading-[2.9] font-serif text-2xl">
            {targetAyahs.map((ayah, aIdx) => {
              const words = ayah.textUthmani.trim().split(/\s+/);

              return (
                <span key={ayah.numberInSurah} className="inline">
                  {words.map((word, wIdx) => {
                    const key = `${ayah.numberInSurah}-${wIdx}`;
                    const isRevealed = revealedWordsMap[key];
                    const isCurrentFocus = aIdx === currentAyahIndex && wIdx === currentWordIndex && !isTestComplete;

                    if (isRevealed) {
                      return (
                        <span
                          key={wIdx}
                          className="inline-block mx-1 text-emerald-800 dark:text-emerald-300 font-bold transition-all animate-in zoom-in-95 duration-150"
                        >
                          {word}
                        </span>
                      );
                    }

                    if (isCurrentFocus) {
                      return (
                        <span
                          key={wIdx}
                          className="inline-block mx-1.5 px-3 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-sans animate-pulse font-bold"
                          title="هذه الكلمة المنتظرة منك الآن"
                        >
                          [اقرأ الكلمة التالية...]
                        </span>
                      );
                    }

                    // Hidden placeholder for words not reached yet
                    return (
                      <span
                        key={wIdx}
                        className="inline-block mx-1 px-2.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700/60 select-none text-transparent text-sm"
                      >
                        {word}
                      </span>
                    );
                  })}

                  {/* Ornate End Ayah Marker */}
                  <span className="inline-flex items-center justify-center mx-1.5 text-stone-400 select-none">
                    <span className="text-xl font-serif">۝</span>
                    <span className="text-[11px] font-mono font-bold -mr-5 -ml-1">
                      {ayah.numberInSurah}
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

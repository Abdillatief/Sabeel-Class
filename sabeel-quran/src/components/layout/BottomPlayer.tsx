/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2, ChevronUp, ChevronDown, Music } from 'lucide-react';
import { RECITERS, getAyahAudioUrl } from '../../data/reciters';
import { QuranSurahMeta } from '../../types/quran';

export type RepetitionMode = 1 | 3 | 5 | 10 | 999;

interface BottomPlayerProps {
  currentSurah: QuranSurahMeta;
  currentAyahNumber: number;
  totalAyahsInSurah: number;
  reciterId: string;
  onSelectReciter: (id: string) => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onAyahFinished?: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentSurah,
  currentAyahNumber,
  totalAyahsInSurah,
  reciterId,
  onSelectReciter,
  onNextAyah,
  onPrevAyah,
  onAyahFinished,
  isPlaying,
  setIsPlaying
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repetitionTarget, setRepetitionTarget] = useState<RepetitionMode>(1);
  const [currentRepeatCount, setCurrentRepeatCount] = useState(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isCurtainRaised, setIsCurtainRaised] = useState<boolean>(false); // By default folded down as requested
  const [hasAudioError, setHasAudioError] = useState(false);

  const activeReciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const audioUrl = getAyahAudioUrl(reciterId, currentSurah.number, currentAyahNumber);

  // Reset repeat count when changing ayah
  useEffect(() => {
    setCurrentRepeatCount(1);
    setHasAudioError(false);
  }, [currentSurah.number, currentAyahNumber]);

  // Synchronize audio element source and playback
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackRate;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Audio playback error', err);
          setHasAudioError(true);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [audioUrl, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    if (currentRepeatCount < repetitionTarget) {
      setCurrentRepeatCount(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      setCurrentRepeatCount(1);
      if (onAyahFinished) {
        onAyahFinished();
      }
      if (currentAyahNumber < totalAyahsInSurah) {
        onNextAyah();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out" dir="rtl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onError={() => setHasAudioError(true)}
      />

      {/* ========================================================
          CASE 1: CURTAIN FOLDED DOWN (الحالة التلقائية كستارة منسدلة)
         ======================================================== */}
      {!isCurtainRaised ? (
        <div 
          onClick={() => setIsCurtainRaised(true)}
          className="max-w-xl mx-auto mb-2 px-4 py-2 bg-stone-900/95 dark:bg-stone-950/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-stone-700/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-800/95 transition-all group"
          title="اضغط لرفع مشغل التلاوة"
        >
          {/* Right side: Surah and Ayah info */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlayPause}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-[-1px]" />}
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold font-serif">
                <span>سورة {currentSurah.name}</span>
                <span className="text-stone-400">·</span>
                <span>الآية {currentAyahNumber}</span>
                {isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                )}
              </div>
              <span className="text-[10px] text-stone-400 block font-sans">
                {activeReciter.name}
              </span>
            </div>
          </div>

          {/* Left side: Lift Curtain Arrow Button */}
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
            <span className="text-[11px] hidden sm:inline">رفع مشغل التلاوة</span>
            <div className="w-7 h-7 rounded-lg bg-stone-800 text-amber-300 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform border border-stone-700">
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
            CASE 2: CURTAIN RAISED (المشغل مرفوع بالكامل)
           ======================================================== */
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          {/* Mini Header of Player: Pull-down Curtain bar */}
          <div className="flex items-center justify-between px-4 py-1 bg-stone-100 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-xs">
            <span className="text-[11px] text-stone-500 font-medium">
              مشغل المصحف الشريف المرتل والمكرر
            </span>
            <button
              onClick={() => setIsCurtainRaised(false)}
              className="flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-300 hover:text-emerald-700 font-medium py-0.5 px-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="إنزال مشغل التلاوة كستارة"
            >
              <span>إنزال المشغل</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar (Scrubber) */}
          <div className="w-full relative h-1 group cursor-pointer bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full bg-emerald-600 transition-all duration-150"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
            {/* Ayah info & Reciter */}
            <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 font-serif font-bold text-sm border border-emerald-200 dark:border-emerald-800">
                {currentAyahNumber}
              </div>
              <div className="truncate text-right">
                <div className="flex items-center gap-1.5 text-xs text-stone-900 dark:text-stone-100 font-semibold truncate">
                  <span>سورة {currentSurah.name}</span>
                  <span className="text-stone-400">·</span>
                  <span>الآية {currentAyahNumber}</span>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {activeReciter.name}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 sm:gap-5">
                {/* Repetition Selector */}
                <button
                  onClick={() => {
                    const modes: RepetitionMode[] = [1, 3, 5, 10, 999];
                    const currentIndex = modes.indexOf(repetitionTarget);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    setRepetitionTarget(nextMode);
                  }}
                  className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
                    repetitionTarget > 1
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                  title={`تكرار الآية للحفظ (${repetitionTarget === 999 ? 'تكرار مستمر' : `${repetitionTarget} مرات`})`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="text-[10px] tabular-nums">
                    {repetitionTarget === 999 ? '∞' : `${currentRepeatCount}/${repetitionTarget}`}
                  </span>
                </button>

                {/* Previous Ayah */}
                <button
                  onClick={onPrevAyah}
                  disabled={currentAyahNumber <= 1}
                  className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="الآية السابقة"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[-1px]" />}
                </button>

                {/* Next Ayah */}
                <button
                  onClick={onNextAyah}
                  disabled={currentAyahNumber >= totalAyahsInSurah}
                  className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="الآية التالية"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Playback Speed */}
                <button
                  onClick={() => {
                    const speeds = [0.75, 1.0, 1.25];
                    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
                    setPlaybackRate(nextSpeed);
                  }}
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="سرعة التلاوة"
                >
                  {playbackRate}x
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-stone-400 font-mono tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Reciter Selector */}
            <div className="flex items-center gap-2">
              <select
                value={reciterId}
                onChange={(e) => onSelectReciter(e.target.value)}
                className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type === 'educational' ? 'معلم' : 'مرتل'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

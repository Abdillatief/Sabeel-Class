import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';

export type UchihaEyeType = 'sharingan_3' | 'itachi_mangekyo' | 'sasuke_eternal' | 'obito_kamui' | 'madara_eternal';

interface UchihaEyesStageProps {
  initialType?: string;
  studentName?: string;
}

export const UchihaEyesStage: React.FC<UchihaEyesStageProps> = ({
  initialType = 'sharingan_3',
  studentName = 'البطل'
}) => {
  // Determine eye form based on animation type or default
  const getInitialForm = (): UchihaEyeType => {
    if (initialType === 'mangekyo_sharingan') return 'sasuke_eternal';
    if (initialType === 'kamui_sharingan') return 'obito_kamui';
    return 'sharingan_3';
  };

  const [activeEye, setActiveEye] = useState<UchihaEyeType>(getInitialForm());
  const [isSpinningFast, setIsSpinningFast] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);

  const getEyeVoiceId = (type: UchihaEyeType): string => {
    switch (type) {
      case 'sharingan_3':
        return 'uchiha_sharingan';
      case 'itachi_mangekyo':
        return 'mangekyo_sharingan';
      case 'obito_kamui':
        return 'kamui_sharingan';
      case 'sasuke_eternal':
        return 'amaterasu';
      case 'madara_eternal':
        return 'mangekyo_sharingan';
      default:
        return 'uchiha_sharingan';
    }
  };

  // Trigger initial sound & voice & fast spin on mount
  useEffect(() => {
    soundManager.playSharinganSound();
    soundManager.playAnimeVoice(getEyeVoiceId(activeEye));
    const timer = setTimeout(() => {
      setIsSpinningFast(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectEye = (type: UchihaEyeType) => {
    soundManager.playSharinganSound();
    soundManager.playAnimeVoice(getEyeVoiceId(type));
    setActiveEye(type);
    setIsSpinningFast(true);
    setPulseKey((prev) => prev + 1);
    setTimeout(() => {
      setIsSpinningFast(false);
    }, 1200);
  };

  // Render specific Eye Iris Pattern SVG based on current active eye
  const renderEyePattern = () => {
    switch (activeEye) {
      case 'sharingan_3':
        // Classic 3-Tomoe Sharingan
        return (
          <g>
            {/* Guide circle */}
            <circle cx="100" cy="100" r="54" fill="none" stroke="#7f1d1d" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.75" />
            {/* Center Pupil */}
            <circle cx="100" cy="100" r="22" fill="#09090b" stroke="#18181b" strokeWidth="2" />
            {/* 3 Tomoe (Magatama) placed at 0, 120, 240 degrees */}
            {[0, 120, 240].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                {/* Tomoe body at (100, 46) */}
                <circle cx="100" cy="46" r="10.5" fill="#09090b" />
                {/* Curved Tomoe tail sweeping outward along the guide circle */}
                <path
                  d="M 100 35.5 C 111 35.5 119 43 118 53 C 117 62 108 67 98 67 C 107 65 112 59 110 52 C 108 45 103 40 96 41 C 98 37 99 35.5 100 35.5 Z"
                  fill="#09090b"
                />
              </g>
            ))}
          </g>
        );

      case 'itachi_mangekyo':
        // Itachi Mangekyo Sharingan (Triangular curved pinwheel scythe blades)
        return (
          <g>
            {/* Center black pupil */}
            <circle cx="100" cy="100" r="20" fill="#09090b" />
            {/* 3 Large curved curved pinwheel blades */}
            {[0, 120, 240].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <path
                  d="M 100 100 Q 120 70 148 55 Q 115 50 100 20 Q 92 65 100 100 Z"
                  fill="#09090b"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <circle cx="100" cy="22" r="6" fill="#09090b" />
              </g>
            ))}
          </g>
        );

      case 'sasuke_eternal':
        // Sasuke Eternal Mangekyo (Interlocking 6-pointed star intersecting with Itachi's blades)
        return (
          <g>
            {/* Underneath: Itachi's 3 curved blades in deep black */}
            {[0, 120, 240].map((deg) => (
              <g key={`itachi_${deg}`} transform={`rotate(${deg} 100 100)`}>
                <path
                  d="M 100 100 Q 118 70 145 55 Q 115 52 100 24 Q 92 65 100 100 Z"
                  fill="#09090b"
                  opacity="0.95"
                />
              </g>
            ))}
            {/* Foreground: Sasuke's 6-pointed star with curved arcs */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <g key={`star_${deg}`} transform={`rotate(${deg} 100 100)`}>
                <path
                  d="M 100 100 L 100 32 Q 95 65 100 100 Z"
                  stroke="#09090b"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="30" r="7" fill="#09090b" />
              </g>
            ))}
            {/* Center Pupil */}
            <circle cx="100" cy="100" r="23" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
          </g>
        );

      case 'obito_kamui':
        // Obito/Kakashi Kamui Mangekyo (Three elongated vortex spiral blades)
        return (
          <g>
            <circle cx="100" cy="100" r="24" fill="#09090b" />
            {[0, 120, 240].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <path
                  d="M 100 100 C 130 95 155 70 162 38 C 140 50 120 70 100 100 Z"
                  fill="#09090b"
                  stroke="#000000"
                  strokeWidth="2"
                />
                <circle cx="160" cy="40" r="6" fill="#09090b" />
              </g>
            ))}
          </g>
        );

      case 'madara_eternal':
        // Madara Eternal Mangekyo (Triple connected crescent rings with central pupil)
        return (
          <g>
            <circle cx="100" cy="100" r="22" fill="#09090b" />
            {/* Connected outer circular crests */}
            <circle cx="100" cy="100" r="56" fill="none" stroke="#09090b" strokeWidth="8" />
            {[0, 120, 240].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <path
                  d="M 100 100 L 100 44"
                  stroke="#09090b"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="42" r="12" fill="#09090b" />
              </g>
            ))}
          </g>
        );

      default:
        return null;
    }
  };

  const getEyeTitle = () => {
    switch (activeEye) {
      case 'sharingan_3':
        return 'الشارينغان الثلاثي (3-Tomoe Sharingan)';
      case 'itachi_mangekyo':
        return 'مانغيكيو إيتاتشي (Itachi Mangekyo)';
      case 'sasuke_eternal':
        return 'المانغيكيو الأبدي لساسكي (Eternal Mangekyo)';
      case 'obito_kamui':
        return 'كاموي أوبيتو للزمكان (Kamui Sharingan)';
      case 'madara_eternal':
        return 'مانغيكيو مادارا الأبدي (Madara EMS)';
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none overflow-hidden py-1">
      {/* 1. Blood Red Tsukuyomi Moon in Background */}
      <div className="absolute -top-12 sm:-top-16 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-red-600 via-rose-700 to-red-950 border-4 border-red-500/70 shadow-[0_0_90px_#dc2626] relative overflow-hidden"
        >
          {/* Moon Craters and Shadows */}
          <div className="absolute top-8 left-10 w-12 h-10 rounded-full bg-red-950/40 blur-xs" />
          <div className="absolute bottom-12 right-12 w-16 h-14 rounded-full bg-red-950/50 blur-xs" />
          <div className="absolute top-20 right-8 w-10 h-8 rounded-full bg-red-950/35 blur-xs" />
          {/* Subtle Sharingan watermark in the Blood Moon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-red-200 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
        </motion.div>
      </div>

      {/* 2. Floating Genjutsu Crows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: -140, y: -40, delay: 0.1, duration: 2.2 },
          { x: 140, y: -60, delay: 0.3, duration: 2.5 },
          { x: -80, y: 50, delay: 0.5, duration: 2.0 },
          { x: 90, y: 30, delay: 0.2, duration: 2.4 }
        ].map((crow, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: crow.x, y: crow.y, scale: 0.6 }}
            animate={{
              opacity: [0, 0.75, 0],
              x: [crow.x, crow.x * 1.6],
              y: [crow.y, crow.y - 40],
              scale: [0.6, 0.9, 0.4]
            }}
            transition={{
              duration: crow.duration,
              delay: crow.delay,
              repeat: Infinity,
              repeatDelay: 1.5
            }}
            className="absolute top-1/2 left-1/2 text-slate-900 text-lg sm:text-xl drop-shadow-[0_0_8px_#ef4444]"
          >
            🦅
          </motion.div>
        ))}
      </div>

      {/* 3. The Dual Cinematic Uchiha Eyes */}
      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-8 my-2">
        {['left', 'right'].map((side) => (
          <motion.div
            key={side}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative"
          >
            {/* Intense Crimson Eye Aura Glow */}
            <div className="absolute -inset-3 rounded-full bg-red-600/30 blur-xl animate-pulse" />

            {/* Anime Almond-shaped Eye Frame Container */}
            <div className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-[50%] bg-slate-950 border-3 border-red-600 shadow-[0_0_45px_#dc2626] overflow-hidden flex items-center justify-center ring-4 ring-red-950/80">
              {/* Eyelid Crease & Sclera */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90" />

              {/* Glowing Iris Base (Deep Crimson to Radiant Red) */}
              <motion.div
                key={`${activeEye}-${side}-${pulseKey}`}
                animate={{
                  rotate: isSpinningFast ? [0, 720, 1080] : 0,
                  scale: isSpinningFast ? [1, 1.12, 1] : [1, 1.03, 1]
                }}
                transition={{
                  duration: isSpinningFast ? 1.2 : 2.5,
                  ease: isSpinningFast ? 'easeInOut' : 'easeInOut',
                  repeat: isSpinningFast ? 0 : Infinity
                }}
                className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-900 border-2 border-slate-950 shadow-[inset_0_0_16px_#000000,0_0_30px_#ef4444] flex items-center justify-center"
              >
                {/* Embedded High-Res SVG for Tomoe and Mangekyo Blades */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full drop-shadow-[0_0_10px_#000000]"
                >
                  {renderEyePattern()}
                </svg>

                {/* Anime Eye Glossy White Reflection Highlights */}
                <div className="absolute top-3 left-4 w-3.5 h-2 rounded-full bg-white/90 -rotate-35 blur-[0.4px]" />
                <div className="absolute bottom-4 right-5 w-1.5 h-1.5 rounded-full bg-white/70" />
              </motion.div>

              {/* Eyelid Blink Shadow Effect */}
              <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>

            {/* Side-specific eye corner tail */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-1 bg-red-700/80 blur-xs ${
                side === 'left' ? '-left-2 -rotate-12' : '-right-2 rotate-12'
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* 4. Eye Stage Header & Title with Voice Replay */}
      <motion.div
        key={`title-${activeEye}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center flex items-center justify-center gap-2"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 text-red-200 border border-red-500/50 text-xs font-black shadow-[0_0_15px_#dc2626]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span>{getEyeTitle()}</span>
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playAnimeVoice(getEyeVoiceId(activeEye));
          }}
          title="استمع لصوت المهارة باليابانية"
          className="px-2.5 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Volume2 className="w-3 h-3 animate-pulse" />
          <span>صوت الشارينغان</span>
        </button>
      </motion.div>

      {/* 5. Interactive Eye Switcher (Allows student to explore and watch transformations) */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 max-w-sm px-2 z-20">
        {[
          { id: 'sharingan_3', label: '🔴 الشارينغان', sub: '3 توموي' },
          { id: 'itachi_mangekyo', label: '👁️ إيتاتشي', sub: 'مروحة' },
          { id: 'sasuke_eternal', label: '⭐ ساسكي', sub: 'أبدي' },
          { id: 'obito_kamui', label: '🌀 أوبيتو', sub: 'كاموي' },
          { id: 'madara_eternal', label: '👑 مادارا', sub: 'الأبدي' },
        ].map((item) => {
          const isSelected = activeEye === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Don't trigger fast dismiss when student clicks to switch eye
                handleSelectEye(item.id as UchihaEyeType);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-[0_0_15px_#dc2626] scale-105 border border-red-400'
                  : 'bg-slate-900/80 text-red-300 hover:bg-red-950/80 hover:text-white border border-red-900/60'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Uchiha Clan Motto */}
      <p className="mt-2 text-[10px] font-bold text-red-300/80 tracking-wide">
        بصيرة خارقة تمكّن {studentName} من إتقان كل التحديات! ⚡
      </p>
    </div>
  );
};

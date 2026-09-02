import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Zap, Flame, Sun, Swords, Stars, Shield, Trophy, Droplets, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { AnimeAvatar } from './AnimeAvatar';
import { SKILL_ANIMATIONS } from '../../utils/constants';

export interface FlyingPointEvent {
  points: number;
  studentName?: string;
  skillName?: string;
  animation?: string;
  studentAvatar?: string;
}

interface FlyingPointsOverlayProps {
  event: FlyingPointEvent | null;
  onDone: () => void;
}

export const FlyingPointsOverlay: React.FC<FlyingPointsOverlayProps> = ({ event, onDone }) => {
  const animType = event?.animation || 'rasengan';
  const animMeta = SKILL_ANIMATIONS.find((a) => a.id === animType) || SKILL_ANIMATIONS[0];

  useEffect(() => {
    if (!event) return;

    // Trigger audio effect based on animation type
    soundManager.playAnimationSound(animType);

    // Trigger confetti tailored to the animation style
    try {
      if (animType === 'titan_transformation' || animType === 'titan_lightning' || animType === 'super_saiyan') {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#fbbf24', '#fef08a', '#eab308', '#ffffff'],
        });
      } else if (animType === 'rasengan' || animType === 'kamehameha' || animType === 'spirit_bomb') {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#38bdf8', '#0284c7', '#06b6d4', '#67e8f9', '#ffffff'],
        });
      } else if (animType === 'chidori') {
        confetti({
          particleCount: 70,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#22d3ee', '#0ea5e9', '#38bdf8', '#ffffff', '#818cf8'],
        });
      } else if (animType === 'water_breathing') {
        confetti({
          particleCount: 70,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#0284c7', '#38bdf8', '#60a5fa', '#bae6fd', '#ffffff'],
        });
      } else if (animType === 'flame_breathing' || animType === 'flame_slash' || animType === 'sun_breathing') {
        confetti({
          particleCount: 85,
          spread: 95,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#f97316', '#dc2626', '#fbbf24', '#ffedd5'],
        });
      } else if (animType === 'thunder_breathing') {
        confetti({
          particleCount: 75,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#eab308', '#facc15', '#fef08a', '#ffffff'],
        });
      } else if (animType === 'gear_fifth' || animType === 'gear_joy') {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#fbbf24', '#ec4899', '#38bdf8', '#ffffff'],
        });
      } else if (animType === 'three_sword_style') {
        confetti({
          particleCount: 75,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#10b981', '#34d399', '#059669', '#a7f3d0', '#ffffff'],
        });
      } else if (animType === 'conquerors_haki' || animType === 'eight_gates' || animType === 'malevolent_shrine') {
        confetti({
          particleCount: 85,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#dc2626', '#991b1b', '#1e1b4b', '#f87171', '#000000'],
        });
      } else if (animType === 'domain_expansion' || animType === 'cosmic_meteors' || animType === 'amaterasu') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#9333ea', '#6366f1', '#c084fc', '#1e1b4b', '#ffffff'],
        });
      } else {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.5 },
          colors: ['#38bdf8', '#0ea5e9', '#f59e0b', '#10b981', '#a855f7'],
        });
      }
    } catch {
      // Ignore
    }

    const timer = setTimeout(() => {
      onDone();
    }, 2300);

    return () => clearTimeout(timer);
  }, [event, animType, onDone]);

  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Darkened backdrop with glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
        />

        {/* ================= SPECIAL ANIME ANIMATION BACKDROPS ================= */}

        {/* 1. Naruto: Rasengan (Cyan Chakra Vortex) */}
        {animType === 'rasengan' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 720, scale: [0.5, 1.4, 1.1] }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="w-96 h-96 rounded-full border-4 border-dashed border-cyan-400 opacity-70 shadow-[0_0_70px_#06b6d4]"
            />
            <motion.div
              animate={{ rotate: -720, scale: [0.3, 1.2, 0.9] }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute w-72 h-72 rounded-full border-4 border-dotted border-sky-300 opacity-80 shadow-[0_0_40px_#38bdf8]"
            />
            <motion.div
              animate={{ scale: [0.2, 1.8, 0], opacity: [0.9, 0.4, 0] }}
              transition={{ duration: 1.5, repeat: 1 }}
              className="absolute w-64 h-64 rounded-full bg-cyan-400/40 blur-2xl"
            />
          </div>
        )}

        {/* 2. Naruto: Chidori (Lightning Blade) */}
        {animType === 'chidori' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Screen Electrical Flash */}
            <motion.div
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0, 0.5, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-cyan-200/30"
            />
            {/* Arcing Electric Bolts */}
            <motion.div
              animate={{ scale: [0.8, 1.3, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.3, repeat: 4 }}
              className="w-96 h-96 rounded-full border-4 border-cyan-300 shadow-[0_0_80px_#06b6d4] opacity-80"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.6, 0] }}
              transition={{ duration: 0.4, repeat: 3 }}
              className="absolute w-full h-1.5 bg-cyan-200 shadow-[0_0_30px_#38bdf8] rotate-45"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.6, 0] }}
              transition={{ duration: 0.4, delay: 0.1, repeat: 3 }}
              className="absolute w-full h-1.5 bg-blue-300 shadow-[0_0_30px_#0284c7] -rotate-45"
            />
          </div>
        )}

        {/* 3. Attack on Titan: Titan Transformation (Golden Colossal Lightning Strike) */}
        {(animType === 'titan_transformation' || animType === 'titan_lightning') && (
          <>
            <motion.div
              initial={{ opacity: 0.85 }}
              animate={{ opacity: [0.85, 0, 0.6, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-yellow-200/40 pointer-events-none"
            />
            <motion.div
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [1, 1, 0.8, 0] }}
              transition={{ duration: 0.7 }}
              className="absolute inset-x-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-gradient-to-b from-yellow-200 via-amber-400 to-white shadow-[0_0_60px_#f59e0b] origin-top"
            />
            <motion.div
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [1, 1, 0.8, 0] }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute left-[35%] top-0 bottom-0 w-1.5 bg-yellow-300 shadow-[0_0_35px_#eab308] rotate-6 origin-top"
            />
            <motion.div
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [1, 1, 0.8, 0] }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="absolute right-[35%] top-0 bottom-0 w-1.5 bg-yellow-300 shadow-[0_0_35px_#eab308] -rotate-6 origin-top"
            />
            {/* Steam cloud expansion */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute w-96 h-96 rounded-full bg-amber-200/30 blur-3xl"
            />
          </>
        )}

        {/* 4. Demon Slayer: Water Breathing (Water Dragon) */}
        {animType === 'water_breathing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="w-96 h-96 rounded-full border-8 border-cyan-400/60 border-t-blue-500 shadow-[0_0_60px_#0284c7]"
            />
            <motion.div
              animate={{ scale: [0.7, 1.4, 1], opacity: [0.4, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-300/30 blur-2xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute w-80 h-80 rounded-full border-4 border-dashed border-sky-300 opacity-70"
            />
          </div>
        )}

        {/* 5. Demon Slayer: Flame Breathing (Rengoku Slash) */}
        {(animType === 'flame_breathing' || animType === 'flame_slash') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute w-[120vw] h-4 bg-gradient-to-r from-transparent via-red-500 to-amber-300 shadow-[0_0_40px_#ef4444] -rotate-45"
            />
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute w-[120vw] h-4 bg-gradient-to-r from-transparent via-amber-400 to-red-600 shadow-[0_0_40px_#f97316] rotate-45"
            />
            <motion.div
              animate={{ scale: [0.6, 1.3, 1], opacity: [0.5, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-88 h-88 rounded-full bg-gradient-to-t from-red-600/40 via-amber-500/30 to-transparent blur-2xl"
            />
          </div>
        )}

        {/* 6. Demon Slayer: Thunder Breathing (Thunderclap and Flash) */}
        {animType === 'thunder_breathing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 0, 0.6, 0] }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-yellow-100/40"
            />
            {/* Rapid Horizontal Speed Lines */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 2, 0] }}
              transition={{ duration: 0.4 }}
              className="w-[120vw] h-2 bg-yellow-300 shadow-[0_0_30px_#facc15]"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 2, 0] }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-1/3 w-[120vw] h-1 bg-amber-400 shadow-[0_0_20px_#eab308]"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 2, 0] }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="absolute bottom-1/3 w-[120vw] h-1 bg-amber-400 shadow-[0_0_20px_#eab308]"
            />
          </div>
        )}

        {/* 7. Demon Slayer: Sun Breathing (Hinokami Kagura) */}
        {animType === 'sun_breathing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360, scale: [0.8, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-96 h-96 rounded-full border-8 border-orange-500/70 border-t-yellow-300 shadow-[0_0_70px_#f97316]"
            />
            <motion.div
              animate={{ scale: [0.8, 1.4, 1], opacity: [0.4, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-red-600/40 to-yellow-400/40 blur-3xl"
            />
          </div>
        )}

        {/* 8. Dragon Ball: Kamehameha Beam */}
        {animType === 'kamehameha' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: [0, 1.5, 1], opacity: [0.5, 1, 0.8] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-[120vw] h-16 bg-gradient-to-r from-cyan-400 via-sky-300 to-white shadow-[0_0_70px_#0284c7]"
            />
            <motion.div
              animate={{ scale: [0.5, 1.5, 1] }}
              transition={{ duration: 0.8 }}
              className="absolute w-72 h-72 rounded-full bg-cyan-300/40 blur-2xl"
            />
          </div>
        )}

        {/* 9. Dragon Ball: Super Saiyan Golden Aura */}
        {animType === 'super_saiyan' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [0.8, 1.3, 1.1], opacity: [0.5, 0.9, 0.7] }}
              transition={{ repeat: Infinity, duration: 0.6, repeatType: 'reverse' }}
              className="w-80 h-96 rounded-full bg-gradient-to-t from-amber-500/40 via-yellow-400/30 to-transparent blur-2xl"
            />
            <motion.div
              animate={{ y: [40, -120], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute w-2 h-8 bg-yellow-300 rounded-full shadow-[0_0_15px_#fef08a]"
            />
            <motion.div
              animate={{ y: [60, -100], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }}
              className="absolute left-1/3 w-2 h-6 bg-amber-400 rounded-full shadow-[0_0_15px_#fbbf24]"
            />
          </div>
        )}

        {/* 10. Dragon Ball: Spirit Bomb (Genki Dama) */}
        {animType === 'spirit_bomb' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ y: -200, scale: 0.4 }}
              animate={{ y: 0, scale: [0.4, 1.3, 1] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-96 h-96 rounded-full bg-gradient-to-b from-white via-cyan-300 to-sky-500 shadow-[0_0_90px_#38bdf8] opacity-80"
            />
          </div>
        )}

        {/* 11. One Piece: Gear 5 Nika Sun */}
        {(animType === 'gear_fifth' || animType === 'gear_joy') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
              className="w-96 h-96 rounded-full border-8 border-dashed border-amber-400/50 opacity-80"
            />
            <motion.div
              animate={{ scale: [0.8, 1.3, 1], opacity: [0.3, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-amber-400/30 to-pink-400/30 blur-2xl"
            />
          </div>
        )}

        {/* 12. One Piece: Conqueror's Haki */}
        {animType === 'conquerors_haki' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: [0.2, 2], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: 2 }}
              className="w-96 h-96 rounded-full border-8 border-rose-600 shadow-[0_0_80px_#e11d48]"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.6, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="absolute w-full h-2 bg-rose-600 shadow-[0_0_40px_#be123c] rotate-12"
            />
          </div>
        )}

        {/* 13. One Piece: Three Sword Style (Santoryu) */}
        {animType === 'three_sword_style' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.5, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute w-[120vw] h-3 bg-emerald-400 shadow-[0_0_40px_#10b981] -rotate-30"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.5, 0] }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="absolute w-[120vw] h-3 bg-emerald-300 shadow-[0_0_40px_#10b981] rotate-30"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute w-[120vw] h-3 bg-teal-300 shadow-[0_0_40px_#14b8a6]"
            />
          </div>
        )}

        {/* 14. Jujutsu Kaisen: Domain Expansion (Infinite Void) */}
        {(animType === 'domain_expansion' || animType === 'cosmic_meteors') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.1 }}
              animate={{ scale: [0.1, 1.8, 1.4], opacity: [0.4, 0.9, 0.6] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="w-96 h-96 rounded-full bg-purple-600/35 blur-3xl"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute w-88 h-88 rounded-full border-4 border-dotted border-indigo-300 opacity-75"
            />
          </div>
        )}

        {/* 15. Jujutsu Kaisen: Malevolent Shrine (Sukuna Slashes) */}
        {animType === 'malevolent_shrine' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.6, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute top-1/4 w-[120vw] h-2 bg-red-600 shadow-[0_0_30px_#dc2626] -rotate-15"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.6, 0] }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-2/4 w-[120vw] h-2 bg-rose-500 shadow-[0_0_30px_#f43f5e] rotate-20"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1.6, 0] }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute top-3/4 w-[120vw] h-2 bg-red-700 shadow-[0_0_30px_#b91c1c] -rotate-10"
            />
          </div>
        )}

        {/* 16. Bleach: Hollow Bankai Getsuga Tensho */}
        {animType === 'hollow_bankai' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: [0, 1.6, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute w-[120vw] h-5 bg-gradient-to-r from-red-600 via-slate-950 to-red-600 shadow-[0_0_50px_#dc2626] -rotate-35"
            />
          </div>
        )}

        {/* 17. Naruto: Amaterasu Black Flames */}
        {animType === 'amaterasu' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [0.6, 1.4, 1], opacity: [0.6, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-80 h-80 rounded-full bg-slate-950 shadow-[0_0_70px_#7c3aed] border-4 border-purple-900"
            />
          </div>
        )}

        {/* 18. Naruto: Eight Gates (Night Guy Red Dragon) */}
        {animType === 'eight_gates' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [0.7, 1.4, 1.1], opacity: [0.6, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="w-96 h-96 rounded-full bg-gradient-to-t from-red-700/50 via-rose-600/30 to-transparent blur-3xl shadow-[0_0_90px_#dc2626]"
            />
          </div>
        )}

        {/* Fallbacks for diamond_shield & golden_trophy */}
        {animType === 'diamond_shield' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [0.4, 1.3, 1], opacity: [0, 0.8, 0.5] }}
              transition={{ duration: 0.8 }}
              className="w-80 h-80 rounded-3xl rotate-45 border-4 border-emerald-400/80 shadow-[0_0_50px_#10b981]"
            />
          </div>
        )}
        {animType === 'golden_trophy' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [0.5, 1.4, 1.1], opacity: [0.3, 0.8, 0.4] }}
              transition={{ duration: 1 }}
              className="w-80 h-80 rounded-full bg-amber-400/25 blur-2xl"
            />
          </div>
        )}

        {/* ================= MAIN ANIMATION CARD ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.2, y: 80 }}
          animate={{
            opacity: 1,
            scale: [0.2, 1.15, 1],
            y: [80, -10, 0],
          }}
          exit={{ opacity: 0, scale: 0.6, y: -100 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center justify-center p-7 sm:p-9 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border-4 border-amber-400 dark:border-amber-500 text-center max-w-sm sm:max-w-md mx-4 ring-8 ring-sky-400/30"
        >
          {/* Top Series / Anime Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white text-[11px] font-black shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{animMeta.name}</span>
            <span className="opacity-80 font-bold">({animMeta.series})</span>
          </div>

          {/* Student 4x4 Avatar */}
          <div className="mb-3 relative">
            <AnimeAvatar
              avatarId={event.studentAvatar || 'islamic_1'}
              studentName={event.studentName}
              size="4x4"
              showBadge={true}
            />
          </div>

          {/* +Points Display with dynamic pulse */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="flex items-center gap-2.5 font-black text-5xl sm:text-6xl text-amber-500 dark:text-amber-400 drop-shadow-md"
          >
            <span>+{event.points}</span>
            <Star className="w-12 h-12 fill-amber-400 text-amber-500 drop-shadow-md" />
          </motion.div>

          {/* Skill Title */}
          {event.skillName && (
            <h3 className="mt-2.5 text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              {event.skillName}
            </h3>
          )}

          {/* Student Celebration Banner */}
          {event.studentName && (
            <p className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400 mt-1">
              مبارك للبطل {event.studentName} ✨
            </p>
          )}

          {/* Anime Encouragement Note */}
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            {animMeta.description}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Gift, Shuffle, Check, X, Shield, BookOpen } from 'lucide-react';
import { Student } from '../../types';
import {
  Character3D,
  RARITY_INFO,
  getAllCharacters,
  rollRandomCharacter,
  getCharactersByRarity,
  CharacterRarity,
} from '../../services/characterSystem';
import { soundManager } from '../../utils/sound';

interface BookUnlockModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (studentId: string, characterId: string, rarity: CharacterRarity) => Promise<void>;
}

type AnimationStage =
  | 'idle' // Closed book ready
  | 'shaking' // 1. الكتاب يبدأ يهتز + نور أزرق
  | 'unlocking' // 2. القفل يختفي + الصفحات تبدأ في الفتح
  | 'beam' // 3. يظهر ضوء + beam
  | 'mystery_choice' // 4. اختيار الشخصية: صندوق عشوائي أو تصفح الـ 50 شخصية
  | 'rolling' // 5. أنيميشن فتح الصندوق العشوائي (Gacha suspense)
  | 'revealed'; // 6. عرض الشخصية الفائزة والاحتفال

export const BookUnlockModal: React.FC<BookUnlockModalProps> = ({
  student,
  isOpen,
  onClose,
  onSaveCharacter,
}) => {
  const [stage, setStage] = useState<AnimationStage>('idle');
  const [selectedCharacter, setSelectedCharacter] = useState<Character3D | null>(null);
  const [browseCategory, setBrowseCategory] = useState<string>('all');
  const [browseRarity, setBrowseRarity] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [rollingCandidate, setRollingCandidate] = useState<Character3D | null>(null);

  // Initialize stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('idle');
      setSelectedCharacter(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Trigger the Transformation Cinematic Sequence
  const startTransformation = () => {
    soundManager.playClickPop();
    setStage('shaking');

    // 1. Shaking + Blue light (1.2s)
    setTimeout(() => {
      setStage('unlocking');
      soundManager.playBadgeFanfare();

      // 2. Lock snaps + Pages opening (1.4s)
      setTimeout(() => {
        setStage('beam');
        triggerConfettiBurst();

        // 3. Beam of light into Mystery/Choice Screen (1.2s)
        setTimeout(() => {
          setStage('mystery_choice');
        }, 1200);
      }, 1400);
    }, 1200);
  };

  const triggerConfettiBurst = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#a855f7', '#34d399'],
      });
    } catch (e) {}
  };

  // Step 2: Roll Random Mystery Chest (صندوق المفاجآت بنظام الندرة)
  const handleRollMystery = () => {
    soundManager.playClickPop();
    setStage('rolling');

    const all = getAllCharacters();
    let count = 0;
    const interval = setInterval(() => {
      const temp = all[Math.floor(Math.random() * all.length)];
      setRollingCandidate(temp);
      count++;

      if (count > 18) {
        clearInterval(interval);
        // Roll with authentic weighted odds (Legendary 5%, Epic 15%, Rare 30%, Common 50%)
        const finalChar = rollRandomCharacter();
        setSelectedCharacter(finalChar);
        setStage('revealed');
        soundManager.playLevelUpFanfare();
        triggerConfettiBurst();
      }
    }, 80);
  };

  // Step 3: Pick a specific character
  const handleSelectCharacter = (char: Character3D) => {
    soundManager.playClickPop();
    setSelectedCharacter(char);
    setStage('revealed');
    soundManager.playBadgeFanfare();
    triggerConfettiBurst();
  };

  // Step 4: Confirm and Save to database/state
  const handleConfirmSave = async () => {
    if (!selectedCharacter || isSaving) return;
    setIsSaving(true);
    soundManager.playClickPop();

    try {
      await onSaveCharacter(student.id, selectedCharacter.id, selectedCharacter.rarity);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const allCharacters = getAllCharacters();
  const filteredCharacters = allCharacters.filter((c) => {
    if (browseRarity !== 'all' && c.rarity !== browseRarity) return false;
    if (browseCategory !== 'all' && c.category !== browseCategory) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-sky-200/60 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-sky-500/20 via-amber-500/10 to-transparent pointer-events-none" />

        {/* ==================================================================== */}
        {/* STAGE: IDLE / CINEMATIC TRANSFORMATION */}
        {/* ==================================================================== */}
        {(stage === 'idle' || stage === 'shaking' || stage === 'unlocking' || stage === 'beam') && (
          <div className="p-6 sm:p-10 flex flex-col items-center text-center">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>إنجاز عظيم: الوصول إلى 50 نقطة!</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              فك قفل كتاب المعرفة للطالب{' '}
              <span className="text-sky-600 dark:text-sky-400">{student.name}</span>
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
              جمع الطالب {student.totalPoints} نقطة واكتملت رحلة الكتاب المغلق! حان وقت تحرير
              شخصيته الكرتونية ثلاثية الأبعاد.
            </p>

            {/* Central Animated Book Scene */}
            <div className="relative my-8 sm:my-12 w-64 h-64 flex items-center justify-center">
              {/* 1. Blue Light Aura Erupting from Book (نور أزرق) */}
              <AnimatePresence>
                {(stage === 'shaking' || stage === 'unlocking' || stage === 'beam') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: [0.4, 0.9, 0.6],
                      scale: [1, 1.4, 1.2],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/60 via-blue-500/70 to-indigo-600/60 blur-3xl pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* 2. Celestial Upward Light Beam (يظهر ضوء) */}
              <AnimatePresence>
                {stage === 'beam' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '350px', opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute bottom-10 w-32 bg-gradient-to-t from-sky-400 via-amber-300 to-transparent blur-md pointer-events-none z-10"
                  />
                )}
              </AnimatePresence>

              {/* 3D Book with shaking and unlocking animation */}
              <motion.div
                animate={
                  stage === 'shaking'
                    ? {
                        x: [-4, 4, -4, 4, -2, 2, 0],
                        y: [-2, 2, -1, 1, 0],
                        rotateZ: [-2, 2, -1, 1, 0],
                        scale: [1, 1.05, 1.02],
                      }
                    : stage === 'unlocking'
                    ? {
                        scale: [1.02, 1.15, 1.1],
                        rotateY: [0, -30, -70],
                      }
                    : stage === 'beam'
                    ? {
                        scale: 1.2,
                        opacity: [1, 0.8, 0],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: stage === 'shaking' ? 0.3 : stage === 'unlocking' ? 1 : 0.8,
                  repeat: stage === 'shaking' ? Infinity : 0,
                }}
                className="relative w-40 h-52 rounded-r-2xl rounded-l-md bg-gradient-to-br from-sky-800 via-sky-900 to-slate-950 border-2 border-amber-400/70 shadow-2xl p-4 flex flex-col justify-between items-center select-none"
              >
                {/* Book Spine */}
                <div className="absolute top-0 bottom-0 left-0 w-4 bg-slate-950 border-r border-amber-400/40" />

                {/* Golden Corner Accents */}
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

                {/* Center Student Name */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <BookOpen className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="font-black text-amber-200 text-sm">{student.name}</p>
                  <span className="text-[10px] text-sky-300 font-bold mt-1">كتاب المعرفة</span>
                </div>

                {/* Golden Padlock (Disappears during unlocking) */}
                <AnimatePresence>
                  {stage !== 'unlocking' && stage !== 'beam' && (
                    <motion.div
                      exit={{ scale: 2, opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-9 rounded-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-xl flex items-center justify-center text-amber-950"
                    >
                      <Shield className="w-4 h-4 fill-amber-950/40" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Action Trigger Button */}
            {stage === 'idle' && (
              <button
                onClick={startTransformation}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>ابدأ مراسم فتح الكتاب وتحرير الشخصية! ✨</span>
              </button>
            )}

            {stage !== 'idle' && (
              <p className="text-sm font-bold text-sky-600 dark:text-sky-400 animate-pulse">
                {stage === 'shaking' && '⚡ الكتاب يرتجف ويشع بنور العلم...'}
                {stage === 'unlocking' && '🔓 القفل الذهبي ينكسر والصفحات تنفتح...'}
                {stage === 'beam' && '🌟 نور باهر ينبثق ويحرر الشخصية!'}
              </p>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE: MYSTERY CHOICE / GACHA CHEST SELECTION */}
        {/* ==================================================================== */}
        {stage === 'mystery_choice' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-3xl shadow-inner mb-3">
              🎉
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              تهانينا! لقد فُتح الكتاب بنجاح
            </h3>

            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
              أصبح بإمكانك الآن منح الطالب شخصيته الكرتونية ثلاثية الأبعاد الدائمة.
            </p>

            {/* Choice Cards (2 Paths) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full my-6">
              {/* Path 1: Mystery Chest Roll (صندوق المفاجآت العشوائي) */}
              <div
                onClick={handleRollMystery}
                className="group relative p-5 rounded-2xl border-2 border-amber-400/80 hover:border-amber-400 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 text-right cursor-pointer transition-all hover:scale-[1.02] shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🎁</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    الأكثر إثارة للأطفال 🔥
                  </span>
                </div>

                <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  فتح صندوق المفاجآت (عشوائي)
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  افتح الصندوق السري واحصل على شخصية عشوائية بنظام الندرة (شائع، نادر، ملحمي، أو
                  أسطوري!).
                </p>

                {/* Rarity odds summary pill */}
                <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-500">🟢 50%</span>
                  <span className="text-sky-500">🔵 30%</span>
                  <span className="text-purple-500">🟣 15%</span>
                  <span className="text-amber-500">🟡 5%</span>
                </div>
              </div>

              {/* Path 2: Browse all 50 characters */}
              <div
                onClick={() => setStage('rolling')} // reuse rolling or directly browse
                className="group relative p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 bg-slate-50 dark:bg-slate-800/50 text-right cursor-pointer transition-all hover:scale-[1.02] shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🎨</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                    50 شخصية متاحة
                  </span>
                </div>

                <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  اختيار يدوي من المكتبة
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  استعرض كافة الشخصيات الكرتونية الـ 50 واختر الشخصية الأنسب لميول وشخصية الطالب.
                </p>

                <div className="mt-3 text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <span>تصفح الكتالوج الكامل ←</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE: ROLLING GACHA SUSPENSE / BROWSER */}
        {/* ==================================================================== */}
        {stage === 'rolling' && (
          <div className="p-6 sm:p-8 flex flex-col items-center">
            {rollingCandidate ? (
              // Fast Suspense Roll Animation
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-28 h-28 rounded-3xl bg-slate-100 dark:bg-slate-800 border-4 border-amber-400 flex items-center justify-center text-6xl shadow-2xl animate-bounce">
                  {rollingCandidate.emoji}
                </div>
                <h4 className="mt-4 text-lg font-black text-slate-900 dark:text-slate-100">
                  {rollingCandidate.nameAr}
                </h4>
                <p className="text-xs font-bold text-amber-500 animate-pulse mt-1">
                  جاري فتح الصندوق السري واكتشاف الندرة...
                </p>
              </div>
            ) : (
              // Full 50 Characters Catalog Browser
              <div className="w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                      مكتبة الـ 50 شخصية ثلاثية الأبعاد
                    </h3>
                    <p className="text-xs text-slate-500">اختر شخصية لتكون Avatar الطالب الدائم</p>
                  </div>
                  <button
                    onClick={handleRollMystery}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>سحب عشوائي</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setBrowseRarity('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      browseRarity === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    الكل (50)
                  </button>
                  <button
                    onClick={() => setBrowseRarity('common')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      browseRarity === 'common'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    🟢 شائع (20)
                  </button>
                  <button
                    onClick={() => setBrowseRarity('rare')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      browseRarity === 'rare'
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                    }`}
                  >
                    🔵 نادر (15)
                  </button>
                  <button
                    onClick={() => setBrowseRarity('epic')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      browseRarity === 'epic'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    🟣 ملحمي (10)
                  </button>
                  <button
                    onClick={() => setBrowseRarity('legendary')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      browseRarity === 'legendary'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    🟡 أسطوري (5)
                  </button>
                </div>

                {/* Characters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1">
                  {filteredCharacters.map((char) => {
                    const r = RARITY_INFO[char.rarity];
                    return (
                      <div
                        key={char.id}
                        onClick={() => handleSelectCharacter(char)}
                        className="card-depth p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform group relative border border-slate-900/[0.08] dark:border-slate-800"
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${char.primaryColor}22, ${char.accentColor}44)`,
                            border: `2px solid ${r.color}`,
                          }}
                        >
                          {char.emoji}
                        </div>

                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full border mb-1 ${r.badgeBg}`}
                        >
                          {r.labelAr}
                        </span>

                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1">
                          {char.nameAr}
                        </p>

                        <p className="text-[10px] text-slate-500 line-clamp-1">{char.titleAr}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE: REVEALED CHARACTER CARD & CONFIRMATION */}
        {/* ==================================================================== */}
        {stage === 'revealed' && selectedCharacter && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Rarity Aura Badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black border ${
                  RARITY_INFO[selectedCharacter.rarity].badgeBg
                }`}
              >
                شخصية {RARITY_INFO[selectedCharacter.rarity].labelAr}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {selectedCharacter.nameAr}
            </h3>

            <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {selectedCharacter.titleAr}
            </p>

            {/* Big 3D Revealed Character Card */}
            <motion.div
              initial={{ scale: 0.5, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative my-5 w-44 h-52 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${selectedCharacter.primaryColor}33, ${selectedCharacter.accentColor}66)`,
                border: `3px solid ${RARITY_INFO[selectedCharacter.rarity].color}`,
              }}
            >
              {/* Stars Header */}
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: selectedCharacter.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* 3D Emoji */}
              <span className="text-6xl drop-shadow-lg mb-2">{selectedCharacter.emoji}</span>

              {/* Quote */}
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-2 px-1">
                "{selectedCharacter.quoteAr}"
              </p>
            </motion.div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-6">
              {selectedCharacter.descriptionAr}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => setStage('rolling')}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                تغيير الشخصية
              </button>

              <button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'جاري الحفظ...' : 'اعتماد الشخصية'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

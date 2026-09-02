import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Star, Shuffle, Search, Filter } from 'lucide-react';
import {
  Character3D,
  RARITY_INFO,
  getAllCharacters,
  rollRandomCharacter,
  CharacterRarity,
} from '../../services/characterSystem';
import { soundManager } from '../../utils/sound';

interface CharacterLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (char: Character3D) => void;
  selectedCharacterId?: string;
  allowSelection?: boolean;
}

export const CharacterLibraryModal: React.FC<CharacterLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
  selectedCharacterId,
  allowSelection = false,
}) => {
  const [activeRarity, setActiveRarity] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingChar, setInspectingChar] = useState<Character3D | null>(null);

  if (!isOpen) return null;

  const characters = getAllCharacters();
  const filtered = characters.filter((c) => {
    if (activeRarity !== 'all' && c.rarity !== activeRarity) return false;
    if (activeCategory !== 'all' && c.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        c.nameAr.toLowerCase().includes(q) ||
        c.titleAr.toLowerCase().includes(q) ||
        c.descriptionAr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-900/[0.08] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-2xl shadow-2xs">
              ✨
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                موسوعة الـ 50 شخصية ثلاثية الأبعاد
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                شخصيات كرتونية تحفيزية للأطفال بنظام الندرة (شائع • نادر • ملحمي • أسطوري)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شخصية (مثال: الحافظ، الفارس، المخترع، نسر القدس)..."
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-900/[0.08] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Rarity Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveRarity('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeRarity === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              الكل ({characters.length})
            </button>
            <button
              onClick={() => setActiveRarity('common')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeRarity === 'common'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              🟢 شائع (20)
            </button>
            <button
              onClick={() => setActiveRarity('rare')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeRarity === 'rare'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
              }`}
            >
              🔵 نادر (15)
            </button>
            <button
              onClick={() => setActiveRarity('epic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeRarity === 'epic'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
              }`}
            >
              🟣 ملحمي (10)
            </button>
            <button
              onClick={() => setActiveRarity('legendary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeRarity === 'legendary'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
            >
              🟡 أسطوري (5)
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filtered.map((char) => {
            const r = RARITY_INFO[char.rarity];
            const isSelected = selectedCharacterId === char.id;

            return (
              <motion.div
                key={char.id}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => {
                  soundManager.playClickPop();
                  setInspectingChar(char);
                  if (allowSelection && onSelectCharacter) {
                    onSelectCharacter(char);
                  }
                }}
                className={`card-depth p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer relative border transition-all ${
                  isSelected
                    ? 'ring-2 ring-sky-500 border-sky-400 bg-sky-50/50 dark:bg-sky-950/40'
                    : 'border-slate-900/[0.08] dark:border-slate-800'
                }`}
              >
                {/* 3D Emoji Avatar Box */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${char.primaryColor}22, ${char.accentColor}44)`,
                    border: `2px solid ${r.color}`,
                  }}
                >
                  {char.emoji}
                </div>

                {/* Rarity Badge & Stars */}
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${r.badgeBg}`}
                  >
                    {r.labelAr}
                  </span>
                  <div className="flex items-center">
                    {Array.from({ length: char.stars }).map((_, idx) => (
                      <Star key={idx} className="w-2 h-2 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1 w-full">
                  {char.nameAr}
                </p>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {char.titleAr}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Character Detail Modal (Quick Inspection) */}
        <AnimatePresence>
          {inspectingChar && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-900/[0.08] dark:border-slate-800 shadow-2xl flex flex-col items-center text-center"
              >
                <button
                  onClick={() => setInspectingChar(null)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>

                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-6xl shadow-xl my-2"
                  style={{
                    background: `linear-gradient(135deg, ${inspectingChar.primaryColor}33, ${inspectingChar.accentColor}55)`,
                    border: `3px solid ${RARITY_INFO[inspectingChar.rarity].color}`,
                  }}
                >
                  {inspectingChar.emoji}
                </div>

                <span
                  className={`mt-2 text-xs font-black px-3 py-1 rounded-full border ${
                    RARITY_INFO[inspectingChar.rarity].badgeBg
                  }`}
                >
                  {RARITY_INFO[inspectingChar.rarity].labelAr}
                </span>

                <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">
                  {inspectingChar.nameAr}
                </h3>
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  {inspectingChar.titleAr}
                </p>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {inspectingChar.descriptionAr}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 w-full text-xs font-bold text-slate-700 dark:text-slate-300">
                  "{inspectingChar.quoteAr}"
                </div>

                {allowSelection && onSelectCharacter && (
                  <button
                    onClick={() => {
                      onSelectCharacter(inspectingChar);
                      setInspectingChar(null);
                      onClose();
                    }}
                    className="mt-4 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md cursor-pointer transition-colors"
                  >
                    اختيار هذه الشخصية
                  </button>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

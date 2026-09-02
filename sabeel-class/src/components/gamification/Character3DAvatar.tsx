import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';
import { Character3D, RARITY_INFO, getCharacterById } from '../../services/characterSystem';

interface Character3DAvatarProps {
  characterId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRarityBadge?: boolean;
  showStars?: boolean;
  showName?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Character3DAvatar: React.FC<Character3DAvatarProps> = ({
  characterId,
  size = 'md',
  showRarityBadge = true,
  showStars = true,
  showName = false,
  interactive = true,
  className = '',
  onClick,
}) => {
  const character: Character3D = getCharacterById(characterId);
  const rarity = RARITY_INFO[character.rarity];

  const sizeDims = {
    sm: { box: 'w-12 h-12', emoji: 'text-2xl', stars: 'w-2 h-2', badgeText: 'text-[8px]' },
    md: { box: 'w-16 h-16', emoji: 'text-3xl', stars: 'w-2.5 h-2.5', badgeText: 'text-[9px]' },
    lg: { box: 'w-24 h-24', emoji: 'text-5xl', stars: 'w-3 h-3', badgeText: 'text-xs' },
    xl: { box: 'w-32 h-32', emoji: 'text-6xl', stars: 'w-4 h-4', badgeText: 'text-sm' },
  }[size];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Character Capsule */}
      <motion.div
        whileHover={interactive ? { scale: 1.06, y: -2 } : undefined}
        whileTap={interactive ? { scale: 0.96 } : undefined}
        onClick={onClick}
        className={`relative ${sizeDims.box} rounded-2xl p-1 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${rarity.glowClass}`}
        style={{
          background: `linear-gradient(135deg, ${character.primaryColor}22, ${character.accentColor}44)`,
          border: `2px solid ${rarity.color}`,
        }}
      >
        {/* Ambient Glow Aura */}
        <div
          className="absolute inset-0 rounded-2xl opacity-40 blur-md pointer-events-none"
          style={{ backgroundColor: rarity.color }}
        />

        {/* 3D Depth Card Inner */}
        <div className="relative w-full h-full rounded-xl bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center overflow-hidden backdrop-blur-xs">
          {/* Subtle 3D Spotlight Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/20 pointer-events-none" />

          {/* Character 3D Emoji Avatar */}
          <span
            className={`${sizeDims.emoji} transform transition-transform duration-300 drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]`}
          >
            {character.emoji}
          </span>

          {/* Sparkle Highlight on Top Right */}
          {character.rarity !== 'common' && (
            <div className="absolute top-1 right-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Rarity Stars Counter Pill (bottom of the box) */}
        {showStars && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-slate-950/90 text-amber-400 border border-white/20 shadow-xs flex items-center gap-0.5 z-10">
            {Array.from({ length: character.stars }).map((_, i) => (
              <Star key={i} className={`${sizeDims.stars} fill-amber-400`} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Rarity Badge Text */}
      {showRarityBadge && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`px-2 py-0.5 rounded-full font-black border ${rarity.badgeBg} ${sizeDims.badgeText}`}
          >
            {rarity.labelAr}
          </span>
        </div>
      )}

      {/* Character Name & Title */}
      {showName && (
        <div className="mt-1 text-center">
          <p className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1">
            {character.nameAr}
          </p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">
            {character.titleAr}
          </p>
        </div>
      )}
    </div>
  );
};

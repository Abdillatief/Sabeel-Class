import React, { useState } from 'react';
import { getIslamicAvatar, IslamicAvatarDef, ISLAMIC_AVATARS } from '../../utils/islamicAvatars';

interface AnimeAvatarProps {
  avatarId?: string;
  photoUrl?: string;
  cartoonPhotoUrl?: string;
  useCartoonAvatar?: boolean;
  studentName?: string;
  size?: 'sm' | 'md' | '4x4' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  enableHoverGlow?: boolean;
}

export const AnimeAvatar: React.FC<AnimeAvatarProps> = ({
  avatarId,
  photoUrl,
  cartoonPhotoUrl,
  useCartoonAvatar,
  studentName = 'طالب',
  size = '4x4',
  className = '',
  showBadge = false,
  enableHoverGlow = true
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine if user uploaded a custom photo
  const customPhoto = useCartoonAvatar && cartoonPhotoUrl ? cartoonPhotoUrl : photoUrl;

  // Find matching Islamic avatar
  const matchedHero: IslamicAvatarDef = getIslamicAvatar(avatarId);

  // Sizes mapping - "4x4" is 4rem x 4rem (w-16 h-16 = 64px x 64px)
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-12 h-12 rounded-xl',
    '4x4': 'w-16 h-16 rounded-2xl', // 4*4 standard
    lg: 'w-20 h-20 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  }[size];

  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg',
    '4x4': 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const nameSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    '4x4': 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  // First name or short title for the card
  const shortHeroName = matchedHero.name.replace(/^(الإمام|الشيخ|السلطان|الحافظ)\s+/, '').split(' ').slice(0, 2).join(' ');

  return (
    <div
      className={`relative ${sizeClasses} shrink-0 overflow-hidden bg-slate-900 ring-2 ring-amber-400/50 dark:ring-amber-500/40 shadow-md ${
        enableHoverGlow ? 'group-hover:ring-4 group-hover:ring-amber-400 group-hover:shadow-amber-500/20 group-hover:shadow-lg transition-all duration-300' : ''
      } ${className}`}
    >
      {customPhoto && !imageError ? (
        <img
          src={customPhoto}
          alt={studentName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Themed Islamic Hero Avatar Card */
        <div
          className={`w-full h-full bg-gradient-to-br ${matchedHero.fallbackColor} relative flex flex-col items-center justify-between p-1 select-none text-white overflow-hidden`}
        >
          {/* Subtle Islamic Geometric Star Motif in Background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full scale-125" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 L61 35 L97 35 L68 57 L79 91 L50 70 L21 91 L32 57 L3 35 L39 35 Z" />
            </svg>
          </div>

          {/* Top Category/Insignia Accent */}
          <div className="w-full flex items-center justify-between px-0.5 z-10 opacity-90">
            <span className="text-[8px] font-black tracking-tighter opacity-80 scale-90">
              {matchedHero.icon}
            </span>
            <span className="text-[7px] font-black px-1 rounded-sm bg-black/25 text-amber-200">
              {matchedHero.badge ? matchedHero.badge.split(' ')[0] : 'سبيل'}
            </span>
          </div>

          {/* Center Iconic Symbol */}
          <div className="z-10 my-auto flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className={`${iconSizes} drop-shadow-md`}>
              {matchedHero.icon}
            </span>
          </div>

          {/* Bottom Historical Name */}
          <div className="w-full text-center z-10 bg-black/40 backdrop-blur-2xs py-0.5 px-0.5 rounded-md mt-auto">
            <span className={`${nameSizes} font-black leading-none block truncate text-amber-100 drop-shadow-sm`}>
              {shortHeroName}
            </span>
          </div>

          {/* Corner Light Shimmer */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full blur-md pointer-events-none" />
        </div>
      )}

      {/* Optional Badge Indicator */}
      {showBadge && (
        <span
          title={`${matchedHero.name} - ${matchedHero.title}`}
          className="absolute bottom-0 right-0 bg-slate-950/90 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-tl-lg border-t border-l border-amber-400/30 shadow-xs"
        >
          {matchedHero.icon}
        </span>
      )}
    </div>
  );
};

// Aliases for clean semantic imports
export const IslamicAvatar = AnimeAvatar;
export default AnimeAvatar;

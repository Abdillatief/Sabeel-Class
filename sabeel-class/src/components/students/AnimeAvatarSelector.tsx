import React, { useState, useMemo } from 'react';
import {
  ISLAMIC_AVATARS,
  ISLAMIC_CATEGORIES,
  IslamicAvatarDef
} from '../../utils/islamicAvatars';
import { Check, Search, Sparkles, Filter } from 'lucide-react';

interface AnimeAvatarSelectorProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
}

export const AnimeAvatarSelector: React.FC<AnimeAvatarSelectorProps> = ({
  selectedAvatarId,
  onSelectAvatar,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAvatars = useMemo(() => {
    return ISLAMIC_AVATARS.filter((av) => {
      const matchCategory =
        activeCategory === 'الكل' || av.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        av.name.includes(searchQuery.trim()) ||
        av.title.includes(searchQuery.trim()) ||
        av.characterTag.includes(searchQuery.trim()) ||
        av.badge.includes(searchQuery.trim());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-3 text-right">
      {/* Search and clean header */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="اسم الشخصية..."
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-right"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <span className="text-[11px] font-black px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>شخصيات إسلامية</span>
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {ISLAMIC_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Avatars Grid - Each exactly 4*4 frame */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 bg-amber-50/20 dark:bg-slate-900/60 rounded-2xl border border-amber-100 dark:border-slate-800">
        {filteredAvatars.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-slate-400">
            لم يتم العثور على شخصية تطابق بحثك
          </div>
        ) : (
          filteredAvatars.map((av) => {
            const isSelected = selectedAvatarId === av.id;

            return (
              <button
                key={av.id}
                type="button"
                onClick={() => onSelectAvatar(av.id)}
                title={`${av.name} (${av.title})`}
                className={`relative flex flex-col items-center p-2 rounded-2xl transition-all text-center cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-100/90 dark:bg-amber-950/80 ring-2 ring-amber-500 shadow-md scale-102'
                    : 'bg-white dark:bg-slate-800/90 hover:bg-amber-50/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700'
                }`}
              >
                {/* 4*4 Avatar Frame */}
                <div
                  className={`relative w-14 h-14 rounded-2xl overflow-hidden shadow-xs ring-2 ${
                    isSelected
                      ? 'ring-amber-500'
                      : 'ring-amber-200/50 dark:ring-slate-700'
                  } bg-gradient-to-br ${av.fallbackColor} shrink-0 flex flex-col items-center justify-between p-1 text-white select-none`}
                >
                  <span className="text-[8px] font-black self-start opacity-90">
                    {av.badge.split(' ')[0]}
                  </span>
                  <span className="text-xl drop-shadow-sm group-hover:scale-115 transition-transform duration-200">
                    {av.icon}
                  </span>
                  <div className="w-full bg-black/40 py-0.5 rounded text-[8px] font-black truncate text-amber-100">
                    {av.name.split(' ')[0]}
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-600/50 flex items-center justify-center text-white backdrop-blur-2xs">
                      <Check className="w-6 h-6 stroke-[3] drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Character Name & Tag */}
                <span className="mt-1 text-[11px] font-black text-slate-800 dark:text-slate-100 line-clamp-1">
                  {av.name}
                </span>
                <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 line-clamp-1">
                  {av.characterTag}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export const IslamicAvatarSelector = AnimeAvatarSelector;
export default AnimeAvatarSelector;

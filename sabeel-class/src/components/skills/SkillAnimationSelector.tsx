import React from 'react';
import { SKILL_ANIMATIONS, SkillAnimationDef } from '../../utils/constants';
import { Check, Eye, Play, Sparkles, Zap, Flame, Sun, Swords, Stars, Shield, Trophy, Volume2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface SkillAnimationSelectorProps {
  selectedAnimationId: string;
  onSelectAnimation: (animationId: string) => void;
  onPreviewAnimation?: (animationId: string) => void;
}

export const SkillAnimationSelector: React.FC<SkillAnimationSelectorProps> = ({
  selectedAnimationId,
  onSelectAnimation,
  onPreviewAnimation,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-sky-500 animate-spin" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-yellow-500 animate-bounce" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-orange-500 animate-spin" />;
      case 'Swords':
        return <Swords className="w-5 h-5 text-rose-500" />;
      case 'Stars':
        return <Stars className="w-5 h-5 text-purple-500 animate-pulse" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-red-500 animate-pulse" />;
      default:
        return <Sparkles className="w-5 h-5 text-sky-500" />;
    }
  };

  const handlePreview = (e: React.MouseEvent, animId: string) => {
    e.stopPropagation();
    soundManager.playClickPop();
    if (onPreviewAnimation) {
      onPreviewAnimation(animId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
          اختر أنيميشن النقاط المذهل لهذه المهارة 🎬
        </label>
        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
          يظهر تلقائياً بملء الشاشة عند منح النقاط للطالب
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1.5 bg-sky-50/40 dark:bg-slate-900/60 rounded-2xl border border-sky-100 dark:border-slate-800">
        {SKILL_ANIMATIONS.map((anim) => {
          const isSelected = selectedAnimationId === anim.id;

          return (
            <div
              key={anim.id}
              onClick={() => onSelectAnimation(anim.id)}
              className={`relative flex items-start justify-between p-3.5 rounded-2xl transition-all cursor-pointer border text-right group ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 ring-2 ring-sky-500 border-sky-400 dark:border-sky-500 shadow-md scale-[1.01]'
                  : 'bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Icon Box */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${anim.badgeBg} ${anim.borderColor}`}
                >
                  {getIcon(anim.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {anim.name}
                    </h4>
                    {isSelected && (
                      <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>محدد</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    {anim.series}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                    {anim.description}
                  </p>
                </div>
              </div>

              {/* Actions: Voice & Preview Buttons */}
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playAnimeVoice(anim.id);
                  }}
                  title="استمع لصوت الشخصية لهذه المهارة"
                  className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold shadow-2xs border border-amber-200/80 dark:border-amber-800/80"
                >
                  <Volume2 className="w-3 h-3" />
                  <span className="hidden sm:inline">صوت</span>
                </button>

                {onPreviewAnimation && (
                  <button
                    type="button"
                    onClick={(e) => handlePreview(e, anim.id)}
                    title="معاينة هذا التأثير الآن"
                    className="p-1.5 rounded-xl bg-sky-50 dark:bg-slate-700/80 text-sky-600 dark:text-sky-300 hover:bg-sky-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold shadow-2xs group-hover:border-sky-300"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden xs:inline">معاينة</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

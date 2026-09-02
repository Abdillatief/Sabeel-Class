import React, { useState } from 'react';
import { Plus, Sparkles, Pencil, Trash2, Check, X, Play, Zap } from 'lucide-react';
import { Skill } from '../../types';
import { SKILL_ANIMATIONS } from '../../utils/constants';
import { SkillAnimationSelector } from './SkillAnimationSelector';
import { soundManager } from '../../utils/sound';

interface SkillsManagementProps {
  skills: Skill[];
  onAddSkill: (name: string, points: number, animation?: string) => Promise<void>;
  onUpdateSkill: (id: string, name: string, points: number, animation?: string) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
  onPreviewAnimation?: (animationId: string) => void;
}

export const SkillsManagement: React.FC<SkillsManagementProps> = ({
  skills,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onPreviewAnimation,
}) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillPoints, setNewSkillPoints] = useState<number | ''>(5);
  const [newSkillAnimation, setNewSkillAnimation] = useState<string>('titan_lightning');
  
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState<number | ''>(5);
  const [editAnimation, setEditAnimation] = useState<string>('titan_lightning');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || newSkillPoints === '') return;
    setIsSubmitting(true);
    try {
      await onAddSkill(newSkillName.trim(), Number(newSkillPoints), newSkillAnimation);
      setNewSkillName('');
      setNewSkillPoints(5);
      setNewSkillAnimation('titan_lightning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setEditName(skill.name);
    setEditPoints(skill.points);
    setEditAnimation(skill.animation || 'titan_lightning');
  };

  const handleSaveEdit = async (skillId: string) => {
    if (!editName.trim() || editPoints === '') return;
    setIsSubmitting(true);
    try {
      await onUpdateSkill(skillId, editName.trim(), Number(editPoints), editAnimation);
      setEditingSkillId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnimationInfo = (animId?: string) => {
    return SKILL_ANIMATIONS.find((a) => a.id === animId) || SKILL_ANIMATIONS[0];
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                إدارة مهارات ومعايير التقييم
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حدد بنود الإنجاز والنقاط الممنوحة مع اختيار الأنيميشن المذهل لكل مهارة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Skill Form */}
      <div className="bg-gradient-to-r from-sky-50/90 to-sky-100/50 dark:from-slate-900 dark:to-slate-850 p-6 rounded-3xl border border-sky-200 dark:border-slate-800 transition-colors space-y-4">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400 stroke-[3]" />
          <span>إضافة مهارة / إنجاز جديد مع أنيميشن خاص</span>
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المهارة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="اسم المهارة (مثال: حفظ جديد، مراجعة، ترتيل متقن...)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 shadow-2xs transition-colors"
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                النقاط <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  placeholder="النقاط"
                  value={newSkillPoints}
                  onChange={(e) => setNewSkillPoints(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 shadow-2xs text-center transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600 dark:text-sky-400 pointer-events-none">
                  نقطة
                </span>
              </div>
            </div>
          </div>

          {/* Animation Selector for New Skill */}
          <div className="pt-2 border-t border-sky-200/60 dark:border-slate-800">
            <SkillAnimationSelector
              selectedAnimationId={newSkillAnimation}
              onSelectAnimation={(id) => setNewSkillAnimation(id)}
              onPreviewAnimation={onPreviewAnimation}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>حفظ وإضافة المهارة بالأنيميشن المختار</span>
            </button>
          </div>
        </form>
      </div>

      {/* Skills List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-sky-100 dark:border-slate-800 shadow-xs transition-colors">
        <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
          <span>قائمة المهارات المعتمدة بحلقتك ({skills.length})</span>
        </h2>

        {skills.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
            لا توجد مهارات مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skills.map((skill) => {
              const isEditing = editingSkillId === skill.id;
              const animInfo = getAnimationInfo(skill.animation);

              if (isEditing) {
                return (
                  <div
                    key={skill.id}
                    className="p-4 rounded-2xl border-2 border-sky-400 dark:border-sky-500 bg-sky-50/40 dark:bg-slate-800/60 space-y-3 col-span-1 md:col-span-2"
                  >
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={editPoints}
                        onChange={(e) => setEditPoints(e.target.value ? Number(e.target.value) : '')}
                        className="w-24 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold text-center focus:outline-none"
                      />
                    </div>

                    <SkillAnimationSelector
                      selectedAnimationId={editAnimation}
                      onSelectAnimation={(id) => setEditAnimation(id)}
                      onPreviewAnimation={onPreviewAnimation}
                    />

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setEditingSkillId(null)}
                        className="p-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(skill.id)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 text-xs font-bold cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-black flex items-center justify-center text-sm shrink-0 shadow-2xs border border-sky-200 dark:border-sky-800">
                      +{skill.points}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm truncate">
                        {skill.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                          {skill.points} نقاط
                        </span>
                        {/* Animation tag */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${animInfo.badgeBg} ${animInfo.borderColor}`}>
                          <span>{animInfo.name.split(' ')[0]}</span>
                          <span>{animInfo.name.split(' ').slice(-1)[0]}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Preview Button */}
                    {onPreviewAnimation && (
                      <button
                        type="button"
                        onClick={() => onPreviewAnimation(skill.animation || 'titan_lightning')}
                        title="معاينة الأنيميشن المختار لهذه المهارة"
                        className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(skill)}
                      title="تعديل المهارة والأنيميشن"
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSkill(skill.id)}
                      title="حذف المهارة"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

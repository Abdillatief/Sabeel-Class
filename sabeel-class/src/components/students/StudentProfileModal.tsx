import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Award,
  Plus,
  History,
  Trash2,
  FileCheck,
  Calendar,
  Sparkles,
  Medal,
  Clock,
  Edit3,
  Check,
  AlertTriangle,
  Loader2,
  Palette,
  Camera,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { Student, PointHistoryItem, StudentBadge } from '../../types';
import { CARTOON_AVATARS, SYSTEM_BADGES } from '../../utils/constants';
import { AnimeAvatar } from '../common/AnimeAvatar';
import { getIslamicAvatar } from '../../utils/islamicAvatars';
import {
  getStudentPointHistory,
  getStudentBadgesList,
  updatePointHistoryItem,
  deletePointHistoryItem
} from '../../services/db';
import { getStudentDisplayPhoto } from '../../services/cartoonService';
import { getStudentLevel } from '../../utils/levels';
import { soundManager } from '../../utils/sound';

interface StudentProfileModalProps {
  student: Student | null;
  rank: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddPoints: (student: Student) => void;
  onOpenAwardBadge: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onEditStudent?: (student: Student) => void;
  onPointsModified?: () => void;
  teacherId: string;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  rank,
  isOpen,
  onClose,
  onOpenAddPoints,
  onOpenAwardBadge,
  onOpenCertificate,
  onDeleteStudent,
  onEditStudent,
  onPointsModified,
  teacherId
}) => {
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [badgeRecords, setBadgeRecords] = useState<StudentBadge[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit Point Modal inside profile
  const [editingPointItem, setEditingPointItem] = useState<PointHistoryItem | null>(null);
  const [editPoints, setEditPoints] = useState<number>(1);
  const [editSkill, setEditSkill] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Point Confirmation inside profile
  const [deletingPointItem, setDeletingPointItem] = useState<PointHistoryItem | null>(null);
  const [isDeletingPoint, setIsDeletingPoint] = useState(false);

  useEffect(() => {
    if (student) {
      setLoadingHistory(true);
      Promise.all([
        getStudentPointHistory(student.id),
        getStudentBadgesList(student.id),
      ])
        .then(([hist, bRecords]) => {
          setHistory(hist);
          setBadgeRecords(bRecords);
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const displayPhoto = getStudentDisplayPhoto(student);
  const levelInfo = getStudentLevel(student.totalPoints || 0);

  const getAvatarContent = () => {
    if (displayPhoto.url) {
      return (
        <img
          src={displayPhoto.url}
          alt={student.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      );
    }
    const av = getIslamicAvatar(student.avatar);
    return (
      <div className={`w-full h-full bg-gradient-to-tr ${av.fallbackColor} flex flex-col items-center justify-center text-white p-2`}>
        <span className="text-4xl">{av.icon}</span>
        <span className="text-[10px] font-black mt-1 text-amber-200">{av.name}</span>
      </div>
    );
  };

  const earnedBadges = SYSTEM_BADGES.filter((b) => student.badges?.includes(b.id));

  const handleDelete = async () => {
    await onDeleteStudent(student.id);
    onClose();
  };

  // Open Edit Point modal
  const handleOpenEditPoint = (item: PointHistoryItem) => {
    setEditingPointItem(item);
    setEditPoints(item.points);
    setEditSkill(item.skillName);
    setEditReason(item.reason || '');
  };

  // Save Point Edit
  const handleSavePointEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPointItem || !student) return;

    setIsSavingEdit(true);
    try {
      await updatePointHistoryItem({
        historyId: editingPointItem.id,
        teacherId,
        studentId: student.id,
        oldPoints: editingPointItem.points,
        newPoints: Number(editPoints),
        newSkillName: editSkill.trim(),
        newReason: editReason.trim()
      });

      // Update local history
      setHistory(prev =>
        prev.map(item =>
          item.id === editingPointItem.id
            ? {
                ...item,
                points: Number(editPoints),
                skillName: editSkill.trim(),
                reason: editReason.trim()
              }
            : item
        )
      );

      // Recalculate student points locally
      const diff = Number(editPoints) - editingPointItem.points;
      student.totalPoints = Math.max(0, (student.totalPoints || 0) + diff);

      setEditingPointItem(null);
      if (onPointsModified) onPointsModified();
    } catch (err) {
      console.error('Failed to update point item:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Point Confirm
  const handleConfirmDeletePoint = async () => {
    if (!deletingPointItem || !student) return;

    setIsDeletingPoint(true);
    try {
      await deletePointHistoryItem({
        historyId: deletingPointItem.id,
        teacherId,
        studentId: student.id,
        points: deletingPointItem.points
      });

      // Update local history
      setHistory(prev => prev.filter(item => item.id !== deletingPointItem.id));
      // Revert student points locally
      student.totalPoints = Math.max(0, (student.totalPoints || 0) - deletingPointItem.points);

      setDeletingPointItem(null);
      if (onPointsModified) onPointsModified();
    } catch (err) {
      console.error('Failed to delete point item:', err);
    } finally {
      setIsDeletingPoint(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto transition-colors">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-sky-100 dark:border-slate-700 flex items-center gap-1.5">
              <span>✨</span>
              <span>خواص الطالب وسجل الإنجاز</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-3xl bg-gradient-to-br from-sky-50/80 via-white to-sky-50/30 dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-800/40 border border-sky-100 dark:border-slate-700 mb-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <AnimeAvatar
              avatarId={student.avatar}
              photoUrl={student.photoUrl || student.photo}
              cartoonPhotoUrl={student.cartoonPhotoUrl}
              useCartoonAvatar={student.useCartoonAvatar}
              studentName={student.name}
              size="lg"
              showBadge={true}
              className="ring-4 ring-sky-300 dark:ring-slate-700 shadow-md"
            />
          </div>

          {/* Student Info & Stats */}
          <div className="flex-1 text-center sm:text-right space-y-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {student.name}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl">
                  🏆 المركز {rank} بالحلقة
                </span>
                {onEditStudent && (
                  <button
                    onClick={() => {
                      onEditStudent(student);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الطالب</span>
                  </button>
                )}
              </div>
            </div>

            {/* Level Badge and Points */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {/* Islamic Character Badge */}
              {(() => {
                const av = getIslamicAvatar(student.avatar);
                return (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    <span>{av.icon}</span>
                    <span>{av.name} ({av.characterTag})</span>
                  </span>
                );
              })()}

              <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-xl border ${levelInfo.borderColor} ${levelInfo.badgeBg}`}>
                <span>{levelInfo.emoji}</span>
                <span>المستوى: {levelInfo.title}</span>
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{student.totalPoints} نقطة</span>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="pt-2 w-full">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                <span>التقدم نحو المستوى التالي:</span>
                <span className="text-sky-600 dark:text-sky-400 font-black">{levelInfo.progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progressPercent}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 shadow-2xs"
                />
              </div>
              {levelInfo.level < 4 && (
                <p className="text-[10px] text-slate-400 text-center sm:text-right mt-1 font-semibold">
                  باقي {levelInfo.pointsToNext} نقطة للانتقال إلى المستوى التالي ✨
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => {
              soundManager.playClickPop();
              onClose();
              onOpenAddPoints(student);
            }}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white text-xs font-black shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة نقاط</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClickPop();
              onClose();
              onOpenAwardBadge(student);
            }}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>منح وسام</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClickPop();
              onClose();
              onOpenCertificate(student);
            }}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-black shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>شهادة تقدير</span>
          </button>
        </div>

        {/* Section: Badges */}
        <div className="mb-6">
          <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>الأوسمة المكتسبة ({earnedBadges.length})</span>
          </h3>

          {earnedBadges.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
              لم يحصل الطالب على أوسمة بعد. امنحه أول وسام تشجيعي!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {earnedBadges.map((b) => {
                const record = badgeRecords.find((r) => r.badgeId === b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border ${b.bgClass} dark:bg-opacity-20 flex items-start gap-3`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                      <Award className={`w-5 h-5 ${b.colorClass}`} />
                    </div>
                    <div>
                      <h4 className={`font-black text-xs ${b.colorClass}`}>{b.name}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{b.description}</p>
                      {record?.reason && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                          السبب: "{record.reason}"
                        </p>
                      )}
                      {record?.date && (
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(record.date).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Achievement Timeline (سجل الإنجازات والخط الزمني التفاعلي) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-sky-500" />
              <span>الخط الزمني لآخر الإنجازات والعمليات ({history.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
              تحديث فوري
            </span>
          </div>

          {loadingHistory ? (
            <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
              جاري تحميل الخط الزمني للإنجازات...
            </div>
          ) : history.length === 0 ? (
            <div className="p-5 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              لا توجد عمليات نقاط مسجلة لهذا الطالب بعد.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 relative before:absolute before:right-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-100 dark:before:bg-slate-800">
              {history.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700/80 text-xs shadow-2xs hover:shadow-xs transition-all relative z-10 mr-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center text-xs shrink-0 border border-amber-200 dark:border-amber-800">
                      +{item.points} ⭐
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-slate-100 text-xs">{item.skillName}</p>
                      {item.reason ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.reason}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">إنجاز متميز</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(item.date).toLocaleDateString('ar-SA', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>

                    {/* Edit & Delete Shortcuts */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPoint(item)}
                        className="p-1 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 rounded-lg cursor-pointer"
                        title="تعديل النقاط"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingPointItem(item)}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                        title="حذف العملية وخصم النقاط"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Student Section */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف الطالب من الحلقة</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">هل أنت متأكد؟</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Edit Point Modal inside Student Profile */}
      {editingPointItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-sky-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-sky-500" />
                <span>تعديل عملية النقاط للطالب</span>
              </h4>
              <button
                onClick={() => setEditingPointItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePointEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  قيمة النقاط (+/-)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={editPoints}
                  onChange={(e) => setEditPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المهارة
                </label>
                <input
                  type="text"
                  required
                  value={editSkill}
                  onChange={(e) => setEditSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  السبب / الملاحظة
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="سبب النقاط..."
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPointItem(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>حفظ التعديل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Point Confirm Modal inside Student Profile */}
      {deletingPointItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-rose-900 text-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1">
              حذف عملية النقاط
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              هل أنت متأكد من حذف عملية <span className="font-bold">+{deletingPointItem.points} ({deletingPointItem.skillName})</span>؟
              سيتم خصم النقاط من رصيد الطالب فوراً.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingPointItem(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={isDeletingPoint}
                onClick={handleConfirmDeletePoint}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isDeletingPoint ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


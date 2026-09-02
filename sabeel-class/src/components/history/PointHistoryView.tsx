import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Edit3,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
  Loader2,
  Check,
  X,
  TrendingUp
} from 'lucide-react';
import { PointHistoryItem, Student } from '../../types';
import { AnimeAvatar } from '../common/AnimeAvatar';
import {
  getAllTeacherPointHistory,
  updatePointHistoryItem,
  deletePointHistoryItem
} from '../../services/db';

interface PointHistoryViewProps {
  teacherId: string;
  students: Student[];
  onPointsUpdated: () => void;
}

export const PointHistoryView: React.FC<PointHistoryViewProps> = ({
  teacherId,
  students,
  onPointsUpdated
}) => {
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');

  // Edit point state
  const [editingItem, setEditingItem] = useState<PointHistoryItem | null>(null);
  const [editPoints, setEditPoints] = useState<number>(1);
  const [editSkill, setEditSkill] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete point state
  const [deletingItem, setDeletingItem] = useState<PointHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const items = await getAllTeacherPointHistory(teacherId);
      setHistory(items);
    } catch (err) {
      console.error('Error fetching point history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [teacherId]);

  // Open Edit Modal
  const handleOpenEdit = (item: PointHistoryItem) => {
    setEditingItem(item);
    setEditPoints(item.points);
    setEditSkill(item.skillName);
    setEditReason(item.reason || '');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingEdit(true);
    try {
      await updatePointHistoryItem({
        historyId: editingItem.id,
        teacherId,
        studentId: editingItem.studentId,
        oldPoints: editingItem.points,
        newPoints: Number(editPoints),
        newSkillName: editSkill.trim(),
        newReason: editReason.trim()
      });

      // Update local view
      setHistory(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                points: Number(editPoints),
                skillName: editSkill.trim(),
                reason: editReason.trim()
              }
            : item
        )
      );

      setEditingItem(null);
      // Trigger parent update so student cards & leaderboard recalculate!
      onPointsUpdated();
    } catch (err) {
      console.error('Failed to update point transaction:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      await deletePointHistoryItem({
        historyId: deletingItem.id,
        teacherId,
        studentId: deletingItem.studentId,
        points: deletingItem.points
      });

      // Remove from local list
      setHistory(prev => prev.filter(item => item.id !== deletingItem.id));
      setDeletingItem(null);
      // Trigger parent update
      onPointsUpdated();
    } catch (err) {
      console.error('Failed to delete point transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter items
  const filteredHistory = history.filter(item => {
    const matchesStudent =
      selectedStudentFilter === 'all' || item.studentId === selectedStudentFilter;

    // Student name lookup
    const student = students.find(s => s.id === item.studentId);
    const sName = student?.name || item.studentName || '';

    const matchesSearch =
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.reason && item.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStudent && matchesSearch;
  });

  const totalPointsSum = history.reduce((sum, item) => sum + (item.points || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 text-white shadow-lg shadow-sky-500/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
                <History className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight">سجل النقاط والعمليات</h1>
            </div>
            <p className="text-xs text-sky-100 font-medium">
              متابعة كاملة لجميع النقاط الممنوحة للطلاب مع صلاحية التعديل والحذف وتحديث الترتيب فوراً
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
              <span className="block text-[11px] text-sky-100 font-semibold">إجمالي العمليات</span>
              <span className="text-lg font-black">{history.length}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
              <span className="block text-[11px] text-sky-100 font-semibold">مجموع النقاط</span>
              <span className="text-lg font-black">+{totalPointsSum}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث باسم الطالب، المهارة، السبب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        {/* Student Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-sky-500 shrink-0" />
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-400 transition-colors cursor-pointer"
          >
            <option value="all">جميع طلاب الحلقة ({students.length})</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.totalPoints} نقطة)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operations List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-sky-100 dark:border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            جاري تحميل سجل عمليات النقاط...
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-sky-100 dark:border-slate-800 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-500 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
            لا توجد عمليات نقاط مسجلة
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            عند إضافة نقاط للطلاب ستظهر جميع العمليات هنا مع إمكانية التعديل والحذف.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const student = students.find(s => s.id === item.studentId);
            const studentName = student?.name || item.studentName || 'طالب';
            const formattedDate = new Date(item.date).toLocaleDateString('ar-SA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800/80 hover:border-sky-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm transition-all gap-4"
              >
                {/* Left Points Badge & Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Points Pill */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    +{item.points}
                  </div>

                  {student && (
                    <div className="shrink-0 hidden sm:block">
                      <AnimeAvatar
                        avatarId={student.avatar}
                        photoUrl={student.photoUrl || student.photo}
                        cartoonPhotoUrl={student.cartoonPhotoUrl}
                        useCartoonAvatar={student.useCartoonAvatar}
                        studentName={student.name}
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Operation Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-800 dark:text-slate-100">
                        {item.skillName}
                      </span>
                      <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-100 dark:border-sky-900/60">
                        {studentName}
                      </span>
                    </div>

                    {item.reason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.reason}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 text-xs font-bold transition-colors cursor-pointer"
                    title="تعديل قيمة أو سبب النقاط"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => setDeletingItem(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                    title="حذف هذه العملية وخصم النقاط"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Point Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-sky-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-500" />
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm">
                  تعديل عملية النقاط
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Point Value */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  قيمة النقاط (+/-)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={editPoints}
                  onChange={(e) => setEditPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Skill Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المهارة / الإنجاز
                </label>
                <input
                  type="text"
                  required
                  value={editSkill}
                  onChange={(e) => setEditSkill(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  سبب النقاط / الملاحظة
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="مثال: إتقان الآيات 1-15 بدون أخطاء"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                ملاحظة: سيتم تحديث مجموع نقاط الطالب وترتيبه في لوحة المتصدرين تلقائياً.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>حفظ التعديل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-rose-900/50 text-center transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base mb-1">
              تأكيد حذف عملية النقاط
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              هل أنت متأكد من حذف عملية <span className="font-black text-slate-700 dark:text-slate-200">+{deletingItem.points} ({deletingItem.skillName})</span>؟
              <br />
              سيتم خصم النقاط من رصيد الطالب وتحديث ترتيبه فوراً.
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>نعم، حذف العملية</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

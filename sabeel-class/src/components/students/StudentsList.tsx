import React, { useState, useMemo } from 'react';
import { Search, Plus, Users, ArrowDownNarrowWide, Award } from 'lucide-react';
import { Student } from '../../types';
import { StudentCard } from './StudentCard';

interface StudentsListProps {
  students: Student[];
  onOpenAddStudent: () => void;
  onAddPoints: (student: Student) => void;
  onOpenProfile: (student: Student) => void;
  onOpenBookUnlock?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onOpenAddStudent,
  onAddPoints,
  onOpenProfile,
  onOpenBookUnlock,
  onEditStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWithBadgesOnly, setFilterWithBadgesOnly] = useState(false);

  // Sorted students by points descending
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  }, [students]);

  // Compute rank mapping
  const studentRankMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedStudents.forEach((student, index) => {
      map.set(student.id, index + 1);
    });
    return map;
  }, [sortedStudents]);

  // Filtered by search & badges
  const filteredStudents = useMemo(() => {
    return sortedStudents.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBadges = filterWithBadgesOnly ? (student.badges && student.badges.length > 0) : true;
      return matchesSearch && matchesBadges;
    });
  }, [sortedStudents, searchQuery, filterWithBadgesOnly]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="card-depth rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
              طلاب الحلقة
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-100 dark:border-sky-900/40">
              {students.length} طالب
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اضغط على أي طالب لعرض الخواص وإضافة النقاط
          </p>
        </div>

        <button
          onClick={onOpenAddStudent}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث باسم الطالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium w-full pl-4 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold"
          />
        </div>

        {/* Filter Badges Toggle */}
        <button
          onClick={() => setFilterWithBadgesOnly(!filterWithBadgesOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
            filterWithBadgesOnly
              ? 'bg-amber-500 text-white shadow-xs border border-amber-500'
              : 'card-depth text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الطلاب الحاصلون على أوسمة</span>
        </button>
      </div>

      {/* Cards Grid - Compact and Avatar Centered */}
      {filteredStudents.length === 0 ? (
        <div className="card-depth rounded-3xl text-center py-16 px-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 text-sky-500 border border-slate-900/[0.06] dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-3xl shadow-2xs">
            🎒
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base mb-1">
            {searchQuery ? 'لا يوجد طلاب يطابقون البحث' : 'لا يوجد طلاب في الحلقة حتى الآن'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mb-5">
            {searchQuery
              ? 'تأكد من كتابة الاسم بصورة صحيحة'
              : 'أضف طلاب حلقتك وابدأ تحفيزهم وتسجيل النقاط والأوسمة!'}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenAddStudent}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              + إضافة طالب جديد
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredStudents.map((student) => {
            const rank = studentRankMap.get(student.id) || 1;
            return (
              <StudentCard
                key={student.id}
                student={student}
                rank={rank}
                onAddPoints={onAddPoints}
                onOpenProfile={onOpenProfile}
                onOpenBookUnlock={onOpenBookUnlock}
                onEditStudent={onEditStudent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

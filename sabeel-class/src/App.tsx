import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { GenderSelectModal } from './pages/GenderSelectModal';
import { Header } from './components/common/Header';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentsList } from './components/students/StudentsList';
import { PointHistoryView } from './components/history/PointHistoryView';
import { SkillsManagement } from './components/skills/SkillsManagement';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { CertificatesView } from './components/certificates/CertificatesView';
import { AddStudentModal } from './components/students/AddStudentModal';
import { EditStudentModal } from './components/students/EditStudentModal';
import { AddPointsModal } from './components/skills/AddPointsModal';
import { AwardBadgeModal } from './components/badges/AwardBadgeModal';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { FlyingPointsOverlay, FlyingPointEvent } from './components/common/FlyingPointsOverlay';
import { SabeelLogo } from './components/common/SabeelLogo';
import {
  Student,
  Skill,
  Competition,
  ActiveTab
} from './types';
import {
  subscribeToTeacherStudents,
  getTeacherStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getTeacherSkills,
  addTeacherSkill,
  updateTeacherSkill,
  deleteTeacherSkill,
  awardPointsToStudent,
  awardBadgeToStudent,
  getTeacherCompetition,
  updateCompetitionTitle
} from './services/db';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { user, profile, loading, needsGenderSelection } = useAuth();
  // Default to students page as requested by user
  const [activeTab, setActiveTab] = useState<ActiveTab>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [flyingPointsEvent, setFlyingPointsEvent] = useState<FlyingPointEvent | null>(null);
  const [competition, setCompetition] = useState<Competition>({
    id: 'default_comp',
    title: 'مسابقة فرسان التلاوة والحفظ - ربيع الأول 1448 هـ',
    month: 'سبتمبر',
    year: 2026,
    teacherId: '',
    type: 'teacher'
  });

  // Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [selectedStudentForPoints, setSelectedStudentForPoints] = useState<Student | null>(null);
  const [selectedStudentForBadge, setSelectedStudentForBadge] = useState<Student | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load teacher students and skills
  useEffect(() => {
    if (!profile?.uid) return;
    const teacherId = profile.uid;

    // Subscribe to students in real-time
    const unsubscribe = subscribeToTeacherStudents(teacherId, (loaded) => {
      setStudents(loaded);
    });

    // Load skills
    getTeacherSkills(teacherId).then(setSkills);

    // Load competition
    getTeacherCompetition(teacherId).then((comp) => {
      setCompetition(comp);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  // If loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50/50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
        <SabeelLogo size="lg" />
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جاري الدخول إلى <span dir="ltr" className="inline-block">Sabeel Class</span>...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  // If logged in but gender not set yet, show selection modal
  if (needsGenderSelection || !profile?.gender) {
    return <GenderSelectModal />;
  }

  // Refresh students helper
  const handlePointsUpdated = async () => {
    if (!profile?.uid) return;
    try {
      const freshStudents = await getTeacherStudents(profile.uid);
      setStudents(freshStudents);
      showToast('تم تحديث النقاط وترتيب الطلاب بنجاح ✨');
    } catch (err) {
      console.warn('Could not manually refresh students list:', err);
    }
  };

  // Handlers
  const handleAddStudent = async (studentData: {
    name: string;
    photo?: string;
    photoUrl?: string;
    cartoonPhotoUrl?: string;
    useCartoonAvatar?: boolean;
    avatar?: string;
  }) => {
    if (!profile?.uid) return;
    const created = await addStudent(profile.uid, studentData);
    setStudents((prev) => [created, ...prev]);
    showToast(`تمت إضافة الطالب ${created.name} بنجاح ✨`);
  };

  const handleUpdateStudent = async (
    studentId: string,
    updates: Partial<Omit<Student, 'id' | 'teacherId' | 'createdAt'>>
  ) => {
    if (!profile?.uid) return;
    await updateStudent(studentId, profile.uid, updates);
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
    );
    showToast('تم تحديث بيانات وصورة الطالب بنجاح ✨');
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!profile?.uid) return;
    await deleteStudent(studentId, profile.uid);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    showToast('تم حذف الطالب من الحلقة.');
  };

  const handleAwardPoints = async (
    studentId: string,
    skillName: string,
    points: number,
    reason?: string
  ) => {
    if (!profile?.uid) return;
    await awardPointsToStudent({
      studentId,
      teacherId: profile.uid,
      skillName,
      points,
      reason
    });

    // Update state locally
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, totalPoints: (s.totalPoints || 0) + points } : s))
    );

    const targetStudent = students.find((s) => s.id === studentId);
    showToast(`تمت إضافة +${points} نقاط للطالب ${targetStudent?.name || ''} ⭐`);
  };

  const handleAwardBadge = async (studentId: string, badgeId: string, reason?: string) => {
    if (!profile?.uid) return;
    await awardBadgeToStudent({
      studentId,
      badgeId,
      teacherId: profile.uid,
      reason
    });

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, badges: Array.from(new Set([...(s.badges || []), badgeId])) }
          : s
      )
    );

    showToast(`تم منح الوسام للطالب بنجاح! 🏆`);
  };

  const handleAddSkill = async (name: string, points: number, animation?: string) => {
    if (!profile?.uid) return;
    const created = await addTeacherSkill(profile.uid, name, points, animation);
    setSkills((prev) => [...prev, created]);
    showToast(`تمت إضافة مهارة "${name}" (${points} نقاط) بنجاح! 🎬`);
  };

  const handleUpdateSkill = async (id: string, name: string, points: number, animation?: string) => {
    if (!profile?.uid) return;
    await updateTeacherSkill(id, profile.uid, name, points, animation);
    setSkills((prev) => prev.map((sk) => (sk.id === id ? { ...sk, name, points, animation: animation || sk.animation } : sk)));
    showToast('تم حفظ تعديل المهارة والأنيميشن.');
  };

  const handlePreviewSkillAnimation = (animationId: string) => {
    setFlyingPointsEvent({
      points: 10,
      studentName: 'معاينة تجريبية',
      skillName: 'معاينة تأثير الأنيميشن المختار',
      animation: animationId,
      studentAvatar: 'avatar_1'
    });
  };

  const handleDeleteSkill = async (id: string) => {
    if (!profile?.uid) return;
    await deleteTeacherSkill(id, profile.uid);
    setSkills((prev) => prev.filter((sk) => sk.id !== id));
    showToast('تم حذف المهارة.');
  };

  const handleUpdateCompetitionTitle = async (title: string) => {
    if (!profile?.uid) return;
    await updateCompetitionTitle(profile.uid, title);
    setCompetition((prev) => ({ ...prev, title }));
    showToast('تم تحديث اسم التحدي الشهري.');
  };

  // Seed sample students helper if empty
  const handleSeedSampleStudents = async () => {
    if (!profile?.uid) return;
    const samples = [
      { name: 'محمد أحمد الصالح', avatar: 'avatar_1', points: 185 },
      { name: 'عبد الرحمن خالد', avatar: 'avatar_7', points: 210 },
      { name: 'عمر بن الخطاب الشامي', avatar: 'avatar_3', points: 140 },
      { name: 'يوسف إبراهيم', avatar: 'avatar_5', points: 95 }
    ];

    for (const sample of samples) {
      const created = await addStudent(profile.uid, {
        name: sample.name,
        avatar: sample.avatar,
      });
      if (sample.points > 0) {
        await awardPointsToStudent({
          studentId: created.id,
          teacherId: profile.uid,
          skillName: 'حفظ جديد',
          points: sample.points,
          reason: 'انطلاقة متميزة'
        });
      }
    }
    showToast('تم إضافة نموذج طلاب تجريبي للحلقة بنجاح!');
  };

  // Calculate ranks
  const sorted = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const getRank = (stId: string) => {
    const idx = sorted.findIndex((s) => s.id === stId);
    return idx === -1 ? 1 : idx + 1;
  };

  return (
    <div className="min-h-screen bg-sky-50/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl text-xs font-bold border border-slate-800 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentsCount={students.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Sample students seeding helper banner if list is completely empty */}
        {students.length === 0 && activeTab !== 'skills' && (
          <div className="mb-6 p-4 rounded-2xl bg-sky-100/70 dark:bg-sky-950/40 border border-sky-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-right transition-colors">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  هل ترغب في إضافة بيانات طلاب تجريبية لمعاينة النظام فوراً؟
                </p>
                <p className="text-[11px] text-sky-700 dark:text-sky-400">
                  يمكنك إضافة 4 طلاب افتراضيين مع نقاط وأوسمة لتجربة المتصدرين والشهادات
                </p>
              </div>
            </div>
            <button
              onClick={handleSeedSampleStudents}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
            >
              + إضافة طلاب تجريبيين
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            students={students}
            competition={competition}
            onUpdateCompetitionTitle={handleUpdateCompetitionTitle}
            setActiveTab={setActiveTab}
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onOpenAddPoints={(s) => setSelectedStudentForPoints(s)}
            onSelectStudent={(s) => setSelectedStudentForProfile(s)}
          />
        )}

        {activeTab === 'students' && (
          <StudentsList
            students={students}
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onAddPoints={(s) => setSelectedStudentForPoints(s)}
            onOpenProfile={(s) => setSelectedStudentForProfile(s)}
            onEditStudent={(s) => setSelectedStudentForEdit(s)}
          />
        )}

        {activeTab === 'history' && (
          <PointHistoryView
            teacherId={profile?.uid || ''}
            students={students}
            onPointsUpdated={handlePointsUpdated}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            students={students}
            onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            onAddPoints={(s) => setSelectedStudentForPoints(s)}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsManagement
            skills={skills}
            onAddSkill={handleAddSkill}
            onUpdateSkill={handleUpdateSkill}
            onDeleteSkill={handleDeleteSkill}
            onPreviewAnimation={handlePreviewSkillAnimation}
          />
        )}

        {activeTab === 'certificates' && (
          <CertificatesView
            students={students}
            competition={competition}
            preselectedStudent={selectedStudentForProfile}
          />
        )}
      </main>

      {/* Global Modals */}
      {/* 1. Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
        teacherId={profile?.uid || ''}
      />

      {/* 2. Edit Student Modal */}
      <EditStudentModal
        isOpen={!!selectedStudentForEdit}
        student={selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        onUpdateStudent={handleUpdateStudent}
        teacherId={profile?.uid || ''}
      />

      {/* 3. Add Points Modal with animation triggering */}
      <AddPointsModal
        student={selectedStudentForPoints}
        isOpen={!!selectedStudentForPoints}
        onClose={() => setSelectedStudentForPoints(null)}
        skills={skills}
        onAwardPoints={handleAwardPoints}
        onTriggerFlyingPoints={(ev) => setFlyingPointsEvent(ev)}
      />

      {/* 4. Award Badge Modal */}
      <AwardBadgeModal
        student={selectedStudentForBadge}
        isOpen={!!selectedStudentForBadge}
        onClose={() => setSelectedStudentForBadge(null)}
        onAwardBadge={handleAwardBadge}
      />

      {/* 5. Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudentForProfile}
        rank={selectedStudentForProfile ? getRank(selectedStudentForProfile.id) : 1}
        isOpen={!!selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        onOpenAddPoints={(s) => {
          setSelectedStudentForPoints(s);
        }}
        onOpenAwardBadge={(s) => {
          setSelectedStudentForBadge(s);
        }}
        onOpenCertificate={(s) => {
          setSelectedStudentForProfile(null);
          setActiveTab('certificates');
        }}
        onDeleteStudent={handleDeleteStudent}
        onEditStudent={(s) => setSelectedStudentForEdit(s)}
        onPointsModified={handlePointsUpdated}
        teacherId={profile?.uid || ''}
      />

      {/* Full-Screen Spectacular Anime Skill Points Overlay */}
      <FlyingPointsOverlay
        event={flyingPointsEvent}
        onDone={() => setFlyingPointsEvent(null)}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-sky-100/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span>نظام Sabeel Class الأكاديمي الداخلي</span>
          <span>•</span>
          <span>أكاديمية سبيل للتعليم</span>
          <span>•</span>
          <span>2026</span>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Sparkles,
  Award,
  LogOut,
  History,
  Settings,
  X,
  UserCheck,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SabeelLogo } from './SabeelLogo';
import { ThemeToggle } from './ThemeToggle';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import { soundManager } from '../../utils/sound';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  studentsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  studentsCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { profile, logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.isEnabled());
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    color: string;
  }> = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, color: 'text-sky-500' },
    { id: 'students', label: 'الطلاب', icon: Users, badge: studentsCount, color: 'text-sky-500' },
    { id: 'skills', label: 'المهارات', icon: Sparkles, color: 'text-purple-500' },
    { id: 'leaderboard', label: 'المتصدرون', icon: Trophy, color: 'text-amber-500' },
    { id: 'badges', label: 'الأوسمة', icon: Award, color: 'text-rose-500' },
    { id: 'certificates', label: 'الشهادات', icon: Award, color: 'text-emerald-500' },
    { id: 'history', label: 'سجل النقاط', icon: History, color: 'text-sky-500' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-slate-500' },
  ];

  const handleNav = (tab: ActiveTab) => {
    soundManager.playClickPop();
    setActiveTab(tab);
    onCloseMobile();
  };

  const handleToggleSound = () => {
    const next = soundManager.toggleSound();
    setSoundEnabled(next);
  };

  const isTeacherMale = profile?.gender === 'male';
  const roleLabel = isTeacherMale ? 'مُعلم' : 'مُعلمة';

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l border-slate-900/[0.07] dark:border-slate-800/80 shadow-[1px_0_3px_0_rgba(15,23,42,0.02)] select-none">
      
      {/* Top Section: Logo & Brand */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => handleNav('dashboard')}
            className="text-right focus:outline-none cursor-pointer group transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <SabeelLogo size="md" />
          </button>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20 font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls & Teacher Profile */}
      <div className="space-y-3 pt-4 border-t border-slate-900/[0.08] dark:border-slate-800">
        
        {/* Quick Toggles: Sound & Theme */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-900/[0.06] dark:border-slate-700/60">
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'كتم الأصوات' : 'تشغيل الأصوات التفاعلية'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-[11px]">{soundEnabled ? 'الأصوات نشطة' : 'صامت'}</span>
          </button>

          <ThemeToggle />
        </div>

        {/* Teacher Info Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-900/[0.08] dark:border-slate-700 shadow-2xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                {profile?.name || 'معلم سبيل'}
              </p>
              <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                {roleLabel} • أكاديمية سبيل
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClickPop();
              setShowLogoutConfirm(true);
            }}
            title="تسجيل الخروج"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

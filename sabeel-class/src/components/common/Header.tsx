import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Sparkles,
  Award,
  LogOut,
  Menu,
  X,
  UserCheck,
  History
} from 'lucide-react';
import { SabeelLogo } from './SabeelLogo';
import { ThemeToggle } from './ThemeToggle';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import { soundManager } from '../../utils/sound';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  studentsCount: number;
  onOpenCharacterEncyclopedia?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  studentsCount,
  onOpenCharacterEncyclopedia
}) => {
  const { profile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'students' as ActiveTab, label: 'الطلاب', icon: Users, badge: studentsCount },
    { id: 'history' as ActiveTab, label: 'سجل النقاط', icon: History },
    { id: 'leaderboard' as ActiveTab, label: 'المتصدرين', icon: Trophy },
    { id: 'skills' as ActiveTab, label: 'المهارات', icon: Sparkles },
    { id: 'certificates' as ActiveTab, label: 'الشهادات', icon: Award },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const isTeacherMale = profile?.gender === 'male';
  const roleLabel = isTeacherMale ? 'مُعلم' : 'مُعلمة';

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-900/[0.07] dark:border-slate-800/80 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Right Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-right focus:outline-none cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <SabeelLogo size="md" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-900/[0.06] dark:border-slate-700/60 transition-colors">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-[0_1px_3px_0_rgba(15,23,42,0.08)] border border-slate-900/[0.06] dark:border-slate-700 font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Left Teacher User Action & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            {onOpenCharacterEncyclopedia && (
              <button
                onClick={() => {
                  soundManager.playClickPop();
                  onOpenCharacterEncyclopedia();
                }}
                title="موسوعة الـ 50 شخصية ثلاثية الأبعاد"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black cursor-pointer transition-colors shadow-2xs active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>موسوعة الشخصيات (50)</span>
              </button>
            )}

            {/* Dark/Light mode toggle */}
            <ThemeToggle />

            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-900/[0.08] dark:border-slate-700/80 shadow-2xs text-right transition-colors">
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-slate-700 border border-sky-100 dark:border-slate-600 flex items-center justify-center text-sky-600 dark:text-sky-300 font-bold text-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {profile?.name || 'معلم سبيل'}
                </span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                  {roleLabel} • أكاديمية سبيل
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClickPop();
                setShowLogoutConfirm(true);
              }}
              title="تسجيل الخروج"
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-transparent hover:border-rose-200/60 dark:hover:border-rose-900/40 cursor-pointer active:scale-95"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile controls: Theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-900/[0.08] cursor-pointer active:scale-95"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-900/[0.08] dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 shadow-lg transition-colors">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-900/[0.08] dark:border-slate-700 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-slate-700 flex items-center justify-center text-sky-600 dark:text-sky-300 font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.name}</p>
                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{roleLabel} • أكاديمية سبيل</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClickPop();
                setIsMobileMenuOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="text-xs text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              خروج
            </button>
          </div>

          {onOpenCharacterEncyclopedia && (
            <button
              onClick={() => {
                soundManager.playClickPop();
                setIsMobileMenuOpen(false);
                onOpenCharacterEncyclopedia();
              }}
              className="w-full mb-3 flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-black"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>موسوعة الـ 50 شخصية ثلاثية الأبعاد</span>
              </span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                استعراض ✨
              </span>
            </button>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sky-500 dark:text-sky-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
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
    </header>
  );
};

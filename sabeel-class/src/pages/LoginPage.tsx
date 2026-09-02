import React, { useState, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Award,
  Users,
  Shield,
  AlertTriangle,
  Copy,
  Check,
  Lock,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SabeelLogo } from '../components/common/SabeelLogo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/sound';
import { TeacherGender } from '../types';

export const LoginPage: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    authError,
    clearAuthError
  } = useAuth();

  const [activeMode, setActiveMode] = useState<'google' | 'email'>('google');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const isActionPending = useRef(false);

  // Email form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherGender, setTeacherGender] = useState<TeacherGender>('male');

  const isUnauthorizedDomain = authError?.startsWith('auth/unauthorized-domain:');
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const domainToAuthorize = isUnauthorizedDomain
    ? authError.replace('auth/unauthorized-domain:', '') || currentHost
    : currentHost;

  const handleCopyDomain = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      soundManager.playClickPop();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || isActionPending.current) return;
    isActionPending.current = true;
    setLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setLoading(false);
      isActionPending.current = false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isActionPending.current) return;
    if (!email.trim() || !password.trim()) return;

    isActionPending.current = true;
    soundManager.playClickPop();
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(
          email.trim(),
          password.trim(),
          teacherName.trim() || (teacherGender === 'male' ? 'أستاذ سبيل' : 'أستاذة سبيل'),
          teacherGender
        );
      } else {
        await loginWithEmail(email.trim(), password.trim());
      }
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
      isActionPending.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/60 via-sky-50/40 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-5 left-5 z-20">
        <ThemeToggle />
      </div>

      {/* Decorative background light accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/40 dark:bg-sky-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-sky-300/20 dark:bg-sky-950/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-sky-900/5 dark:shadow-black/40 border border-sky-100 dark:border-slate-800 p-6 sm:p-9 relative transition-colors">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <SabeelLogo size="lg" className="mb-3" />
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 mb-2.5 border border-sky-200/60 dark:border-sky-800/60">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            النظام الداخلي للمعلمين والمسابقات
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
            مرحباً بكم في <span dir="ltr" className="inline-block text-sky-600 dark:text-sky-400">Sabeel Class</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            منصة تحفيز ومتابعة طلاب أكاديمية سبيل عبر مسابقات النقاط والافتارات الإسلامية التاريخية
          </p>
        </div>

        {/* Feature badges list */}
        <div className="bg-sky-50/70 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700/60 rounded-2xl p-3.5 mb-6 space-y-2 text-right transition-colors">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
            <span>شخصيات إسلامية تاريخية وتقنيات أنيميشن للمهارات</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>أوسمة مخصصة، لوحة صدارة أولمبية، وشهادات تفوق PDF</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>دخول آمن عبر حساب Google أو البريد الإلكتروني</span>
          </div>
        </div>

        {/* Unauthorized Domain Guide Card */}
        {isUnauthorizedDomain && (
          <div className="mb-6 p-4 bg-amber-50/95 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl text-right space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                إعداد Firebase OAuth
              </span>
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-black text-sm">
                <span>تنبيه تصريح نطاق التطبيق</span>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
            </div>

            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              لحماية حسابات Google، يطلب Firebase تسجيل نطاق التشغيل في قائمة <strong>Authorized Domains</strong> داخل لوحة التحكم. يمكنك أيضاً استخدام تبويب <strong>البريد الإلكتروني</strong> لتسجيل الدخول فوراً.
            </p>

            {/* Current Domain Box with Copy Button */}
            <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyDomain(domainToAuthorize)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النطاق'}</span>
              </button>
              <code className="text-[11px] font-mono text-slate-800 dark:text-slate-200 truncate select-all dir-ltr text-left font-bold">
                {domainToAuthorize}
              </code>
            </div>

            {/* Steps Guide */}
            <details className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/30 p-2.5 rounded-xl">
              <summary className="cursor-pointer font-bold text-amber-950 dark:text-amber-100 flex items-center justify-between">
                <span>خطوات إضافة النطاق في Firebase Console:</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </summary>
              <ol className="list-decimal list-inside space-y-1 mt-2 leading-relaxed">
                <li>افتح <strong>Firebase Console</strong> واذهب لمشروع <strong>sabeel-class</strong></li>
                <li>توجّه إلى <strong>Authentication</strong> ثم تبويب <strong>Settings</strong></li>
                <li>اختر <strong>Authorized domains</strong> واضغط <strong>Add domain</strong></li>
                <li>ألصق النطاق المنسوخ أعلاه واضغط <strong>Save</strong></li>
              </ol>
              <a
                href="https://console.firebase.google.com/project/sabeel-class/authentication/settings"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 font-bold mt-2 hover:underline"
              >
                <span>فتح صفحة إعدادات Firebase مباشرة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </details>
          </div>
        )}

        {/* Other Auth Errors */}
        {authError && !isUnauthorizedDomain && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 leading-relaxed text-right flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{authError}</span>
              <button
                type="button"
                onClick={clearAuthError}
                className="block text-[11px] text-rose-600 dark:text-rose-400 font-bold underline mt-1 cursor-pointer"
              >
                إغلاق التنبيه
              </button>
            </div>
          </div>
        )}

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-6 text-xs font-bold transition-colors">
          <button
            type="button"
            onClick={() => { setActiveMode('google'); clearAuthError(); }}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'google'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>حساب Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('email'); clearAuthError(); }}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'email'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>البريد الإلكتروني</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE LOGIN */}
        {activeMode === 'google' && (
          <div className="space-y-4">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                <Lock className="w-3.5 h-3.5 text-sky-500" />
                الدخول عبر حساب Google المعتمد للأكاديمية
              </span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3.5 py-4 px-6 bg-white dark:bg-slate-800 hover:bg-sky-50/50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 shadow-md shadow-sky-900/5 transition-all text-sm active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {/* Google Color Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'جارٍ تسجيل الدخول بواسطة Google...' : 'تسجيل الدخول بواسطة Google'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: EMAIL & PASSWORD */}
        {activeMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-right">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {isRegistering ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'معلم جديد؟ إنشاء حساب'}
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isRegistering ? 'إنشاء حساب معلم جديد' : 'تسجيل الدخول بالبريد'}
              </span>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكامل:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="الأستاذ / الأستاذة..."
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-right"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الصفة:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTeacherGender('male')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        teacherGender === 'male'
                          ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      👨‍🏫 معلّم (بنين)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherGender('female')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        teacherGender === 'female'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      👩‍🏫 معلّمة (فتيات)
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="teacher@sabeel.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-left"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-left"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>{loading ? 'جارٍ التحقق...' : isRegistering ? 'إنشاء الحساب والدخول' : 'تسجيل الدخول'}</span>
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center pt-5 border-t border-sky-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            نظام Sabeel Class • خاص بهيئة التدريس بأكاديمية سبيل
          </p>
        </div>
      </div>
    </div>
  );
};

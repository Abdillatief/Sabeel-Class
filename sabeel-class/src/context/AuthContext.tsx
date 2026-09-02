import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { UserProfile, TeacherGender } from '../types';
import { getUserProfile, saveUserProfile } from '../services/db';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  needsGenderSelection: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, gender: TeacherGender) => Promise<void>;
  loginAsDemoTeacher: (gender: TeacherGender, name?: string) => Promise<void>;
  updateTeacherGender: (gender: TeacherGender) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsGenderSelection, setNeedsGenderSelection] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if demo user is stored in session
    const demoStored = localStorage.getItem('sabeel_active_demo_user');
    if (demoStored) {
      try {
        const p: UserProfile = JSON.parse(demoStored);
        setProfile(p);
        setUser({
          uid: p.uid,
          displayName: p.name,
          email: p.email,
          emailVerified: true,
          isAnonymous: false,
        } as unknown as FirebaseUser);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('sabeel_active_demo_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setUser(fbUser);
        try {
          const userProf = await getUserProfile(fbUser.uid);
          if (userProf && userProf.gender) {
            setProfile(userProf);
            setNeedsGenderSelection(false);
          } else {
            // Needs to choose معلم or معلمة
            setNeedsGenderSelection(true);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setNeedsGenderSelection(true);
        }
      } else {
        setUser(null);
        setProfile(null);
        setNeedsGenderSelection(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isLoggingInRef = React.useRef(false);

  const loginWithGoogle = async () => {
    if (isLoggingInRef.current) return;
    isLoggingInRef.current = true;
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setUser(fbUser);

      const existingProfile = await getUserProfile(fbUser.uid);
      if (existingProfile && existingProfile.gender) {
        setProfile(existingProfile);
        setNeedsGenderSelection(false);
      } else {
        setNeedsGenderSelection(true);
      }
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : '';
        setAuthError(`auth/unauthorized-domain:${domain}`);
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة (Popups) من إعدادات المتصفح ثم إعادة المحاولة.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setAuthError('تم إغلاق نافذة تسجيل الدخول. يمكنك المحاولة مجدداً بالضغط على زر تسجيل الدخول.');
      } else {
        setAuthError(err.message || 'تعذر تسجيل الدخول بواسطة Google. يرجى التحقق من اتصالك والمحاولة مجدداً.');
      }
    } finally {
      isLoggingInRef.current = false;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = result.user;
      setUser(fbUser);
      const existingProfile = await getUserProfile(fbUser.uid);
      if (existingProfile && existingProfile.gender) {
        setProfile(existingProfile);
        setNeedsGenderSelection(false);
      } else {
        setNeedsGenderSelection(true);
      }
    } catch (err: any) {
      console.warn('Email sign-in error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('صيغة البريد الإلكتروني غير صحيحة.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('تم تجاوز عدد المحاولات المسموح بها، يرجى الانتظار قليلاً.');
      } else {
        setAuthError(err.message || 'تعذر تسجيل الدخول بالبريد.');
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, gender: TeacherGender) => {
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = result.user;
      await updateProfile(fbUser, { displayName: name.trim() });
      setUser(fbUser);

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        name: name.trim() || (gender === 'male' ? 'معلم سبيل' : 'معلمة سبيل'),
        email: fbUser.email || email.trim(),
        role: 'teacher',
        gender,
        academy: 'Sabeel Academy',
        createdAt: new Date().toISOString()
      };

      await saveUserProfile(newProfile);
      setProfile(newProfile);
      setNeedsGenderSelection(false);
    } catch (err: any) {
      console.warn('Email registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول بدلاً من ذلك.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('كلمة المرور ضعيفة، يجب أن لا تقل عن 6 خانات.');
      } else {
        setAuthError(err.message || 'تعذر إنشاء الحساب بالبريد.');
      }
      throw err;
    }
  };

  const loginAsDemoTeacher = async (gender: TeacherGender, customName?: string) => {
    setAuthError(null);
    const isMale = gender === 'male';
    const demoName = customName || (isMale ? 'الأستاذ أحمد الصالح' : 'الأستاذة فاطمة النور');
    const demoUid = isMale ? 'demo_teacher_male' : 'demo_teacher_female';
    const demoEmail = isMale ? 'ahmed.teacher@sabeel.edu' : 'fatima.teacher@sabeel.edu';

    const newProfile: UserProfile = {
      uid: demoUid,
      name: demoName,
      email: demoEmail,
      role: 'teacher',
      gender,
      academy: 'Sabeel Academy',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('sabeel_active_demo_user', JSON.stringify(newProfile));
    setProfile(newProfile);
    setUser({
      uid: demoUid,
      displayName: demoName,
      email: demoEmail,
      emailVerified: true,
      isAnonymous: false,
    } as unknown as FirebaseUser);
    setNeedsGenderSelection(false);
  };

  const updateTeacherGender = async (gender: TeacherGender) => {
    if (!user) return;

    const newProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || (gender === 'male' ? 'معلم سبيل' : 'معلمة سبيل'),
      email: user.email || `${user.uid}@sabeel.edu`,
      role: 'teacher',
      gender,
      academy: 'Sabeel Academy',
      createdAt: new Date().toISOString()
    };

    await saveUserProfile(newProfile);
    setProfile(newProfile);
    setNeedsGenderSelection(false);
  };

  const logout = async () => {
    localStorage.removeItem('sabeel_active_demo_user');
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    setProfile(null);
    setNeedsGenderSelection(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsGenderSelection,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemoTeacher,
        updateTeacherGender,
        logout,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

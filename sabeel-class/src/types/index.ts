export type TeacherGender = 'male' | 'female';
export type UserRole = 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  gender: TeacherGender;
  academy: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  teacherId: string;
  photo?: string;
  photoUrl?: string;
  cartoonPhotoUrl?: string;
  useCartoonAvatar?: boolean;
  avatar?: string;
  totalPoints: number;
  badges: string[]; // badge IDs or names
  unlockedCharacterId?: string;
  isBookOpened?: boolean;
  characterUnlockedAt?: string;
  characterRarity?: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: string;
}

export type SkillAnimationType =
  | 'titan_lightning'
  | 'rasengan'
  | 'super_saiyan'
  | 'gear_joy'
  | 'flame_slash'
  | 'cosmic_meteors'
  | 'diamond_shield'
  | 'golden_trophy';

export interface Skill {
  id: string;
  name: string;
  points: number;
  animation?: SkillAnimationType | string;
  icon?: string;
  teacherId: string;
  createdAt: string;
}

export interface PointHistoryItem {
  id: string;
  studentId: string;
  studentName?: string;
  teacherId: string;
  skillName: string;
  points: number;
  reason?: string;
  date: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon identifier or emoji
  colorClass: string;
  bgClass: string;
}

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  teacherId: string;
  reason?: string;
  date: string;
}

export interface Competition {
  id: string;
  title: string;
  month: string;
  year: number;
  teacherId: string;
  type: 'teacher' | 'academy';
}

export interface CertificateItem {
  id: string;
  studentId: string;
  studentName?: string;
  rank: string;
  month: string;
  year: number;
  points: number;
  pdfUrl?: string;
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'students' | 'skills' | 'leaderboard' | 'badges' | 'certificates' | 'history' | 'settings';

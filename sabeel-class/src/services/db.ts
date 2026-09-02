import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  UserProfile,
  Student,
  Skill,
  PointHistoryItem,
  StudentBadge,
  Competition,
  CertificateItem
} from '../types';
import { DEFAULT_SKILLS } from '../utils/constants';

// Local storage key for fallback / offline sync
const FALLBACK_STUDENTS_KEY = 'sabeel_local_students_';
const FALLBACK_SKILLS_KEY = 'sabeel_local_skills_';
const FALLBACK_HISTORY_KEY = 'sabeel_local_history_';
const FALLBACK_BADGES_KEY = 'sabeel_local_badges_';

// ----------------- USERS -----------------
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    // Check localStorage fallback
    const saved = localStorage.getItem(`sabeel_user_${uid}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch user profile from Firestore, checking local storage:', error);
    const saved = localStorage.getItem(`sabeel_user_${uid}`);
    return saved ? JSON.parse(saved) : null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  // Save locally first for instant response
  localStorage.setItem(`sabeel_user_${profile.uid}`, JSON.stringify(profile));
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (error) {
    console.warn('Firestore write warning (saving profile):', error);
  }
}

// ----------------- STUDENTS -----------------
export function subscribeToTeacherStudents(
  teacherId: string,
  onSuccess: (students: Student[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'students';
  try {
    const q = query(
      collection(db, path),
      where('teacherId', '==', teacherId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const students: Student[] = [];
        snapshot.forEach((doc) => {
          students.push({ id: doc.id, ...(doc.data() as Omit<Student, 'id'>) });
        });
        if (students.length === 0 && teacherId.startsWith('demo_')) {
          const demoList = getLocalStudents(teacherId);
          onSuccess(demoList);
          return;
        }
        // Sort descending by points
        students.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(students));
        onSuccess(students);
      },
      (error) => {
        console.warn('Students listener fallback to local cache:', error);
        const local = getLocalStudents(teacherId);
        onSuccess(local);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    const local = getLocalStudents(teacherId);
    onSuccess(local);
    return () => {};
  }
}

export async function getTeacherStudents(teacherId: string): Promise<Student[]> {
  try {
    const q = query(
      collection(db, 'students'),
      where('teacherId', '==', teacherId)
    );
    const snapshot = await getDocs(q);
    const students: Student[] = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...(doc.data() as Omit<Student, 'id'>) });
    });
    if (students.length > 0) {
      localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(students));
      return students;
    }
  } catch (err) {
    console.warn('Error fetching students from Firestore, using local cache:', err);
  }
  return getLocalStudents(teacherId);
}

export async function addStudent(
  teacherId: string,
  studentData: {
    name: string;
    photo?: string;
    photoUrl?: string;
    cartoonPhotoUrl?: string;
    useCartoonAvatar?: boolean;
    avatar?: string;
  }
): Promise<Student> {
  const path = 'students';
  const effectivePhotoUrl = studentData.photoUrl || studentData.photo || '';
  const effectiveCartoonUrl = studentData.cartoonPhotoUrl || '';
  const effectiveUseCartoon = studentData.useCartoonAvatar ?? !!effectiveCartoonUrl;

  const newStudent: Omit<Student, 'id'> = {
    name: studentData.name.trim(),
    teacherId,
    photo: effectivePhotoUrl,
    photoUrl: effectivePhotoUrl,
    cartoonPhotoUrl: effectiveCartoonUrl,
    useCartoonAvatar: effectiveUseCartoon,
    avatar: studentData.avatar || 'avatar_1',
    totalPoints: 0,
    badges: [],
    isBookOpened: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, path), newStudent);
    const created = { id: docRef.id, ...newStudent };
    
    // Update local cache
    const current = getLocalStudents(teacherId);
    current.push(created);
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(current));
    
    return created;
  } catch (error) {
    console.warn('Using local storage for added student:', error);
    const localId = 'student_' + Date.now();
    const created = { id: localId, ...newStudent };
    const current = getLocalStudents(teacherId);
    current.push(created);
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(current));
    return created;
  }
}

export async function updateStudent(
  studentId: string,
  teacherId: string,
  updates: Partial<Omit<Student, 'id' | 'teacherId' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'students', studentId), updates);
  } catch (error) {
    console.warn('Updating student locally:', error);
  }
  // Also update local cache
  const current = getLocalStudents(teacherId);
  const idx = current.findIndex(s => s.id === studentId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(current));
  }
}

export async function deleteStudent(studentId: string, teacherId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    console.warn('Deleting student locally:', error);
  }
  const current = getLocalStudents(teacherId).filter(s => s.id !== studentId);
  localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(current));
}

function getInitialDemoStudents(teacherId: string): Student[] {
  const isMale = teacherId.includes('male');
  if (isMale) {
    return [
      {
        id: 'demo_s1',
        name: 'عبدالرحمن بن سعود',
        teacherId,
        avatar: 'avatar_1',
        unlockedCharacterId: 'char_quran_hafid',
        characterRarity: 'legendary',
        isBookOpened: true,
        totalPoints: 165,
        badges: ['hafiz_distinct', 'star_revision'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s2',
        name: 'عمر الفاروق الدوسري',
        teacherId,
        avatar: 'avatar_2',
        unlockedCharacterId: 'char_knight_badr',
        characterRarity: 'epic',
        isBookOpened: true,
        totalPoints: 130,
        badges: ['commitment_hero'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s3',
        name: 'يوسف بن إبراهيم',
        teacherId,
        avatar: 'avatar_3',
        unlockedCharacterId: 'char_quran_tilawa',
        characterRarity: 'rare',
        isBookOpened: true,
        totalPoints: 110,
        badges: ['star_manners'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s4',
        name: 'خالد بن الوليد النجار',
        teacherId,
        avatar: 'avatar_4',
        isBookOpened: false,
        totalPoints: 50, // Ready to open!
        badges: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s5',
        name: 'زيد بن حارثة العلي',
        teacherId,
        avatar: 'avatar_5',
        isBookOpened: false,
        totalPoints: 37, // In progress book (37 / 50)
        badges: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s6',
        name: 'أنس بن مالك الصغير',
        teacherId,
        avatar: 'avatar_1',
        isBookOpened: false,
        totalPoints: 15, // Early stage book (15 / 50)
        badges: [],
        createdAt: new Date().toISOString()
      }
    ];
  } else {
    return [
      {
        id: 'demo_s1_f',
        name: 'سارة بنت عبدالعزيز',
        teacherId,
        avatar: 'avatar_6',
        unlockedCharacterId: 'char_quran_hafid',
        characterRarity: 'legendary',
        isBookOpened: true,
        totalPoints: 170,
        badges: ['hafiz_distinct', 'star_revision'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s2_f',
        name: 'مريم أحمد الشريف',
        teacherId,
        avatar: 'avatar_7',
        unlockedCharacterId: 'char_scholar_noor',
        characterRarity: 'epic',
        isBookOpened: true,
        totalPoints: 140,
        badges: ['commitment_hero'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s3_f',
        name: 'عائشة الصالح',
        teacherId,
        avatar: 'avatar_8',
        unlockedCharacterId: 'char_nature_dawood',
        characterRarity: 'rare',
        isBookOpened: true,
        totalPoints: 115,
        badges: ['star_manners'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s4_f',
        name: 'نور الهدى الحربي',
        teacherId,
        avatar: 'avatar_1',
        isBookOpened: false,
        totalPoints: 50, // Ready to open!
        badges: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s5_f',
        name: 'فاطمة الزهراء العتيبي',
        teacherId,
        avatar: 'avatar_2',
        isBookOpened: false,
        totalPoints: 42, // In progress (42 / 50)
        badges: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_s6_f',
        name: 'خديجة بنت خويلد الصغيرة',
        teacherId,
        avatar: 'avatar_6',
        isBookOpened: false,
        totalPoints: 20, // Early stage book (20 / 50)
        badges: [],
        createdAt: new Date().toISOString()
      }
    ];
  }
}

function getLocalStudents(teacherId: string): Student[] {
  const cached = localStorage.getItem(FALLBACK_STUDENTS_KEY + teacherId);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
  }

  // Seed demo students if demo teacher
  if (teacherId.startsWith('demo_')) {
    const demoList = getInitialDemoStudents(teacherId);
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(demoList));
    return demoList;
  }

  return [];
}

// ----------------- SKILLS -----------------
export async function getTeacherSkills(teacherId: string): Promise<Skill[]> {
  const path = 'skills';
  try {
    const q = query(
      collection(db, path),
      where('teacherId', '==', teacherId)
    );
    const snap = await getDocs(q);
    const list: Skill[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<Skill, 'id'>) });
    });

    if (list.length === 0) {
      // Seed default skills
      return await seedDefaultSkills(teacherId);
    }
    localStorage.setItem(FALLBACK_SKILLS_KEY + teacherId, JSON.stringify(list));
    return list;
  } catch (error) {
    console.warn('Fallback fetching skills from local storage:', error);
    const cached = localStorage.getItem(FALLBACK_SKILLS_KEY + teacherId);
    if (cached) {
      return JSON.parse(cached);
    }
    return await seedDefaultSkills(teacherId);
  }
}

async function seedDefaultSkills(teacherId: string): Promise<Skill[]> {
  const createdList: Skill[] = [];
  for (const s of DEFAULT_SKILLS) {
    const skillData = {
      name: s.name,
      points: s.points,
      animation: s.animation || 'titan_lightning',
      icon: s.icon || '⭐',
      teacherId,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = await addDoc(collection(db, 'skills'), skillData);
      createdList.push({ id: docRef.id, ...skillData });
    } catch {
      createdList.push({ id: 'skill_' + Math.random().toString(36).slice(2, 9), ...skillData });
    }
  }
  localStorage.setItem(FALLBACK_SKILLS_KEY + teacherId, JSON.stringify(createdList));
  return createdList;
}

export async function addTeacherSkill(
  teacherId: string,
  name: string,
  points: number,
  animation: string = 'titan_lightning',
  icon?: string
): Promise<Skill> {
  const newSkill = {
    name: name.trim(),
    points: Number(points),
    animation,
    icon: icon || '⭐',
    teacherId,
    createdAt: new Date().toISOString()
  };
  try {
    const ref = await addDoc(collection(db, 'skills'), newSkill);
    const created = { id: ref.id, ...newSkill };
    const list = await getTeacherSkills(teacherId);
    list.push(created);
    localStorage.setItem(FALLBACK_SKILLS_KEY + teacherId, JSON.stringify(list));
    return created;
  } catch (err) {
    const created = { id: 'skill_' + Date.now(), ...newSkill };
    const cached = localStorage.getItem(FALLBACK_SKILLS_KEY + teacherId);
    const list: Skill[] = cached ? JSON.parse(cached) : [];
    list.push(created);
    localStorage.setItem(FALLBACK_SKILLS_KEY + teacherId, JSON.stringify(list));
    return created;
  }
}

export async function updateTeacherSkill(
  skillId: string,
  teacherId: string,
  name: string,
  points: number,
  animation?: string,
  icon?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    name: name.trim(),
    points: Number(points)
  };
  if (animation) updateData.animation = animation;
  if (icon) updateData.icon = icon;

  try {
    await updateDoc(doc(db, 'skills', skillId), updateData);
  } catch (err) {
    console.warn('Updating skill locally:', err);
  }
  const cached = localStorage.getItem(FALLBACK_SKILLS_KEY + teacherId);
  if (cached) {
    const list: Skill[] = JSON.parse(cached);
    const idx = list.findIndex(s => s.id === skillId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      localStorage.setItem(FALLBACK_SKILLS_KEY + teacherId, JSON.stringify(list));
    }
  }
}

export async function deleteTeacherSkill(skillId: string, teacherId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'skills', skillId));
  } catch (err) {
    console.warn('Deleting skill locally:', err);
  }
  const cached = localStorage.getItem(FALLBACK_SKILLS_KEY + teacherId);
  if (cached) {
    const list: Skill[] = JSON.parse(cached).filter((s: Skill) => s.id !== skillId);
    localStorage.setItem(FALLBACK_SKILLS_KEY + teacherId, JSON.stringify(list));
  }
}

// ----------------- POINT HISTORY & AWARDING -----------------
export async function awardPointsToStudent(params: {
  studentId: string;
  studentName?: string;
  teacherId: string;
  skillName: string;
  points: number;
  reason?: string;
}): Promise<void> {
  const { studentId, teacherId, skillName, points, reason = '' } = params;

  // Resolve student name if not provided
  let studentName = params.studentName;
  if (!studentName) {
    const students = getLocalStudents(teacherId);
    const found = students.find(s => s.id === studentId);
    studentName = found ? found.name : 'طالب';
  }

  const historyItem = {
    studentId,
    studentName,
    teacherId,
    skillName,
    points,
    reason: reason.trim(),
    date: new Date().toISOString()
  };

  try {
    // 1. Update student points in Firestore
    await updateDoc(doc(db, 'students', studentId), {
      totalPoints: increment(points)
    });
  } catch (err) {
    console.warn('Firestore student points update fallback:', err);
  }

  let createdHistoryId = 'hist_' + Date.now();
  try {
    // 2. Add to pointHistory
    const docRef = await addDoc(collection(db, 'pointHistory'), historyItem);
    createdHistoryId = docRef.id;
  } catch (err) {
    console.warn('Firestore pointHistory add fallback:', err);
  }

  // Local caching update for student-specific history
  const localHistoryKey = `${FALLBACK_HISTORY_KEY}${studentId}`;
  const cachedHist = localStorage.getItem(localHistoryKey);
  const histList: PointHistoryItem[] = cachedHist ? JSON.parse(cachedHist) : [];
  histList.unshift({ id: createdHistoryId, ...historyItem });
  localStorage.setItem(localHistoryKey, JSON.stringify(histList));

  // Local caching update for teacher-wide history
  const teacherHistoryKey = `sabeel_teacher_history_${teacherId}`;
  const cachedTeacherHist = localStorage.getItem(teacherHistoryKey);
  const teacherHistList: PointHistoryItem[] = cachedTeacherHist ? JSON.parse(cachedTeacherHist) : [];
  teacherHistList.unshift({ id: createdHistoryId, ...historyItem });
  localStorage.setItem(teacherHistoryKey, JSON.stringify(teacherHistList));

  // Local student update
  const students = getLocalStudents(teacherId);
  const s = students.find(x => x.id === studentId);
  if (s) {
    s.totalPoints = (s.totalPoints || 0) + points;
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(students));
  }
}

export async function getStudentPointHistory(studentId: string): Promise<PointHistoryItem[]> {
  try {
    const q = query(
      collection(db, 'pointHistory'),
      where('studentId', '==', studentId),
      orderBy('date', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const list: PointHistoryItem[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...(d.data() as Omit<PointHistoryItem, 'id'>) });
    });
    localStorage.setItem(`${FALLBACK_HISTORY_KEY}${studentId}`, JSON.stringify(list));
    return list;
  } catch (err) {
    const cached = localStorage.getItem(`${FALLBACK_HISTORY_KEY}${studentId}`);
    return cached ? JSON.parse(cached) : [];
  }
}

/**
 * Fetches all point operations across all students for this teacher
 */
export async function getAllTeacherPointHistory(teacherId: string): Promise<PointHistoryItem[]> {
  try {
    const q = query(
      collection(db, 'pointHistory'),
      where('teacherId', '==', teacherId),
      orderBy('date', 'desc'),
      limit(150)
    );
    const snap = await getDocs(q);
    const list: PointHistoryItem[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...(d.data() as Omit<PointHistoryItem, 'id'>) });
    });
    localStorage.setItem(`sabeel_teacher_history_${teacherId}`, JSON.stringify(list));
    return list;
  } catch (err) {
    console.warn('Fallback fetching teacher point history:', err);
    const cached = localStorage.getItem(`sabeel_teacher_history_${teacherId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return [];
  }
}

/**
 * Updates a point transaction: recalculates student total points & updates history
 */
export async function updatePointHistoryItem(params: {
  historyId: string;
  teacherId: string;
  studentId: string;
  oldPoints: number;
  newPoints: number;
  newSkillName: string;
  newReason?: string;
}): Promise<void> {
  const { historyId, teacherId, studentId, oldPoints, newPoints, newSkillName, newReason = '' } = params;
  const pointDiff = newPoints - oldPoints;

  // 1. Update Student totalPoints in Firestore if changed
  if (pointDiff !== 0) {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        totalPoints: increment(pointDiff)
      });
    } catch (err) {
      console.warn('Firestore student points diff update fallback:', err);
    }
  }

  // 2. Update PointHistory document in Firestore
  try {
    await updateDoc(doc(db, 'pointHistory', historyId), {
      points: newPoints,
      skillName: newSkillName.trim(),
      reason: newReason.trim()
    });
  } catch (err) {
    console.warn('Firestore pointHistory update fallback:', err);
  }

  // 3. Update student in local storage
  if (pointDiff !== 0) {
    const students = getLocalStudents(teacherId);
    const s = students.find(x => x.id === studentId);
    if (s) {
      s.totalPoints = Math.max(0, (s.totalPoints || 0) + pointDiff);
      localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(students));
    }
  }

  // 4. Update student-specific history cache
  const localHistoryKey = `${FALLBACK_HISTORY_KEY}${studentId}`;
  const cachedHist = localStorage.getItem(localHistoryKey);
  if (cachedHist) {
    try {
      const list: PointHistoryItem[] = JSON.parse(cachedHist);
      const idx = list.findIndex(h => h.id === historyId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], points: newPoints, skillName: newSkillName.trim(), reason: newReason.trim() };
        localStorage.setItem(localHistoryKey, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }

  // 5. Update teacher-wide history cache
  const teacherHistoryKey = `sabeel_teacher_history_${teacherId}`;
  const cachedTeacherHist = localStorage.getItem(teacherHistoryKey);
  if (cachedTeacherHist) {
    try {
      const list: PointHistoryItem[] = JSON.parse(cachedTeacherHist);
      const idx = list.findIndex(h => h.id === historyId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], points: newPoints, skillName: newSkillName.trim(), reason: newReason.trim() };
        localStorage.setItem(teacherHistoryKey, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Deletes a point transaction added by mistake: reverts student totalPoints & deletes history doc
 */
export async function deletePointHistoryItem(params: {
  historyId: string;
  teacherId: string;
  studentId: string;
  points: number;
}): Promise<void> {
  const { historyId, teacherId, studentId, points } = params;

  // 1. Revert student totalPoints in Firestore
  try {
    await updateDoc(doc(db, 'students', studentId), {
      totalPoints: increment(-points)
    });
  } catch (err) {
    console.warn('Firestore student points decrement fallback:', err);
  }

  // 2. Delete pointHistory doc in Firestore
  try {
    await deleteDoc(doc(db, 'pointHistory', historyId));
  } catch (err) {
    console.warn('Firestore pointHistory delete fallback:', err);
  }

  // 3. Update student total points in local storage
  const students = getLocalStudents(teacherId);
  const s = students.find(x => x.id === studentId);
  if (s) {
    s.totalPoints = Math.max(0, (s.totalPoints || 0) - points);
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(students));
  }

  // 4. Remove from student-specific history cache
  const localHistoryKey = `${FALLBACK_HISTORY_KEY}${studentId}`;
  const cachedHist = localStorage.getItem(localHistoryKey);
  if (cachedHist) {
    try {
      const list: PointHistoryItem[] = JSON.parse(cachedHist).filter((h: PointHistoryItem) => h.id !== historyId);
      localStorage.setItem(localHistoryKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // 5. Remove from teacher-wide history cache
  const teacherHistoryKey = `sabeel_teacher_history_${teacherId}`;
  const cachedTeacherHist = localStorage.getItem(teacherHistoryKey);
  if (cachedTeacherHist) {
    try {
      const list: PointHistoryItem[] = JSON.parse(cachedTeacherHist).filter((h: PointHistoryItem) => h.id !== historyId);
      localStorage.setItem(teacherHistoryKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

// ----------------- BADGES -----------------
export async function awardBadgeToStudent(params: {
  studentId: string;
  badgeId: string;
  teacherId: string;
  reason?: string;
}): Promise<void> {
  const { studentId, badgeId, teacherId, reason = '' } = params;

  const studentBadge = {
    studentId,
    badgeId,
    teacherId,
    reason: reason.trim(),
    date: new Date().toISOString()
  };

  try {
    // Add to studentBadges collection
    await addDoc(collection(db, 'studentBadges'), studentBadge);
  } catch (err) {
    console.warn('Saving badge doc locally:', err);
  }

  // Update student's badges array in students collection
  const students = getLocalStudents(teacherId);
  const s = students.find(x => x.id === studentId);
  const updatedBadges = s ? Array.from(new Set([...(s.badges || []), badgeId])) : [badgeId];

  try {
    await updateDoc(doc(db, 'students', studentId), {
      badges: updatedBadges
    });
  } catch (err) {
    console.warn('Saving student badges array locally:', err);
  }

  if (s) {
    s.badges = updatedBadges;
    localStorage.setItem(FALLBACK_STUDENTS_KEY + teacherId, JSON.stringify(students));
  }

  // Local student badges list
  const localBadgesKey = `${FALLBACK_BADGES_KEY}${studentId}`;
  const cached = localStorage.getItem(localBadgesKey);
  const list: StudentBadge[] = cached ? JSON.parse(cached) : [];
  list.unshift({ id: 'badge_' + Date.now(), ...studentBadge });
  localStorage.setItem(localBadgesKey, JSON.stringify(list));
}

export async function getStudentBadgesList(studentId: string): Promise<StudentBadge[]> {
  try {
    const q = query(
      collection(db, 'studentBadges'),
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    const list: StudentBadge[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...(d.data() as Omit<StudentBadge, 'id'>) });
    });
    localStorage.setItem(`${FALLBACK_BADGES_KEY}${studentId}`, JSON.stringify(list));
    return list;
  } catch (err) {
    const cached = localStorage.getItem(`${FALLBACK_BADGES_KEY}${studentId}`);
    return cached ? JSON.parse(cached) : [];
  }
}

// ----------------- COMPETITIONS -----------------
export async function getTeacherCompetition(teacherId: string): Promise<Competition> {
  const currentYear = new Date().getFullYear();
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const currentMonth = arabicMonths[new Date().getMonth()];

  const defaultComp: Competition = {
    id: `comp_${teacherId}`,
    title: `مسابقة تحفيز طلاب سبيل - شهر ${currentMonth} ${currentYear}`,
    month: currentMonth,
    year: currentYear,
    teacherId,
    type: 'teacher'
  };

  try {
    const q = query(
      collection(db, 'competitions'),
      where('teacherId', '==', teacherId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...(d.data() as Omit<Competition, 'id'>) };
    }
  } catch (err) {
    console.warn('Using local competition fallback:', err);
  }

  const cached = localStorage.getItem(`sabeel_comp_${teacherId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  localStorage.setItem(`sabeel_comp_${teacherId}`, JSON.stringify(defaultComp));
  return defaultComp;
}

export async function updateCompetitionTitle(
  teacherId: string,
  title: string
): Promise<void> {
  const comp = await getTeacherCompetition(teacherId);
  comp.title = title;
  localStorage.setItem(`sabeel_comp_${teacherId}`, JSON.stringify(comp));

  try {
    await setDoc(doc(db, 'competitions', comp.id), comp);
  } catch (err) {
    console.warn('Saved competition locally:', err);
  }
}

// ----------------- ACADEMY LEADERBOARD (TOP 3 ONLY) -----------------
export async function getAcademyTop3Students(): Promise<Array<{
  name: string;
  totalPoints: number;
  rank: number;
  avatar?: string;
}>> {
  try {
    const q = query(
      collection(db, 'students'),
      orderBy('totalPoints', 'desc'),
      limit(3)
    );
    const snap = await getDocs(q);
    const top: Array<{ name: string; totalPoints: number; rank: number; avatar?: string }> = [];
    let rank = 1;
    snap.forEach(docSnap => {
      const data = docSnap.data() as Student;
      top.push({
        name: data.name,
        totalPoints: data.totalPoints || 0,
        rank: rank++,
        avatar: data.avatar || 'avatar_1'
      });
    });

    if (top.length > 0) {
      return top;
    }
  } catch (err) {
    console.warn('Academy top 3 query fallback:', err);
  }

  // Fallback demo/academy showcase top 3
  return [
    { name: 'عبد الرحمن خالد', totalPoints: 485, rank: 1, avatar: 'avatar_7' },
    { name: 'فاطمة الزهراء علي', totalPoints: 460, rank: 2, avatar: 'avatar_4' },
    { name: 'عمر بن الخطاب الشامي', totalPoints: 420, rank: 3, avatar: 'avatar_1' }
  ];
}

// ----------------- CERTIFICATES -----------------
export async function saveCertificateRecord(cert: Omit<CertificateItem, 'id'>): Promise<CertificateItem> {
  const created: CertificateItem = {
    id: 'cert_' + Date.now(),
    ...cert
  };

  try {
    const docRef = await addDoc(collection(db, 'certificates'), cert);
    created.id = docRef.id;
  } catch (err) {
    console.warn('Saved certificate locally:', err);
  }

  const cached = localStorage.getItem('sabeel_certificates');
  const list: CertificateItem[] = cached ? JSON.parse(cached) : [];
  list.unshift(created);
  localStorage.setItem('sabeel_certificates', JSON.stringify(list));

  return created;
}

export async function getCertificatesList(): Promise<CertificateItem[]> {
  try {
    const q = query(collection(db, 'certificates'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list: CertificateItem[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...(d.data() as Omit<CertificateItem, 'id'>) });
    });
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('Certificates fetch fallback:', err);
  }

  const cached = localStorage.getItem('sabeel_certificates');
  return cached ? JSON.parse(cached) : [];
}

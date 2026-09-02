// ============================================================================
// Sabeel Class - Unlock & Progression System
// Modular milestone manager for student gamification progression
// ============================================================================

export interface Milestone {
  id: string;
  pointsRequired: number;
  titleAr: string;
  badgeAr: string;
  icon: string;
  descriptionAr: string;
  isCurrentScope: boolean; // true for 50 pts (current release)
}

export const MILESTONES: Milestone[] = [
  {
    id: 'milestone_character',
    pointsRequired: 50,
    titleAr: 'فتح شخصية ثلاثية الأبعاد',
    badgeAr: 'المستوى الأول',
    icon: '✨',
    descriptionAr: 'تحرير الكتاب المغلق وانطلاق شخصيتك الكرتونية ثلاثية الأبعاد.',
    isCurrentScope: true,
  },
  {
    id: 'milestone_accessory',
    pointsRequired: 150,
    titleAr: 'إكسسوار ملكي جديد',
    badgeAr: 'المستوى الثاني',
    icon: '👑',
    descriptionAr: 'تاج أو وشاح أو درع خاص يميز شخصيتك.',
    isCurrentScope: false,
  },
  {
    id: 'milestone_golden_frame',
    pointsRequired: 300,
    titleAr: 'إطار ذهبي فاخر',
    badgeAr: 'المستوى الثالث',
    icon: '🖼️',
    descriptionAr: 'إطار مذهب محفور لبطاقتك في لوحة الشرف.',
    isCurrentScope: false,
  },
  {
    id: 'milestone_glow_aura',
    pointsRequired: 500,
    titleAr: 'تأثيرات ضوئية مضيئة',
    badgeAr: 'المستوى الرابع',
    icon: '⚡',
    descriptionAr: 'توهج سحري يشع حول بطاقتك وتلاوتك.',
    isCurrentScope: false,
  },
  {
    id: 'milestone_celestial_halo',
    pointsRequired: 1000,
    titleAr: 'هالة أسطورية خاصة',
    badgeAr: 'القمة الأسطورية',
    icon: '🌌',
    descriptionAr: 'هالة النجوم الكونية تكريماً لأبطال الحفظ الدائم.',
    isCurrentScope: false,
  },
];

export const CHARACTER_UNLOCK_POINTS = 50;

/**
 * Determine if student has unlocked their 3D Character
 */
export function isCharacterUnlocked(
  totalPoints: number,
  unlockedCharacterId?: string,
  isBookOpened?: boolean
): boolean {
  // If explicitly unlocked or already has a picked character
  if (isBookOpened && unlockedCharacterId) return true;
  if (unlockedCharacterId) return true;
  
  // If student already has 50+ points and is marked as opened
  if (totalPoints >= CHARACTER_UNLOCK_POINTS && isBookOpened === true) return true;

  // New students or students below 50 points always start as the 3D Closed Book
  return false;
}

/**
 * Check if the student qualifies to trigger the 50-point Book Opening sequence
 */
export function canOpenBook(totalPoints: number, isBookOpened?: boolean): boolean {
  return (totalPoints || 0) >= CHARACTER_UNLOCK_POINTS && !isBookOpened;
}

/**
 * Check if adding new points crossed the 50 points milestone
 */
export function didCrossUnlockMilestone(prevPoints: number, newPoints: number): boolean {
  return prevPoints < CHARACTER_UNLOCK_POINTS && newPoints >= CHARACTER_UNLOCK_POINTS;
}

/**
 * Get calculation details for the 3D Book progress
 */
export function getBookProgress(totalPoints: number) {
  const points = Math.max(0, totalPoints || 0);
  const current = Math.min(points, CHARACTER_UNLOCK_POINTS);
  const target = CHARACTER_UNLOCK_POINTS;
  const remaining = Math.max(0, target - points);
  const percent = Math.min(100, Math.round((current / target) * 100));

  return {
    current,
    target,
    remaining,
    percent,
    isReadyToOpen: points >= target,
  };
}

/**
 * Get list of all milestones with current student progress status
 */
export function getStudentMilestonesProgress(totalPoints: number) {
  const points = totalPoints || 0;
  return MILESTONES.map((m) => {
    const isUnlocked = points >= m.pointsRequired;
    const progressPercent = Math.min(100, Math.round((points / m.pointsRequired) * 100));
    return {
      ...m,
      isUnlocked,
      progressPercent,
      remainingPoints: Math.max(0, m.pointsRequired - points),
    };
  });
}

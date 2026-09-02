export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
  nextLevelPoints: number;
  progressPercent: number;
  pointsToNext: number;
  colorClass: string;
  badgeBg: string;
  borderColor: string;
}

export function getStudentLevel(points: number): LevelInfo {
  const pts = Math.max(0, points || 0);

  if (pts < 100) {
    // 0 - 100: بداية الطريق
    const minPoints = 0;
    const maxPoints = 100;
    const progressPercent = Math.min(100, Math.round((pts / maxPoints) * 100));
    return {
      level: 1,
      title: 'بداية الطريق',
      emoji: '🌱',
      minPoints,
      maxPoints,
      nextLevelPoints: maxPoints,
      progressPercent,
      pointsToNext: maxPoints - pts,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      borderColor: 'border-emerald-300 dark:border-emerald-700',
    };
  }

  if (pts < 300) {
    // 100 - 300: طالب متميز
    const minPoints = 100;
    const maxPoints = 300;
    const progressPercent = Math.min(100, Math.round(((pts - minPoints) / (maxPoints - minPoints)) * 100));
    return {
      level: 2,
      title: 'طالب متميز',
      emoji: '⭐',
      minPoints,
      maxPoints,
      nextLevelPoints: maxPoints,
      progressPercent,
      pointsToNext: maxPoints - pts,
      colorClass: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
      borderColor: 'border-sky-300 dark:border-sky-700',
    };
  }

  if (pts < 600) {
    // 300 - 600: نجم سبيل
    const minPoints = 300;
    const maxPoints = 600;
    const progressPercent = Math.min(100, Math.round(((pts - minPoints) / (maxPoints - minPoints)) * 100));
    return {
      level: 3,
      title: 'نجم سبيل',
      emoji: '🏆',
      minPoints,
      maxPoints,
      nextLevelPoints: maxPoints,
      progressPercent,
      pointsToNext: maxPoints - pts,
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      borderColor: 'border-amber-300 dark:border-amber-700',
    };
  }

  // 600+: بطل الأكاديمية
  const minPoints = 600;
  const maxPoints = 1000;
  const progressPercent = Math.min(100, Math.round(((pts - minPoints) / (maxPoints - minPoints)) * 100));
  return {
    level: 4,
    title: 'بطل الأكاديمية',
    emoji: '👑',
    minPoints,
    maxPoints,
    nextLevelPoints: maxPoints,
    progressPercent: 100,
    pointsToNext: 0,
    colorClass: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
  };
}

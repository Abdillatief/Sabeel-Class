import { BadgeDefinition } from '../types';

export const SYSTEM_BADGES: BadgeDefinition[] = [
  {
    id: 'hafiz_distinct',
    name: 'حافظ متميز',
    description: 'إتقان استثنائي في الحفظ والتسميع المتقن',
    icon: 'BookOpen',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80'
  },
  {
    id: 'star_manners',
    name: 'نجم الأخلاق',
    description: 'أخلاق فاضلة، احترام المعلم والزملاء، وأدب رفيع',
    icon: 'Heart',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/80'
  },
  {
    id: 'star_revision',
    name: 'نجم المراجعة',
    description: 'جهد دائم في المراجعة وتثبيت المحفوظ بدقة',
    icon: 'Flame',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80'
  },
  {
    id: 'commitment_hero',
    name: 'بطل الالتزام',
    description: 'انضباط في المواعيد والحضور والمتابعة اليومية',
    icon: 'ShieldCheck',
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/80'
  },
  {
    id: 'student_of_month',
    name: 'طالب الشهر',
    description: 'أعلى وسام شهري للتميز والتفوق الشامل بالأكاديمية',
    icon: 'Trophy',
    colorClass: 'text-amber-600 dark:text-amber-300',
    bgClass: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/80 dark:ring-amber-500/50'
  }
];

export interface SkillAnimationDef {
  id: string;
  name: string;
  series: string;
  description: string;
  icon: string;
  colorClass: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
}

export const SKILL_ANIMATIONS: SkillAnimationDef[] = [
  {
    id: 'rasengan',
    name: 'راسينغان - دوامة التشاكرا 🌀',
    series: 'ناروتو (Naruto)',
    description: 'دوامة كروية زرقاء دوارة من طاقة التشاكرا المتفجرة والمضيئة',
    icon: 'Sparkles',
    colorClass: 'text-sky-500',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-400 dark:border-sky-500',
    glowColor: 'shadow-sky-500/50'
  },
  {
    id: 'chidori',
    name: 'تشيدوري - نصل البرق الأزرق ⚡',
    series: 'ناروتو (Naruto - Sasuke)',
    description: 'صاعقة برق أزرق صاعقة بألف طائر وصوت كهربائي عالي التردد',
    icon: 'Zap',
    colorClass: 'text-cyan-500',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-400 dark:border-cyan-500',
    glowColor: 'shadow-cyan-500/50'
  },
  {
    id: 'titan_transformation',
    name: 'التحول لعملاق - صاعقة الفتح ⚡',
    series: 'هجوم العمالقة (Attack on Titan)',
    description: 'صاعقة برق ذهبية هائلة تضرب من السماء مع هزة أرضية وانفجار بخار مهيب',
    icon: 'Zap',
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400 dark:border-amber-500',
    glowColor: 'shadow-amber-500/50'
  },
  {
    id: 'water_breathing',
    name: 'تنفس الماء - التنين المائي 🌊',
    series: 'قاتل الشياطين (Demon Slayer - Tanjiro)',
    description: 'أمواج مائية متدفقة ودوامات تنين الماء الأزرق المتعرج والناصع',
    icon: 'Droplets',
    colorClass: 'text-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-400 dark:border-blue-500',
    glowColor: 'shadow-blue-500/50'
  },
  {
    id: 'flame_breathing',
    name: 'تنفس اللهب - الشعلة المستعرة 🔥',
    series: 'قاتل الشياطين (Demon Slayer - Rengoku)',
    description: 'إعصار من النيران الحمراء والبرتقالية المتوهجة بضربة سيف قاطعة',
    icon: 'Flame',
    colorClass: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-400 dark:border-rose-500',
    glowColor: 'shadow-rose-500/50'
  },
  {
    id: 'thunder_breathing',
    name: 'تنفس الرعد - الوميض الخاطف ⚡',
    series: 'قاتل الشياطين (Demon Slayer - Zenitsu)',
    description: 'وميض رعد أصفر خاطف بسرعة الصوت مع خطوط سرعة وصواعق حارقة',
    icon: 'Zap',
    colorClass: 'text-yellow-500',
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    glowColor: 'shadow-yellow-500/50'
  },
  {
    id: 'sun_breathing',
    name: 'تنفس الشمس - رقصة إله النار ☀️',
    series: 'قاتل الشياطين (Hinokami Kagura)',
    description: 'هالة شمسية متقدة من حلقات النيران الذهبية الحمراء الأسطورية',
    icon: 'Sun',
    colorClass: 'text-orange-500',
    badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-400 dark:border-orange-500',
    glowColor: 'shadow-orange-500/50'
  },
  {
    id: 'kamehameha',
    name: 'كاميهاميها - مدفع الكي 💥',
    series: 'دراغون بول (Dragon Ball - Goku)',
    description: 'شعاع طاقة أزرق وسماوي ضخم يجتاح الشاشة مع هالة طاقة متوهجة',
    icon: 'Sparkles',
    colorClass: 'text-sky-500',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-400 dark:border-sky-500',
    glowColor: 'shadow-sky-500/50'
  },
  {
    id: 'super_saiyan',
    name: 'السوبر سايان - الطاقة الذهبية 🔥',
    series: 'دراغون بول (Dragon Ball)',
    description: 'هالة ذهبية نارية تتصاعد بقوة أسطورية مع شرر كهربائي وارتفاع الكي',
    icon: 'Flame',
    colorClass: 'text-yellow-500',
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    glowColor: 'shadow-yellow-500/50'
  },
  {
    id: 'spirit_bomb',
    name: 'جينكي داما - كرة الروح 🌟',
    series: 'دراغون بول (Dragon Ball)',
    description: 'كرة طاقة سماوية عملاقة تتدفق إليها ذرات النور من أرجاء الكون',
    icon: 'Stars',
    colorClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-400 dark:border-cyan-500',
    glowColor: 'shadow-cyan-500/50'
  },
  {
    id: 'gear_fifth',
    name: 'جير فيفث - شمس نيكا 🥁',
    series: 'ون بيس (One Piece - Luffy Nika)',
    description: 'شمس بيضاء وذهبية مشعة مع هالة غيوم وقفزات تحرير مرحة ومبهجة',
    icon: 'Sun',
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400 dark:border-amber-500',
    glowColor: 'shadow-amber-500/50'
  },
  {
    id: 'conquerors_haki',
    name: 'هاكي الملوك - صواعق الهيبة 👑',
    series: 'ون بيس (One Piece)',
    description: 'تموجات صواعق سوداء وحمراء تشق الأرجاء وتهز المكان بالهيبة والعزيمة',
    icon: 'Trophy',
    colorClass: 'text-rose-600',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-400 dark:border-rose-500',
    glowColor: 'shadow-rose-500/50'
  },
  {
    id: 'three_sword_style',
    name: 'أسلوب الثلاثة سيوف - سانتوريو ⚔️',
    series: 'ون بيس (One Piece - Zoro)',
    description: 'ثلاث ضربات سيف خضراء متقاطعة مع إعصار تاتسوماكي قاطع ومهيب',
    icon: 'Swords',
    colorClass: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-400 dark:border-emerald-500',
    glowColor: 'shadow-emerald-500/50'
  },
  {
    id: 'domain_expansion',
    name: 'توسيع النطاق - الفراغ اللانهائي 🌌',
    series: 'جوجيتسو كايسن (Jujutsu Kaisen - Gojo)',
    description: 'سديم كوزمي نيلي يتمدد محاطاً بفضاء لانهائي من النجوم وحلقات العيون',
    icon: 'Stars',
    colorClass: 'text-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-400 dark:border-purple-500',
    glowColor: 'shadow-purple-500/50'
  },
  {
    id: 'malevolent_shrine',
    name: 'الضريح الخبيث - تقطيع السكنا 🩸',
    series: 'جوجيتسو كايسن (Jujutsu Kaisen - Sukuna)',
    description: 'شبكة من ضربات التقطيع الحادة بوميض أحمر داكن يمزق الأرجاء',
    icon: 'Swords',
    colorClass: 'text-red-500',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400',
    borderColor: 'border-red-400 dark:border-red-500',
    glowColor: 'shadow-red-500/50'
  },
  {
    id: 'hollow_bankai',
    name: 'بانكاي - غيتسوغا تينشو 🌑',
    series: 'بليتش (Bleach - Ichigo)',
    description: 'سيف أسود بنصل أحمر متوهج وهلال طاقة عارم يقطع الشاشة بقوة',
    icon: 'Moon',
    colorClass: 'text-slate-800 dark:text-red-400',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400',
    borderColor: 'border-red-500 dark:border-red-600',
    glowColor: 'shadow-red-500/50'
  },
  {
    id: 'amaterasu',
    name: 'أماتيراسو - اللهب الأسود 🖤',
    series: 'ناروتو (Naruto - Uchiha)',
    description: 'ألسنة لهب سوداء أسطورية تشتعل في المركز وتنشر هالة داكنة مهيبة',
    icon: 'Flame',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-500 dark:border-indigo-600',
    glowColor: 'shadow-indigo-500/50'
  },
  {
    id: 'eight_gates',
    name: 'البوابات الثمانية - تنين الليل 🐉',
    series: 'ناروتو (Naruto - Might Guy)',
    description: 'بخار دموي أحمر وتنين ناري قرمزي متفجر بأعلى درجات العزيمة والإصرار',
    icon: 'Flame',
    colorClass: 'text-rose-600',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500 dark:border-rose-600',
    glowColor: 'shadow-rose-500/50'
  },
  // Backward compatibility alias keys
  {
    id: 'titan_lightning',
    name: 'برق الفتح والهمة ⚡',
    series: 'هجوم العمالقة (Attack on Titan)',
    description: 'صواعق برق ذهبية خاطفة وهزة أرضية حماسية عند الإنجاز الكبير',
    icon: 'Zap',
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400 dark:border-amber-500',
    glowColor: 'shadow-amber-500/50'
  },
  {
    id: 'gear_joy',
    name: 'شمس الفرح والسكينة ☀️',
    series: 'ون بيس (One Piece)',
    description: 'أشعة شمس مضيئة وقفزات مرحة مع نافورة نجوم ملونة',
    icon: 'Sun',
    colorClass: 'text-orange-500',
    badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-400 dark:border-orange-500',
    glowColor: 'shadow-orange-500/50'
  },
  {
    id: 'flame_slash',
    name: 'شهب السيف واللهب ⚔️',
    series: 'قاتل الشياطين (Demon Slayer)',
    description: 'وميض سيف قاطع بنيران متوهجة تتطاير معها شظايا الشهب',
    icon: 'Swords',
    colorClass: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-400 dark:border-rose-500',
    glowColor: 'shadow-rose-500/50'
  },
  {
    id: 'cosmic_meteors',
    name: 'أفلاك النور والحكمة 🌌',
    series: 'جوجيتسو كايسن',
    description: 'شهب كونية براقة تخترق الشاشة مع سديم بنفسجي ساطع',
    icon: 'Stars',
    colorClass: 'text-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-400 dark:border-purple-500',
    glowColor: 'shadow-purple-500/50'
  },
  {
    id: 'diamond_shield',
    name: 'درع الأمانة واليقين 💎',
    series: 'الحماية والالتزام والتقوى',
    description: 'درع بلوري ناصع ينبثق منه شعاع نور قرآني يغمر الشاشة',
    icon: 'Shield',
    colorClass: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-400 dark:border-emerald-500',
    glowColor: 'shadow-emerald-500/50'
  },
  {
    id: 'golden_trophy',
    name: 'كأس النصر والفلاح 👑',
    series: 'المراكز الأولى والتفوق',
    description: 'صعود كأس ذهبي عملاق متوج بتاج وألعاب نارية ملكية',
    icon: 'Trophy',
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400 dark:border-amber-500',
    glowColor: 'shadow-amber-500/50'
  }
];

export const DEFAULT_SKILLS = [
  { name: 'حفظ جديد متقن', points: 5, animation: 'titan_transformation', icon: '📖' },
  { name: 'مراجعة وتثبيت', points: 3, animation: 'rasengan', icon: '🔄' },
  { name: 'تلاوة ممتازة وترتيل', points: 4, animation: 'water_breathing', icon: '🌊' },
  { name: 'انضباط والتزام بالموعد', points: 2, animation: 'chidori', icon: '⚡' },
  { name: 'مشاركة وتفاعل صفي', points: 3, animation: 'gear_fifth', icon: '🥁' },
  { name: 'إتقان أحكام التجويد', points: 4, animation: 'sun_breathing', icon: '☀️' },
  { name: 'سرعة البديهة والتركيز', points: 3, animation: 'thunder_breathing', icon: '⚡' },
  { name: 'حل الواجب بإتقان', points: 2, animation: 'kamehameha', icon: '💥' }
];

import { ISLAMIC_AVATARS, IslamicAvatarDef, ISLAMIC_CATEGORIES, getIslamicAvatar } from './islamicAvatars';
export { ISLAMIC_AVATARS, ISLAMIC_CATEGORIES, getIslamicAvatar };
export type { IslamicAvatarDef };

// Backward compatibility alias for AnimeAvatarDef
export type AnimeAvatarDef = IslamicAvatarDef;

// 100 Islamic Character Avatars replacing anime completely
export const ANIME_AVATARS: IslamicAvatarDef[] = ISLAMIC_AVATARS.map((av) => ({
  ...av,
  animeSeries: av.category
}));

// Aliases for any legacy code
export const CARTOON_AVATARS: IslamicAvatarDef[] = ANIME_AVATARS;

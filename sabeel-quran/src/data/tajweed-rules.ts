/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TajweedRuleMeta, TajweedRuleType } from '../types/quran';

export const TAJWEED_RULES: Record<TajweedRuleType, TajweedRuleMeta> = {
  // 1. المد العارض للسكون (برتقالي)
  madd_arid: {
    id: 'madd_arid',
    name: 'المد العارض للسكون',
    category: 'أحكام المدود',
    color: '#EA580C', // برتقالي
    textColor: 'text-orange-600 dark:text-orange-400',
    description: 'أن يأتي حرف المد وبعده حرف سكن سكوناً عارضاً لأجل الوقف.',
    articulation: 'يمد بمقدار حركتين أو أربع أو ست حركات جوازاً عند الوقف.',
    letters: ['ا', 'و', 'ي'],
    duration: '2 أو 4 أو 6 حركات',
    example: 'ٱلْعَٰلَمِينَ، ٱلرَّحِيمِ، تَعْمَلُونَ'
  },

  // 2. المد المتصل والمنفصل (بينك)
  madd_muttasil_munfasil: {
    id: 'madd_muttasil_munfasil',
    name: 'المد المتصل والمنفصل',
    category: 'أحكام المدود',
    color: '#DB2777', // بينك
    textColor: 'text-pink-600 dark:text-pink-400',
    description: 'أن يأتي حرف المد وتليه همزة؛ سواء في نفس الكلمة (متصل) أو في الكلمة التالية (منفصل).',
    articulation: 'يمد المتصل وجوباً 4-5 حركات، والمنفصل جوازاً 4-5 حركات (أو حركتان بالقصر).',
    letters: ['ا', 'و', 'ي'],
    duration: '4 إلى 5 حركات',
    example: 'ٱلسَّمَآءِ، جَآءَ، إِنَّآ أَنزَلْنَٰهُ'
  },
  madd_obligatory: {
    id: 'madd_obligatory',
    name: 'المد الواجب المتصل',
    category: 'أحكام المدود',
    color: '#DB2777', // بينك
    textColor: 'text-pink-600 dark:text-pink-400',
    description: 'أن يأتي حرف المد وبعده همزة متصلة به في نفس الكلمة.',
    articulation: 'يمد وجوباً بمقدار أربع أو خمس حركات.',
    letters: ['ا', 'و', 'ي'],
    duration: '4 إلى 5 حركات',
    example: 'ٱلسَّمَآءِ، سُوٓءَ، سِيٓئَتْ'
  },
  madd_permissible: {
    id: 'madd_permissible',
    name: 'المد الجائز المنفصل',
    category: 'أحكام المدود',
    color: '#DB2777', // بينك
    textColor: 'text-pink-600 dark:text-pink-400',
    description: 'أن يأتي حرف المد في آخر الكلمة، وتأتي همزة القطع في أول الكلمة التالية.',
    articulation: 'يمد جوازاً 4 أو 5 حركات.',
    letters: ['ا', 'و', 'ي'],
    duration: '4 إلى 5 حركات',
    example: 'قُوٓا۟ أَنفُسَكُمْ، إِنَّآ أَعْطَيْنَٰكَ'
  },

  // 3. المد اللازم (أحمر)
  madd_lazim: {
    id: 'madd_lazim',
    name: 'المد اللازم (كلمي وحرفي)',
    category: 'أحكام المدود',
    color: '#DC2626', // أحمر
    textColor: 'text-red-600 dark:text-red-400',
    description: 'أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً في كلمة أو حرف.',
    articulation: 'يمد لزوماً بمقدار ست حركات مشبعة بلا تفاوت.',
    letters: ['ا', 'و', 'ي'],
    duration: '6 حركات لزوماً',
    example: 'ٱلضَّآلِّينَ، دَآبَّةٍ، الٓمٓ'
  },

  // 4. الغنة في النون والميم المشددتين (أخضر)
  ghunnah: {
    id: 'ghunnah',
    name: 'الغنة (النون والميم المشددتان)',
    category: 'أحكام الغنن',
    color: '#16A34A', // أخضر
    textColor: 'text-green-600 dark:text-green-400',
    description: 'وجوب الغنة بمقدار حركتين في النون أو الميم عند تشديدهما وصلاً ووقفاً.',
    articulation: 'صوت رخيم يخرج من الخيشوم بمقدار حركتين.',
    letters: ['نّ', 'مّ'],
    duration: 'حركتان',
    example: 'إِنَّ ٱللَّهَ، ثُمَّ، عَمَّ'
  },

  // 5. الإقلاب (أخضر)
  iqlab: {
    id: 'iqlab',
    name: 'الإقلاب',
    category: 'أحكام النون والتنوين',
    color: '#16A34A', // أخضر
    textColor: 'text-green-600 dark:text-green-400',
    description: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاة حرف الباء.',
    articulation: 'تلامس خفيف للشفتين دون كز مع خروج الغنة من الخيشوم.',
    letters: ['ب'],
    duration: 'حركتان بغنة',
    example: 'مِنۢ بَعْدِ، سَمِيعٌۢ بَصِيرٌ، أَنۢبِئْهُم'
  },

  // 6. الإخفاء الحقيقي (أخضر)
  ikhfa: {
    id: 'ikhfa',
    name: 'الإخفاء الحقيقي والشفوي',
    category: 'أحكام النون والتنوين',
    color: '#16A34A', // أخضر
    textColor: 'text-green-600 dark:text-green-400',
    description: 'ستر النون الساكنة أو التنوين مع بقاء الغنة عند حروف الإخفاء الخمسة عشر.',
    articulation: 'تهيئة الفم لمخرج الحرف التالي وتصعيد الغنة من الخيشوم.',
    letters: ['ص', 'ذ', 'ث', 'ك', 'ج', 'ش', 'ق', 'س', 'د', 'ط', 'ز', 'ف', 'ت', 'ض', 'ظ'],
    duration: 'حركتان',
    example: 'مِن قَبْلُ، كُنتُمْ، أَنزَلْنَٰهُ'
  },

  // 7. الإدغام بغنة (أخضر)
  idgham_ghunnah: {
    id: 'idgham_ghunnah',
    name: 'الإدغام بغنة (ينمو)',
    category: 'أحكام النون والتنوين',
    color: '#16A34A', // أخضر
    textColor: 'text-green-600 dark:text-green-400',
    description: 'دمج النون الساكنة أو التنوين في حروف (ي، ن، م، و) مع إبقاء صوت الغنة.',
    articulation: 'إدغام مصحوب بغنة ممتدة حركتين.',
    letters: ['ي', 'ن', 'م', 'و'],
    duration: 'حركتان',
    example: 'مَن يَقُولُ، لَهَبٍ وَتَبَّ'
  },

  // 8. الحرف المفخم (أزرق كاتم)
  mufakhkham: {
    id: 'mufakhkham',
    name: 'الحرف المفخم (خص ضغط قظ)',
    category: 'صفات الحروف',
    color: '#1D4ED8', // أزرق كاتم في الفاتح
    textColor: 'text-blue-700 dark:text-blue-400',
    description: 'تسمين صوت الحرف وتغليظه حتى يمتلئ الفم بصداه، وهي حروف الاستعلاء السبعة.',
    articulation: 'استعلاء أقصى اللسان وتصعد الصوت إلى قبة الحنك الأعلى.',
    letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'],
    duration: 'تفخيم الحرف',
    example: 'خَلَقَ، ٱلصَّٰلِحَٰتِ، غَفُورٌ، طِبَاقًا'
  },
  tafkheem: {
    id: 'tafkheem',
    name: 'الحرف المفخم والتفخيم',
    category: 'صفات الحروف',
    color: '#1D4ED8',
    textColor: 'text-blue-700 dark:text-blue-400',
    description: 'تفخيم حروف الاستعلاء والراء واللام المغلظة في لفظ الجلالة.',
    articulation: 'استعلاء أقصى اللسان وتصعيد الهواء.',
    letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ', 'ر', 'ل'],
    example: 'خَالِدِينَ، قَدِيرٌ'
  },

  // 9. الحرف المرقق (بربل / بنفسجي)
  muraqqaq: {
    id: 'muraqqaq',
    name: 'الحرف المرقق (حروف الاستفال)',
    category: 'صفات الحروف',
    color: '#7E22CE', // بربل
    textColor: 'text-purple-600 dark:text-purple-400',
    description: 'نحول يدخل على صوت الحرف فلا يمتلئ الفم بصداه (حروف الاستفال كالتاء والكاف والسين).',
    articulation: 'انخفاض اللسان عن الحنك الأعلى عند النطق بالحرف.',
    letters: ['ب', 'ت', 'ث', 'ج', 'ح', 'د', 'ذ', 'ز', 'س', 'ش', 'ع', 'ف', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
    duration: 'ترقيق الحرف',
    example: 'بِسْمِ، كِتَٰبٌ، ٱلسَّلَٰمُ'
  },

  // 10. القلقلة (بيبي بلو)
  qalqalah: {
    id: 'qalqalah',
    name: 'القلقلة (قطب جد)',
    category: 'أحكام الحروف',
    color: '#0284C7', // بيبي بلو
    textColor: 'text-sky-500 dark:text-sky-400',
    description: 'اضطراب ونبرة قوية في المخرج عند النطق بالحرف الساكن من حروف (ق، ط، ب، ج، د).',
    articulation: 'فك احتباس الصوت فجأة دون إمالة الحرف لأي حركة.',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    duration: 'نبرة صوتية واضحة',
    example: 'ٱلْفَلَقِ، يَجْعَلُونَ، مَسَدٍ، أَحَدٌ'
  },

  // 11. الحرف الساكن والإدغام بغير غنة (رمادي)
  sukun: {
    id: 'sukun',
    name: 'الحرف الساكن (السكون)',
    category: 'أحكام السكون',
    color: '#4B5563', // رمادي
    textColor: 'text-gray-500 dark:text-gray-400',
    description: 'الحرف الخالي من الحركات الثلاث (فتحة، ضمة، كسرة) ويظهر عليه السكون أو رأس الخاء.',
    articulation: 'الاعتماد على المخرج دون فتح أو ضم أو كسر الشفتين والفك.',
    letters: ['ْ', 'ۡ'],
    example: 'ٱلْحَمْدُ، قُلْ، أَنْعَمْتَ'
  },
  idgham_no_ghunnah: {
    id: 'idgham_no_ghunnah',
    name: 'إدغام بغير غنة',
    category: 'أحكام النون والتنوين',
    color: '#4B5563', // رمادي
    textColor: 'text-gray-500 dark:text-gray-400',
    description: 'إدخال النون الساكنة أو التنوين كاملاً في اللام أو الراء دون غنة.',
    articulation: 'ذهاب ذات النون وصوتها بالكامل والانتقال للحرف المشدد.',
    letters: ['ل', 'ر'],
    duration: 'إدغام تام بلا غنة',
    example: 'مِّن رَّبِّهِمْ، هُدًى لِّلْمُتَّقِينَ'
  },

  idgham_shafawi: {
    id: 'idgham_shafawi',
    name: 'إدغام شفوي (الميم الساكنة)',
    category: 'أحكام الميم الساكنة',
    color: '#16A34A',
    textColor: 'text-green-600',
    description: 'إدغام الميم الساكنة في الميم التي تليها بغنة حركتين.',
    articulation: 'انطباق الشفتين وغنة خيشومية.',
    letters: ['م'],
    duration: 'حركتان',
    example: 'لَهُم مَّا يَشَآءُونَ'
  },
  ikhfa_shafawi: {
    id: 'ikhfa_shafawi',
    name: 'إخفاء شفوي (الميم الساكنة)',
    category: 'أحكام الميم الساكنة',
    color: '#16A34A',
    textColor: 'text-green-600',
    description: 'إخفاء الميم الساكنة بغنة عند حرف الباء.',
    articulation: 'تلامس خفيف للشفتين دون كز.',
    letters: ['ب'],
    duration: 'حركتان',
    example: 'تَرْمِيهِم بِحِجَارَةٍ'
  },
  madd_normal: {
    id: 'madd_normal',
    name: 'المد الطبيعي',
    category: 'أحكام المدود',
    color: '#EA580C',
    textColor: 'text-orange-600',
    description: 'المد الأصلي الذي لا تقوم ذات الحرف إلا به.',
    articulation: 'امتداد طبيعي حركتين.',
    letters: ['ا', 'و', 'ي'],
    duration: 'حركتان',
    example: 'قَالَ، يَقُولُ، قِيلَ'
  }
};

/**
 * High-contrast theme-aware color calculator to guarantee that NO letters ever disappear
 * on either light or dark backgrounds!
 */
export function getTajweedThemeColor(ruleId: TajweedRuleType, isDark: boolean): string {
  switch (ruleId) {
    case 'madd_arid':
      return isDark ? '#FB923C' : '#C2410C'; // برتقالي واضح
    case 'madd_muttasil_munfasil':
    case 'madd_obligatory':
    case 'madd_permissible':
      return isDark ? '#F472B6' : '#BE185D'; // بينك واضح
    case 'madd_lazim':
      return isDark ? '#F87171' : '#B91C1C'; // أحمر واضح
    case 'ghunnah':
    case 'iqlab':
    case 'ikhfa':
    case 'idgham_ghunnah':
    case 'idgham_shafawi':
    case 'ikhfa_shafawi':
      return isDark ? '#4ADE80' : '#15803D'; // أخضر واضح
    case 'mufakhkham':
    case 'tafkheem':
      return isDark ? '#60A5FA' : '#1D4ED8'; // أزرق واضح مشرق في الداكن وكحلي في الفاتح
    case 'muraqqaq':
      return isDark ? '#C084FC' : '#7E22CE'; // بربل واضح
    case 'qalqalah':
      return isDark ? '#38BDF8' : '#0284C7'; // بيبي بلو واضح
    case 'sukun':
    case 'idgham_no_ghunnah':
      return isDark ? '#9CA3AF' : '#4B5563'; // رمادي مقروء
    default:
      return isDark ? '#CBD5E1' : '#334155';
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TajweedRuleType =
  | 'madd_lazim'            // المد اللازم (أحمر)
  | 'madd_muttasil_munfasil'// المد المتصل والمنفصل (بينك)
  | 'madd_arid'             // المد العارض للسكون (برتقالي)
  | 'madd_obligatory'       // مد لازم / متصل واجب
  | 'madd_permissible'      // مد جائز منفصل
  | 'ghunnah'               // الغنة في النون والميم (أخضر)
  | 'iqlab'                 // الإقلاب (أخضر)
  | 'ikhfa'                 // الإخفاء (أخضر)
  | 'idgham_ghunnah'        // إدغام بغنة (أخضر)
  | 'idgham_no_ghunnah'     // إدغام بغير غنة (رمادي)
  | 'mufakhkham'            // الحرف المفخم (أزرق كاتم)
  | 'muraqqaq'              // الحرف المرقق (بربل)
  | 'qalqalah'              // القلقلة (بيبي بلو)
  | 'sukun'                 // الحرف الساكن (رمادي)
  | 'madd_normal'           // مد طبيعي
  | 'tafkheem'              // تفخيم
  | 'idgham_shafawi'        // إدغام شفوي
  | 'ikhfa_shafawi';        // إخفاء شفوي

export interface TajweedRuleMeta {
  id: TajweedRuleType;
  name: string;
  category: string;
  color: string;
  textColor: string;
  description: string;
  articulation: string;
  letters: string[];
  duration?: string;
  example: string;
}

export interface TajweedSegment {
  surah: number;
  ayah: number;
  wordIndex: number;
  wordText: string;
  letterRange: [number, number];
  letters: string;
  rule: TajweedRuleType;
  color: string;
}

export interface QuranWord {
  id: number;
  text: string;
  transliteration?: string;
  translation?: string;
  rule?: TajweedRuleType;
}

export interface QuranAyah {
  number: number;           // الترتيب في المصحف كاملاً (1-6236)
  numberInSurah: number;    // رقم الآية في السورة
  textUthmani: string;      // النص الكامل بالرسم العثماني
  textClean: string;        // النص المجرّد بدون تشكيل لتسهيل البحث
  juz: number;              // رقم الجزء (1-30)
  page: number;             // رقم الصفحة (1-604)
  hizbQuarter?: number;     // ربع الحزب (1-240)
  sajda?: boolean;          // سجدة تلاوة
  tafsir?: string;          // التفسير الميسر المعتمد
  segments?: TajweedSegment[];
}

export interface QuranSurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  startPage: number;
  endPage: number;
  juzNumber: number;
}

export interface QuranSurah extends QuranSurahMeta {
  ayahs: QuranAyah[];
}

export interface Reciter {
  id: string;
  name: string;
  subname: string;
  baseUrl: string;
  type: 'murattal' | 'mujawwad' | 'educational';
}

export interface UserBookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  note?: string;
  category: 'wird' | 'hifz' | 'tadabbur' | 'general';
  createdAt: string;
}

export interface HifzGoal {
  id: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  repetitionsCompleted: number;
  repetitionsTarget: number;
  status: 'active' | 'completed' | 'needs_review';
  createdAt: string;
  updatedAt: string;
}

export interface RenderLetterSpan {
  text: string;
  isTajweed: boolean;
  rule?: TajweedRuleType;
  color?: string;
}

export interface QuranSettings {
  fontSize: number;
  fontFamily: 'Amiri Quran' | 'Amiri' | 'Scheherazade New';
  theme: 'babyblue-light' | 'babyblue-dark' | 'classic-mushaf' | 'light' | 'night-emerald';
  showTajweedColors: boolean;
  displayMode: 'continuous' | 'separated';
  reciterId: string;
  autoScroll: boolean;
  showTafsirInline: boolean;
}

export interface ValidationReport {
  timestamp: string;
  totalSurahs: number;
  totalAyahs: number;
  hasErrors: boolean;
  issues: string[];
  bismillahCheckPassed: boolean;
  audioSourcesChecked: boolean;
}

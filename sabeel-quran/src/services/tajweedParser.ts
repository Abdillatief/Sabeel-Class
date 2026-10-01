/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TAJWEED_RULES } from '../data/tajweed-rules';
import { RenderLetterSpan, TajweedRuleType, TajweedSegment } from '../types/quran';

export const ZWJ = '\u200D'; // Zero-Width Joiner to preserve Arabic cursive connections

/**
 * Checks if a character is an Arabic combining diacritic/harakah
 */
export function isCombiningMark(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0x064B && code <= 0x065F) || // Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shaddah, Sukoon
    code === 0x0670 || // Superscript / Dagger Alif
    (code >= 0x06D6 && code <= 0x06DC) || // Quranic pause marks
    (code >= 0x06DF && code <= 0x06E8) || // Quranic small signs (small meem, high rounded zero, etc.)
    (code >= 0x06EA && code <= 0x06ED)
  );
}

/**
 * Sanitizes Uthmani text from spurious Tanzil encoding artifacts:
 * In some digital Tanzil editions, sequential tanween or end-of-verse connections
 * are encoded by appending a small meem (\u06E2 or \u06ED or \u06EB or \u06EC) onto tanween (e.g. ٌۢ, ٍۢ, ًۢ, ٌۭ, ٍۭ, ًۭ).
 * In standard Arabic fonts and Mus-haf mushafs, this renders as an erroneous literal meem above the tanween!
 * A small meem ONLY legitimately accompanies Noon or Tanween when followed by the letter Baa (ب) (حكم الإقلاب).
 * Everywhere else, it is an erroneous artifact that must be replaced by pure, clean canonical Tanween.
 */
export function sanitizeUthmaniTashkeel(text: string): string {
  if (!text) return '';

  return text
    // Replace tanween + spurious small meem with pure canonical tanween if not followed by Baa
    .replace(/([\u064B\u064C\u064D])[\u06E2\u06ED\u06EB\u06EC]/g, (match, tanween, offset, fullStr) => {
      const after = String(fullStr).slice(offset + match.length).trim();
      const firstChar = after.charAt(0);
      if (firstChar === 'ب' || after.startsWith('ب') || after.startsWith('بِ') || after.startsWith('بَ') || after.startsWith('بُ')) {
        return match; // Legitimate Iqlab before Baa
      }
      return tanween; // Erroneous meem artifact
    })
    // Remove standalone meem artifact at end of word or before non-Baa letters
    .replace(/([\u06E2\u06ED])(?=\s|[ۖۗۘۙۚۛ۝]|$)/g, (match, meem, offset, fullStr) => {
      const after = String(fullStr).slice(offset + match.length).trim();
      if (after.startsWith('ب') || after.startsWith('بِ') || after.startsWith('بَ') || after.startsWith('بُ')) {
        return match;
      }
      return '';
    })
    // Clean any accidental double tashkeel
    .replace(/\u0652\u0652+/g, '\u0652')
    .replace(/\u0651\u0651+/g, '\u0651');
}

/**
 * Returns the end index of the complete grapheme cluster
 * (base consonant + all attached diacritics, shaddah, harakat)
 */
export function getClusterEndIndex(text: string, startIndex: number): number {
  let end = startIndex + 1;
  while (end < text.length && isCombiningMark(text[end])) {
    end++;
  }
  return end;
}

export function getLastBaseLetter(text: string): string {
  for (let i = text.length - 1; i >= 0; i--) {
    if (!isCombiningMark(text[i]) && text[i] !== ZWJ) {
      return text[i];
    }
  }
  return '';
}

export function getFirstBaseLetter(text: string): string {
  for (let i = 0; i < text.length; i++) {
    if (!isCombiningMark(text[i]) && text[i] !== ZWJ) {
      return text[i];
    }
  }
  return '';
}

/**
 * Determines whether the Arabic letter connects to the following letter (to the left)
 */
export function doesConnectLeft(char: string): boolean {
  const nonConnecting = new Set([
    'ا', 'أ', 'إ', 'آ', 'ٱ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ء'
  ]);
  return Boolean(char && !nonConnecting.has(char));
}

/**
 * Normalizes an Arabic string by stripping diacritics and signs
 */
export function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '');
}

/**
 * Parses an Uthmani Ayah into structured words and letter-range Tajweed segments.
 * Fully customized according to user specifications:
 * - المد العارض للسكون: برتقالي (#F97316)
 * - المد المتصل والمنفصل: بينك (#EC4899)
 * - المد اللازم: أحمر (#DC2626)
 * - الغنة في النون والميم والإقلاب والإخفاء: أخضر (#16A34A)
 * - الحرف المفخم: أزرق كاتم (#1E3A8A)
 * - الحرف المرقق: بربل (#9333EA)
 * - القلقلة: بيبي بلو (#38BDF8)
 * - الحرف الساكن: رمادي (#6B7280)
 */
export function parseAyahTajweedSegments(
  surahNumber: number,
  ayahNumber: number,
  ayahText: string
): TajweedSegment[] {
  const segments: TajweedSegment[] = [];
  const cleanAyahText = sanitizeUthmaniTashkeel(ayahText);
  const words = cleanAyahText.trim().split(/\s+/);

  const QALQALAH_LETTERS = new Set(['ق', 'ط', 'ب', 'ج', 'د']);
  const MUFAKHKHAM_LETTERS = new Set(['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ']);
  const IKHFA_LETTERS = new Set(['ص', 'ذ', 'ث', 'ك', 'ج', 'ش', 'ق', 'س', 'د', 'ط', 'ز', 'ف', 'ت', 'ض', 'ظ']);
  const IDGHAM_GHUNNAH_LETTERS = new Set(['ي', 'ن', 'م', 'و']);
  const IDGHAM_NO_GHUNNAH_LETTERS = new Set(['ل', 'ر']);

  words.forEach((wordText, wordIndex) => {
    const isLastWordOfAyah = wordIndex === words.length - 1;

    // 1. المدود (لازم: أحمر | متصل ومنفصل: بينك | عارض للسكون: برتقالي)
    const maddRegex = /([ـاويى\u0670ٱ]\u0653|[ـاويى\u0670ٱ]ٓ|آ)/g;
    let maddMatch: RegExpExecArray | null;
    let hasMaddSign = false;

    while ((maddMatch = maddRegex.exec(wordText)) !== null) {
      hasMaddSign = true;
      const matchIndex = maddMatch.index;
      const clusterEnd = getClusterEndIndex(wordText, matchIndex + maddMatch[0].length - 1);
      
      const hasShaddahAfter = wordText.slice(clusterEnd).includes('\u0651');
      let ruleType: TajweedRuleType = 'madd_muttasil_munfasil';

      if (hasShaddahAfter) {
        // مد لازم (أحمر)
        ruleType = 'madd_lazim';
      } else {
        // مد متصل أو منفصل (بينك)
        ruleType = 'madd_muttasil_munfasil';
      }

      segments.push({
        surah: surahNumber,
        ayah: ayahNumber,
        wordIndex,
        wordText,
        letterRange: [matchIndex, clusterEnd],
        letters: wordText.slice(matchIndex, clusterEnd),
        rule: ruleType,
        color: TAJWEED_RULES[ruleType].color // أحمر أو بينك
      });
    }

    // 2. المد العارض للسكون في نهاية الآية (برتقالي)
    if (isLastWordOfAyah && !hasMaddSign) {
      // Find penultimate vowel letter (ي، و، ا، ٰ) before the final consonant
      const cleanWord = removeDiacritics(wordText);
      if (cleanWord.length >= 2) {
        const aridRegex = /([يوا\u0670])(?=[^يوا\u0670]*$)/;
        const aridMatch = wordText.match(aridRegex);
        if (aridMatch && aridMatch.index !== undefined) {
          const clusterEnd = getClusterEndIndex(wordText, aridMatch.index);
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [aridMatch.index, clusterEnd],
            letters: wordText.slice(aridMatch.index, clusterEnd),
            rule: 'madd_arid',
            color: TAJWEED_RULES.madd_arid.color // برتقالي
          });
        }
      }
    }

    // 3. الغنة في النون والميم المشددتين (أخضر)
    for (let i = 0; i < wordText.length; i++) {
      const char = wordText[i];
      if (char === 'ن' || char === 'م') {
        const nextChar = wordText[i + 1];
        if (nextChar === '\u0651' || nextChar === 'ّ') {
          const clusterEnd = getClusterEndIndex(wordText, i + 1);
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [i, clusterEnd],
            letters: wordText.slice(i, clusterEnd),
            rule: 'ghunnah',
            color: TAJWEED_RULES.ghunnah.color // أخضر
          });
        }
      }
    }

    // 4. الإقلاب (أخضر)
    const iqlabMatch = wordText.match(/([ن][\u06E2\u06E8]|[\u06E2\u06E8])/);
    if (iqlabMatch && iqlabMatch.index !== undefined) {
      const isInsideBaa = wordText.slice(iqlabMatch.index).includes('ب');
      const nextWord = words[wordIndex + 1];
      const isNextBaa = nextWord && removeDiacritics(nextWord).startsWith('ب');

      if (isInsideBaa || isNextBaa) {
        let start = iqlabMatch.index;
        while (start > 0 && isCombiningMark(wordText[start])) {
          start--;
        }
        const clusterEnd = getClusterEndIndex(wordText, iqlabMatch.index + iqlabMatch[0].length - 1);
        segments.push({
          surah: surahNumber,
          ayah: ayahNumber,
          wordIndex,
          wordText,
          letterRange: [start, clusterEnd],
          letters: wordText.slice(start, clusterEnd),
          rule: 'iqlab',
          color: TAJWEED_RULES.iqlab.color // أخضر
        });
      }
    }

    // 5. القلقلة (بيبي بلو: #38BDF8)
    for (let i = 0; i < wordText.length; i++) {
      const char = wordText[i];
      const nextChar = wordText[i + 1];
      const hasSukoon = nextChar === '\u06E1' || nextChar === '\u0652' || nextChar === 'ْ';
      const isWordEnd = i === wordText.length - 1 || (i === wordText.length - 2 && isCombiningMark(wordText[i + 1]));

      if (QALQALAH_LETTERS.has(char) && (hasSukoon || isWordEnd)) {
        const clusterEnd = getClusterEndIndex(wordText, i);
        segments.push({
          surah: surahNumber,
          ayah: ayahNumber,
          wordIndex,
          wordText,
          letterRange: [i, clusterEnd],
          letters: wordText.slice(i, clusterEnd),
          rule: 'qalqalah',
          color: TAJWEED_RULES.qalqalah.color // بيبي بلو
        });
      }
    }

    // 6. الإخفاء الحقيقي (أخضر: #16A34A)
    for (let i = 0; i < wordText.length - 1; i++) {
      const char = wordText[i];
      if (char === 'ن') {
        const nextChar = wordText[i + 1];
        const isSukoon = nextChar === '\u06E1' || nextChar === '\u0652';
        const targetLetter = isSukoon ? wordText[i + 2] : nextChar;
        if (targetLetter && IKHFA_LETTERS.has(targetLetter)) {
          const clusterEnd = isSukoon ? i + 2 : i + 1;
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [i, clusterEnd],
            letters: wordText.slice(i, clusterEnd),
            rule: 'ikhfa',
            color: TAJWEED_RULES.ikhfa.color // أخضر
          });
        }
      }
    }

    // 7. الإدغام والإخفاء بين الكلمات
    const nextWord = words[wordIndex + 1];
    if (nextWord) {
      const hasTanween = /[\u064B\u064C\u064D]/.test(wordText);
      const endsWithNoonSakin = wordText.endsWith('ن') || wordText.endsWith('نْ') || wordText.endsWith('نۡ');

      if (hasTanween || endsWithNoonSakin) {
        const nextWordClean = removeDiacritics(nextWord);
        const firstLetterOfNext = nextWordClean.charAt(0);

        let start = wordText.length - 1;
        while (start > 0 && isCombiningMark(wordText[start])) {
          start--;
        }

        if (IDGHAM_GHUNNAH_LETTERS.has(firstLetterOfNext)) {
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [start, wordText.length],
            letters: wordText.slice(start),
            rule: 'idgham_ghunnah',
            color: TAJWEED_RULES.idgham_ghunnah.color // أخضر
          });
        } else if (IDGHAM_NO_GHUNNAH_LETTERS.has(firstLetterOfNext)) {
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [start, wordText.length],
            letters: wordText.slice(start),
            rule: 'idgham_no_ghunnah',
            color: TAJWEED_RULES.idgham_no_ghunnah.color // رمادي
          });
        } else if (IKHFA_LETTERS.has(firstLetterOfNext)) {
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [start, wordText.length],
            letters: wordText.slice(start),
            rule: 'ikhfa',
            color: TAJWEED_RULES.ikhfa.color // أخضر
          });
        }
      }
    }

    // 8. الحرف المفخم (أزرق كاتم: #1E3A8A)
    for (let i = 0; i < wordText.length; i++) {
      const char = wordText[i];
      if (MUFAKHKHAM_LETTERS.has(char)) {
        // Only if not already colored by qalqalah
        const alreadyColored = segments.some(s => s.wordIndex === wordIndex && s.letterRange[0] <= i && s.letterRange[1] > i);
        if (!alreadyColored) {
          const clusterEnd = getClusterEndIndex(wordText, i);
          segments.push({
            surah: surahNumber,
            ayah: ayahNumber,
            wordIndex,
            wordText,
            letterRange: [i, clusterEnd],
            letters: wordText.slice(i, clusterEnd),
            rule: 'mufakhkham',
            color: TAJWEED_RULES.mufakhkham.color // أزرق كاتم
          });
        }
      }
    }
  });

  return segments;
}

/**
 * Splits a word into letter spans so that ONLY the specific Tajweed letter is colored,
 * while automatically injecting Zero-Width Joiners (ZWJ) at the boundaries
 * so Arabic cursive ligatures remain 100% UNBROKEN and CONNECTED!
 */
export function buildWordLetterSpans(
  wordText: string,
  wordIndex: number,
  ayahSegments: TajweedSegment[]
): RenderLetterSpan[] {
  const wordRules = ayahSegments.filter(s => s.wordIndex === wordIndex);
  if (wordRules.length === 0) {
    return [{ text: wordText, isTajweed: false }];
  }

  // Sort rules by start index
  const sortedRules = [...wordRules].sort((a, b) => a.letterRange[0] - b.letterRange[0]);

  const rawSpans: RenderLetterSpan[] = [];
  let currentIndex = 0;

  for (const ruleSeg of sortedRules) {
    const [start, end] = ruleSeg.letterRange;
    if (start < currentIndex || start >= wordText.length) continue;

    // Normal prefix before Tajweed letter
    if (start > currentIndex) {
      rawSpans.push({
        text: wordText.slice(currentIndex, start),
        isTajweed: false
      });
    }

    // Tajweed letter
    const ruleEnd = Math.min(wordText.length, Math.max(end, start + 1));
    rawSpans.push({
      text: wordText.slice(start, ruleEnd),
      isTajweed: true,
      rule: ruleSeg.rule,
      color: ruleSeg.color
    });

    currentIndex = ruleEnd;
  }

  // Trailing normal text
  if (currentIndex < wordText.length) {
    rawSpans.push({
      text: wordText.slice(currentIndex),
      isTajweed: false
    });
  }

  // Preserve Arabic Cursive Joining with Zero-Width Joiner (ZWJ)
  for (let i = 0; i < rawSpans.length - 1; i++) {
    const currentSpan = rawSpans[i];
    const nextSpan = rawSpans[i + 1];

    const lastBaseChar = getLastBaseLetter(currentSpan.text);
    if (doesConnectLeft(lastBaseChar)) {
      currentSpan.text += ZWJ;
      nextSpan.text = ZWJ + nextSpan.text;
    }
  }

  return rawSpans;
}

/**
 * Builds the direct word pronunciation audio URL from Quran CDN
 */
export function getWordAudioUrl(surahNumber: number, ayahNumber: number, wordIndexInAyah: number): string {
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahNumber).padStart(3, '0');
  const wStr = String(wordIndexInAyah + 1).padStart(3, '0');
  return `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_${wStr}.mp3`;
}

// Global audio instance for word pronunciation
let activeWordAudio: HTMLAudioElement | null = null;

export function playWordPronunciation(
  surahNumber: number,
  ayahNumber: number,
  wordIndexInAyah: number
): Promise<void> {
  if (activeWordAudio) {
    activeWordAudio.pause();
    activeWordAudio = null;
  }

  const url = getWordAudioUrl(surahNumber, ayahNumber, wordIndexInAyah);
  const audio = new Audio(url);
  activeWordAudio = audio;

  return audio.play().catch(err => {
    console.warn('Word audio playback failed', err);
  });
}

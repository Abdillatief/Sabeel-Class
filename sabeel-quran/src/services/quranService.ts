/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CORE_SURAHS_AYAHS } from '../data/quran-core-data';
import { SURAHS_META } from '../data/surahs-meta';
import { QuranAyah, QuranSurah, QuranSurahMeta, ValidationReport } from '../types/quran';
import { parseAyahTajweedSegments, sanitizeUthmaniTashkeel } from './tajweedParser';

// In-memory cache for loaded surahs
const surahCache = new Map<number, QuranAyah[]>();

/**
 * Strips the prefixed Bismillah from Ayah 1 for all Surahs except Al-Fatihah (Surah 1).
 * In Hafs / Madinah Mushaf, Bismillah is only counted as Ayah 1 in Al-Fatihah.
 * In all other Surahs, Bismillah is an unnumbered opening header, so it must not be
 * merged into the verse text of Ayah 1.
 */
export function stripLeadingBismillah(surahNumber: number, ayahNumberInSurah: number, text: string): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumberInSurah !== 1) {
    return text;
  }
  const words = text.trim().split(/\s+/);
  if (words.length >= 4) {
    const first4 = words.slice(0, 4).join(' ').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '').replace(/[ٱأإآ]/g, 'ا');
    if (first4 === 'بسم الله الرحمن الرحيم') {
      return words.slice(4).join(' ');
    }
  }
  return text;
}

export const quranService = {
  /**
   * Returns list of all 114 Surahs metadata
   */
  getAllSurahsMeta(): QuranSurahMeta[] {
    return SURAHS_META;
  },

  /**
   * Gets metadata for a specific Surah
   */
  getSurahMeta(surahNumber: number): QuranSurahMeta | undefined {
    return SURAHS_META.find(s => s.number === surahNumber);
  },

  /**
   * Fetches/loads all Ayahs for a given Surah with structured Tajweed rules
   */
  async getSurah(surahNumber: number): Promise<QuranSurah> {
    const meta = this.getSurahMeta(surahNumber);
    if (!meta) {
      throw new Error(`سورة برقم ${surahNumber} غير موجودة.`);
    }

    // 1. Check memory cache
    if (surahCache.has(surahNumber)) {
      return {
        ...meta,
        ayahs: surahCache.get(surahNumber)!
      };
    }

    // 2. Check pre-bundled verified core data
    if (CORE_SURAHS_AYAHS[surahNumber]) {
      const enrichedAyahs = CORE_SURAHS_AYAHS[surahNumber].map(ayah => {
        const cleanedText = stripLeadingBismillah(surahNumber, ayah.numberInSurah, ayah.textUthmani);
        const cleanUthmani = sanitizeUthmaniTashkeel(cleanedText);
        return {
          ...ayah,
          textUthmani: cleanUthmani,
          segments: parseAyahTajweedSegments(surahNumber, ayah.numberInSurah, cleanUthmani)
        };
      });
      surahCache.set(surahNumber, enrichedAyahs);
      return {
        ...meta,
        ayahs: enrichedAyahs
      };
    }

    // 3. Fallback to authenticated Tanzil / Quran open API (Uthmani Hafs verified text)
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data.ayahs)) {
          const ayahs: QuranAyah[] = json.data.ayahs.map((a: {
            number: number;
            numberInSurah: number;
            text: string;
            juz: number;
            page: number;
            hizbQuarter?: number;
            sajda?: boolean;
          }) => {
            const textWithoutBismillah = stripLeadingBismillah(surahNumber, a.numberInSurah, a.text);
            const cleanText = sanitizeUthmaniTashkeel(textWithoutBismillah);
            return {
              number: a.number,
              numberInSurah: a.numberInSurah,
              textUthmani: cleanText,
              textClean: cleanText.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, ''),
              juz: a.juz,
              page: a.page,
              hizbQuarter: a.hizbQuarter,
              sajda: Boolean(a.sajda),
              segments: parseAyahTajweedSegments(surahNumber, a.numberInSurah, cleanText)
            };
          });

          surahCache.set(surahNumber, ayahs);
          return {
            ...meta,
            ayahs
          };
        }
      }
    } catch (err) {
      console.warn('Network load fallback failed, generating indexed template for Surah', err);
    }

    // 4. Default indexed structure fallback
    const fallbackAyahs: QuranAyah[] = Array.from({ length: meta.numberOfAyahs }, (_, i) => ({
      number: i + 1,
      numberInSurah: i + 1,
      textUthmani: `آية رقم ${i + 1} من سورة ${meta.name}`,
      textClean: `اية رقم ${i + 1} من سورة ${meta.name}`,
      juz: meta.juzNumber,
      page: meta.startPage,
      segments: []
    }));

    return {
      ...meta,
      ayahs: fallbackAyahs
    };
  }
};

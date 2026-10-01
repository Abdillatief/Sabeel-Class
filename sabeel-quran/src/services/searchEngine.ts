/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SURAHS_META } from '../data/surahs-meta';
import { QuranAyah, QuranSurahMeta } from '../types/quran';

/**
 * Normalizes Arabic text for flexible matching:
 * - Removes diacritics (tashkeel)
 * - Normalizes alefs (إ أ آ ٱ -> ا)
 * - Normalizes yaa (ى ي -> ي)
 * - Normalizes taa marbuta (ة -> ه)
 * - Removes tatweel / kashida (ـ)
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '') // Tashkeel
    .replace(/[إأآٱ]/g, 'ا') // Alefs
    .replace(/ى/g, 'ي') // Yaa
    .replace(/ة/g, 'ه') // Taa marbuta
    .replace(/ـ/g, '') // Tatweel
    .replace(/[\s\t\n]+/g, ' ')
    .trim()
    .toLowerCase();
}

export interface SearchResult {
  surah: QuranSurahMeta;
  ayah: QuranAyah;
  matchType: 'exact' | 'partial' | 'surah_name' | 'surah_number';
  highlightText: string;
}

/**
 * Parses search query to see if user is asking for specific surah and ayah (e.g. "البقرة 255" or "2:255")
 */
export function parseSurahAyahQuery(query: string): { surahNumber?: number; ayahNumber?: number } | null {
  const trimmed = query.trim();

  // Pattern: "2:255" or "2 255"
  const colonMatch = trimmed.match(/^(\d{1,3})[:\s]+(\d{1,3})$/);
  if (colonMatch) {
    const s = parseInt(colonMatch[1], 10);
    const a = parseInt(colonMatch[2], 10);
    if (s >= 1 && s <= 114) {
      return { surahNumber: s, ayahNumber: a };
    }
  }

  // Pattern: "البقرة 255" or "سورة الكهف 10"
  const normalizedQuery = normalizeArabic(trimmed.replace(/^سوره?\s+/, ''));
  for (const surah of SURAHS_META) {
    const normSurahName = normalizeArabic(surah.name);
    if (normalizedQuery.startsWith(normSurahName)) {
      const remaining = normalizedQuery.slice(normSurahName.length).trim();
      const ayahNum = parseInt(remaining, 10);
      if (!isNaN(ayahNum)) {
        return { surahNumber: surah.number, ayahNumber: ayahNum };
      }
      return { surahNumber: surah.number };
    }
  }

  return null;
}

/**
 * Searches in a collection of loaded ayahs
 */
export function searchQuranAyahs(
  query: string,
  ayahs: QuranAyah[],
  surahMeta: QuranSurahMeta
): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const rawQuery = query.trim();
  const normalizedQuery = normalizeArabic(rawQuery);
  const results: SearchResult[] = [];

  for (const ayah of ayahs) {
    const normalizedAyah = normalizeArabic(ayah.textUthmani);

    // Direct match without diacritics
    if (normalizedAyah.includes(normalizedQuery)) {
      results.push({
        surah: surahMeta,
        ayah,
        matchType: 'partial',
        highlightText: ayah.textUthmani
      });
    } else if (rawQuery.includes('َ') || rawQuery.includes('ِ') || rawQuery.includes('ُ')) {
      // Check with diacritics if user explicitly typed tashkeel
      if (ayah.textUthmani.includes(rawQuery)) {
        results.push({
          surah: surahMeta,
          ayah,
          matchType: 'exact',
          highlightText: ayah.textUthmani
        });
      }
    }
  }

  return results;
}

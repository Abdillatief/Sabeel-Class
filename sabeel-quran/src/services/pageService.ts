/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SURAHS_META } from '../data/surahs-meta';
import { QuranSurahMeta } from '../types/quran';

export interface PageInfo {
  pageNumber: number;
  surah: QuranSurahMeta;
  estimatedAyah: number;
  juzNumber: number;
}

/**
 * Returns the primary Surah and estimated starting Ayah for any page from 1 to 604
 * in the standard Madinah Mus-haf (مصحف المدينة النبوية)
 */
export function getPageInfo(pageNumber: number): PageInfo {
  const safePage = Math.min(604, Math.max(1, Math.round(pageNumber)));

  // Find the surah containing this page
  // Priority: if a surah starts on this page, select it
  const startingSurah = SURAHS_META.find(s => s.startPage === safePage);
  if (startingSurah) {
    return {
      pageNumber: safePage,
      surah: startingSurah,
      estimatedAyah: 1,
      juzNumber: startingSurah.juzNumber
    };
  }

  // Otherwise, find the surah spanning this page
  const spanningSurah = SURAHS_META.find(s => safePage >= s.startPage && safePage <= s.endPage) || SURAHS_META[0];

  // Estimate the ayah on this page based on relative position within the surah
  const totalPagesInSurah = Math.max(1, (spanningSurah.endPage - spanningSurah.startPage) + 1);
  const pageOffset = safePage - spanningSurah.startPage;
  const ayahsPerPage = spanningSurah.numberOfAyahs / totalPagesInSurah;
  const estimatedAyah = Math.min(spanningSurah.numberOfAyahs, Math.max(1, Math.floor(pageOffset * ayahsPerPage) + 1));

  return {
    pageNumber: safePage,
    surah: spanningSurah,
    estimatedAyah,
    juzNumber: spanningSurah.juzNumber
  };
}

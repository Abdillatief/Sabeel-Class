/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Reciter } from '../types/quran';

export const RECITERS: Reciter[] = [
  {
    id: 'husary_educational',
    name: 'الشيخ محمود خليل الحصري',
    subname: 'المصحف المعلم (التعليم والترديد)',
    baseUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps',
    type: 'educational'
  },
  {
    id: 'husary_murattal',
    name: 'الشيخ محمود خليل الحصري',
    subname: 'المصحف المرتل (ضبط الأحكام ومخارج الحروف)',
    baseUrl: 'https://everyayah.com/data/Husary_128kbps',
    type: 'murattal'
  },
  {
    id: 'alafasy',
    name: 'الشيخ مشاري بن راشد العفاسي',
    subname: 'تلاوة نقية عذبة 128kbps',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps',
    type: 'murattal'
  },
  {
    id: 'abdulbasit',
    name: 'الشيخ عبد الباسط عبد الصمد',
    subname: 'المصحف المرتل الكلاسيكي',
    baseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
    type: 'murattal'
  },
  {
    id: 'minshawi_murattal',
    name: 'الشيخ محمد صديق المنشاوي',
    subname: 'المصحف المرتل الخاشع',
    baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps',
    type: 'murattal'
  },
  {
    id: 'ghamadi',
    name: 'الشيخ سعد الغامدي',
    subname: 'ترتيل متقن وسلس للمراجعة',
    baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps',
    type: 'murattal'
  }
];

/**
 * Builds the exact audio URL for a given Surah and Ayah number
 * EveryAyah format: {Surah3Digits}{Ayah3Digits}.mp3, e.g. 001001.mp3
 */
export function getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumberInSurah: number): string {
  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const surahStr = String(surahNumber).padStart(3, '0');
  const ayahStr = String(ayahNumberInSurah).padStart(3, '0');
  return `${reciter.baseUrl}/${surahStr}${ayahStr}.mp3`;
}

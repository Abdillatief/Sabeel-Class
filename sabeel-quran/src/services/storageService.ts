/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HifzGoal, QuranSettings, UserBookmark } from '../types/quran';

const STORAGE_KEYS = {
  LAST_READ: 'sabeel_quran_last_read',
  BOOKMARKS: 'sabeel_quran_bookmarks',
  HIFZ_GOALS: 'sabeel_quran_hifz_goals',
  SETTINGS: 'sabeel_quran_settings',
  NOTES: 'sabeel_quran_notes'
};

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  updatedAt: string;
}

export interface AyahNote {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
  createdAt: string;
}

const DEFAULT_SETTINGS: QuranSettings = {
  fontSize: 28,
  fontFamily: 'Amiri Quran',
  theme: 'babyblue-light',
  showTajweedColors: true,
  displayMode: 'continuous',
  reciterId: 'husary_educational',
  autoScroll: true,
  showTafsirInline: false
};

export const storageService = {
  getLastRead(): LastReadPosition {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READ);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      surahNumber: 1,
      ayahNumber: 1,
      surahName: 'الفاتحة',
      updatedAt: new Date().toISOString()
    };
  },

  setLastRead(pos: LastReadPosition) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(pos));
    } catch (e) {
      console.error('Error saving last read', e);
    }
  },

  getBookmarks(): UserBookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [
      {
        id: 'bm-initial',
        surahNumber: 1,
        ayahNumber: 1,
        surahName: 'الفاتحة',
        category: 'wird',
        note: 'بداية الختمة المباركة',
        createdAt: new Date().toISOString()
      }
    ];
  },

  addBookmark(bm: Omit<UserBookmark, 'id' | 'createdAt'>): UserBookmark {
    const bookmarks = this.getBookmarks();
    const newBm: UserBookmark = {
      ...bm,
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    bookmarks.unshift(newBm);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Error saving bookmark', e);
    }
    return newBm;
  },

  removeBookmark(id: string) {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Error removing bookmark', e);
    }
  },

  getHifzGoals(): HifzGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HIFZ_GOALS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [
      {
        id: 'goal-fatihah',
        surahNumber: 1,
        startAyah: 1,
        endAyah: 7,
        repetitionsCompleted: 5,
        repetitionsTarget: 10,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'goal-mulk',
        surahNumber: 67,
        startAyah: 1,
        endAyah: 10,
        repetitionsCompleted: 2,
        repetitionsTarget: 5,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  },

  saveHifzGoals(goals: HifzGoal[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HIFZ_GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving hifz goals', e);
    }
  },

  getNotes(): AyahNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  },

  saveNote(surahNumber: number, ayahNumber: number, text: string) {
    const notes = this.getNotes().filter(n => !(n.surahNumber === surahNumber && n.ayahNumber === ayahNumber));
    if (text.trim()) {
      notes.unshift({
        id: `note-${surahNumber}-${ayahNumber}`,
        surahNumber,
        ayahNumber,
        text: text.trim(),
        createdAt: new Date().toISOString()
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving note', e);
    }
  },

  getSettings(): QuranSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: QuranSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  exportUserData(): string {
    return JSON.stringify({
      lastRead: this.getLastRead(),
      bookmarks: this.getBookmarks(),
      hifzGoals: this.getHifzGoals(),
      notes: this.getNotes(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  importUserData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
      if (data.lastRead) localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(data.lastRead));
      if (data.hifzGoals) localStorage.setItem(STORAGE_KEYS.HIFZ_GOALS, JSON.stringify(data.hifzGoals));
      if (data.notes) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomPlayer } from './components/layout/BottomPlayer';
import { Dashboard } from './components/home/Dashboard';
import { MushafReader } from './components/mushaf/MushafReader';
import { HifzStudio } from './components/hifz/HifzStudio';
import { TasmeeStudio } from './components/tasmee/TasmeeStudio';
import { TajweedGuide } from './components/tajweed/TajweedGuide';
import { TajweedModal } from './components/mushaf/TajweedModal';
import { TafsirModal } from './components/mushaf/TafsirModal';
import { MushafSettingsModal } from './components/mushaf/MushafSettingsModal';
import { SearchModal } from './components/search/SearchModal';
import { SURAHS_META } from './data/surahs-meta';
import { storageService, LastReadPosition } from './services/storageService';
import { QuranAyah, QuranSettings, TajweedRuleType, UserBookmark } from './types/quran';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(1);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Settings & Storage State
  const [settings, setSettings] = useState<QuranSettings>(() => storageService.getSettings());
  const [lastRead, setLastRead] = useState<LastReadPosition>(() => storageService.getLastRead());
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(() => storageService.getBookmarks());

  // Navigation & Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTajweedRule, setSelectedTajweedRule] = useState<{ rule: TajweedRuleType; word: string } | null>(null);
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<QuranAyah | null>(null);

  // Synchronize Baby Blue theme on html and body
  useEffect(() => {
    const isDark = settings.theme === 'babyblue-dark' || settings.theme === 'night-emerald';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.body.className = `theme-${settings.theme} ${isDark ? 'dark bg-stone-950 text-white' : 'bg-sky-50/20 text-stone-900'}`;
  }, [settings.theme]);

  // Global Keyboard shortcuts (Ctrl+K or Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentSurahMeta = SURAHS_META.find(s => s.number === currentSurahNumber) || SURAHS_META[0];

  // Update Last Read
  const updateLastRead = (surahNum: number, ayahNum: number) => {
    const sMeta = SURAHS_META.find(s => s.number === surahNum);
    const pos: LastReadPosition = {
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      surahName: sMeta?.name || 'الفاتحة',
      updatedAt: new Date().toISOString()
    };
    setLastRead(pos);
    storageService.setLastRead(pos);
  };

  // Navigate to Surah / Ayah
  const handleNavigateToMushaf = (surahNumber: number, ayahNumber: number = 1) => {
    setCurrentSurahNumber(surahNumber);
    setCurrentAyahNumber(ayahNumber);
    updateLastRead(surahNumber, ayahNumber);
    setActiveTab('mushaf');
  };

  // Audio Playback
  const handlePlayAyah = (surahNumber: number, ayahNumber: number) => {
    setCurrentSurahNumber(surahNumber);
    setCurrentAyahNumber(ayahNumber);
    updateLastRead(surahNumber, ayahNumber);
    setIsPlaying(true);
  };

  const handleNextAyah = () => {
    if (currentAyahNumber < currentSurahMeta.numberOfAyahs) {
      setCurrentAyahNumber(prev => prev + 1);
      updateLastRead(currentSurahNumber, currentAyahNumber + 1);
    } else if (currentSurahNumber < 114) {
      setCurrentSurahNumber(prev => prev + 1);
      setCurrentAyahNumber(1);
      updateLastRead(currentSurahNumber + 1, 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahNumber > 1) {
      setCurrentAyahNumber(prev => prev - 1);
      updateLastRead(currentSurahNumber, currentAyahNumber - 1);
    }
  };

  // Bookmarks toggle
  const isAyahBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some(b => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
  };

  const handleToggleBookmark = (surahNum: number, ayahNum: number) => {
    const existing = bookmarks.find(b => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
    if (existing) {
      storageService.removeBookmark(existing.id);
      setBookmarks(storageService.getBookmarks());
    } else {
      const sMeta = SURAHS_META.find(s => s.number === surahNum);
      storageService.addBookmark({
        surahNumber: surahNum,
        ayahNumber: ayahNum,
        surahName: sMeta?.name || '',
        category: 'wird'
      });
      setBookmarks(storageService.getBookmarks());
    }
  };

  const handleSaveAyahNote = (ayah: QuranAyah, noteText: string) => {
    storageService.saveNote(currentSurahNumber, ayah.numberInSurah, noteText);
  };

  const handleUpdateSettings = (newSettings: QuranSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // Toggle Baby Blue light vs dark theme
  const handleToggleTheme = () => {
    const isDark = settings.theme === 'babyblue-dark' || settings.theme === 'night-emerald';
    const nextTheme = isDark ? 'babyblue-light' : 'babyblue-dark';
    handleUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Lightweight Navbar (Only Menu, Title, Theme & Search) */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        settings={settings}
        onToggleTheme={handleToggleTheme}
      />

      {/* Slide-out Sidebar Drawer with Navigation Items */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            lastRead={lastRead}
            bookmarks={bookmarks}
            onContinueReading={handleNavigateToMushaf}
            onSelectSurah={(sNum) => handleNavigateToMushaf(sNum, 1)}
            onNavigateToHifz={() => setActiveTab('hifz')}
            onNavigateToTasmee={() => setActiveTab('tasmee')}
            onNavigateToTajweed={() => setActiveTab('tajweed')}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'mushaf' && (
          <MushafReader
            surahNumber={currentSurahNumber}
            initialAyahNumber={currentAyahNumber}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            activeAyahNumber={currentAyahNumber}
            isPlaying={isPlaying}
            onPlayAyah={handlePlayAyah}
            onSelectSurah={(sNum) => {
              setCurrentSurahNumber(sNum);
              setCurrentAyahNumber(1);
              updateLastRead(sNum, 1);
            }}
            onOpenTajweedModal={(rule, word) => setSelectedTajweedRule({ rule, word })}
            onOpenTafsirModal={(ayah) => setSelectedTafsirAyah(ayah)}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={isAyahBookmarked}
          />
        )}

        {activeTab === 'hifz' && (
          <HifzStudio
            onPlayAyah={handlePlayAyah}
            onNavigateToMushaf={handleNavigateToMushaf}
          />
        )}

        {activeTab === 'tasmee' && (
          <TasmeeStudio
            onNavigateToMushaf={handleNavigateToMushaf}
          />
        )}

        {activeTab === 'tajweed' && (
          <TajweedGuide
            onNavigateToSurah={(sNum, aNum) => handleNavigateToMushaf(sNum, aNum)}
          />
        )}
      </main>

      {/* Floating Audio Player (Curtain folded down by default) */}
      <BottomPlayer
        currentSurah={currentSurahMeta}
        currentAyahNumber={currentAyahNumber}
        totalAyahsInSurah={currentSurahMeta.numberOfAyahs}
        reciterId={settings.reciterId}
        onSelectReciter={(rId) => handleUpdateSettings({ ...settings, reciterId: rId })}
        onNextAyah={handleNextAyah}
        onPrevAyah={handlePrevAyah}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          onSelectResult={handleNavigateToMushaf}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <MushafSettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Tajweed Explanation Modal */}
      {selectedTajweedRule && (
        <TajweedModal
          ruleId={selectedTajweedRule.rule}
          selectedWordText={selectedTajweedRule.word}
          onClose={() => setSelectedTajweedRule(null)}
        />
      )}

      {/* Tafsir Modal */}
      {selectedTafsirAyah && (
        <TafsirModal
          surah={currentSurahMeta}
          ayah={selectedTafsirAyah}
          existingNote={
            storageService.getNotes().find(
              n => n.surahNumber === currentSurahNumber && n.ayahNumber === selectedTafsirAyah.numberInSurah
            )?.text
          }
          onSaveNote={(noteText) => handleSaveAyahNote(selectedTafsirAyah, noteText)}
          onClose={() => setSelectedTafsirAyah(null)}
        />
      )}
    </div>
  );
}

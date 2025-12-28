
import React, { useState, useEffect, useCallback } from 'react';
import { sideStoryVolumes } from '../data/sideStories';
import { Language, SideStoryVolume, ReadingMode } from '../types';
import SideStoryVolumeList from '../components/sidestory/SideStoryVolumeList';
import SideStoryChapterList from '../components/sidestory/SideStoryChapterList';
import SideStoryExtraDirectory from '../components/sidestory/SideStoryExtraDirectory';
import SideStoryReader from '../components/sidestory/SideStoryReader';
import VisualNovelPage from '../pages/VisualNovelPage'; 
import SideCharacterModal from '../components/sidestory/SideCharacterModal';
import SideStoryEntryAnimation from '../components/SideStoryEntryAnimation';
import { ReaderFont } from '../components/fonts/fontConfig';
import TemporaryTerminal from '../components/TemporaryTerminal';

interface SideStoriesPageProps {
  language: Language;
  isLightTheme: boolean;
  onVolumeChange: (volumeId: string | null) => void;
  readerFont: ReaderFont;
  readingMode?: ReadingMode; // Accept reading mode
  onTerminalOpen?: () => void;
  onTerminalClose?: () => void;
}

const SideStoriesPage: React.FC<SideStoriesPageProps> = ({ language, isLightTheme, onVolumeChange, readerFont, readingMode = 'standard', onTerminalOpen, onTerminalClose }) => {
  // Navigation State: 'volumes' -> 'chapters' -> 'extra_directory' (optional) -> 'reader' | 'game'
  const [viewMode, setViewMode] = useState<'volumes' | 'chapters' | 'extra_directory' | 'reader' | 'game'>('volumes');
  const [activeVolume, setActiveVolume] = useState<SideStoryVolume | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showCharModal, setShowCharModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  // Terminal State: Stores the ID of the script to play, null if closed
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);

  // Trigger animation when entering a folder (Volume)
  const handleVolumeSelect = (vol: SideStoryVolume) => {
    setActiveVolume(vol);
    onVolumeChange(vol.id); // Notify App.tsx to potentially play music
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setViewMode('chapters');
  };

  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
    
    // Check if it's the special terminal chapter
    if (activeVolume && activeVolume.chapters[index].id === 'special-terminal-discovery') {
       handleOpenTerminal('T001');
       return; 
    }

    // Logic: Respect Reading Mode preference, but allow override for specific highly-interactive volumes like DAILY if we want (Currently unified)
    if (readingMode === 'visual_novel') {
        setViewMode('game');
    } else {
        setViewMode('reader');
    }
  };

  const handleEnterExtraDirectory = () => {
    setViewMode('extra_directory');
  };

  const handleExtraChapterSelect = (chapterId: string) => {
      if (!activeVolume) return;
      const index = activeVolume.chapters.findIndex(c => c.id === chapterId);
      if (index !== -1) {
          setCurrentChapterIndex(index);
          // Extra chapters (like the diary) often look better as text, but let's respect preference
          setViewMode(readingMode === 'visual_novel' ? 'game' : 'reader');
      }
  };
  
  const handleBackToVolumes = () => {
      setActiveVolume(null);
      onVolumeChange(null); // Notify App.tsx we left the volume
      setViewMode('volumes');
  };

  // Wrap with useCallback to stabilize reference
  const handleOpenTerminal = useCallback((scriptId: string) => {
      setActiveTerminalId(scriptId);
      if (onTerminalOpen) onTerminalOpen();
  }, [onTerminalOpen]);

  const handleCloseTerminal = useCallback(() => {
      setActiveTerminalId(null);
      if (onTerminalClose) onTerminalClose();
  }, [onTerminalClose]);

  const handleTerminalComplete = useCallback(() => {
      handleCloseTerminal();
      // Auto-advance to the next chapter after terminal interaction if possible
      if (activeVolume) {
          // Find the index of the terminal chapter (usually via ID special-terminal-discovery)
          const termIndex = activeVolume.chapters.findIndex(c => c.id === 'special-terminal-discovery');
          if (termIndex !== -1 && termIndex < activeVolume.chapters.length - 1) {
              // Advance to next chapter
              setCurrentChapterIndex(termIndex + 1);
              // Respect view mode (if previous was game, next should likely stay unless specific overrides)
              // But here we rely on the state-based effect to trigger open, so we just update index.
              // Note: viewMode might need to be set if we want to proceed to reading.
              // However, since we are in `SideStoriesPage`, changing `currentChapterIndex` will propagate to `SideStoryReader` or `VisualNovelPage`
              // depending on current `viewMode`. 
              // If we were on the LIST when clicked (shouldn't happen for reader flow), we might need to set mode.
          }
      }
  }, [activeVolume, handleCloseTerminal]);

  // Monitor chapter changes to trigger terminal if navigated to (e.g. from previous chapter in Game Mode)
  useEffect(() => {
      if (activeVolume && (viewMode === 'game' || viewMode === 'reader')) {
          const chapter = activeVolume.chapters[currentChapterIndex];
          if (chapter && chapter.id === 'special-terminal-discovery') {
              handleOpenTerminal('T001');
          }
      }
  }, [currentChapterIndex, activeVolume, viewMode, handleOpenTerminal]);

  // Render Animation if active
  if (isAnimating && activeVolume) {
    return (
        <SideStoryEntryAnimation 
            onComplete={handleAnimationComplete}
            language={language}
            volumeId={activeVolume.id}
        />
    );
  }

  // --- View 1: Volume Index (Directory) ---
  if (viewMode === 'volumes') {
    return (
        <>
            <SideStoryVolumeList 
                volumes={sideStoryVolumes}
                onSelectVolume={handleVolumeSelect}
                onOpenCharModal={() => setShowCharModal(true)}
                onOpenTerminal={() => handleOpenTerminal('T001')} // Default fallback if triggered here
                language={language}
                isLightTheme={isLightTheme}
            />
            <SideCharacterModal 
                isOpen={showCharModal}
                onClose={() => setShowCharModal(false)}
                language={language}
                isLightTheme={isLightTheme}
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
        </>
    );
  }

  // --- View 2: Chapter List (File Browser) ---
  if (viewMode === 'chapters' && activeVolume) {
      return (
        <>
            <SideStoryChapterList 
                volume={activeVolume}
                onBack={handleBackToVolumes}
                onSelectChapter={handleChapterSelect}
                onEnterExtra={handleEnterExtraDirectory}
                onOpenTerminal={handleOpenTerminal}
                language={language}
                isLightTheme={isLightTheme}
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
        </>
      );
  }

  // --- View 2.5: Extra Fragmented Directory ---
  if (viewMode === 'extra_directory' && activeVolume) {
      const extraChapters = activeVolume.chapters.filter(c => c.id === 'story-byaki-diary');
      return (
          <SideStoryExtraDirectory 
            chapters={extraChapters}
            onBack={() => setViewMode('chapters')}
            onSelectChapter={handleExtraChapterSelect}
            language={language}
            isLightTheme={isLightTheme}
          />
      );
  }

  // --- View 3: Reader (Standard) ---
  if (viewMode === 'reader' && activeVolume) {
      return (
        <>
            <SideStoryReader 
                volume={activeVolume}
                currentIndex={currentChapterIndex} 
                onBack={() => {
                    const isExtra = activeVolume.chapters[currentChapterIndex].id === 'story-byaki-diary';
                    setViewMode(isExtra ? 'extra_directory' : 'chapters');
                }}
                language={language}
                isLightTheme={isLightTheme}
                readerFont={readerFont}
                onOpenTerminal={handleOpenTerminal} 
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
        </>
      );
  }

  // --- View 4: Game Engine (Visual Novel) ---
  if (viewMode === 'game' && activeVolume) {
      return (
          <>
            <VisualNovelPage 
                chapter={activeVolume.chapters[currentChapterIndex]}
                onNextChapter={() => {
                    if (currentChapterIndex < activeVolume.chapters.length - 1) {
                        setCurrentChapterIndex(prev => prev + 1);
                    }
                }}
                onPrevChapter={() => {
                    if (currentChapterIndex > 0) {
                        setCurrentChapterIndex(prev => prev - 1);
                    }
                }}
                onExit={() => setViewMode('chapters')}
                language={language}
                isLightTheme={isLightTheme}
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
          </>
      );
  }

  return null;
};

export default SideStoriesPage;

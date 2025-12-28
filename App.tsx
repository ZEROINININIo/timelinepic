
import React, { useState, useEffect } from 'react';
import RPGMap from './components/game/RPGMap';
import GalleryEntry from './components/GalleryEntry';
import CustomCursor from './components/CustomCursor';
import BackgroundMusic, { unlockGlobalAudio } from './components/BackgroundMusic';
import { Language } from './types';

const STORAGE_KEY = 'nova_gallery_config_v1';

interface AppConfig {
  language: Language;
  bgmPlaying: boolean;
  bgmVolume: number;
}

const defaultConfig: AppConfig = {
  language: 'zh-CN',
  bgmPlaying: true, 
  bgmVolume: 0.2,
};

const App: React.FC = () => {
  const loadConfig = (): AppConfig => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Failed to load config", e);
    }
    return defaultConfig;
  };

  const initialConfig = loadConfig();
  
  // App State Flow: ENTRY -> READY
  const [appState, setAppState] = useState<'ENTRY' | 'READY'>('ENTRY');
  
  // Minimal Settings
  const [language, setLanguage] = useState<Language>(initialConfig.language);
  const [bgmPlaying, setBgmPlaying] = useState(initialConfig.bgmPlaying);
  const [bgmVolume, setBgmVolume] = useState(initialConfig.bgmVolume);

  // Default visuals
  useEffect(() => {
      document.body.classList.add('crt-enabled'); // Always on for gallery vibe
      document.body.classList.remove('light-theme'); // Force dark mode
  }, []);

  // Audio Sources
  const audioSources = [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/i09IZ3effnne",
    "https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/fd991fcc1f737774/main.mp3"
  ];

  // Cleanup Loader
  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.remove(), 800);
      }, 600);
    }
  }, []);

  // Global Audio Unlock Listener (Fallback since we removed the boot screen click)
  useEffect(() => {
      const unlock = () => {
          unlockGlobalAudio();
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
      return () => {
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
      };
  }, []);

  // Persistence
  useEffect(() => {
    const config: AppConfig = { language, bgmPlaying, bgmVolume };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [language, bgmPlaying, bgmVolume]);

  const handleEntryComplete = () => {
    setAppState('READY');
  };

  return (
    <>
      <CustomCursor />

      {appState === 'ENTRY' && (
        <GalleryEntry onComplete={handleEntryComplete} />
      )}

      {/* Main Game State */}
      <div className={`fixed inset-0 overflow-hidden bg-black text-ash-light transition-opacity duration-1000 ${appState === 'READY' ? 'opacity-100' : 'opacity-0'}`}>
          {/* Main Game Canvas */}
          <RPGMap language={language} />

          {/* Floating BGM Only */}
          <div className="fixed top-0 right-0 p-4 z-[100] pointer-events-none">
              <div className="pointer-events-auto">
                  <BackgroundMusic 
                      floating
                      isPlaying={bgmPlaying && appState === 'READY'} 
                      onToggle={() => setBgmPlaying(!bgmPlaying)}
                      volume={bgmVolume}
                      onVolumeChange={setBgmVolume}
                      audioSources={audioSources}
                      trackTitle="STATIC_MENU"
                      trackComposer="NOVA_OST"
                  />
              </div>
          </div>
      </div>
    </>
  );
};

export default App;

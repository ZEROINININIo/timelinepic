
import React, { useState, useEffect } from 'react';
import RPGMap from './components/game/RPGMap';
import GalleryEntry from './components/GalleryEntry';
import CustomCursor from './components/CustomCursor';
import BackgroundMusic, { unlockGlobalAudio } from './components/BackgroundMusic';
import GuestbookPage from './pages/GuestbookPage';
import { Language } from './types';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'nova_gallery_config_v1';
const NICKNAME_KEY = 'nova_user_nickname';

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
  
  // View State: 'map' or 'guestbook'
  const [activeView, setActiveView] = useState<'map' | 'guestbook'>('map');
  
  // Nickname State
  const [nickname, setNickname] = useState<string | null>(null);

  // Default visuals & Nickname Check
  useEffect(() => {
      document.body.classList.add('crt-enabled'); // Always on for gallery vibe
      document.body.classList.remove('light-theme'); // Force dark mode

      // Check for nickname in URL
      const params = new URLSearchParams(window.location.search);
      const urlNickname = params.get('nickname');
      
      if (urlNickname) {
          const decoded = decodeURIComponent(urlNickname);
          setNickname(decoded);
          localStorage.setItem(NICKNAME_KEY, decoded);
      } else {
          // Load cached nickname
          const cached = localStorage.getItem(NICKNAME_KEY);
          if (cached) setNickname(cached);
      }
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

  const toggleGuestbook = () => {
      setActiveView(prev => prev === 'map' ? 'guestbook' : 'map');
  };

  const handleNicknameChange = (newNick: string) => {
      setNickname(newNick);
      localStorage.setItem(NICKNAME_KEY, newNick);
  };

  return (
    <>
      <CustomCursor />

      {appState === 'ENTRY' && (
        <GalleryEntry onComplete={handleEntryComplete} />
      )}

      {/* Main Game State */}
      <div className={`fixed inset-0 overflow-hidden bg-black text-ash-light transition-opacity duration-1000 ${appState === 'READY' ? 'opacity-100' : 'opacity-0'}`}>
          
          {activeView === 'map' ? (
              <RPGMap 
                language={language} 
                nickname={nickname} 
                onOpenGuestbook={() => setActiveView('guestbook')}
              />
          ) : (
              <GuestbookPage 
                language={language} 
                isLightTheme={false} 
                nickname={nickname}
                onBack={() => setActiveView('map')}
                onNicknameChange={handleNicknameChange}
              />
          )}

          {/* Floating Controls Overlay (Top Right) */}
          <div className="fixed top-0 right-0 p-4 z-[100] pointer-events-none flex flex-col gap-2 items-end">
              {/* Guestbook Toggle Button */}
              <div className="pointer-events-auto">
                  <button 
                    onClick={toggleGuestbook}
                    className={`flex items-center gap-2 px-3 py-3 border-2 shadow-hard transition-all ${
                        activeView === 'guestbook' 
                        ? 'bg-ash-black text-ash-light border-ash-gray hover:border-ash-light' 
                        : 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
                    }`}
                  >
                    {activeView === 'guestbook' ? <ArrowLeft size={16} /> : <MessageSquare size={16} />}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest hidden md:inline">
                        {activeView === 'guestbook' ? 'RETURN' : 'GUESTBOOK'}
                    </span>
                  </button>
              </div>

              {/* BGM Controller */}
              <div className="pointer-events-auto">
                  <BackgroundMusic 
                      floating={false} // Use standard mode layout but position it here
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

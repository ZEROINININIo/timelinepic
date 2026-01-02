
import React, { useState } from 'react';
import { Database, Book, Users, Home, GitBranch, Settings, Globe, X, ExternalLink, Headphones, MessageSquare, Map, ArrowRight, Radio, Trash2, AlertTriangle } from 'lucide-react';
import BackgroundMusic, { unlockGlobalAudio } from './BackgroundMusic';
import CRTToggle from './CRTToggle';
import ThemeToggle from './ThemeToggle';
import FullscreenToggle from './FullscreenToggle';
import FontSelector from './fonts/FontSelector';
import ReadingModeToggle from './ReadingModeToggle';
import { Language, ReadingMode } from '../types';
import { ReaderFont } from './fonts/fontConfig';
import RoadmapPage from '../pages/RoadmapPage'; 
import { navigationData, exitModalData } from '../data/navigationData';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  isLightTheme: boolean;
  setIsLightTheme: (val: boolean) => void;
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (val: number) => void;
  readerFont: ReaderFont;
  setReaderFont: (font: ReaderFont) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  // Audio Props
  audioSources: string[];
  trackTitle: string;
  trackComposer: string;
  // Terminal Handlers
  onTerminalOpen?: () => void;
  onTerminalClose?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
    activeTab, setActiveTab, language, setLanguage,
    crtEnabled, setCrtEnabled, isLightTheme, setIsLightTheme,
    bgmPlaying, setBgmPlaying, bgmVolume, setBgmVolume,
    readerFont, setReaderFont, readingMode, setReadingMode,
    audioSources, trackTitle, trackComposer,
    onTerminalOpen, onTerminalClose
}) => {
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showDesktopSettings, setShowDesktopSettings] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false); 
  // Modal Step: 0 = Closed, 1 = Confirm, 2 = Follow-up
  const [exitModalStep, setExitModalStep] = useState<0 | 1 | 2>(0);

  const t = navigationData[language];
  const tModal = exitModalData[language];

  const navItems = [
    { id: 'home', label: t.home, mobileLabel: t.mobileHome, icon: Home },
    { id: 'characters', label: t.characters, mobileLabel: t.mobileChars, icon: Users },
    { id: 'database', label: t.database, mobileLabel: t.mobileData, icon: Database },
    { id: 'reader', label: t.reader, mobileLabel: t.mobileRead, icon: Book },
    { id: 'sidestories', label: t.sidestories, mobileLabel: t.mobileSide, icon: GitBranch },
    { id: 'guestbook', label: t.guestbook, mobileLabel: t.mobileGuest, icon: MessageSquare },
  ];

  const cycleLanguage = () => {
    if (language === 'zh-CN') setLanguage('zh-TW');
    else if (language === 'zh-TW') setLanguage('en');
    else setLanguage('zh-CN');
  };

  const getLangLabel = () => {
    if (language === 'zh-CN') return '简';
    if (language === 'zh-TW') return '繁';
    return 'EN';
  };

  const handleOstClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setExitModalStep(1); // Open to Step 1
  };

  const confirmExit = () => {
      window.open("https://cdn.zeroxv.cn/", "_blank");
      setExitModalStep(0);
  };

  const handleMistake = () => {
      setExitModalStep(2); // Go to Step 2
  };

  const handleFactoryReset = () => {
      const msg = language === 'en' 
        ? "WARNING: This will wipe all local data, history, and settings. The system will reboot. Confirm?" 
        : "警告：此操作将清除所有本地数据、历史记录和设置，系统将重新启动。确定吗？";
      
      if (window.confirm(msg)) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <>
      {showRoadmap && (
          <RoadmapPage 
            language={language} 
            onBack={() => setShowRoadmap(false)} 
          />
      )}

      {/* Mobile Floating BGM */}
      <div className="lg:hidden">
          <BackgroundMusic 
              floating
              isPlaying={bgmPlaying} 
              onToggle={() => setBgmPlaying(!bgmPlaying)}
              volume={bgmVolume}
              onVolumeChange={setBgmVolume}
              audioSources={audioSources}
              trackTitle={trackTitle}
              trackComposer={trackComposer}
              className="opacity-90 scale-90 origin-top-right"
          />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 lg:static lg:w-72 lg:h-full bg-ash-black border-t-2 lg:border-t-0 lg:border-r-2 border-ash-light/20 z-50 flex lg:flex-col justify-between p-2 lg:p-6 shadow-2xl transition-colors duration-300 lg:overflow-y-auto no-scrollbar font-custom-02 landscape:p-1">
        <div className="hidden lg:block mb-8 border-b-2 border-ash-light/20 pb-6 shrink-0">
          <div className="flex items-center gap-4 mb-4">
               <div className="relative w-12 h-12 bg-ash-black border border-ash-gray/50 p-1 shadow-hard group">
                   <img 
                      src="https://free.picui.cn/free/2025/12/08/6936e856897d6.png" 
                      alt="Nova Labs"
                      className="w-full h-full object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                   />
              </div>
              <div className="flex flex-col gap-1">
                  <div className="w-2 h-2 bg-ash-light animate-pulse"></div>
                  <div className="w-2 h-2 bg-ash-gray"></div>
              </div>
          </div>
          <h1 className="text-4xl font-black text-ash-light tracking-tighter uppercase mb-1" style={{ textShadow: '2px 2px 0 #333' }}>
            NOVA<br/>LABS
          </h1>
          <div className="text-[10px] text-ash-gray font-custom-02 bg-ash-dark p-1 inline-block border border-ash-gray">
            ARCHIVE_SYS // TL.1.19-K
          </div>
        </div>

        <div className="flex lg:flex-col justify-between lg:justify-start w-full gap-1 lg:gap-3 lg:mb-auto shrink-0 landscape:gap-1">
          {navItems.map((item, index) => {
            const isReader = item.id === 'reader';
            const isSide = item.id === 'sidestories';
            const isGuest = item.id === 'guestbook';
            const isStoryItem = isReader || isSide || isGuest;
            const showSeparator = index === 3;

            return (
              <React.Fragment key={item.id}>
                {showSeparator && (
                    <div className="hidden lg:flex items-center gap-2 my-2 opacity-50">
                        <div className="h-px bg-ash-gray flex-1"></div>
                        <div className="text-[9px] font-mono text-ash-gray">{t.archives}</div>
                        <div className="h-px bg-ash-gray flex-1"></div>
                    </div>
                )}
                
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileSettings(false);
                  }}
                  className={`flex-1 lg:w-full lg:flex-none flex flex-col lg:flex-row items-center justify-center lg:justify-start transition-all duration-300 group relative overflow-hidden landscape:py-1 
                    ${isStoryItem ? 'lg:py-6 lg:px-6 lg:my-1 lg:border-l-4 border-2 lg:border-y-0 lg:border-r-0' : 'py-2 lg:px-4 lg:py-4 border-2'}
                    ${item.id === 'reader' ? 'ml-1 lg:ml-0' : ''}
                    
                    ${activeTab === item.id 
                        ? (isSide 
                            ? 'bg-cyan-950/40 text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                            : isGuest 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-ash-light text-ash-black border-ash-light shadow-hard')
                        : (isSide
                            ? 'bg-cyan-950/10 text-cyan-600 border-cyan-900/40 hover:bg-cyan-950/30 hover:text-cyan-400 hover:border-cyan-500'
                            : isGuest
                                ? 'bg-emerald-950/10 text-emerald-600 border-emerald-900/40 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-500'
                                : isReader 
                                    ? 'bg-ash-light/5 text-ash-light/80 border-ash-light/20 hover:bg-ash-light/10 hover:border-ash-light hover:text-ash-light'
                                    : 'bg-ash-black text-ash-gray border-ash-gray/30 hover:border-ash-light hover:text-ash-light')
                    }
                  `}
                >
                  {activeTab === item.id && (
                      <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
                  )}
                  
                  <item.icon 
                    size={isStoryItem ? 22 : 18} 
                    className={`mb-1 lg:mb-0 lg:mr-3 z-10 transition-transform landscape:mb-0.5 landscape:size-4 ${isStoryItem && activeTab !== item.id ? 'group-hover:scale-110' : ''}`} 
                    strokeWidth={isStoryItem ? 2.5 : 2} 
                  />
                  
                  <span className={`hidden lg:inline font-bold tracking-widest z-10 whitespace-normal text-left ${isStoryItem ? 'text-lg uppercase font-black' : 'text-sm'}`}>
                    {item.label}
                  </span>
                  
                  <span className="lg:hidden text-[10px] font-bold tracking-widest z-10 whitespace-nowrap landscape:text-[8px]">{item.mobileLabel}</span>
                  
                  {isStoryItem && (
                    <div className={`absolute top-1 right-1 lg:top-1/2 lg:-translate-y-1/2 lg:right-4 w-1.5 h-1.5 opacity-50 rounded-full lg:rounded-none lg:w-1 lg:h-8 ${isSide ? 'bg-cyan-500' : isGuest ? 'bg-emerald-500' : 'bg-ash-light'}`}></div>
                  )}
                </button>
              </React.Fragment>
            );
          })}
          
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className={`flex-1 lg:hidden flex flex-col items-center justify-center py-2 border-2 transition-all duration-300 group relative overflow-hidden landscape:py-1 ml-1 ${
              showMobileSettings
                ? 'bg-ash-light text-ash-black border-ash-light shadow-hard'
                : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
            }`}
          >
            {showMobileSettings && (
                <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
            )}
            <Settings size={18} className="mb-1 z-10 landscape:mb-0.5 landscape:size-4" strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-widest z-10 landscape:text-[8px]">{t.cfg}</span>
          </button>
        </div>

        <div className="hidden lg:flex flex-col gap-3 mt-8 pt-6 border-t-2 border-dashed border-ash-gray/30 shrink-0">
          <button 
            onClick={() => setShowRoadmap(true)}
            className="flex items-center justify-between px-4 py-4 border-2 border-amber-900/50 bg-amber-950/10 text-amber-500 hover:bg-amber-900/20 hover:border-amber-600 transition-all group relative overflow-hidden shadow-hard-sm w-full text-left"
          >
             <div className="flex items-center gap-3 z-10">
                <Map size={20} className="group-hover:animate-pulse" />
                <span className="font-black tracking-widest text-sm uppercase">{t.roadmap}</span>
             </div>
             <ArrowRight size={14} className="z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.5),transparent)] group-hover:opacity-20 transition-opacity"></div>
          </button>

          <button 
            onClick={handleOstClick}
            className="flex items-center justify-between px-4 py-4 border-2 border-ash-gray/50 bg-ash-dark/20 text-ash-gray hover:bg-ash-light hover:text-ash-black hover:border-ash-light transition-all group relative overflow-hidden shadow-hard-sm w-full text-left"
          >
             <div className="flex items-center gap-3 z-10">
                <Headphones size={20} className="group-hover:animate-bounce" />
                <span className="font-black tracking-widest text-sm">{t.ost}</span>
             </div>
             <ExternalLink size={14} className="z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(228,228,231,0.5),transparent)] group-hover:opacity-20 transition-opacity"></div>
          </button>

          <BackgroundMusic 
              isPlaying={bgmPlaying} 
              onToggle={() => setBgmPlaying(!bgmPlaying)}
              volume={bgmVolume}
              onVolumeChange={setBgmVolume}
              audioSources={audioSources}
              trackTitle={trackTitle}
              trackComposer={trackComposer}
          />

          <div className="mt-2">
            <div className="text-[10px] text-ash-gray font-custom-02 mb-1 uppercase px-1">{t.system}</div>
            <button
                onClick={() => setShowDesktopSettings(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-2 transition-all duration-300 group shadow-hard ${
                    showDesktopSettings
                    ? 'bg-ash-light text-ash-black border-ash-light'
                    : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
                }`}
            >
                <Settings size={18} className={`transition-transform duration-700 ${showDesktopSettings ? 'rotate-180' : ''}`} />
                <span className="text-sm font-bold tracking-widest uppercase">{t.config}</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:block mt-6 pt-4 border-t-2 border-dashed border-ash-gray/30 text-ash-gray text-[10px] font-custom-02 leading-tight shrink-0">
          <p>&gt; ENCRYPTION: STATIC</p>
          <div className="w-full bg-ash-dark h-2 border border-ash-gray mb-1">
              <div className="bg-ash-light h-full w-[98%] animate-pulse"></div>
          </div>
          <p>&gt; PING: 0.04ms</p>
        </div>
      </nav>

      {/* Settings Overlays */}
      {showMobileSettings && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-[2px]" onClick={() => setShowMobileSettings(false)}>
            <div 
                className="absolute bottom-[90px] left-4 right-4 bg-ash-black border-2 border-ash-light p-5 shadow-hard animate-slide-in z-50 max-h-[70vh] overflow-y-auto landscape:bottom-12 landscape:p-3"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 border-b-2 border-ash-gray/30 pb-2">
                    <div className="flex items-center gap-2">
                        <Settings size={16} className="text-ash-light" />
                        <span className="text-xs font-bold text-ash-light font-mono uppercase tracking-wider">{t.config}</span>
                    </div>
                    <div className="text-[10px] text-ash-gray font-mono">TL.1.19-K</div>
                </div>
                
                <div className="flex flex-col gap-3 landscape:grid landscape:grid-cols-2">
                    <button 
                      onClick={() => { setShowRoadmap(true); setShowMobileSettings(false); }}
                      className="flex items-center justify-between w-full px-3 py-3 border-2 border-amber-900/50 bg-amber-950/10 text-amber-500 hover:bg-amber-900/20 transition-all group shadow-hard-sm"
                    >
                       <div className="flex items-center gap-3">
                          <Map size={16} />
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest">{t.roadmap}</span>
                       </div>
                       <ArrowRight size={14} className="opacity-50" />
                    </button>

                    <button 
                      onClick={handleOstClick}
                      className="flex items-center justify-between w-full px-3 py-3 border-2 border-ash-gray/50 bg-ash-dark/20 text-ash-gray hover:bg-ash-light hover:text-ash-black transition-all group shadow-hard-sm"
                    >
                       <div className="flex items-center gap-3">
                          <Headphones size={16} />
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest">{t.ost}</span>
                       </div>
                       <ExternalLink size={14} className="opacity-50" />
                    </button>

                    <button 
                      onClick={cycleLanguage}
                      className="flex items-center justify-between w-full px-3 py-3 border-2 transition-all duration-300 shadow-hard bg-ash-black text-ash-gray border-ash-gray/50 active:border-ash-light active:text-ash-light group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe size={16} />
                        <span className="text-[10px] font-mono font-bold uppercase">Language</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">{getLangLabel()}</span>
                    </button>
                    <ReadingModeToggle value={readingMode} onChange={setReadingMode} language={language} />
                    <FontSelector value={readerFont} onChange={setReaderFont} language={language} />
                    <CRTToggle value={crtEnabled} onChange={setCrtEnabled} language={language} />
                    <FullscreenToggle language={language} />
                    <ThemeToggle value={isLightTheme} onChange={setIsLightTheme} />
                    
                    <button 
                        onClick={handleFactoryReset}
                        className="flex items-center justify-center gap-2 w-full px-3 py-3 border-2 border-red-900/50 bg-red-950/20 text-red-600 hover:bg-red-900/40 hover:text-red-500 transition-all font-mono font-bold text-[10px] mt-2 col-span-full"
                    >
                        <AlertTriangle size={12} />
                        {language === 'en' ? 'RESET SYSTEM' : '重置系统依赖'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Desktop Modal */}
      {showDesktopSettings && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setShowDesktopSettings(false)}>
            <div 
                className="w-full max-w-xl bg-ash-black border-2 border-ash-light p-8 shadow-hard relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Settings size={120} />
                </div>

                <div className="flex items-center justify-between mb-8 border-b-2 border-ash-gray pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <Settings size={24} className="text-ash-light" />
                        <h2 className="text-xl font-black text-ash-light uppercase tracking-[0.2em]">{t.settingsTitle}</h2>
                    </div>
                    <button onClick={() => setShowDesktopSettings(false)} className="text-ash-gray hover:text-ash-light transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <div className="text-[10px] text-ash-gray font-mono uppercase">{t.uiLanguage}</div>
                            <button 
                                onClick={cycleLanguage}
                                className="w-full flex items-center justify-between px-4 py-3 border-2 border-ash-gray/30 bg-ash-dark/30 text-ash-gray hover:border-ash-light hover:text-ash-light transition-all shadow-hard-sm"
                            >
                                <span className="text-sm font-bold font-mono tracking-widest">LANGUAGE</span>
                                <span className="text-sm font-bold font-mono">{getLangLabel()}</span>
                            </button>
                        </div>
                        
                        <div className="space-y-1">
                             <div className="text-[10px] text-ash-gray font-mono uppercase">{t.renderFonts}</div>
                             <FontSelector value={readerFont} onChange={setReaderFont} language={language} />
                        </div>

                        <div className="space-y-1">
                             <div className="text-[10px] text-ash-gray font-mono uppercase">{t.readingMode}</div>
                             <ReadingModeToggle value={readingMode} onChange={setReadingMode} language={language} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] text-ash-gray font-mono uppercase">{t.displayFx}</div>
                        <CRTToggle value={crtEnabled} onChange={setCrtEnabled} language={language} />
                        <FullscreenToggle language={language} />
                        <ThemeToggle value={isLightTheme} onChange={setIsLightTheme} />
                        
                        <button 
                            onClick={handleFactoryReset}
                            className="w-full flex items-center justify-between px-3 py-3 border-2 border-red-900/50 bg-red-950/10 text-red-700 hover:bg-red-950/30 hover:text-red-500 hover:border-red-500/50 transition-all group mt-4"
                        >
                            <span className="text-[10px] font-mono font-bold uppercase flex items-center gap-2">
                                <AlertTriangle size={12} />
                                {language === 'en' ? 'FACTORY_RESET' : '重置系统依赖'}
                            </span>
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-dashed border-ash-gray/30 flex justify-between items-center relative z-10">
                    <div className="text-[10px] font-mono text-ash-gray">
                        SYSTEM_BUILD: 2025.12.30<br/>
                        ARCHIVE_VER: TL.1.19-K
                    </div>
                    <button 
                        onClick={() => setShowDesktopSettings(false)}
                        className="px-8 py-2 bg-ash-light text-ash-black font-black text-sm uppercase shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        {t.apply}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Exit Modal (Byaki Theme) */}
      {exitModalStep > 0 && (
          <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setExitModalStep(0)}>
              <div 
                className="w-full max-w-lg bg-black border-2 border-emerald-500 p-6 md:p-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-slide-in relative"
                onClick={e => e.stopPropagation()}
              >
                  <div className="mb-6 flex items-start gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-emerald-950/20 border border-emerald-500/50 p-1">
                          <img src="https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/d19ea972df034757/byq.jpg" alt="Byaki" className="w-full h-full object-cover filter contrast-125" />
                      </div>
                      <div className="flex-1">
                          <div className="text-xs font-black text-emerald-400 mb-1 uppercase tracking-widest border-b border-emerald-500/30 pb-1">{tModal.speaker}</div>
                          <p className="text-sm md:text-base text-emerald-600/80 font-custom-02 leading-relaxed">
                              {exitModalStep === 1 ? tModal.message : tModal.msg2}
                          </p>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3">
                      {exitModalStep === 1 ? (
                          <>
                            <button 
                                onClick={confirmExit}
                                className="w-full text-left px-4 py-3 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold text-sm"
                            >
                                {tModal.opt1}
                            </button>
                            <button 
                                onClick={handleMistake}
                                className="w-full text-left px-4 py-3 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold text-sm"
                            >
                                {tModal.opt2}
                            </button>
                          </>
                      ) : (
                          <button 
                                onClick={() => setExitModalStep(0)}
                                className="w-full text-left px-4 py-3 border-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold text-sm italic opacity-70"
                            >
                                {tModal.opt3}
                            </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Navigation;

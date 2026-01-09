
import React, { useState, useEffect } from 'react';
import { Globe, Monitor, Volume2, ArrowRight, ShieldAlert, Check, ChevronLeft, Loader2, Type } from 'lucide-react';
import { Language, ReadingMode } from '../types';
import ThemeToggle from './ThemeToggle';
import CRTToggle from './CRTToggle';
import BackgroundMusic from './BackgroundMusic';
import FullscreenToggle from './FullscreenToggle';
import FontSelector from './fonts/FontSelector';
import ReadingModeToggle from './ReadingModeToggle';
import { ReaderFont } from './fonts/fontConfig';

interface InitialSetupProps {
  onComplete: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  crtEnabled: boolean;
  setCrtEnabled: (enabled: boolean) => void;
  isLightTheme: boolean;
  setIsLightTheme: (isLight: boolean) => void;
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (val: number) => void;
  readerFont: ReaderFont;
  setReaderFont: (font: ReaderFont) => void;
  // Add Reading Mode support
  readingMode?: ReadingMode;
  setReadingMode?: (mode: ReadingMode) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ 
    onComplete, language, setLanguage, crtEnabled, setCrtEnabled, isLightTheme, setIsLightTheme,
    bgmPlaying, setBgmPlaying, bgmVolume, setBgmVolume, readerFont, setReaderFont,
    readingMode, setReadingMode
}) => {
  
  const [step, setStep] = useState(0); // 0: Lang, 1: Config, 2: Ready
  const [isRebooting, setIsRebooting] = useState(false);
  const [progress, setProgress] = useState(0);

  const t = {
    'zh-CN': {
        title: '系统恢复控制台',
        subtitle: '检测到非核心设置丢失。请重新配置用户偏好。',
        langSelect: '选择界面语言 // SELECT_LANGUAGE',
        visuals: '视觉子系统',
        audio: '音频子系统',
        theme: '主题模式',
        continue: '应用设置',
        reboot: '重新启动系统',
        safeMode: '安全模式已激活',
        back: '返回',
        rebooting: '正在重启系统...',
        applying: '应用配置...'
    },
    'zh-TW': {
        title: '系統恢復控制台',
        subtitle: '檢測到非核心設置丟失。請重新配置用戶偏好。',
        langSelect: '選擇界面語言 // SELECT_LANGUAGE',
        visuals: '視覺子系統',
        audio: '音頻子系統',
        theme: '主題模式',
        continue: '應用設置',
        reboot: '重新啟動系統',
        safeMode: '安全模式已激活',
        back: '返回',
        rebooting: '正在重啟系統...',
        applying: '應用配置...'
    },
    'en': {
        title: 'SYSTEM_RECOVERY_CONSOLE',
        subtitle: 'NON-CORE SETTINGS CORRUPTION DETECTED. RECONFIGURE PREFERENCES.',
        langSelect: 'SELECT LANGUAGE',
        visuals: 'VISUAL_SUBSYSTEM',
        audio: 'AUDIO_SUBSYSTEM',
        theme: 'THEME_MODE',
        continue: 'APPLY_SETTINGS',
        reboot: 'REBOOT_SYSTEM',
        safeMode: 'SAFE_MODE_ACTIVE',
        back: 'BACK',
        rebooting: 'SYSTEM_REBOOT_INITIATED...',
        applying: 'WRITING_CONFIG...'
    }
  }[language];

  const handleReboot = () => {
    setIsRebooting(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
        currentProgress += Math.random() * 5;
        if (currentProgress > 100) {
            currentProgress = 100;
            clearInterval(interval);
            setTimeout(onComplete, 500); // Small delay at 100% before switch
        }
        setProgress(currentProgress);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-amber-500 font-mono p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="max-w-3xl w-full border-2 border-amber-600/50 bg-black/80 backdrop-blur-sm p-6 md:p-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] relative animate-slide-in landscape:max-h-[90vh] landscape:overflow-y-auto landscape:p-4">
            <div className="absolute -top-3 left-4 bg-black px-2 text-amber-500 font-bold border border-amber-600/50 flex items-center gap-2 text-[10px] md:text-xs">
                <ShieldAlert size={14} className="animate-pulse" />
                {t.safeMode}
            </div>

            <header className="mb-6 md:mb-10 text-center border-b border-dashed border-amber-800 pb-4 md:pb-6">
                <h1 className="text-xl md:text-3xl font-black tracking-tighter mb-1 text-amber-500 glitch-text-heavy" data-text={t.title}>
                    {t.title}
                </h1>
                <p className="text-amber-700 text-[8px] md:text-sm uppercase tracking-widest">{t.subtitle}</p>
            </header>

            {!isRebooting ? (
                <div className="space-y-6 md:space-y-8">
                    <div className={`transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-50 blur-[1px] pointer-events-none'}`}>
                        <label className="block text-[10px] font-bold text-amber-600 mb-2 md:mb-4 uppercase flex items-center gap-2">
                            <Globe size={14} /> {t.langSelect}
                        </label>
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            {(['zh-CN', 'zh-TW', 'en'] as Language[]).map(l => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        setLanguage(l);
                                        setStep(1);
                                    }}
                                    className={`py-2 md:py-4 border-2 font-bold text-xs md:text-lg transition-all ${
                                        language === l 
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                                        : 'border-amber-900/50 text-amber-800 hover:border-amber-700 hover:text-amber-600'
                                    }`}
                                >
                                    {l === 'en' ? 'EN' : l === 'zh-CN' ? '简' : '繁'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {step >= 1 && (
                        <div className="animate-fade-in space-y-6 landscape:space-y-4">
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6 landscape:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase flex items-center gap-2">
                                        <Monitor size={14} /> {t.visuals}
                                    </label>
                                    <FontSelector value={readerFont} onChange={setReaderFont} language={language} isSetupMode />
                                    <CRTToggle value={crtEnabled} onChange={setCrtEnabled} isSetupMode language={language} />
                                    <FullscreenToggle isSetupMode language={language} />
                                    <ThemeToggle value={isLightTheme} onChange={setIsLightTheme} isSetupMode />
                                    {readingMode && setReadingMode && (
                                        <ReadingModeToggle value={readingMode} onChange={setReadingMode} language={language} isSetupMode />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase flex items-center gap-2">
                                        <Volume2 size={14} /> {t.audio}
                                    </label>
                                    <BackgroundMusic 
                                        isSetupMode 
                                        isPlaying={bgmPlaying}
                                        onToggle={() => setBgmPlaying(!bgmPlaying)}
                                        volume={bgmVolume}
                                        onVolumeChange={setBgmVolume}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-dashed border-amber-800 flex justify-between items-center landscape:mt-2">
                                <button
                                    onClick={() => setStep(0)}
                                    className="px-4 py-2 text-amber-800 hover:text-amber-500 font-mono font-bold text-xs uppercase flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    {t.back}
                                </button>

                                <button
                                    onClick={handleReboot}
                                    className="px-6 md:px-8 py-2 md:py-3 bg-amber-500 text-black font-bold font-mono uppercase tracking-wider hover:bg-amber-400 transition-colors text-xs md:text-base"
                                >
                                    <span className="flex items-center gap-2">
                                        {t.reboot} <ArrowRight size={16} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in py-8 md:py-12 flex flex-col items-center justify-center w-full">
                    <div className="w-full max-w-md space-y-2 mb-8">
                         <div className="flex justify-between text-xs font-mono uppercase text-amber-500/80">
                             <span>{t.rebooting}</span>
                             <span>{Math.floor(progress)}%</span>
                         </div>
                         <div className="h-4 bg-amber-900/30 border border-amber-800 p-0.5">
                             <div 
                                className="h-full bg-amber-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                                style={{ width: `${progress}%` }}
                             ></div>
                         </div>
                    </div>
                </div>
            )}

            {/* Updated version to TL.1.19-Q */}
            <div className="absolute bottom-2 right-2 text-[8px] md:text-[10px] text-amber-900 font-mono">
                TL.1.19-Q
            </div>
        </div>
    </div>
  );
};

export default InitialSetup;

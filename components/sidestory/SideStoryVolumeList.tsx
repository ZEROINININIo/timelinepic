
import React from 'react';
import { SideStoryVolume, Language } from '../../types';
import { Folder, Lock, AlertTriangle, HardDrive, VenetianMask, Star, Sparkles, CloudRain, Cpu, Activity, Crown, Radio, Signal } from 'lucide-react';
import Reveal from '../Reveal';

interface SideStoryVolumeListProps {
  volumes: SideStoryVolume[];
  onSelectVolume: (volume: SideStoryVolume) => void;
  onOpenCharModal: () => void;
  onOpenTerminal: () => void;
  language: Language;
  isLightTheme: boolean;
}

const SideStoryVolumeList: React.FC<SideStoryVolumeListProps> = ({ volumes, onSelectVolume, onOpenCharModal, onOpenTerminal, language, isLightTheme }) => {
  
  // Helper to determine Priority Label
  const getPriorityLabel = (id: string, index: number) => {
      if (id === 'VOL_VARIABLE') return 'PR_00 [MAX]';
      if (id === 'VOL_MEMORIES') return 'PR_01';
      if (id === 'VOL_DAILY') return 'PR_02';
      if (id === 'VOL_UNKNOWN') return 'PR_NULL';
      return `PR_0${index + 1}`; // Fallback
  };

  // Helper for Badge Text translation
  const getBadgeText = (id: string, lang: Language) => {
      if (id === 'VOL_VARIABLE') {
          if (lang === 'zh-CN') return '以前的以前';
          if (lang === 'zh-TW') return '以前的以前';
          return 'BEFORE_THE_PAST';
      }
      if (id === 'VOL_MEMORIES') {
          if (lang === 'zh-CN') return '特别收录';
          if (lang === 'zh-TW') return '特別收錄';
          return 'FEATURED_ARCHIVE';
      }
      return '';
  };

  return (
        <div className="h-full bg-halftone overflow-y-auto p-4 md:p-12 relative flex flex-col items-center">
            {/* Background Tech Lines */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
                <div className="absolute top-1/4 left-0 w-full h-px bg-ash-gray/50"></div>
                <div className="absolute bottom-1/4 left-0 w-full h-px bg-ash-gray/50"></div>
                <div className="absolute top-0 left-1/4 h-full w-px bg-ash-gray/50"></div>
                <div className="absolute top-0 right-1/4 h-full w-px bg-ash-gray/50"></div>
            </div>

            {/* Giant Glowing Four-Pointed Star Background */}
            <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-0 transition-opacity duration-1000 ${isLightTheme ? 'opacity-[0.03] text-zinc-400' : 'opacity-[0.08] text-ash-light'}`}>
                 <div className="relative w-[140vmin] h-[140vmin] animate-[spin_60s_linear_infinite]">
                     {/* Glow Layer */}
                     <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full blur-3xl animate-pulse">
                         <path d="M100 0 C105 85 115 95 200 100 C115 105 105 115 100 200 C95 115 85 105 0 100 C85 95 95 85 100 0 Z" fill="currentColor" />
                     </svg>
                     {/* Shape Layer */}
                     <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                         <path d="M100 0 C102 90 110 98 200 100 C110 102 102 110 100 200 C98 110 90 102 0 100 C90 98 98 90 100 0 Z" fill="currentColor" />
                     </svg>
                     {/* Decorative Center Ring */}
                     <div className="absolute inset-0 m-auto w-[25%] h-[25%] border border-current rounded-full opacity-30"></div>
                     <div className="absolute inset-0 m-auto w-[40%] h-[40%] border border-dashed border-current rounded-full opacity-20 animate-spin-reverse-slow"></div>
                 </div>
            </div>

            {/* Floating Char Modal Button */}
            <button 
                onClick={onOpenCharModal}
                className="fixed bottom-24 right-4 md:absolute md:top-4 md:right-4 z-50 bg-ash-black border border-ash-gray p-3 text-ash-gray hover:bg-ash-light hover:text-ash-black hover:border-ash-light transition-all shadow-hard group"
                title="Personnel Archive"
            >
                <VenetianMask size={20} />
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-ash-dark text-ash-light text-[10px] font-mono px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-ash-gray hidden md:block">
                    PERSONNEL_DB
                </span>
            </button>

            <header className="relative z-10 mb-16 text-center w-full max-w-2xl mx-auto mt-8 md:mt-4">
                <div className="flex flex-col items-center gap-3">
                    <HardDrive size={40} className="text-ash-light" strokeWidth={1} />
                    <h1 className="text-3xl md:text-5xl font-black text-ash-light uppercase tracking-tighter glitch-text-heavy" data-text={language === 'en' ? 'SIDE_ARCHIVES' : '支线档案库'}>
                        {language === 'en' ? 'SIDE_ARCHIVES' : '支线档案库'}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-ash-gray border border-ash-gray/50 px-2 py-1 bg-ash-black/80">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         STATUS: MOUNTED
                         <span className="mx-1">|</span>
                         /VAR/LIB/MEMORIES/SIDE_STORIES
                    </div>
                </div>
            </header>

            <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-2 md:px-4 pb-20">
                {/* Standard Volumes */}
                {volumes.map((volume, index) => {
                    const isLocked = volume.status === 'locked';
                    const isCorrupted = volume.status === 'corrupted';
                    const isMemories = volume.id === 'VOL_MEMORIES';
                    const isVariable = volume.id === 'VOL_VARIABLE';
                    
                    const priorityLabel = getPriorityLabel(volume.id, index);
                    const badgeText = getBadgeText(volume.id, language);

                    // Light theme specific styles for states
                    const corruptedClass = isLightTheme 
                        ? 'bg-red-50 border-red-300 text-red-700' 
                        : 'bg-red-950/20 border-red-900 text-red-500';
                    
                    const lockedClass = isLightTheme
                        ? 'bg-zinc-200 border-zinc-300 text-zinc-500'
                        : 'bg-ash-dark/20 border-ash-dark text-ash-gray';

                    const normalClass = isLightTheme
                        ? 'bg-white border-zinc-300 text-zinc-800 hover:border-zinc-500 hover:shadow-lg'
                        : 'bg-ash-black/90 border-ash-gray text-ash-light group-hover:border-ash-light group-hover:bg-ash-dark/80 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]';

                    // Special Highlight Style (Cyan/Blue Theme for Memories)
                    const memoriesClass = isLightTheme
                        ? 'bg-sky-50 border-cyan-500 text-sky-900 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:-translate-y-2'
                        : 'bg-cyan-950/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-900/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:-translate-y-2';

                    // Special Highlight Style (Emerald/Green Theme for Variable)
                    const variableClass = isLightTheme
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-2'
                        : 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-900/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-2';

                    return (
                        <Reveal key={volume.id} delay={index * 150} className={`w-full h-full ${isMemories || isVariable ? 'md:col-span-1' : ''}`}> 
                            <button
                                onClick={() => {
                                    if (!isLocked && !isCorrupted) {
                                        onSelectVolume(volume);
                                    }
                                }}
                                disabled={isLocked || isCorrupted}
                                className={`
                                    w-full h-64 relative group transition-all duration-300 transform
                                    flex flex-col text-left overflow-hidden
                                    ${isCorrupted 
                                        ? 'opacity-80' 
                                        : isLocked
                                            ? 'opacity-60'
                                            : 'cursor-pointer'
                                    }
                                `}
                            >
                                {/* Card Body (Skewed container with ClipPath) */}
                                <div 
                                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
                                    className={`
                                        absolute inset-0 border-2 transition-colors duration-300
                                        ${isCorrupted 
                                            ? corruptedClass 
                                            : isLocked
                                                ? lockedClass
                                                : isMemories
                                                    ? memoriesClass
                                                    : isVariable
                                                        ? variableClass
                                                        : normalClass
                                        }
                                    `}
                                >
                                    {/* Scanline Effect - Subtle in light mode */}
                                    <div className={`absolute inset-0 bg-transparent bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none ${isLightTheme ? 'opacity-5' : 'opacity-20'}`}></div>
                                    
                                    {/* Memories Highlight Effect (Rain) */}
                                    {isMemories && (
                                        <>
                                            {!isLightTheme && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none"></div>}
                                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <div 
                                                        key={i}
                                                        className={`absolute w-[1.5px] bg-gradient-to-b from-transparent ${isLightTheme ? 'via-cyan-600' : 'via-cyan-300'} to-transparent`}
                                                        style={{
                                                            height: `${20 + Math.random() * 40}%`,
                                                            left: `${Math.random() * 100}%`,
                                                            top: '-20%',
                                                            animation: `dataRainCard ${1.5 + Math.random() * 1.5}s linear infinite`,
                                                            animationDelay: `${Math.random() * 2}s`,
                                                            willChange: 'transform'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Variable Highlight Effect (Matrix/Glitch) */}
                                    {isVariable && (
                                        <>
                                            {!isLightTheme && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>}
                                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <div 
                                                        key={i}
                                                        className={`absolute text-[8px] font-mono writing-vertical-rl ${isLightTheme ? 'text-emerald-700' : 'text-emerald-400'}`}
                                                        style={{
                                                            left: `${10 + Math.random() * 80}%`,
                                                            top: '-100%',
                                                            animation: `dataRain ${2 + Math.random() * 3}s linear infinite`,
                                                            animationDelay: `${Math.random() * 5}s`,
                                                        }}
                                                    >
                                                        {Math.random() > 0.5 ? '0101' : 'NULL'}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Special Labels */}
                                    {isMemories && (
                                        <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-cyan-100 text-cyan-700 border-cyan-200' : 'bg-cyan-950 text-cyan-400 border-cyan-500/50'}`}>
                                            <Sparkles size={10} className="animate-pulse" />
                                            {badgeText}
                                        </div>
                                    )}
                                    {isVariable && (
                                        <div className={`absolute top-0 right-0 z-30 px-3 py-1 text-[10px] font-bold font-mono border-b-2 border-l-2 flex items-center gap-1 ${isLightTheme ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-950 text-emerald-400 border-emerald-500/50'}`}>
                                            <Crown size={10} className="animate-pulse" />
                                            {badgeText}
                                        </div>
                                    )}
                                    
                                    {/* Content */}
                                    <div className="p-6 h-full flex flex-col relative z-20">
                                        <div className="flex justify-between items-start mb-auto">
                                            {isMemories ? (
                                                <div className="relative">
                                                    <CloudRain size={32} strokeWidth={1} className="text-cyan-500 relative z-10" />
                                                    <Star size={16} className="text-cyan-300 absolute -top-1 -right-1 animate-spin-slow" />
                                                </div>
                                            ) : isVariable ? (
                                                <div className="relative">
                                                    <Cpu size={32} strokeWidth={1} className="text-emerald-500 relative z-10" />
                                                    <Activity size={16} className="text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
                                                </div>
                                            ) : (
                                                <Folder size={32} strokeWidth={1} className={isCorrupted ? 'animate-pulse' : ''} />
                                            )}
                                            
                                            <div className={`text-[10px] font-mono border border-current px-1 ${isVariable ? 'font-black opacity-100 bg-emerald-500/20' : 'opacity-70'}`}>
                                                {priorityLabel}
                                            </div>
                                        </div>

                                        <div className="space-y-1 mt-4">
                                            <h3 className={`font-black text-xl md:text-2xl font-mono uppercase tracking-tight leading-none ${isCorrupted ? 'blur-[1px]' : ''} ${isMemories ? (isLightTheme ? 'text-cyan-700' : 'text-cyan-100 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]') : isVariable ? (isLightTheme ? 'text-emerald-700' : 'text-emerald-100 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]') : ''}`}>
                                                {language === 'en' ? volume.titleEn : volume.title}
                                            </h3>
                                            <div className={`text-[10px] font-mono uppercase tracking-widest ${isMemories || isVariable ? 'opacity-80' : 'opacity-50'}`}>
                                                {volume.titleEn}
                                            </div>
                                        </div>

                                        {/* Footer Metadata */}
                                        <div className="mt-6 pt-4 border-t border-dashed border-current/30 flex justify-between items-end text-[10px] font-mono">
                                            <div className="flex flex-col gap-1">
                                                <span>SIZE: {volume.chapters.length * 128}KB</span>
                                                <span className="flex items-center gap-1">
                                                    STATUS: 
                                                    {isCorrupted ? 'ERR' : isLocked ? 'LCK' : 'RDY'}
                                                </span>
                                            </div>
                                            {isCorrupted ? <AlertTriangle size={16} /> : isLocked ? <Lock size={16} /> : <div className="w-16 h-2 bg-current opacity-20 relative"><div className="absolute left-0 top-0 h-full bg-current w-1/2"></div></div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Corners (Visual Flair) */}
                                {!isLocked && !isCorrupted && (
                                    <>
                                        <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMemories ? 'border-cyan-400' : isVariable ? 'border-emerald-400' : (isLightTheme ? 'border-zinc-800' : 'border-ash-light')}`}></div>
                                        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMemories ? 'border-cyan-400' : isVariable ? 'border-emerald-400' : (isLightTheme ? 'border-zinc-800' : 'border-ash-light')}`}></div>
                                    </>
                                )}
                            </button>
                        </Reveal>
                    );
                })}
            </div>
        </div>
    );
};

export default SideStoryVolumeList;


import React from 'react';
import { SideStoryVolume, Language } from '../../types';
import { ArrowLeft, Cpu, Lock, FileText, ChevronRight, AlertTriangle, Star, XCircle, Loader2, Database, GitCommit, Sparkle, Terminal, CornerDownRight } from 'lucide-react';
import Reveal from '../Reveal';

interface SideStoryChapterListProps {
  volume: SideStoryVolume;
  onBack: () => void;
  onSelectChapter: (index: number) => void;
  onEnterExtra?: () => void; 
  onOpenTerminal?: (scriptId: string) => void; // Updated to accept scriptId
  language: Language;
  isLightTheme: boolean;
}

const SideStoryChapterList: React.FC<SideStoryChapterListProps> = ({ volume, onBack, onSelectChapter, onEnterExtra, onOpenTerminal, language, isLightTheme }) => {
  const isVariableVolume = volume.id === 'VOL_VARIABLE';
  
  // Separate main chapters from extra chapters (IDs that represent extra/secret content)
  const mainChapters = isVariableVolume 
    ? volume.chapters.filter(c => c.id !== 'story-byaki-diary')
    : volume.chapters;
  
  const hasExtra = isVariableVolume && volume.chapters.some(c => c.id === 'story-byaki-diary');

  const extraTitle = {
    'zh-CN': '秘密日记',
    'zh-TW': '秘密日記',
    'en': 'SECRET_DIARY'
  }[language];

  const extraSummary = {
    'zh-CN': '▞▞▞ ▞▞▞ 0x76 0x6F 0x69 0x64 ▞▞▞ ▞▞▞',
    'zh-TW': '▞▞▞ ▞▞▞ 0x76 0x6F 0x69 0x64 ▞▞▞ ▞▞▞',
    'en': '▞▞▞ ▞▞▞ ERROR_RESIDUAL ▞▞▞ ▞▞▞'
  }[language];

  return (
        <div className="h-full bg-halftone overflow-y-auto p-4 md:p-12 relative flex flex-col items-center custom-scrollbar pb-32">
             <div className="w-full max-w-3xl relative z-10 animate-fade-in mt-8 md:mt-0">
                {/* Header / Breadcrumb */}
                <div className="flex items-center gap-4 mb-8 border-b-2 border-ash-gray pb-4">
                     <button 
                        onClick={onBack}
                        className="p-2 border border-ash-gray text-ash-gray hover:text-ash-light hover:border-ash-light hover:bg-ash-dark transition-all"
                     >
                         <ArrowLeft size={20} />
                     </button>
                     <div>
                         <div className="text-[10px] font-mono text-ash-gray uppercase">ROOT / {volume.id}</div>
                         <h2 className="text-2xl font-black text-ash-light uppercase tracking-tight">{language === 'en' ? volume.titleEn : volume.title}</h2>
                     </div>
                     <div className="ml-auto hidden md:block">
                         <Cpu size={24} className="text-ash-dark animate-pulse" />
                     </div>
                </div>

                {/* Main File List */}
                <div className="space-y-3">
                    {mainChapters.map((chapter, index) => {
                        const isLocked = chapter.status === 'locked';
                        const t = chapter.translations[language] || chapter.translations['zh-CN'];
                        const isLegacy = chapter.id === 'special-legacy-dusk';
                        const isGarbled = t.title.includes('▞');
                        const isConstructing = chapter.id === 'F_ERR';
                        const isTerminalNode = chapter.id === 'special-terminal-discovery';
                        
                        // Check if this node should be connected to the previous one (Sub-chapter logic)
                        const prevChapter = mainChapters[index - 1];
                        const isConnectedSubChapter = isTerminalNode && prevChapter?.id === 'story-variable-home';

                        let itemClass = "";
                        if (isTerminalNode) {
                             itemClass = isLightTheme 
                                ? 'bg-gradient-to-r from-emerald-50 to-fuchsia-50 border-emerald-500 text-emerald-800 shadow-md border-dashed'
                                : 'bg-gradient-to-r from-emerald-950/40 to-fuchsia-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-dashed hover:border-fuchsia-500/50 hover:text-fuchsia-300 transition-all';
                        } else if (isLegacy) {
                             itemClass = isLightTheme
                                ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-[0_0_15px_rgba(37,99,235,0.4)] border-dashed skew-x-2'
                                : 'bg-blue-950/30 border-blue-400 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)] border-dashed -skew-x-1';
                        } else if (isConstructing) {
                             itemClass = 'bg-emerald-950/20 border-emerald-900 text-emerald-600 animate-pulse border-dashed border-2 cursor-progress';
                        } else if (isGarbled) {
                             itemClass = 'bg-red-950/20 border-red-900 text-red-700 opacity-80 cursor-not-allowed animate-pulse border-dotted border-4 scale-[0.98] origin-center rotate-[0.5deg]';
                        } else if (isLocked) {
                            itemClass = isLightTheme 
                                ? 'bg-zinc-100 border-zinc-300 text-zinc-400 opacity-60 cursor-not-allowed'
                                : 'bg-ash-dark/20 border-ash-dark/50 text-ash-gray opacity-60 cursor-not-allowed';
                        } else {
                            itemClass = isLightTheme
                                ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-500 shadow-sm'
                                : 'bg-ash-black/80 border-ash-dark/50 text-ash-light hover:border-ash-light hover:bg-ash-dark/40 shadow-hard-sm';
                        }

                        return (
                            <React.Fragment key={chapter.id}>
                                {isConnectedSubChapter && (
                                    <Reveal delay={index * 50}>
                                        <div className="flex items-end h-6 ml-6 -mt-3 mb-0 relative z-0">
                                            <div className="w-px h-full bg-emerald-500/30 border-l-2 border-dashed border-emerald-500/30"></div>
                                            <div className="w-6 h-px bg-emerald-500/30 border-t-2 border-dashed border-emerald-500/30 mb-3"></div>
                                            <CornerDownRight size={14} className="text-emerald-500/50 mb-1.5 -ml-1" />
                                        </div>
                                    </Reveal>
                                )}
                                <Reveal delay={index * 50}>
                                    <button
                                        onClick={() => {
                                            // Simply navigate to the reader. The Reader component will handle the terminal trigger.
                                            if (!isLocked || isConstructing) {
                                                const realIndex = volume.chapters.findIndex(c => c.id === chapter.id);
                                                onSelectChapter(realIndex);
                                            }
                                        }}
                                        disabled={isLocked && !isConstructing}
                                        className={`
                                            flex items-center gap-4 p-4 border transition-all duration-200 group relative overflow-hidden
                                            ${isConnectedSubChapter ? 'ml-12 w-[calc(100%-3rem)]' : 'w-full'}
                                            ${itemClass}
                                        `}
                                    >
                                        <div className={`shrink-0 w-8 text-center font-mono text-xs ${isTerminalNode ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-fuchsia-400 font-black animate-pulse' : isLegacy ? 'text-blue-500 font-bold' : isConstructing ? 'text-emerald-500 font-bold animate-pulse' : isGarbled ? 'text-red-800 font-black animate-glitch' : 'opacity-50'}`}>
                                            {isTerminalNode ? 'T-01' : isLegacy ? '!!' : isConstructing ? '>>' : isGarbled ? 'ERR' : String(index + 1).padStart(2, '0')}
                                        </div>
                                        <div className={`shrink-0 p-2 border transition-colors ${isTerminalNode ? 'bg-black/20 border-emerald-500 text-fuchsia-400' : isLegacy ? 'bg-blue-950 border-blue-500 text-blue-500 animate-pulse' : isConstructing ? 'bg-emerald-950/50 border-emerald-600 text-emerald-500 animate-[spin_3s_linear_infinite]' : isGarbled ? 'bg-red-950 border-red-800 text-red-600 animate-[spin_2s_linear_infinite]' : isLocked ? 'bg-transparent border-current opacity-50' : isLightTheme ? 'bg-zinc-100 border-zinc-200 group-hover:bg-zinc-800 group-hover:text-white group-hover:border-zinc-800' : 'bg-ash-dark/50 border-ash-gray/30 group-hover:border-ash-light group-hover:bg-ash-light group-hover:text-ash-black'}`}>
                                            {isTerminalNode ? <Sparkle size={16} className="animate-spin-slow" /> : isLegacy ? <Star size={16} fill="currentColor" /> : isConstructing ? <Loader2 size={16} /> : isGarbled ? <XCircle size={16} /> : isLocked ? <Lock size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div className="flex-1 text-left relative overflow-hidden">
                                            <div className={`font-bold font-mono text-sm md:text-base uppercase truncate ${isTerminalNode ? 'tracking-widest' : isLegacy ? 'glitch-text-heavy tracking-widest opacity-80' : isConstructing ? 'text-emerald-500 glitch-text-heavy' : isGarbled ? 'glitch-text-heavy text-red-500' : ''}`} data-text={t.title}>{t.title}</div>
                                            <div className={`text-[10px] font-mono flex items-center gap-2 ${isTerminalNode ? 'text-emerald-600 font-bold' : isLegacy ? 'text-blue-500/70' : isConstructing ? 'text-emerald-600 font-bold' : isGarbled ? 'text-red-700 font-bold' : 'opacity-50'}`}>
                                                <span>{chapter.date}</span>
                                                {isTerminalNode && <span className="font-bold border border-emerald-500/50 px-1 bg-gradient-to-r from-emerald-950/30 to-fuchsia-950/30 text-emerald-500">INTERACTIVE // SPECIAL</span>}
                                                {isLegacy && <span className="font-bold border border-blue-500/50 px-1 bg-blue-950/30">LEGACY // CORRUPTED</span>}
                                                {isConstructing && <span className="font-bold border border-emerald-500/50 px-1 bg-emerald-950/30 animate-pulse">BUILDING...</span>}
                                                {isGarbled && !isConstructing && <span className="font-bold border border-red-500/50 px-1 bg-red-950/30 animate-pulse">CRITICAL_FAILURE</span>}
                                            </div>
                                        </div>
                                        {!isLocked && <div className="opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={16} /></div>}
                                    </button>
                                </Reveal>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Independent Extra Entry Point */}
                {hasExtra && (
                    <div className="mt-16 animate-slide-in">
                        <div className="flex items-center gap-2 mb-6 opacity-60">
                             <div className="h-px bg-ash-gray flex-1"></div>
                             <div className="text-[10px] font-black font-mono text-ash-gray uppercase tracking-[0.3em] flex items-center gap-2">
                                <div className="flex -space-x-1">
                                    <AlertTriangle size={14} className="text-fuchsia-600 animate-pulse" />
                                    <Sparkle size={14} className="text-emerald-600 animate-ping" />
                                </div>
                                DUALITY_SECTOR // FUSION
                             </div>
                             <div className="h-px bg-ash-gray flex-1"></div>
                        </div>

                        <Reveal>
                            <button
                                onClick={onEnterExtra}
                                className={`
                                    w-full flex items-center gap-6 p-6 border-2 transition-all duration-500 group relative overflow-hidden
                                    ${isLightTheme 
                                        ? 'bg-fuchsia-50/50 border-fuchsia-200 text-fuchsia-900 shadow-sm hover:border-emerald-400 hover:bg-emerald-50/50' 
                                        : 'bg-fuchsia-950/10 border-fuchsia-900/50 text-fuchsia-200 shadow-lg hover:border-emerald-500 hover:bg-emerald-950/20'
                                    }
                                `}
                            >
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHRleHQgeD0iMCIgeT0iMjAiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iY3VycmVudENvbG9yIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBvcGFjaXR5PSIwLjMiPkVSUk9SPC90ZXh0Pjwvc3ZnPg==')]"></div>

                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-600 to-emerald-600 animate-pulse"></div>
                                
                                <div className="shrink-0 relative">
                                    <Database size={32} strokeWidth={1} className="text-fuchsia-800 group-hover:text-emerald-500 transition-colors" />
                                    <GitCommit size={14} className="absolute -top-1 -right-1 text-emerald-500 animate-pulse" />
                                </div>

                                <div className="flex-1 text-left">
                                    <div className="text-[9px] font-black font-mono text-fuchsia-500 mb-1 tracking-tighter uppercase flex items-center gap-1">
                                        <span className="animate-pulse">[ACCESS_ST.1_FRAGMENTS]</span>
                                        <span className="text-emerald-500">// SYNC: EVOLVING</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-ash-light drop-shadow-[0_0_8px_rgba(192,38,211,0.2)] group-hover:translate-x-1 transition-transform group-hover:text-emerald-400">
                                        {extraTitle}
                                    </h3>
                                    <p className="text-[10px] md:text-xs font-mono opacity-60 mt-1 italic">
                                        {extraSummary}
                                    </p>
                                </div>

                                <div className="shrink-0 flex items-center justify-center p-2 border border-fuchsia-500/30 group-hover:border-emerald-500/80 transition-all">
                                    <ChevronRight size={20} className="text-fuchsia-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </Reveal>
                        
                        <div className="mt-8 text-center">
                             <p className="text-[8px] font-mono text-ash-gray uppercase tracking-widest opacity-40">
                                Warning: st.1 data interference detected. Do not interfere with origin timeline.
                             </p>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};

export default SideStoryChapterList;

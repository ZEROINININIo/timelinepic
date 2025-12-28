
import React, { useState, useRef, useEffect } from 'react';
import { SideStoryVolume, Language, ChapterTranslation } from '../../types';
import { ArrowLeft, List, ShieldAlert, FileText, ChevronLeft, ChevronRight, Activity, Image as ImageIcon, AlertTriangle, Loader2, Eye, Cpu, Database, Sparkle, Lock, Ban, Terminal } from 'lucide-react';
import Reveal from '../Reveal';
import MaskedText from '../MaskedText';
import { ReaderFont, getFontClass } from '../fonts/fontConfig';

const VoidLog: React.FC<{ lines: string[]; language: Language }> = ({ lines, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hint = language === 'zh-CN' ? '[点击解码]' : language === 'zh-TW' ? '[點擊解碼]' : '[CLICK_TO_DECODE]';
  
  // Extract ID from the first line (e.g., 0000.2, 0600.0)
  const idMatch = lines.length > 0 ? lines[0].match(/(\d{4}\.\d)Void>>/) : null;
  const voidId = idMatch ? idMatch[1] : '0000.2';

  return (
    <Reveal>
      <div className="my-6 md:my-10 border-l-4 border-fuchsia-600 bg-fuchsia-950/10 font-mono text-xs md:text-sm shadow-[0_0_15px_-3px_rgba(192,38,211,0.2)]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left p-3 md:p-4 bg-fuchsia-950/20 hover:bg-fuchsia-900/30 text-fuchsia-300 font-bold flex items-center gap-3 transition-all group border-b border-fuchsia-500/20 focus:outline-none"
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
             <AlertTriangle size={16} />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
             <span className="animate-pulse tracking-widest text-fuchsia-400 text-[10px] md:text-xs">&gt;&gt;&gt; SYSTEM_INTERCEPT // {voidId}_VOID</span>
             <span className="text-[10px] bg-fuchsia-900/50 px-1 border border-fuchsia-500/30 text-fuchsia-200/70">
                SOURCE: UNKNOWN
             </span>
          </div>
          <span className="ml-auto opacity-50 text-[10px] group-hover:opacity-100 transition-opacity font-mono">{hint}</span>
        </button>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 md:p-6 text-fuchsia-100/90 space-y-2 leading-relaxed tracking-wide font-medium bg-black/20 backdrop-blur-sm">
              {lines.map((line, i) => (
                    <p key={i} className="border-l border-fuchsia-500/20 pl-3 hover:border-fuchsia-500 hover:bg-fuchsia-500/5 transition-colors duration-300">
                        {line.replace(/\d{4}\.\dVoid>>|【插入结束】|【插入結束】|\[INSERTION_END\]/g, '')}
                    </p>
              ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
};

const parseRichText = (text: string) => {
  const parts = text.split(/(\[\[(?:MASK|GLITCH_GREEN|GREEN|VOID|DANGER|BLUE|WHITE)::.*?\]\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('[[MASK::') && part.endsWith(']]')) {
      const content = part.slice(8, -2);
      return <MaskedText key={index}>{content}</MaskedText>;
    } else if (part.startsWith('[[GLITCH_GREEN::') && part.endsWith(']]')) {
      const content = part.slice(16, -2);
      return (
        <span key={index} className="text-emerald-400 font-black tracking-widest drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] inline-block animate-pulse relative px-1">
            <span className="absolute inset-0 animate-ping opacity-30 blur-sm bg-emerald-500/20 rounded-full"></span>
            <span className="relative z-10">{content}</span>
        </span>
      );
    } else if (part.startsWith('[[GREEN::') && part.endsWith(']]')) {
      const content = part.slice(9, -2);
      return (
        <span key={index} className="text-emerald-500 font-mono font-bold tracking-wide">
            {content}
        </span>
      );
    } else if (part.startsWith('[[VOID::') && part.endsWith(']]')) {
      const content = part.slice(8, -2);
      return (
        <span key={index} className="text-fuchsia-500 font-black tracking-widest drop-shadow-[0_0_10px_rgba(192,38,211,0.8)] inline-block animate-pulse relative px-1">
            <span className="absolute inset-0 animate-ping opacity-30 blur-sm bg-fuchsia-500/20 rounded-full"></span>
            <span className="relative z-10">{content}</span>
        </span>
      );
    } else if (part.startsWith('[[DANGER::') && part.endsWith(']]')) {
      const content = part.slice(10, -2);
      return (
        <span key={index} className="text-red-600 font-black animate-crash origin-left inline-block px-1">
            {content}
        </span>
      );
    } else if (part.startsWith('[[BLUE::') && part.endsWith(']]')) {
      const content = part.slice(8, -2);
      return (
        <span key={index} className="text-blue-400 font-bold px-1">
            {content}
        </span>
      );
    } else if (part.startsWith('[[WHITE::') && part.endsWith(']]')) {
      const content = part.slice(9, -2);
      return (
        <span key={index} className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse">
            {content}
        </span>
      );
    }
    return part;
  });
};

interface SideStoryReaderProps {
  volume: SideStoryVolume;
  currentIndex: number;
  onBack: () => void;
  language: Language;
  isLightTheme: boolean;
  readerFont: ReaderFont;
  onOpenTerminal?: (scriptId: string) => void;
}

const SideStoryReader: React.FC<SideStoryReaderProps> = ({ volume, currentIndex, onBack, language, isLightTheme, readerFont, onOpenTerminal }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(currentIndex);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    setCurrentChapterIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentChapterIndex]);

  const currentChapter = volume.chapters[currentChapterIndex];
  
  // Auto-trigger terminal if special chapter is loaded
  useEffect(() => {
      if (currentChapter.id === 'special-terminal-discovery' && onOpenTerminal) {
          onOpenTerminal('T001');
      }
  }, [currentChapter.id, onOpenTerminal]);

  const translation: ChapterTranslation = currentChapter.translations[language] || currentChapter.translations['zh-CN'];
  const isLegacy = currentChapter.id === 'special-legacy-dusk';
  const isDiary = currentChapter.id === 'story-byaki-diary'; 
  const isVariable = volume.id === 'VOL_VARIABLE';

  const mainChapters = isVariable 
    ? volume.chapters.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.id !== 'story-byaki-diary')
    : volume.chapters.map((c, i) => ({ ...c, originalIndex: i }));
  
  const extraChapters = isVariable
    ? volume.chapters.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.id === 'story-byaki-diary')
    : [];

  const extraTitle = {
    'zh-CN': 'FRAGMENTED_EXTRA // 碎片附加',
    'zh-TW': 'FRAGMENTED_EXTRA // 碎片附加',
    'en': 'FRAGMENTED_EXTRA // FRAGS'
  }[language];

  // Standard navigation logic - no interception needed, useEffect handles the trigger
  const handleNextChapter = () => {
      const nextIndex = currentChapterIndex + 1;
      if (nextIndex < volume.chapters.length) {
          setCurrentChapterIndex(nextIndex);
      }
  };

  const renderContent = (text: string) => {
    const smartJoin = (lines: string[]) => {
      if (lines.length === 0) return '';
      return lines.reduce((acc, curr, idx) => {
        if (idx === 0) return curr;
        const prev = lines[idx - 1];
        const prevChar = prev[prev.length - 1];
        const currChar = curr[0];
        const cjkRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;
        if (cjkRegex.test(prevChar) || cjkRegex.test(currChar)) return acc + curr;
        return acc + ' ' + curr;
      }, '');
    };

    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    let textBuffer: string[] = [];
    let inVoidBlock = false;
    let voidBuffer: string[] = [];

    const flushTextBuffer = () => {
        if (textBuffer.length > 0) {
            const joinedText = smartJoin(textBuffer);
            let className = `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-ash-light transition-colors ${getFontClass(readerFont)}`;
            
            if (isLegacy) {
                className = isLightTheme
                    ? "mb-4 md:mb-8 text-justify indent-6 md:indent-12 font-mono text-xs md:text-base leading-relaxed text-blue-900 legacy-text"
                    : "mb-4 md:mb-8 text-justify indent-6 md:indent-12 font-mono text-xs md:text-base leading-relaxed text-blue-200 legacy-text";
            } else if (isDiary) {
                className = isLightTheme
                    ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-fuchsia-900 font-bold ${getFontClass(readerFont)}`
                    : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-emerald-100 drop-shadow-[0_0_8px_rgba(192,38,211,0.6)] ${getFontClass(readerFont)}`;
            } else {
                if (/^(零点|Point|零點)(:|：|\(|（)/.test(joinedText)) {
                    className = isLightTheme
                        ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-zinc-600 font-bold ${getFontClass(readerFont)}`
                        : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.4)] ${getFontClass(readerFont)}`;
                } else if (/^(芷漓|Zeri)(:|：|\(|（)/.test(joinedText)) {
                    className = isLightTheme
                        ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-pink-600 ${getFontClass(readerFont)}`
                        : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-pink-400 drop-shadow-[0_0_2px_rgba(244,114,182,0.4)] ${getFontClass(readerFont)}`;
                } else if (/^(泽洛|Zelo|澤洛)(:|：|\(|（)/.test(joinedText)) {
                    className = isLightTheme
                        ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-blue-600 ${getFontClass(readerFont)}`
                        : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-blue-400 drop-shadow-[0_0_2px_rgba(96,165,250,0.4)] ${getFontClass(readerFont)}`;
                } else if (/^(\?\?\?|Void|void)(:|：|\(|（|>)/.test(joinedText)) {
                    className = isLightTheme
                        ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-fuchsia-900 font-bold ${getFontClass(readerFont)}`
                        : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-white drop-shadow-[0_0_5px_rgba(192,38,211,0.5)] ${getFontClass(readerFont)}`;
                }
            }

            nodes.push(
                <Reveal key={`p-${nodes.length}`}>
                    <p className={className}>
                        {parseRichText(joinedText)}
                    </p>
                </Reveal>
            );
            textBuffer = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Use regex for flexible detection (e.g. 0000.2Void>>, 0600.0Void>>)
        const isVoidStart = /\d{4}\.\dVoid>>/.test(trimmed);
        const isVoidEnd = /【插入结束】|【插入結束】|\[INSERTION_END\]/.test(trimmed);

        // 1. Check for VOID block
        if (isVoidStart) {
            flushTextBuffer();
            inVoidBlock = true;
            voidBuffer = [line];
            
            // Check for closing tag on the same line
            if (isVoidEnd) { 
                inVoidBlock = false; 
                nodes.push(<VoidLog key={`void-${i}`} lines={[...voidBuffer]} language={language} />); 
                voidBuffer = []; 
            }
            continue;
        }
        if (inVoidBlock) {
            voidBuffer.push(line);
            if (isVoidEnd) { 
                inVoidBlock = false; 
                nodes.push(<VoidLog key={`void-${i}`} lines={[...voidBuffer]} language={language} />); 
                voidBuffer = []; 
            }
            continue;
        }

        // 2. Check for Image Tag (Improved Detection)
        const isImage = trimmed.startsWith('[[IMAGE::') && trimmed.endsWith(']]');
        if (isImage) {
            flushTextBuffer();
            const content = trimmed.slice(9, -2);
            const [src, ...captionParts] = content.split('::');
            const caption = captionParts.join('::'); // Re-join in case caption has ::
            
            nodes.push(
                <Reveal key={`img-${i}`} className="my-8 md:my-12 flex flex-col items-center w-full">
                    <div className="relative border-2 md:border-4 border-ash-light p-1 md:p-2 bg-ash-dark max-w-full shadow-hard">
                        <img 
                            src={src} 
                            alt={caption} 
                            className="relative max-h-[400px] md:max-h-[600px] w-auto object-cover block grayscale-[20%] hover:grayscale-0 transition-all duration-500" 
                        />
                        <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none"></div>
                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-ash-light text-ash-black px-2 md:px-3 py-0.5 md:py-1 text-[8px] md:text-[10px] font-mono font-bold border border-ash-black flex items-center gap-1 md:gap-2 uppercase"><ImageIcon size={10} /> {caption}</div>
                    </div>
                </Reveal>
            );
            continue;
        }

        // 3. Regular text processing (Empty line or normal text)
        if (!trimmed) { flushTextBuffer(); continue; }
        
        textBuffer.push(trimmed);
    }
    flushTextBuffer();
    return nodes;
  };

  return (
    <div className={`flex h-full relative overflow-hidden text-zinc-950 ${isDiary ? (isLightTheme ? 'bg-fuchsia-50' : 'bg-[#05000a]') : 'bg-retro-paper'}`}>
        {isDiary && (
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,38,211,0.08),transparent_80%)] animate-pulse"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.05),transparent_70%)]"></div>
            </div>
        )}

        {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-10 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)}/>
        )}

        <aside className={`absolute md:relative z-20 h-full bg-ash-black border-r-4 border-ash-dark transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none ${isSidebarOpen ? 'w-64 md:w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-0 overflow-hidden'}`}>
            <div className={`p-4 border-b-2 border-ash-gray bg-ash-black text-ash-light flex justify-between items-center shrink-0 landscape:p-2`}>
                 <button onClick={onBack} className="flex items-center gap-2 text-[10px] md:text-xs font-mono hover:text-ash-gray transition-colors"><ArrowLeft size={14} /> {language === 'en' ? 'BACK' : '返回'}</button>
                 <div className="text-[8px] md:text-[10px] font-mono opacity-50 truncate max-w-[80px]">{language === 'en' ? volume.titleEn : volume.title}</div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
                {mainChapters.map((chapter) => {
                    const chapTitle = chapter.translations[language]?.title || chapter.translations['zh-CN'].title;
                    const isLocked = chapter.status === 'locked';
                    const isActive = chapter.originalIndex === currentChapterIndex;
                    const isTerminal = chapter.id === 'special-terminal-discovery';

                    return (
                        <button
                            key={chapter.id}
                            onClick={() => {
                                if (!isLocked) {
                                    setCurrentChapterIndex(chapter.originalIndex);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }
                            }}
                            disabled={isLocked && !isTerminal}
                            className={`w-full text-left p-3 md:p-4 text-[10px] md:text-xs font-mono border-b border-ash-dark transition-none group relative overflow-hidden ${
                                isActive && !isTerminal
                                    ? (isLegacy ? 'bg-blue-950/50 text-blue-200 border-blue-500/50' : isVariable ? 'bg-emerald-950/50 text-emerald-200 border-emerald-500/50' : 'bg-ash-light text-ash-black')
                                    : isTerminal
                                        ? 'bg-gradient-to-r from-emerald-950/20 to-fuchsia-950/20 hover:from-emerald-900/30 hover:to-fuchsia-900/30 text-emerald-400'
                                        : isLocked ? 'bg-ash-dark/10 text-ash-gray cursor-not-allowed' : 'text-ash-gray hover:bg-ash-dark hover:text-ash-white'
                            }`}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className={`font-bold truncate uppercase max-w-[85%] flex items-center gap-2 ${(isLegacy) && isActive ? 'legacy-text' : ''}`}>
                                        {isActive && !isTerminal && <span className="mr-1 md:mr-2">&gt;</span>}
                                        {isTerminal && <Sparkle size={10} className="animate-spin-slow" />}
                                        {chapTitle}
                                    </span>
                                    {isLocked && !isTerminal && <ShieldAlert size={10} className="opacity-70" />}
                                </div>
                            </div>
                        </button>
                    )
                })}

                {extraChapters.length > 0 && (
                    <div className="mt-6 md:mt-8">
                         <div className="flex items-center gap-2 px-2 py-1 md:py-2 mb-2 bg-fuchsia-950/30 border-y border-fuchsia-900/50 overflow-hidden">
                             <div className="flex -space-x-1 shrink-0 scale-75">
                                <AlertTriangle size={12} className="text-fuchsia-500 animate-pulse" />
                                <Sparkle size={12} className="text-emerald-500 animate-ping" />
                             </div>
                             <div className="text-[8px] md:text-[9px] font-black font-mono text-emerald-400 uppercase tracking-tighter animate-pulse truncate">
                                 DUALITY_STREAM
                             </div>
                             <div className="flex-1 h-px bg-emerald-900/50"></div>
                         </div>
                         
                         <div className="text-[8px] md:text-[10px] font-bold text-fuchsia-700/50 px-4 mb-2 uppercase tracking-widest">{extraTitle}</div>
                         
                         <div className="space-y-1 px-2">
                            {extraChapters.map((chapter) => {
                                const chapTitle = chapter.translations[language]?.title || chapter.translations['zh-CN'].title;
                                const isActive = chapter.originalIndex === currentChapterIndex;
                                const isLocked = chapter.status === 'locked';

                                return (
                                    <button
                                        key={chapter.id}
                                        onClick={() => {
                                            if (!isLocked) {
                                                setCurrentChapterIndex(chapter.originalIndex);
                                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                                            }
                                        }}
                                        disabled={isLocked}
                                        className={`
                                            w-full text-left p-2 md:p-3 text-[9px] md:text-[10px] font-mono transition-all duration-300 relative group overflow-hidden
                                            ${isActive 
                                                ? 'bg-fuchsia-950/40 text-emerald-400 border-fuchsia-500/50' 
                                                : isLocked
                                                    ? 'bg-ash-dark/20 text-ash-gray/30 border-ash-gray/20 cursor-not-allowed'
                                                    : 'bg-fuchsia-950/10 text-fuchsia-800/60 border-fuchsia-900/20 hover:text-emerald-500 hover:bg-emerald-950/20'
                                            }
                                            border-l-4 border-r-2
                                        `}
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 90% 100%, 0 100%)' }}
                                    >
                                        <div className="relative z-10 flex items-center gap-1 md:gap-2">
                                            <div className={`shrink-0 w-1 h-3 md:h-4 ${isActive ? 'bg-emerald-500 animate-pulse' : isLocked ? 'bg-ash-gray/30' : 'bg-fuchsia-900/50'}`}></div>
                                            <div className="flex-1 truncate">
                                                <div className="opacity-50 text-[7px] md:text-[8px] flex items-center gap-1">
                                                    {isLocked ? <Lock size={8} /> : <Database size={8} />}
                                                    {chapter.date.split(':').pop()?.trim()}
                                                </div>
                                                <div className={`font-black uppercase truncate ${isActive ? 'glitch-text-heavy' : ''} ${isLocked ? 'blur-[1px]' : ''}`}>
                                                    {isLocked ? 'ENCRYPTED' : chapTitle}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                         </div>
                         <div className="h-8"></div>
                    </div>
                )}
            </div>
        </aside>

        {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="absolute top-2 left-2 md:top-4 md:left-4 z-10 p-2 bg-ash-black text-ash-light border-2 border-ash-light shadow-hard-sm md:shadow-hard"><List className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" /></button>}

        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth relative bg-ash-black no-scrollbar">
             <div key={currentChapter.id} className={`max-w-4xl mx-auto min-h-full bg-ash-black border-l-0 md:border-l-2 md:border-r-2 border-ash-dark/50 shadow-2xl relative animate-slide-in ${isDiary ? 'border-fuchsia-900/50 shadow-[0_0_50px_rgba(192,38,211,0.15)]' : ''}`}>
                {currentChapter.status === 'locked' ? (
                    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-black">
                         <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)] pointer-events-none"></div>
                         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>
                         <div className="border-4 border-red-900/50 p-8 md:p-12 bg-black/90 backdrop-blur-md relative shadow-[0_0_50px_rgba(220,38,38,0.3)] max-w-lg w-full">
                              {/* Glitch Overlay */}
                              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                  <div className="w-full h-full bg-red-500/5 animate-pulse"></div>
                              </div>
                              
                              <Ban size={64} className="text-red-600 mx-auto mb-6 animate-[pulse_0.5s_infinite]" />
                              <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter mb-4 glitch-text-heavy" data-text="ACCESS_DENIED">
                                  ACCESS DENIED
                              </h1>
                              <div className="bg-red-950/30 border border-red-900/50 p-4 font-mono text-red-400 text-xs md:text-sm tracking-widest uppercase mb-6 flex flex-col gap-2">
                                  <span>{language === 'en' ? 'SENSITIVE_DATA // CLEARANCE_REVOKED' : '绝密档案 // 权限已被吊销'}</span>
                                  <span className="text-[10px] opacity-70 glitch-text-heavy">▞▞▞▞▞▞▞▞▞▞▞▞▞▞▞▞</span>
                              </div>
                              <p className="text-red-800/60 font-mono text-[10px] uppercase">
                                  [SYSTEM_MESSAGE]: The requested memory fragment is currently unstable or encrypted by a higher-dimensional entity. 
                                  <br/>
                                  ERROR_CODE: 0x{Math.floor(Math.random() * 9999).toString(16).toUpperCase()}
                              </p>
                         </div>
                    </div>
                ) : (
                    <>
                        <div className={`px-4 py-8 md:px-16 md:py-12 border-b-4 border-double border-ash-gray bg-ash-black text-ash-light mt-8 md:mt-12 ${isDiary ? 'border-fuchsia-900/50 bg-gradient-to-br from-fuchsia-950/20 to-emerald-950/20' : ''}`}>
                            <Reveal>
                                <div className={`flex justify-between items-start mb-3 md:mb-6 font-mono text-[8px] md:text-[10px] text-ash-gray uppercase tracking-widest ${isDiary ? 'text-emerald-500' : ''}`}>
                                    <span>SIDE_ARCHIVE // {currentChapter.id}</span>
                                    <span>INDEX: {currentChapterIndex + 1}</span>
                                </div>
                                <h1 className={`text-xl md:text-5xl font-black mb-3 md:mb-6 uppercase tracking-tighter leading-tight ${isDiary ? 'bg-gradient-to-r from-fuchsia-400 to-emerald-400 bg-clip-text text-transparent' : 'text-ash-light'}`}>
                                    {translation.title}
                                </h1>
                                <div className={`flex items-center gap-2 text-[10px] font-mono text-ash-gray bg-ash-dark inline-block px-2 py-0.5 border border-ash-gray ${isDiary ? 'border-fuchsia-900 text-emerald-400' : ''}`}>
                                    {isDiary ? <Sparkle size={10} className="animate-ping" /> : <FileText size={10} />}
                                    <span>{currentChapter.date}</span>
                                </div>
                            </Reveal>
                        </div>
                        
                        <article className={`px-4 py-8 md:px-16 md:py-12 max-w-none text-ash-light font-serif leading-loose tracking-wide ${isDiary || isLegacy ? 'font-mono' : getFontClass(readerFont)}`}>
                            {renderContent(translation.content)}
                        </article>

                        <div className={`p-4 md:p-16 border-t-4 border-double border-ash-gray bg-ash-dark landscape:p-4`}>
                             <div className="flex justify-between items-center gap-2 md:gap-4">
                                <button onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))} disabled={currentChapterIndex === 0} className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 py-3 md:px-6 md:py-4 border-2 border-ash-gray text-ash-gray hover:bg-ash-light hover:text-ash-black disabled:opacity-20 transition-colors uppercase font-bold text-[10px] md:text-sm font-mono"><ChevronLeft size={14} /> PREV</button>
                                <button onClick={handleNextChapter} disabled={currentChapterIndex === volume.chapters.length - 1} className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 py-3 md:px-6 md:py-4 border-2 border-ash-gray text-ash-gray hover:bg-ash-light hover:text-ash-black disabled:opacity-20 transition-colors uppercase font-bold text-[10px] md:text-sm font-mono">NEXT <ChevronRight size={14} /></button>
                             </div>
                        </div>
                    </>
                )}
             </div>
        </main>
    </div>
  );
};

export default SideStoryReader;

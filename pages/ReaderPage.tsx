
import React, { useState, useEffect, useRef } from 'react';
import { novelData } from '../data/novelData';
import { BookOpen, List, ChevronLeft, ChevronRight, Image as ImageIcon, FileText, Activity, AlertTriangle, Terminal, Grid, Folder, Lock, ArrowLeft, MousePointer2, Eye, Cpu, Database, Hash, Disc, BarChart, CircleDashed, FastForward, X } from 'lucide-react';
import { ChapterTranslation, Language, ReadingMode } from '../types';
import Reveal from '../components/Reveal';
import StoryEntryAnimation from '../components/StoryEntryAnimation';
import MaskedText from '../components/MaskedText';
import { ReaderFont, getFontClass } from '../components/fonts/fontConfig';
import VisualNovelPage from './VisualNovelPage';

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
                ENCRYPTION: UNSTABLE
             </span>
          </div>
          <span className="ml-auto opacity-50 text-[10px] group-hover:opacity-100 transition-opacity font-mono">{hint}</span>
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 md:p-6 text-fuchsia-100/90 space-y-2 leading-relaxed tracking-wide font-medium bg-black/20 backdrop-blur-sm">
              {lines.map((line, i) => {
                  const cleanLine = line.replace(/\d{4}\.\dVoid>>/, '').replace(/【插入结束】|【插入結束】|\[INSERTION_END\]/g, '');
                  if (!cleanLine.trim()) return <br key={i}/>;
                  return (
                    <p key={i} className="border-l border-fuchsia-500/20 pl-3 hover:border-fuchsia-500 hover:bg-fuchsia-500/5 transition-colors duration-300">
                        {cleanLine}
                    </p>
                  );
              })}
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

const MainArchiveBackground = ({ isLightTheme }: { isLightTheme: boolean }) => {
    // ... (Code omitted for brevity, assuming no changes here, but preserving content structure)
    // Actually, I must include full content for the file change.
    // Re-pasting the background component code from previous context to ensure file integrity.
    const fragments = React.useMemo(() => {
        return Array.from({ length: 45 }).map((_, i) => {
            const sizeBase = Math.random(); 
            const verticalDuration = 20 + Math.random() * 30; 
            const horizontalDuration = 7 + Math.random() * 10; 
            const tumbleDuration = 10 + Math.random() * 20;
            return {
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * -50,
                verticalDuration,
                horizontalDuration,
                tumbleDuration,
                size: 20 + sizeBase * 150,
                type: Math.random() > 0.7 ? 'monolith' : Math.random() > 0.5 ? 'code' : 'plate',
                code: `0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6,'0')}`,
                opacity: 0.1 + sizeBase * 0.3,
                zIndex: Math.floor(sizeBase * 20),
            };
        });
    }, []);

    const beams = React.useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            left: 10 + Math.random() * 80,
            width: 2 + Math.random() * 50,
            duration: 6 + Math.random() * 4,
            delay: Math.random() * -10,
            opacity: 0.05 + Math.random() * 0.05
        }));
    }, []);

    const bgColor = isLightTheme ? 'bg-zinc-50' : 'bg-[#050505]';
    const gridColor = isLightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
    const particleColor = isLightTheme ? 'text-zinc-800 border-zinc-400' : 'text-ash-light border-ash-gray';
    const beamColor = isLightTheme ? 'bg-gradient-to-b from-transparent via-zinc-400/10 to-transparent' : 'bg-gradient-to-b from-transparent via-ash-light/5 to-transparent';

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${bgColor}`}>
            <div className="absolute inset-0 [perspective:1000px] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,${isLightTheme ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'}_0%,transparent_50%)] animate-pulse-glow pointer-events-none`}></div>
                <div className="absolute inset-x-[-50%] bottom-[-50%] h-[200%] bg-[size:6rem_6rem] [transform:rotateX(75deg)] opacity-30 animate-scanline" style={{ backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)` }}></div>
                {beams.map(beam => (
                    <div key={`beam-${beam.id}`} className={`absolute top-[-20%] bottom-[-20%] ${beamColor} transform -skew-x-12 blur-xl`} style={{ left: `${beam.left}%`, width: `${beam.width}%`, opacity: beam.opacity, animation: `pulse-glow ${beam.duration}s ease-in-out infinite alternate`, animationDelay: `${beam.delay}s` }}></div>
                ))}
                {fragments.map((frag) => (
                    <div key={frag.id} className={`absolute flex items-center justify-center will-change-transform ${particleColor}`} style={{ left: `${frag.left}%`, width: frag.type === 'code' ? 'auto' : `${frag.size}px`, height: frag.type === 'code' ? 'auto' : `${frag.size}px`, zIndex: frag.zIndex, '--base-opacity': frag.opacity, animation: `drift-vertical ${frag.verticalDuration}s linear infinite`, animationDelay: `${frag.delay}s` } as any}>
                        <div className="w-full h-full relative" style={{ animation: `drift-horizontal ${frag.horizontalDuration}s ease-in-out infinite alternate, tumble-3d ${frag.tumbleDuration}s linear infinite`, animationDelay: `${frag.delay * 0.5}s` }}>
                            {frag.type === 'monolith' && <div className="w-full h-full border border-current bg-current/5 relative overflow-hidden"><div className="absolute inset-4 border border-dashed border-current opacity-20"></div></div>}
                            {frag.type === 'plate' && <div className="w-full h-full border-t border-b border-current opacity-40 transform -skew-x-12"></div>}
                            {frag.type === 'code' && <span className="text-[12px] font-mono font-bold tracking-[0.2em] opacity-60 writing-vertical-rl text-current absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{frag.code}</span>}
                        </div>
                    </div>
                ))}
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,${isLightTheme ? 'rgba(255,255,255,0.9)' : 'rgba(5,5,5,0.9)'}_100%)] pointer-events-none z-50`}></div>
            </div>
        </div>
    );
};

interface ReaderPageProps {
  currentIndex: number;
  onChapterChange: (index: number) => void;
  language: Language;
  isLightTheme: boolean;
  readerFont: ReaderFont;
  readingMode?: ReadingMode;
}

const ReaderPage: React.FC<ReaderPageProps> = ({ currentIndex, onChapterChange, language, isLightTheme, readerFont, readingMode = 'standard' }) => {
  const [viewMode, setViewMode] = useState<'directory' | 'reader'>('directory');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingChapterIndex, setPendingChapterIndex] = useState(0);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const autoAdvanceRef = useRef<HTMLDivElement>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const currentChapter = novelData.chapters[currentIndex];
  const translation: ChapterTranslation = currentChapter.translations[language] || currentChapter.translations['zh-CN'];
  const hasNextChapter = currentIndex < novelData.chapters.length - 1;
  const nextChapter = hasNextChapter ? novelData.chapters[currentIndex + 1] : null;
  const canAutoAdvance = hasNextChapter && nextChapter && nextChapter.status !== 'locked';

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
    setIsAutoAdvancing(false);
    setAutoAdvanceTimer(null);
  }, [currentIndex, viewMode]);

  useEffect(() => {
    if (viewMode !== 'reader' || !canAutoAdvance || readingMode === 'visual_novel') return; // Disable standard auto-advance in VN mode
    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isAutoAdvancing) {
                setIsAutoAdvancing(true);
                let timeLeft = 3;
                setAutoAdvanceTimer(timeLeft);
                const timerInterval = setInterval(() => {
                    timeLeft -= 1;
                    setAutoAdvanceTimer(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        handleNext();
                    }
                }, 1000);
                return () => clearInterval(timerInterval);
            } else if (!entry.isIntersecting && isAutoAdvancing) {
                setIsAutoAdvancing(false);
                setAutoAdvanceTimer(null);
            }
        },
        { threshold: 0.5 }
    );
    if (autoAdvanceRef.current) observer.observe(autoAdvanceRef.current);
    return () => observer.disconnect();
  }, [viewMode, canAutoAdvance, isAutoAdvancing, readingMode]);

  const handleChapterSelect = (index: number, id: string) => {
      setSelectedChapterId(id);
      setPendingChapterIndex(index);
      setIsTransitioning(true);
  };
  
  const handleTransitionComplete = () => {
      setIsTransitioning(false);
      onChapterChange(pendingChapterIndex);
      setViewMode('reader');
      setSelectedChapterId(null);
  };

  const handleNext = () => { if (currentIndex < novelData.chapters.length - 1) onChapterChange(currentIndex + 1); };
  const handlePrev = () => { if (currentIndex > 0) onChapterChange(currentIndex - 1); };

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
    
    // State to track the active speaker for continued dialogue without prefix
    let lastSpeakerClass = "";

    const flushTextBuffer = () => {
        if (textBuffer.length > 0) {
            const joinedText = smartJoin(textBuffer);
            let className = `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-ash-light transition-colors ${getFontClass(readerFont)}`;
            let foundSpeaker = false;
            
            // Check for explicit speakers
            if (/^(零点|Point|零點)(:|：|\(|（)/.test(joinedText)) {
                className = isLightTheme ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-zinc-600 font-bold ${getFontClass(readerFont)}` : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.4)] ${getFontClass(readerFont)}`;
                lastSpeakerClass = className;
                foundSpeaker = true;
            } else if (/^(芷漓|Zeri)(:|：|\(|（)/.test(joinedText)) {
                className = isLightTheme ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-pink-600 ${getFontClass(readerFont)}` : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-pink-400 drop-shadow-[0_0_2px_rgba(244,114,182,0.4)] ${getFontClass(readerFont)}`;
                lastSpeakerClass = className;
                foundSpeaker = true;
            } else if (/^(泽洛|Zelo|澤洛)(:|：|\(|（)/.test(joinedText)) {
                className = isLightTheme ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-blue-600 ${getFontClass(readerFont)}` : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-blue-400 drop-shadow-[0_0_2px_rgba(96,165,250,0.4)] ${getFontClass(readerFont)}`;
                lastSpeakerClass = className;
                foundSpeaker = true;
            } else if (/^(\?\?\?|Void|void)(:|：|\(|（|>)/.test(joinedText)) {
                className = isLightTheme ? `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-fuchsia-700 font-bold ${getFontClass(readerFont)}` : `mb-4 md:mb-8 text-justify indent-6 md:indent-12 text-xs md:text-base leading-relaxed text-fuchsia-400 drop-shadow-[0_0_5px_rgba(192,38,211,0.5)] ${getFontClass(readerFont)}`;
                lastSpeakerClass = className;
                foundSpeaker = true;
            }

            // If no explicit speaker found, check for continued dialogue (starts with quote)
            if (!foundSpeaker) {
                const startsWithQuote = /^["“「]/.test(joinedText);
                if (startsWithQuote && lastSpeakerClass) {
                    className = lastSpeakerClass;
                } else if (!startsWithQuote) {
                    // Reset if it looks like narration (no quote)
                    lastSpeakerClass = "";
                }
            }

            nodes.push(<Reveal key={`p-${nodes.length}`}><p className={className}>{parseRichText(joinedText)}</p></Reveal>);
            textBuffer = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Use regex for flexible detection of interference level (0000.2, 0600.0, etc)
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
                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-ash-light text-ash-black px-2 md:px-3 py-0.5 md:py-1 text-[8px] md:text-[10px] font-mono font-bold border border-ash-black flex items-center gap-1 md:gap-2 uppercase">
                            <ImageIcon size={10} /> {caption}
                        </div>
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

  if (viewMode === 'directory') {
    return (
        <div className="h-full relative flex flex-col items-center overflow-hidden">
             {isTransitioning && <StoryEntryAnimation onComplete={handleTransitionComplete} language={language} mode="fast" />}
             <MainArchiveBackground isLightTheme={isLightTheme} />
             <div className="absolute inset-0 overflow-y-auto p-4 md:p-12 z-10 custom-scrollbar landscape:p-4">
                 <header className="relative mb-8 md:mb-16 text-center w-full max-w-4xl mx-auto mt-4 border-b border-ash-gray/30 pb-4 md:pb-8 bg-ash-black/40 backdrop-blur-sm p-4 md:p-6 landscape:mb-6">
                    <div className="flex flex-col items-center gap-2 md:gap-4">
                        <div className="bg-ash-black border-2 border-ash-light p-2 md:p-4 shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                            <CircleDashed size={32} className="text-ash-light animate-spin-slow" />
                        </div>
                        <h1 className="text-2xl md:text-6xl font-black text-ash-light uppercase tracking-tighter landscape:text-xl">
                            {language === 'en' ? 'MAIN_ARCHIVE' : '主线档案'}
                        </h1>
                        <div className="text-[8px] md:text-[10px] font-mono text-ash-light uppercase tracking-widest bg-ash-black/80 px-4 py-1 border border-ash-gray/50">
                            CORE_SPIN_RATE: 104% | SYNC_STABLE
                        </div>
                    </div>
                </header>

                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20 px-2 landscape:grid-cols-2 landscape:gap-4">
                    {novelData.chapters.map((chapter, index) => {
                        const t = chapter.translations[language] || chapter.translations['zh-CN'];
                        const isLocked = chapter.status === 'locked';
                        const isSelected = selectedChapterId === chapter.id;
                        const indexStr = String(index + 1).padStart(2, '0');
                        
                        return (
                            <Reveal key={chapter.id} delay={index * 50}>
                                <button
                                    onClick={() => !isLocked && handleChapterSelect(index, chapter.id)}
                                    disabled={isLocked}
                                    className={`
                                        w-full h-40 md:h-56 relative group transition-all duration-300 flex flex-col text-left overflow-hidden border-2
                                        ${isLocked 
                                            ? 'border-ash-dark bg-ash-black/60 opacity-60 cursor-not-allowed' 
                                            : isSelected
                                                ? 'border-ash-light bg-ash-light text-ash-black scale-[0.98] shadow-none'
                                                : 'border-ash-gray bg-ash-black/80 hover:border-ash-light hover:drop-shadow-[0_0_10px_rgba(228,228,231,0.5)]'
                                        }
                                    `}
                                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
                                >
                                    <div className={`absolute -right-2 -bottom-4 md:-bottom-6 text-[60px] md:text-[100px] font-black font-mono leading-none tracking-tighter opacity-5 pointer-events-none ${isSelected ? 'text-black opacity-10' : ''}`}>
                                        {indexStr}
                                    </div>
                                    <div className="relative z-10 flex justify-between items-start p-3 md:p-4 border-b border-dashed border-current opacity-70 group-hover:opacity-100 transition-opacity">
                                        <div className="text-[8px] md:text-[10px] font-mono font-bold px-2 py-0.5 border border-current">CH_{indexStr}</div>
                                        {isLocked && <Lock size={12} />}
                                        {isSelected && <div className="animate-spin"><Disc size={12} /></div>}
                                    </div>
                                    <div className={`relative z-10 p-4 md:p-5 flex-1 flex flex-col justify-between transition-colors duration-300 ${!isLocked && 'group-hover:text-ash-black'} ${isSelected ? 'text-ash-black' : ''}`}>
                                        <h3 className={`text-sm md:text-xl font-black uppercase tracking-tight leading-tight line-clamp-2 ${isLocked ? 'blur-[2px]' : ''}`}>{t.title}</h3>
                                        <div className="text-[8px] md:text-[10px] font-mono opacity-70 mt-2">DATE: {chapter.date}</div>
                                    </div>
                                </button>
                            </Reveal>
                        );
                    })}
                </div>
             </div>
        </div>
    );
  }

  // --- Visual Novel Mode Check ---
  if (readingMode === 'visual_novel' && currentChapter.status !== 'locked') {
      return (
          <VisualNovelPage 
              chapter={currentChapter}
              onNextChapter={handleNext}
              onPrevChapter={handlePrev}
              onExit={() => setViewMode('directory')}
              language={language}
              isLightTheme={isLightTheme}
          />
      );
  }

  // --- Standard Reader ---
  return (
    <div className="flex h-full relative overflow-hidden bg-retro-paper text-zinc-950">
      <aside className={`absolute md:relative z-20 h-full bg-ash-black border-r-4 border-ash-dark transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-64 md:w-72 translate-x-0 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full md:w-0 md:-translate-x-0 overflow-hidden'}`}>
        <div className="p-3 md:p-4 border-b-2 border-ash-gray bg-ash-black text-ash-light flex justify-between items-center shrink-0 landscape:py-1">
          <button onClick={() => setViewMode('directory')} className="flex items-center gap-2 text-[10px] md:text-xs font-mono font-bold hover:text-ash-gray transition-colors group p-1">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {language === 'en' ? 'DIRECTORY' : '返回目录'}
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-ash-gray hover:text-ash-light" aria-label="Close Sidebar"><ChevronLeft size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-0 no-scrollbar">
          {novelData.chapters.map((chapter, index) => {
            const chapTitle = chapter.translations[language]?.title || chapter.translations['zh-CN'].title;
            const isLocked = chapter.status === 'locked';
            return (
              <button key={chapter.id} onClick={() => { if (!isLocked) { onChapterChange(index); if (window.innerWidth < 768) setIsSidebarOpen(false); }}} disabled={isLocked}
                className={`w-full text-left p-3 md:p-4 text-[10px] md:text-xs font-mono border-b border-ash-dark transition-none group relative overflow-hidden ${index === currentIndex ? 'bg-ash-light text-ash-black border-l-4 border-l-white' : 'text-ash-gray hover:bg-ash-dark'}`}>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="font-bold truncate uppercase max-w-[85%]">{index === currentIndex && <span className="mr-1">&gt;</span>}{chapTitle}</div>
                    </div>
                    <div className="opacity-60 text-[8px]">{chapter.date}</div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>
      {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="absolute top-2 left-2 md:top-4 md:left-4 z-10 p-2 bg-ash-black text-ash-light border-2 border-ash-light shadow-hard-sm md:shadow-hard"><List size={18} /></button>}
      <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth relative bg-ash-black custom-scrollbar">
        <div key={currentIndex} className="max-w-4xl mx-auto min-h-full bg-ash-black border-l-0 md:border-l-2 md:border-r-2 border-ash-dark/50 shadow-2xl relative animate-slide-in">
          {currentChapter.status === 'locked' ? (
              <div className="h-[80vh] flex flex-col items-center justify-center text-ash-gray p-8 text-center"><h2 className="text-xl font-black uppercase text-red-700 tracking-widest mb-2">Access Denied</h2></div>
          ) : (
            <>
                <div className="px-4 py-8 md:px-16 md:py-12 border-b-4 border-double border-ash-gray bg-ash-black text-ash-light mt-8 md:mt-0 landscape:py-6">
                    <Reveal>
                    <div className="flex justify-between items-start mb-3 md:mb-6 font-mono text-[8px] md:text-[10px] text-ash-gray uppercase tracking-widest">
                        <span>NOVA_ARCHIVE // {currentChapter.id}</span>
                        <span>PG_INDEX: {currentIndex + 1}</span>
                    </div>
                    <h1 className={`text-2xl md:text-5xl font-black mb-3 md:mb-6 uppercase tracking-tighter leading-tight ${getFontClass(readerFont)} landscape:text-xl`}>{translation.title}</h1>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-ash-gray bg-ash-dark inline-block px-3 py-0.5 border border-ash-gray"><FileText size={12} /><span>{currentChapter.date}</span></div>
                    </Reveal>
                </div>
                <article className={`px-4 py-8 md:px-16 md:py-12 max-w-none text-ash-light font-serif leading-loose tracking-wide ${getFontClass(readerFont)} landscape:py-6`}>{renderContent(translation.content)}</article>
                
                {canAutoAdvance && (
                    <div ref={autoAdvanceRef} className="px-8 pb-8 pt-4 bg-ash-black flex flex-col items-center justify-center border-t-2 border-dashed border-ash-gray/30 landscape:pb-4">
                        {isAutoAdvancing ? (
                            <div className="w-full max-w-md animate-fade-in text-center">
                                <div className="text-ash-light font-mono text-[10px] mb-2 tracking-widest animate-pulse">{language === 'en' ? 'AUTO_ADVANCING...' : '即将自动跳转下一章...'}</div>
                                <div className="w-full h-1 bg-ash-dark rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${((3 - (autoAdvanceTimer || 3)) / 3) * 100}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-ash-gray/30 text-[8px] font-mono uppercase">SCROLL DOWN TO ADVANCE</div>
                        )}
                    </div>
                )}

                <div className="p-4 md:p-16 border-t-4 border-double border-ash-gray bg-ash-dark landscape:p-4">
                    <div className="flex justify-between items-center gap-2 md:gap-4">
                        <button onClick={handlePrev} disabled={currentIndex === 0} className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 py-3 md:px-6 md:py-4 border-2 border-ash-gray text-ash-gray hover:bg-ash-light hover:text-ash-black transition-colors uppercase font-bold text-[10px] md:text-sm font-mono"><ChevronLeft size={14} /> PREV</button>
                        <button onClick={handleNext} disabled={currentIndex === novelData.chapters.length - 1} className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 py-3 md:px-6 md:py-4 border-2 border-ash-gray text-ash-gray hover:bg-ash-light hover:text-ash-black transition-colors uppercase font-bold text-[10px] md:text-sm font-mono">NEXT <ChevronRight size={14} /></button>
                    </div>
                </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReaderPage;

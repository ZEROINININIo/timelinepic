
import React, { useState, useEffect, useRef } from 'react';
import { Chapter, Language, VNNode } from '../types';
import { parseChapterToVN } from '../utils/vnParser';
import { Play, Pause, RotateCcw, ArrowRight, Terminal, X, Image as ImageIcon, CheckCircle, FileText, AlertTriangle, CloudRain, Cpu, Coffee, Sparkles } from 'lucide-react';
import Reveal from '../components/Reveal';
import MaskedText from '../components/MaskedText';

interface VisualNovelPageProps {
  chapter: Chapter;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  onExit: () => void;
  language: Language;
  isLightTheme: boolean;
}

// Helper: Remove outer quotes from dialogue
const cleanDialogueText = (text: string) => {
    let clean = text.trim();
    // Recursively remove outer quotes until clean, handling mixed types
    while (
        (clean.startsWith('“') && clean.endsWith('”')) || 
        (clean.startsWith('"') && clean.endsWith('"')) ||
        (clean.startsWith('「') && clean.endsWith('」'))
    ) {
        clean = clean.slice(1, -1).trim();
    }
    return clean;
};

// --- Theme Engine ---
type VNTheme = 'variable' | 'rain' | 'daily' | 'default';

const detectChapterTheme = (chapterId: string): VNTheme => {
    if (chapterId.startsWith('story-variable-') || chapterId.includes('byaki') || chapterId.includes('void')) return 'variable';
    if (chapterId.startsWith('story-frag-rain-')) return 'rain';
    if (chapterId.startsWith('story-coffee') || chapterId.startsWith('story-hotpot') || chapterId.includes('daily')) return 'daily';
    return 'default';
};

const getThemeStyles = (theme: VNTheme, isLightTheme: boolean) => {
    switch (theme) {
        case 'variable':
            return {
                bg: isLightTheme ? 'bg-emerald-50 text-emerald-900' : 'bg-green-950 text-emerald-100',
                grid: isLightTheme 
                    ? 'bg-[linear-gradient(0deg,transparent_24%,rgba(16,185,129,.1)_25%,rgba(16,185,129,.1)_26%,transparent_27%,transparent_74%,rgba(16,185,129,.1)_75%,rgba(16,185,129,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(16,185,129,.1)_25%,rgba(16,185,129,.1)_26%,transparent_27%,transparent_74%,rgba(16,185,129,.1)_75%,rgba(16,185,129,.1)_76%,transparent_77%,transparent)]'
                    : 'bg-[linear-gradient(0deg,transparent_24%,rgba(16,185,129,.1)_25%,rgba(16,185,129,.1)_26%,transparent_27%,transparent_74%,rgba(16,185,129,.1)_75%,rgba(16,185,129,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(16,185,129,.1)_25%,rgba(16,185,129,.1)_26%,transparent_27%,transparent_74%,rgba(16,185,129,.1)_75%,rgba(16,185,129,.1)_76%,transparent_77%,transparent)]',
                textBox: isLightTheme ? 'bg-white/95 border-emerald-300 shadow-[0_-10px_30px_rgba(16,185,129,0.1)]' : 'bg-black/95 border-emerald-500/50 shadow-[0_-10px_30px_rgba(16,185,129,0.1)]',
                accentText: 'text-emerald-500',
                border: 'border-emerald-500',
                icon: Cpu
            };
        case 'rain':
            return {
                bg: isLightTheme ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-cyan-100',
                grid: isLightTheme
                    ? 'bg-[linear-gradient(0deg,transparent_24%,rgba(56,189,248,.1)_25%,rgba(56,189,248,.1)_26%,transparent_27%,transparent_74%,rgba(56,189,248,.1)_75%,rgba(56,189,248,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(56,189,248,.1)_25%,rgba(56,189,248,.1)_26%,transparent_27%,transparent_74%,rgba(56,189,248,.1)_75%,rgba(56,189,248,.1)_76%,transparent_77%,transparent)]'
                    : 'bg-[linear-gradient(0deg,transparent_24%,rgba(6,182,212,.1)_25%,rgba(6,182,212,.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,.1)_75%,rgba(6,182,212,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(6,182,212,.1)_25%,rgba(6,182,212,.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,.1)_75%,rgba(6,182,212,.1)_76%,transparent_77%,transparent)]',
                textBox: isLightTheme ? 'bg-white/95 border-cyan-300 shadow-[0_-10px_30px_rgba(6,182,212,0.1)]' : 'bg-slate-900/95 border-cyan-500/50 shadow-[0_-10px_30px_rgba(6,182,212,0.15)]',
                accentText: 'text-cyan-400',
                border: 'border-cyan-500',
                icon: CloudRain
            };
        case 'daily':
            return {
                bg: isLightTheme ? 'bg-amber-50 text-amber-900' : 'bg-[#1a1510] text-amber-100',
                grid: 'bg-[linear-gradient(0deg,transparent_24%,rgba(245,158,11,.1)_25%,rgba(245,158,11,.1)_26%,transparent_27%,transparent_74%,rgba(245,158,11,.1)_75%,rgba(245,158,11,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(245,158,11,.1)_25%,rgba(245,158,11,.1)_26%,transparent_27%,transparent_74%,rgba(245,158,11,.1)_75%,rgba(245,158,11,.1)_76%,transparent_77%,transparent)]',
                textBox: isLightTheme ? 'bg-white/95 border-amber-300 shadow-[0_-10px_30px_rgba(245,158,11,0.1)]' : 'bg-black/95 border-amber-500/50 shadow-[0_-10px_30px_rgba(245,158,11,0.1)]',
                accentText: 'text-amber-500',
                border: 'border-amber-500',
                icon: Coffee
            };
        default:
            return {
                bg: isLightTheme ? 'bg-zinc-100 text-zinc-900' : 'bg-[#0a0a0c] text-ash-light',
                grid: 'bg-[linear-gradient(0deg,transparent_24%,rgba(34,211,238,.1)_25%,rgba(34,211,238,.1)_26%,transparent_27%,transparent_74%,rgba(34,211,238,.1)_75%,rgba(34,211,238,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(34,211,238,.1)_25%,rgba(34,211,238,.1)_26%,transparent_27%,transparent_74%,rgba(34,211,238,.1)_75%,rgba(34,211,238,.1)_76%,transparent_77%,transparent)]',
                textBox: isLightTheme ? 'bg-white/95 border-zinc-300 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]' : 'bg-black/95 border-ash-dark shadow-[0_-10px_30px_rgba(0,0,0,0.5)]',
                accentText: 'text-ash-light',
                border: 'border-ash-light',
                icon: Terminal
            };
    }
};

const getCharacterTheme = (id: string, isLightTheme: boolean, vnTheme: VNTheme) => {
    // Character theme overrides based on VN Theme (e.g., in Variable theme, characters might look glitchy)
    
    const baseThemes: Record<string, any> = {
        'point': { 
            text: isLightTheme ? 'text-zinc-700' : 'text-zinc-300',
            border: isLightTheme ? 'border-zinc-400' : 'border-zinc-500',
            bg: isLightTheme ? 'bg-zinc-100' : 'bg-zinc-900',
            labelBg: isLightTheme ? 'bg-zinc-800' : 'bg-ash-light',
            labelTx: isLightTheme ? 'text-white' : 'text-ash-black',
            initials: 'ZP'
        },
        'zeri': { 
            text: isLightTheme ? 'text-pink-700' : 'text-pink-200',
            border: isLightTheme ? 'border-pink-300' : 'border-pink-500/50',
            bg: isLightTheme ? 'bg-pink-50' : 'bg-pink-950/20',
            labelBg: 'bg-pink-600',
            labelTx: 'text-white',
            initials: 'ZL'
        },
        'zelo': { 
            text: isLightTheme ? 'text-blue-700' : 'text-blue-200',
            border: isLightTheme ? 'border-blue-300' : 'border-blue-500/50',
            bg: isLightTheme ? 'bg-blue-50' : 'bg-blue-950/20',
            labelBg: 'bg-blue-600',
            labelTx: 'text-white',
            initials: 'ZO'
        },
        'void': { 
            text: isLightTheme ? 'text-fuchsia-900 font-mono font-bold' : 'text-fuchsia-300 font-mono font-bold',
            border: 'border-fuchsia-500 border-dashed border-2',
            bg: isLightTheme ? 'bg-fuchsia-50' : 'bg-black/90 backdrop-blur-md',
            labelBg: 'bg-black border border-fuchsia-500',
            labelTx: 'text-fuchsia-500 animate-pulse',
            initials: 'VOID'
        },
        'dusk': { 
            text: isLightTheme ? 'text-amber-800' : 'text-amber-200',
            border: isLightTheme ? 'border-amber-300' : 'border-amber-500/50',
            bg: isLightTheme ? 'bg-amber-50' : 'bg-amber-950/20',
            labelBg: 'bg-amber-600',
            labelTx: 'text-white',
            initials: 'DR'
        },
        'byaki': { 
            text: isLightTheme ? 'text-emerald-800' : 'text-emerald-200',
            border: isLightTheme ? 'border-emerald-300' : 'border-emerald-500/50',
            bg: isLightTheme ? 'bg-emerald-50' : 'bg-emerald-950/20',
            labelBg: 'bg-emerald-700',
            labelTx: 'text-white',
            initials: 'BK'
        },
        'system': {
            text: 'text-red-500 font-mono',
            border: 'border-red-500 border-double border-4',
            bg: 'bg-black',
            labelBg: 'bg-red-600',
            labelTx: 'text-white',
            initials: 'SYS'
        },
        'unknown': { 
            text: isLightTheme ? 'text-zinc-600' : 'text-ash-gray',
            border: isLightTheme ? 'border-zinc-300' : 'border-ash-gray/30',
            bg: isLightTheme ? 'bg-zinc-50' : 'bg-ash-dark/30',
            labelBg: isLightTheme ? 'bg-zinc-500' : 'bg-ash-gray',
            labelTx: 'text-white',
            initials: '??'
        }
    };

    const t = baseThemes[id] || baseThemes['unknown'];

    // Overrides for Variable Theme (Unified Green/Glitch aesthetics for some characters)
    if (vnTheme === 'variable') {
        if (id === 'byaki') {
             // Byaki looks more like Void in Variable theme
             return { ...t, text: 'text-emerald-100 font-mono tracking-wider', border: 'border-emerald-400', bg: 'bg-emerald-900/40' };
        }
        if (id === 'unknown') {
             return { ...t, text: 'text-emerald-500', border: 'border-emerald-800', bg: 'bg-black' };
        }
    }

    return t;
};

const CharacterSprite = ({ id, isActive, emotion, isLightTheme, vnTheme }: { id: string, isActive: boolean, emotion?: string, isLightTheme: boolean, vnTheme: VNTheme }) => {
    const theme = getCharacterTheme(id, isLightTheme, vnTheme);
    
    return (
        <div 
            className={`
                transition-all duration-500 transform
                ${isActive ? 'scale-110 opacity-100 grayscale-0 translate-y-0' : 'scale-90 opacity-40 grayscale translate-y-4'}
                flex flex-col items-center
            `}
        >
            {/* Avatar Circle */}
            <div className={`
                w-32 h-32 md:w-48 md:h-48 rounded-full border-4 flex items-center justify-center backdrop-blur-md relative overflow-hidden
                ${theme.text} ${theme.border} ${theme.bg}
                ${isActive && emotion === 'shocked' ? 'animate-shake-violent' : ''}
                ${isActive && emotion === 'happy' ? 'animate-bounce' : ''}
            `}>
                <div className="text-4xl md:text-6xl font-black font-mono tracking-tighter opacity-80 select-none">
                    {theme.initials}
                </div>
                {/* Scanline overlay on char */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
            </div>
            
            {/* Stand Base */}
            <div className={`mt-4 w-24 h-2 bg-current opacity-50 rounded-full blur-[2px] ${theme.text}`}></div>
        </div>
    );
};

const VisualNovelPage: React.FC<VisualNovelPageProps> = ({ chapter, onNextChapter, onPrevChapter, onExit, language, isLightTheme }) => {
  const [nodes, setNodes] = useState<VNNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [history, setHistory] = useState<VNNode[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  const autoPlayTimerRef = useRef<number | null>(null);
  const textTimerRef = useRef<number | null>(null);

  const t = chapter.translations[language] || chapter.translations['zh-CN'];
  const vnTheme = detectChapterTheme(chapter.id);
  const themeStyles = getThemeStyles(vnTheme, isLightTheme);

  // Initialize
  useEffect(() => {
    const parsed = parseChapterToVN(t.content);
    // Fallback for empty content (like Terminal trigger chapters) to prevent hanging
    if (parsed.length === 0) {
        setNodes([{
            id: 'sys-wait',
            type: 'system',
            text: 'TERMINAL_LINK_ESTABLISHED...',
            emotion: 'neutral'
        }]);
    } else {
        setNodes(parsed);
    }
    setCurrentIndex(0);
    setHistory([]);
    setAutoPlay(false);
    setShowEndModal(false);
  }, [chapter, language]);

  const currentNode = nodes[currentIndex];

  // Typing Effect
  useEffect(() => {
    if (!currentNode) return;

    let textToDisplay = currentNode.text;
    if (currentNode.type === 'dialogue') {
        textToDisplay = cleanDialogueText(textToDisplay);
    }

    // Handle Image Nodes: Auto skip typing, display immediately
    if (currentNode.type === 'image') {
        setDisplayedText(currentNode.text);
        setIsTyping(false);
        return;
    }

    setIsTyping(true);
    setDisplayedText('');
    let charIdx = 0;
    const speed = 30; // ms per char

    if (textTimerRef.current) clearInterval(textTimerRef.current);

    // Skip typewriter for rich text to avoid broken tags during rendering
    if (currentNode.text.includes('[[')) {
        setDisplayedText(currentNode.text); // Use original for rich text parsing (parser handles removal)
        setIsTyping(false);
        if (autoPlay) {
            autoPlayTimerRef.current = window.setTimeout(() => {
                handleNext();
            }, 2000 + currentNode.text.length * 20);
        }
        return;
    }

    textTimerRef.current = window.setInterval(() => {
        if (charIdx < textToDisplay.length) {
            setDisplayedText(textToDisplay.substring(0, charIdx + 1));
            charIdx++;
        } else {
            setIsTyping(false);
            if (textTimerRef.current) clearInterval(textTimerRef.current);
            
            // Auto Play Logic
            if (autoPlay) {
                autoPlayTimerRef.current = window.setTimeout(() => {
                    handleNext();
                }, 1500 + textToDisplay.length * 20);
            }
        }
    }, speed);

    return () => {
        if (textTimerRef.current) clearInterval(textTimerRef.current);
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [currentIndex, currentNode, autoPlay]);

  const handleNext = () => {
      if (showEndModal) return;

      if (isTyping) {
          // Complete immediately
          let textToDisplay = currentNode.text;
          if (currentNode.type === 'dialogue') {
             textToDisplay = cleanDialogueText(textToDisplay);
          }
          setDisplayedText(textToDisplay);
          setIsTyping(false);
          if (textTimerRef.current) clearInterval(textTimerRef.current);
          return;
      }

      if (currentIndex < nodes.length - 1) {
          setHistory(prev => [...prev, currentNode]);
          setCurrentIndex(prev => prev + 1);
      } else {
          // End of Chapter Reached
          setAutoPlay(false);
          setShowEndModal(true);
      }
  };

  const handleFinishChapter = () => {
      setShowEndModal(false);
      onNextChapter();
  };

  const toggleAuto = () => {
      if (autoPlay) {
          setAutoPlay(false);
          if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      } else {
          setAutoPlay(true);
          if (!isTyping) handleNext();
      }
  };

  // --- Rich Text Parser (Theme Aware) ---
  const parseRichText = (text: string) => {
    // Regex includes VOID_VISION
    const parts = text.split(/(\[\[(?:MASK|GLITCH_GREEN|GREEN|VOID|DANGER|BLUE|WHITE|VOID_VISION)::.*?\]\])/g);
    return parts.map((part, index) => {
        if (part.startsWith('[[MASK::') && part.endsWith(']]')) {
            const content = part.slice(8, -2);
            return <MaskedText key={index}>{content}</MaskedText>;
        }
        
        // Helper for colored spans
        const createSpan = (content: string, colorClass: string, extraClass: string = "") => (
            <span key={index} className={`${colorClass} ${extraClass}`}>
                {content}
            </span>
        );

        if (part.startsWith('[[GLITCH_GREEN::') && part.endsWith(']]')) {
            const content = part.slice(16, -2);
            const color = isLightTheme ? 'text-emerald-600' : 'text-emerald-400';
            const shadow = isLightTheme ? '' : 'drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]';
            return (
                <span key={index} className={`${color} font-black tracking-widest ${shadow} inline-block animate-pulse relative px-1`}>
                    {!isLightTheme && <span className="absolute inset-0 animate-ping opacity-30 blur-sm bg-emerald-500/20 rounded-full"></span>}
                    <span className="relative z-10">{content}</span>
                </span>
            );
        }
        if (part.startsWith('[[GREEN::') && part.endsWith(']]')) {
            const content = part.slice(9, -2);
            return createSpan(content, isLightTheme ? 'text-emerald-700' : 'text-emerald-500', 'font-mono font-bold tracking-wide');
        }
        if (part.startsWith('[[VOID::') && part.endsWith(']]')) {
            const content = part.slice(8, -2);
            const color = isLightTheme ? 'text-fuchsia-700' : 'text-fuchsia-500';
            return (
                <span key={index} className={`${color} font-black tracking-widest inline-block animate-pulse relative px-1`}>
                    <span className="relative z-10">{content}</span>
                </span>
            );
        }
        if (part.startsWith('[[DANGER::') && part.endsWith(']]')) {
            const content = part.slice(10, -2);
            return createSpan(content, 'text-red-600', 'font-black animate-crash origin-left inline-block px-1');
        }
        if (part.startsWith('[[BLUE::') && part.endsWith(']]')) {
            const content = part.slice(8, -2);
            // Ensure BLUE text stands out in Light Mode against Zinc-50 background
            return createSpan(content, isLightTheme ? 'text-blue-700' : 'text-blue-400', 'font-bold px-1');
        }
        if (part.startsWith('[[WHITE::') && part.endsWith(']]')) {
            const content = part.slice(9, -2);
            // In light theme, WHITE text needs to be black or dark
            const color = isLightTheme ? 'text-black font-black' : 'text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]';
            return createSpan(content, color, 'animate-pulse');
        }
        if (part.startsWith('[[VOID_VISION::') && part.endsWith(']]')) {
            const content = part.slice(15, -2);
            const color = isLightTheme ? 'text-purple-900 bg-purple-100 border-purple-300' : 'text-fuchsia-300 bg-fuchsia-950/50 border-fuchsia-500/50';
            return (
                <div key={index} className={`my-2 p-2 border-l-4 font-mono text-sm ${color} animate-pulse`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                        <AlertTriangle size={12} /> SYSTEM_INTERCEPT
                    </div>
                    {content}
                </div>
            );
        }
        return part;
    });
  };

  const activeSpeakerId = currentNode?.type === 'dialogue' ? currentNode.speaker : 'unknown';
  const speakerTheme = getCharacterTheme(activeSpeakerId || 'unknown', isLightTheme, vnTheme);

  if (!currentNode) return <div className="flex items-center justify-center h-full">LOADING_SCRIPT...</div>;

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden font-mono select-none ${themeStyles.bg}`}>
        
        {/* Background Grid Animation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className={`w-full h-full bg-[size:50px_50px] ${themeStyles.grid}`}></div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
            <div className="flex gap-2">
                <button onClick={onExit} className="p-2 border border-current hover:bg-current hover:text-black transition-colors" title="Exit Game Mode">
                    <X size={16} />
                </button>
                <div className="px-3 py-2 border border-current text-xs font-bold flex items-center gap-2">
                    <themeStyles.icon size={14} />
                    <span>{chapter.id.toUpperCase()}</span>
                </div>
            </div>
            <div className="text-xs font-bold opacity-50">
                FRAME: {currentIndex + 1} / {nodes.length}
            </div>
        </div>

        {/* Stage Area (Character Visuals or Image) */}
        <div className="flex-1 relative flex items-center justify-center z-10" onClick={handleNext}>
            {currentNode?.type === 'dialogue' && currentNode.speaker && (
                <CharacterSprite 
                    id={currentNode.speaker} 
                    isActive={true} 
                    emotion={currentNode.emotion}
                    isLightTheme={isLightTheme}
                    vnTheme={vnTheme}
                />
            )}
            {currentNode.type === 'narration' && (
                <div className="text-4xl opacity-10 animate-pulse">...</div>
            )}
            {currentNode.type === 'image' && (
                <div className="relative max-w-[90%] max-h-[60%] border-4 border-current p-2 bg-black/20 shadow-hard animate-zoom-in-fast">
                    {/* Parse src and caption from stored text (src::caption) */}
                    {(() => {
                        const parts = currentNode.text.split('::');
                        const src = parts[0];
                        const caption = parts.length > 1 ? parts.slice(1).join('::') : '';
                        return (
                            <>
                                <img src={src} alt="Scene" className="max-h-[50vh] object-contain block" />
                                {caption && (
                                    <div className="absolute bottom-4 right-4 bg-black text-white px-2 py-1 text-xs font-bold border border-white flex items-center gap-2">
                                        <ImageIcon size={12} /> {caption}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>

        {/* Text Box Area */}
        <div className={`relative z-30 p-4 md:p-8 md:pb-12 shrink-0 transition-all duration-300 ${themeStyles.textBox} border-t-4`}>
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
                
                {/* Speaker Label */}
                <div className="h-8 flex items-end">
                    {currentNode.type === 'dialogue' && (
                        <div className={`
                            px-4 py-1 text-sm font-black uppercase tracking-widest transform -skew-x-12 origin-bottom-left border
                            ${speakerTheme.labelBg} ${speakerTheme.labelTx} border-transparent
                        `}>
                            {currentNode.speakerName}
                        </div>
                    )}
                    {currentNode.type === 'system' && (
                        <div className="px-4 py-1 text-sm font-black uppercase tracking-widest text-red-500 border border-red-500 bg-red-950/20">
                            SYSTEM_ALERT
                        </div>
                    )}
                    {currentNode.type === 'image' && (
                        <div className="px-4 py-1 text-sm font-black uppercase tracking-widest text-blue-500 border border-blue-500 bg-blue-950/20">
                            VISUAL_DATA
                        </div>
                    )}
                </div>

                {/* Main Text */}
                <div 
                    className={`
                        min-h-[100px] md:min-h-[120px] text-base md:text-xl leading-relaxed cursor-pointer p-4 border-2
                        ${currentNode.type === 'system' ? 'text-red-500 border-red-900/30' : ''}
                        ${currentNode.type === 'narration' ? 'italic border-transparent opacity-80' : ''}
                        ${currentNode.type === 'dialogue' ? `${speakerTheme.border} ${speakerTheme.bg} ${speakerTheme.text}` : isLightTheme ? 'bg-zinc-50 border-zinc-200' : 'bg-ash-dark/30 border-ash-gray/20'}
                        ${currentNode.type === 'image' ? 'text-center flex items-center justify-center font-bold opacity-70' : ''}
                    `}
                    onClick={handleNext}
                >
                    {currentNode.type === 'image' ? (
                        <span>[ SCENE VISUALIZATION ]</span>
                    ) : (
                        <>
                            {parseRichText(displayedText)}
                            {isTyping && <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse align-middle"></span>}
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-4">
                        <button onClick={() => setShowHistory(!showHistory)} className="text-xs font-bold hover:underline opacity-70 hover:opacity-100 flex items-center gap-1">
                            <RotateCcw size={14} /> LOG
                        </button>
                        <button onClick={toggleAuto} className={`text-xs font-bold hover:underline flex items-center gap-1 ${autoPlay ? 'text-green-500' : 'opacity-70 hover:opacity-100'}`}>
                            {autoPlay ? <Pause size={14} /> : <Play size={14} />} AUTO
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onPrevChapter} className="p-2 border border-current opacity-50 hover:opacity-100 hover:text-ash-light" title="Previous Chapter">
                            <RotateCcw size={16} />
                        </button>
                        
                        <button onClick={handleNext} className="px-6 py-2 bg-current text-black font-black uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-2">
                            NEXT <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* End Chapter Transition Modal */}
        {showEndModal && (
            <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className={`w-full max-w-md border-2 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 relative ${isLightTheme ? 'bg-white border-zinc-400' : 'bg-ash-black border-ash-light'}`}>
                    <div className="text-center space-y-2">
                        <CheckCircle size={48} className={`mx-auto mb-4 ${isLightTheme ? 'text-zinc-800' : 'text-ash-light'}`} />
                        <h2 className="text-xl font-black uppercase tracking-widest">
                            {language === 'en' ? 'CHAPTER COMPLETE' : '本章閱讀完畢'}
                        </h2>
                        <div className={`text-xs font-mono border-b pb-4 mb-4 ${isLightTheme ? 'border-zinc-300 text-zinc-500' : 'border-ash-gray/30 text-ash-gray'}`}>
                            {t.title}
                        </div>
                        <p className={`text-sm font-mono ${isLightTheme ? 'text-zinc-600' : 'text-ash-gray'}`}>
                            {language === 'en' ? 'Proceed to the next data node?' : '是否跳轉至下一節點？'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleFinishChapter}
                            className={`w-full py-4 border-2 font-black uppercase tracking-widest transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${isLightTheme ? 'bg-zinc-800 text-white border-zinc-800 hover:bg-zinc-700' : 'bg-ash-light text-ash-black border-ash-light hover:bg-white'}`}
                        >
                            {language === 'en' ? 'NEXT CHAPTER' : '跳轉下一章'} <ArrowRight size={16} />
                        </button>
                        <button 
                            onClick={onExit}
                            className={`w-full py-3 border-2 font-bold uppercase tracking-wide transition-all hover:scale-[1.02] ${isLightTheme ? 'border-zinc-300 text-zinc-600 hover:border-zinc-800 hover:text-black' : 'border-ash-gray/50 text-ash-gray hover:border-ash-light hover:text-ash-light'}`}
                        >
                            {language === 'en' ? 'RETURN TO MENU' : '返回目錄'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* History Modal */}
        {showHistory && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-8 overflow-y-auto animate-fade-in" onClick={() => setShowHistory(false)}>
                <div className="max-w-3xl mx-auto space-y-6" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-black border-b border-ash-gray pb-4 mb-8 sticky top-0 bg-black/90 pt-4 text-ash-light">BACKLOG</h2>
                    {history.map((node) => (
                        <div key={node.id} className="flex flex-col gap-1 border-l-2 border-ash-dark pl-4 opacity-70 hover:opacity-100 transition-opacity text-ash-light">
                            {node.speakerName && <div className="text-xs font-bold opacity-50">{node.speakerName}</div>}
                            <div className="text-sm">{node.type === 'image' ? '[IMAGE]' : parseRichText(node.text)}</div>
                        </div>
                    ))}
                    <div className="h-20"></div>
                </div>
            </div>
        )}

    </div>
  );
};

export default VisualNovelPage;


import React from 'react';
import { Chapter, Language } from '../../types';
import { ArrowLeft, AlertTriangle, Database, GitCommit, ShieldAlert, Cpu, Sparkle, Lock } from 'lucide-react';
import Reveal from '../Reveal';

interface SideStoryExtraDirectoryProps {
  chapters: Chapter[];
  onBack: () => void;
  onSelectChapter: (chapterId: string) => void;
  language: Language;
  isLightTheme: boolean;
}

const SideStoryExtraDirectory: React.FC<SideStoryExtraDirectoryProps> = ({ 
    chapters, onBack, onSelectChapter, language, isLightTheme 
}) => {
  
  const translations = {
    'zh-CN': {
      title: 'FRAGMENTED_EXTRA // 碎片附加',
      warning: '警告：正在访问非线性数据流。同步率 [Byaki -> Void] 波动中。',
      back: '返回主目录',
      locked: '访问拒绝 // 加密'
    },
    'zh-TW': {
      title: 'FRAGMENTED_EXTRA // 碎片附加',
      warning: '警告：正在訪問非線性數據流。同步率 [Byaki -> Void] 波動中。',
      back: '返回主目錄',
      locked: '訪問拒絕 // 加密'
    },
    'en': {
      title: 'FRAGMENTED_EXTRA // DATA_FRAGS',
      warning: 'WARNING: ACCESSING NON-LINEAR DATA STREAM. SYNC [Byaki -> Void] FLUCTUATING.',
      back: 'RETURN_ROOT',
      locked: 'ACCESS DENIED // ENCRYPTED'
    }
  }[language];

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-12 relative flex flex-col items-center custom-scrollbar pb-32 landscape:pb-20 ${isLightTheme ? 'bg-fuchsia-50/20' : 'bg-[#05000a]'}`}>
        
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 overflow-hidden font-mono text-[8px] flex flex-wrap gap-4 p-4 select-none">
             {Array.from({length: 120}).map((_, i) => (
                 <span key={i} className={`animate-pulse ${i % 2 === 0 ? 'text-fuchsia-500' : 'text-emerald-500'}`} style={{ animationDelay: `${Math.random() * 5}s` }}>
                     0x{Math.floor(Math.random()*255).toString(16).toUpperCase()}
                 </span>
             ))}
        </div>

        <div className="w-full max-w-4xl relative z-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 mb-8 md:mb-12 border-b-2 border-fuchsia-900/50 pb-4 md:pb-8 relative landscape:mb-6">
                <button 
                    onClick={onBack}
                    className={`p-2 md:p-3 border-2 transition-all flex items-center gap-2 font-black font-mono text-[10px] md:text-xs uppercase group shadow-hard-sm ${
                        isLightTheme 
                        ? 'border-fuchsia-200 text-fuchsia-900 hover:bg-fuchsia-100' 
                        : 'border-fuchsia-900/50 text-fuchsia-400 hover:bg-fuchsia-900/40'
                    }`}
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {translations.back}
                </button>
                
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="flex -space-x-1">
                            <ShieldAlert size={12} className="text-fuchsia-600 animate-pulse" />
                            <Sparkle size={12} className="text-emerald-600 animate-ping" />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black font-mono text-ash-gray uppercase tracking-[0.2em]">{translations.warning}</span>
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(192,38,211,0.4)] glitch-text-heavy bg-gradient-to-r from-fuchsia-500 via-white to-emerald-500 bg-clip-text text-transparent landscape:text-xl" data-text={translations.title}>
                        {translations.title}
                    </h1>
                </div>
            </div>

            {/* Fragmented Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-16 py-4 landscape:grid-cols-2 landscape:gap-4">
                {chapters.map((chapter, index) => {
                    const t = chapter.translations[language] || chapter.translations['zh-CN'];
                    const date = chapter.date.split(':').pop()?.trim() || "";
                    const isLocked = chapter.status === 'locked';
                    
                    const rotation = index % 2 === 0 ? '-0.5deg' : '0.5deg';
                    const offset = index % 3 === 0 ? 'md:translate-y-4' : '';

                    return (
                        <Reveal key={chapter.id} delay={index * 100} className={`${offset}`}>
                            <button
                                onClick={() => !isLocked && onSelectChapter(chapter.id)}
                                disabled={isLocked}
                                className={`
                                    w-full text-left transition-all duration-500 group relative
                                    p-4 md:p-8 border-2 shadow-hard-sm overflow-hidden min-h-[120px] md:min-h-0
                                    ${isLocked 
                                        ? (isLightTheme 
                                            ? 'bg-zinc-100 border-zinc-300 cursor-not-allowed opacity-70' 
                                            : 'bg-ash-dark/20 border-ash-dark/50 cursor-not-allowed opacity-60')
                                        : (isLightTheme 
                                            ? 'bg-white border-fuchsia-100 hover:border-fuchsia-500' 
                                            : 'bg-fuchsia-950/5 border-fuchsia-900/40 hover:border-emerald-500 hover:bg-emerald-950/10')
                                    }
                                `}
                                style={{ transform: `rotate(${rotation})` }}
                            >
                                <div className={`absolute top-1 right-2 text-[40px] md:text-[60px] font-black font-mono select-none transition-opacity ${isLocked ? 'text-ash-gray opacity-[0.05]' : 'text-fuchsia-500 opacity-[0.03] group-hover:opacity-[0.1]'}`}>
                                    {date.replace('EXB-', '')}
                                </div>

                                <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-4 relative z-10">
                                    <div className={`p-2 md:p-3 border transition-colors ${isLocked ? 'bg-ash-dark border-ash-gray text-ash-gray' : 'bg-fuchsia-950/20 border-fuchsia-900/50 text-fuchsia-500 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                                        {isLocked ? <Lock size={18} className="md:size-6" /> : <Database size={18} className="md:size-6" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className={`text-[8px] md:text-[10px] font-black font-mono uppercase tracking-widest flex items-center gap-1 ${isLocked ? 'text-ash-gray' : 'text-fuchsia-500'}`}>
                                            <span className={isLocked ? '' : 'animate-pulse'}>●</span> {date}
                                        </div>
                                        <h2 className={`text-sm md:text-xl font-black uppercase tracking-tight line-clamp-1 transition-colors ${isLocked ? 'text-ash-gray blur-[2px]' : 'text-ash-light group-hover:text-emerald-400'}`}>
                                            {isLocked ? 'ENCRYPTED' : t.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="pl-10 md:pl-14 relative z-10">
                                    <p className={`text-[10px] md:text-xs font-mono italic leading-relaxed line-clamp-1 md:line-clamp-2 ${isLocked ? 'text-ash-gray/50' : (isLightTheme ? 'text-zinc-600' : 'text-ash-gray')}`}>
                                        {isLocked ? '////////////////////////////////' : t.summary}
                                    </p>
                                    <div className={`mt-2 md:mt-4 flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-opacity ${isLocked ? 'text-red-500 opacity-100' : 'text-emerald-500 opacity-0 group-hover:opacity-100'}`}>
                                        {isLocked ? (
                                            <>
                                                <ShieldAlert size={10} />
                                                {translations.locked}
                                            </>
                                        ) : (
                                            <>
                                                <Cpu size={10} className="animate-spin-slow" />
                                                SYNCING_VOID_CORE...
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </Reveal>
                    );
                })}
            </div>
            
            <div className="mt-12 md:mt-24 border-t border-dashed border-fuchsia-900/30 pt-4 flex justify-between items-center text-[7px] md:text-[8px] font-mono text-fuchsia-500/50 uppercase tracking-[0.3em] md:tracking-[0.5em]">
                <span>Neural_Sync: STABLE_FUSION</span>
                <span>Byaki :: Void // Duality_Node</span>
            </div>
        </div>
    </div>
  );
};

export default SideStoryExtraDirectory;

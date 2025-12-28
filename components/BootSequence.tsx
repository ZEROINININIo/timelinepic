
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Terminal, Cpu, CheckCircle, MousePointer2 } from 'lucide-react';
import { Language } from '../types';

interface BootSequenceProps {
  onComplete: () => void;
  isNormalBoot?: boolean; // If true, skip the crash/recovery drama
  language: Language;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, isNormalBoot = false, language }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<'BIOS' | 'ERROR' | 'RECOVERY' | 'NORMAL'>('BIOS');
  const [waitingForInput, setWaitingForInput] = useState(false);

  useEffect(() => {
    const tip = language === 'zh-CN' ? ">> 提示：开启暗黑模式阅读体验更佳"
            : language === 'zh-TW' ? ">> 提示：開啟暗黑模式閱讀體驗更佳"
            : ">> TIP: DARK MODE RECOMMENDED FOR BEST EXPERIENCE";

    // Normal Boot Sequence (Fast, clean)
    if (isNormalBoot) {
        const bootLines = [
            "NOVA_BIOS v.3.1.4 (STABLE)",
            "VERIFYING_INTEGRITY... OK",
            "LOADING_USER_PROFILE... FOUND",
            tip,
            "CONNECTING_TO_ARCHIVE... ESTABLISHED",
            "DECRYPTING_DATA_STREAMS...",
            "WELCOME_BACK_OPERATOR."
        ];

        let delay = 0;
        bootLines.forEach((line) => {
            delay += 150 + Math.random() * 100;
            setTimeout(() => {
                setLines(prev => [...prev, line]);
            }, delay);
        });

        // Force input wait to unlock audio
        setTimeout(() => {
            setWaitingForInput(true);
        }, delay + 500);
        
        return;
    }

    // Crash Boot Sequence (Original)
    // Phase 1: BIOS Init (Fast)
    const biosLines = [
      "NOVA_BIOS v.0.0.1a (LEGACY)",
      "CHECKING_MEM... OK",
      "CHECKING_CPU... OK",
      "LOADING_KERNEL...",
      "MOUNTING_VIRTUAL_DRIVES..."
    ];

    let delay = 0;
    biosLines.forEach((line, i) => {
      delay += Math.random() * 200;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
      }, delay);
    });

    // Phase 2: CRASH (Delayed)
    setTimeout(() => {
      setPhase('ERROR');
      const errorLines = [
        "CRITICAL_ERROR: SECTOR 0x00F21 CORRUPTED",
        "KERNEL_PANIC: UNEXPECTED_INTERRUPT",
        "REALITY_ANCHOR... LOST",
        "ATTEMPTING_DUMP...",
        "DUMP_FAILED.",
        "SYSTEM_HALTED."
      ];
      
      let errDelay = 0;
      errorLines.forEach((line, i) => {
        errDelay += 150;
        setTimeout(() => {
            setLines(prev => [...prev, `>> ${line}`]);
        }, errDelay);
      });
      
    }, delay + 500);

    // Phase 3: RECOVERY (Delayed)
    setTimeout(() => {
        setPhase('RECOVERY');
        setLines([]); // Clear screen
        const recoverLines = [
            "INITIATING_SAFE_MODE...",
            "BYPASSING_DAMAGED_SECTORS...",
            "LOADING_BACKUP_CONFIG...",
            tip,
            "RESTORING_USER_INTERFACE...",
            "SYSTEM RESTORED."
        ];

        let recDelay = 0;
        recoverLines.forEach(line => {
            recDelay += 800;
            setTimeout(() => {
                setLines(prev => [...prev, line]);
            }, recDelay);
        });

        // Force input wait here too
        setTimeout(() => {
            setWaitingForInput(true);
        }, recDelay + 500);

    }, delay + 2500);

  }, [onComplete, isNormalBoot, language]);

  const handleInteraction = () => {
      if (waitingForInput) {
          onComplete();
      }
  };

  if (phase === 'ERROR') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 overflow-hidden animate-crash z-[100]">
        <div className="absolute inset-0 bg-red-900/20 z-0"></div>
        <AlertTriangle size={128} className="text-red-500 mb-8 animate-ping" />
        <h1 className="text-6xl md:text-9xl font-black text-red-500 glitch-text-heavy mb-4" data-text="FATAL_ERROR">FATAL_ERROR</h1>
        <div className="font-mono text-red-400 text-sm md:text-xl text-center max-w-2xl space-y-1">
            {lines.slice(-6).map((line, i) => (
                <div key={i} className="bg-red-950/50 px-2">{line}</div>
            ))}
        </div>
        <div className="mt-12 w-full max-w-md h-2 bg-red-900 overflow-hidden">
            <div className="h-full bg-red-500 w-full animate-[glitch_0.2s_infinite]"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
        className={`fixed inset-0 bg-black text-green-500 p-8 pb-32 md:pb-8 font-mono text-xs md:text-sm overflow-hidden flex flex-col justify-end z-[100] transition-colors duration-500 touch-manipulation ${phase === 'RECOVERY' ? 'text-amber-500' : ''} ${waitingForInput ? 'cursor-pointer hover:bg-green-950/10' : ''}`}
        onClick={handleInteraction}
    >
      <div className="mb-auto opacity-50 flex items-center gap-4">
        {isNormalBoot ? <CheckCircle className="text-green-500" /> : 
         phase === 'BIOS' ? <Cpu className="animate-pulse" /> : 
         <Terminal className="animate-spin" />
        }
        <span>NOVA_LABS_TERMINAL_ACCESS // {isNormalBoot ? 'NORMAL_BOOT' : phase}</span>
      </div>
      
      <div className="space-y-1 w-full max-w-4xl mx-auto">
        {lines.map((line, index) => {
            const isTip = line.includes("开启暗黑模式") || line.includes("開啟暗黑模式") || line.includes("DARK MODE RECOMMENDED");
            
            if (isTip) {
                return (
                    <div key={index} className="animate-fade-in my-6 w-full text-center">
                         <div className="inline-block px-4 py-2 border-y-2 border-dashed border-amber-500 bg-amber-900/20 text-amber-400 text-sm md:text-lg font-bold tracking-widest animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                             {line.replace(/^>>\s*/, '')}
                         </div>
                    </div>
                );
            }

            return (
                <div key={index} className="animate-fade-in break-words">
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {line}
                </div>
            );
        })}
        
        {!waitingForInput && (
            <div className="h-4 w-3 bg-current animate-pulse inline-block mt-2"></div>
        )}

        {waitingForInput && (
            <div className="mt-8 py-4 border-t border-green-500/30 animate-fade-in">
                <div className="flex items-center gap-3 text-lg md:text-xl font-bold text-green-400 animate-pulse">
                    <MousePointer2 className="animate-bounce" />
                    <span>&gt; {language === 'en' ? 'CLICK_TO_INITIALIZE_SYSTEM' : '点击屏幕进入系统'} <span className="animate-[blink_1s_infinite]">_</span></span>
                </div>
                <div className="text-[10px] text-green-500/50 mt-1 uppercase">
                    AWAITING_USER_INPUT // AUDIO_CONTEXT_READY
                </div>
            </div>
        )}
      </div>

      {phase === 'RECOVERY' && (
          <div className="absolute inset-0 pointer-events-none border-[20px] border-amber-900/20 animate-pulse"></div>
      )}
    </div>
  );
};

export default BootSequence;

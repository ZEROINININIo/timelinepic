import React, { useEffect, useState } from 'react';
import { Target, Zap, Globe, Activity, Wifi } from 'lucide-react';

interface StoryEntryAnimationProps {
  onComplete: () => void;
  language: 'zh-CN' | 'zh-TW' | 'en';
  mode?: 'full' | 'fast'; // Support fast mode for chapter transitions
}

const StoryEntryAnimation: React.FC<StoryEntryAnimationProps> = ({ onComplete, language, mode = 'full' }) => {
  const [stage, setStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Random data stream generation
  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
      const code = Math.floor(Math.random() * 9999);
      setLogs(prev => [`> SYNC_FRAME_${hex} :: PACKET_${code}`, ...prev].slice(0, 15));
    }, mode === 'full' ? 50 : 20);
    return () => clearInterval(interval);
  }, [mode]);

  // Main Animation Sequence
  useEffect(() => {
    // Define Timings inside effect to avoid dependency re-creation loop
    const TIMINGS = mode === 'full' 
      ? { stage1: 1200, stage2: 2500, stage3: 3500, complete: 4000 }
      : { stage1: 300,  stage2: 800,  stage3: 1500, complete: 1800 };

    // Stage 0: Initialization / Lock-on (0ms)
    
    // Stage 1: Data Surge / Expansion
    const t1 = setTimeout(() => setStage(1), TIMINGS.stage1);

    // Stage 2: The "Dive" / Warp
    const t2 = setTimeout(() => setStage(2), TIMINGS.stage2);

    // Stage 3: Glitch / Transition
    const t3 = setTimeout(() => setStage(3), TIMINGS.stage3);

    // Complete
    const t4 = setTimeout(onComplete, TIMINGS.complete);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, mode]); // removed TIMINGS from deps

  const messages = {
    'zh-CN': {
      init: "协议初始化...",
      lock: "锁定现实锚点",
      targeting: "目标搜寻",
      verified: "验证通过",
      sync: "时空同步率: 0%",
      dive: "开始读取",
      warn: "警告：当前时间线无法确认，以只读模式进入.."
    },
    'zh-TW': {
      init: "協議初始化...",
      lock: "鎖定現實錨點",
      targeting: "目標搜尋",
      verified: "驗證通過",
      sync: "時空同步率: 0%",
      dive: "開始讀取",
      warn: "警告：當前時間線無法確認，以唯讀模式進入.."
    },
    'en': {
      init: "PROTOCOL_INIT...",
      lock: "REALITY_ANCHOR_LOCKED",
      targeting: "TARGET_SEARCH",
      verified: "VERIFIED",
      sync: "SYNC_RATE: 0%",
      dive: "READING_INIT",
      warn: "WARNING: TIMELINE UNVERIFIED // ENTERING READ-ONLY MODE"
    }
  }[language];

  return (
    <div className="fixed inset-0 z-[99999] bg-ash-black text-ash-light overflow-hidden flex items-center justify-center font-mono cursor-none">
      
      {/* Abort/Skip Button - Failsafe */}
      <button 
        onClick={onComplete}
        className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-ash-light/20 px-2 py-1 hover:bg-ash-light hover:text-ash-black transition-colors opacity-50 hover:opacity-100 cursor-pointer"
      >
        [ABORT_SEQUENCE]
      </button>

      {/* Background Grid - Moving */}
      <div className={`absolute inset-0 bg-grid-hard opacity-20 transition-transform duration-[4000ms] ease-in ${stage > 0 ? 'scale-150' : 'scale-100'}`}></div>

      {/* --- Phase 1: The Lock-on Ring (Center) --- */}
      <div className={`relative z-10 transition-all duration-500 ${stage >= 2 ? 'scale-[5] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
        <div className="relative flex items-center justify-center">
            {/* Rotating Outer Rings (Responsive) */}
            <div className="absolute w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] border border-ash-gray/20 rounded-full animate-spin-slow"></div>
            <div className="absolute w-[65vw] h-[65vw] md:w-[500px] md:h-[500px] border border-ash-gray/30 rounded-full border-dashed animate-spin-reverse-slow"></div>
            <div className={`absolute w-[50vw] h-[50vw] md:w-[400px] md:h-[400px] border-2 border-ash-light rounded-full animate-ping opacity-20 ${stage === 1 ? 'border-red-500' : ''}`}></div>

            {/* Core Targeting UI */}
            <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-ash-light relative flex items-center justify-center animate-zoom-in-fast bg-ash-black/50 backdrop-blur-sm">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-ash-light"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-ash-light"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-ash-light"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-ash-light"></div>
                 
                 <div className={`flex flex-col items-center gap-4 transition-colors duration-300 ${stage > 0 ? 'text-red-500' : 'text-ash-light'}`}>
                     <Target size={48} strokeWidth={1} className={`md:w-16 md:h-16 ${stage > 0 ? 'animate-spin' : ''}`} />
                     <div className="text-xl md:text-2xl font-black tracking-widest uppercase">{stage === 0 ? messages.targeting : messages.verified}</div>
                     {mode === 'full' && (
                        <div className="text-[10px] bg-ash-light text-ash-black px-2 py-0.5">{messages.lock}</div>
                     )}
                 </div>
            </div>
        </div>
      </div>

      {/* --- Phase 2: Data Stream (Sides) --- */}
      <div className="absolute left-0 top-0 bottom-0 w-64 p-8 flex flex-col justify-center gap-1 opacity-60 pointer-events-none hidden lg:flex">
         {logs.map((log, i) => (
             <div key={i} className="text-[10px] text-green-500/70 font-mono truncate">{log}</div>
         ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-64 p-8 flex flex-col justify-center gap-1 opacity-60 pointer-events-none text-right hidden lg:flex">
         {logs.map((log, i) => (
             <div key={i} className="text-[10px] text-green-500/70 font-mono truncate">{log.split('').reverse().join('')}</div>
         ))}
      </div>

      {/* --- Phase 3: The Tunnel / Warp --- */}
      {stage >= 1 && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
             <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-transparent via-red-900/10 to-transparent"></div>
             {/* Creating a tunnel effect with multiple expanding rings */}
             {[1,2,3,4,5].map(i => (
                 <div key={i} className={`absolute border border-ash-light/20 rounded-full animate-tunnel`} style={{ width: `${i * 10}%`, height: `${i * 10}%`, animationDelay: `${i * 0.1}s` }}></div>
             ))}
        </div>
      )}

      {/* --- HUD Elements --- */}
      <div className="absolute top-12 w-full text-center space-y-2">
          {mode === 'full' && (
            <div className="text-xs font-bold tracking-[1em] text-ash-gray animate-pulse">{messages.init}</div>
          )}
          {stage >= 1 && (
              <div className="text-4xl md:text-6xl font-black uppercase text-ash-light glitch-text-heavy" data-text="NOVA_LABS">
                  NOVA_LABS
              </div>
          )}
      </div>

      <div className="absolute bottom-12 w-full flex justify-center gap-4 md:gap-8 text-[10px] md:text-xs font-mono px-4 flex-wrap">
          <div className="flex items-center gap-2">
              <Globe size={14} /> SYSTEM: <span className="text-green-500">ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
              <Wifi size={14} /> UPLINK: <span className="text-green-500">STABLE</span>
          </div>
          <div className="flex items-center gap-2">
              <Activity size={14} /> MEMORY: <span className="text-green-500">READ_WRITE</span>
          </div>
      </div>

      {/* --- Stage 3: The Flash/Transition --- */}
      {stage === 3 && (
          <div className="absolute inset-0 bg-ash-white animate-fade-in z-[100000]"></div>
      )}

      {/* Warning Overlay during Stage 2 */}
      {stage === 2 && mode === 'full' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-500/10">
              <div className="border-y-4 border-red-500 bg-ash-black text-red-500 text-xl md:text-4xl font-black p-4 w-full text-center animate-pulse">
                  {messages.warn}
              </div>
          </div>
      )}

    </div>
  );
};

export default StoryEntryAnimation;
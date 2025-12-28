
import React, { useEffect, useState } from 'react';
import { Binary, Database, Brain, CloudRain, Sparkle, Clock, Cpu, GitBranch, Activity } from 'lucide-react';
import { Language } from '../types';

interface SideStoryEntryAnimationProps {
  onComplete: () => void;
  language: Language;
  volumeId?: string;
}

const SideStoryEntryAnimation: React.FC<SideStoryEntryAnimationProps> = ({ onComplete, language, volumeId }) => {
  const [stage, setStage] = useState(0);

  const isRainTheme = volumeId === 'VOL_MEMORIES';
  const isVariableTheme = volumeId === 'VOL_VARIABLE';

  // Animation Sequence
  useEffect(() => {
    // 0ms: Init (Static)
    // 500ms: Start (Rain/Glitch)
    // 1500ms: Deep Dive
    // 3000ms: Submerge (White/Flash)
    
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 2000);
    const t3 = setTimeout(() => setStage(3), 3500);
    const t4 = setTimeout(onComplete, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const t = {
    'zh-CN': {
      accessing: "访问记忆扇区...",
      decompressing: "解压碎片数据",
      syncing: "神经同步中",
      complete: "重构完成",
      // Rain Theme
      rain_init: "正在回溯时间轴...",
      rain_mem: "检索关键节点：[雨]",
      rain_sync: "VoidOS部署中",
      // Variable Theme
      var_init: "检测到未定义变量...",
      var_mem: "纠正量子偏差：[Byaki]",
      var_sync: "进入本地记忆调用模式 // 正在进入VoidOS"
    },
    'zh-TW': {
      accessing: "訪問記憶扇區...",
      decompressing: "解壓碎片數據",
      syncing: "神經同步中",
      complete: "重構完成",
      // Rain Theme
      rain_init: "正在回溯時間軸...",
      rain_mem: "檢索關鍵節點：[雨]",
      rain_sync: "VoidOS部署中",
      // Variable Theme
      var_init: "檢測到未定義變量...",
      var_mem: "糾正量子偏差：[Byaki]",
      var_sync: "進入本地記憶調用模式 // 正在進入VoidOS"
    },
    'en': {
      accessing: "ACCESSING_MEMORY_SECTOR...",
      decompressing: "DECOMPRESSING_FRAGMENTS",
      syncing: "NEURAL_SYNC_IN_PROGRESS",
      complete: "RECONSTRUCTION_COMPLETE",
      // Rain Theme
      rain_init: "REWINDING_TIMELINE...",
      rain_mem: "SEARCHING_NODE: [RAIN]",
      rain_sync: "DEPLOYING_VOID_OS",
      // Variable Theme
      var_init: "UNDEFINED_VARIABLE_DETECTED...",
      var_mem: "CORRECTING_QUANTUM_BIAS: [Byaki]",
      var_sync: "LOCAL_MEM_CALL_MODE // ENTERING_VOID_OS"
    }
  }[language];

  // --- Rain Theme Render ---
  if (isRainTheme) {
    return (
        <div className="fixed inset-0 z-[99999] bg-slate-950 text-cyan-100 overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-cyan-400/30 text-cyan-400 px-2 py-1 hover:bg-cyan-400 hover:text-slate-900 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
                [SKIP_MEMORY]
            </button>

            {/* Background - Elegant Rain */}
            <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black transition-opacity duration-1000 ${stage > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
            
            {/* Elegant Rain Drops */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-data-rain"
                        style={{
                            height: `${30 + Math.random() * 50}px`,
                            left: `${Math.random() * 100}%`,
                            top: '-20%',
                            animationDuration: `${0.8 + Math.random() * 1.5}s`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    >
                    </div>
                ))}
            </div>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                
                {/* Icons Circle */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className={`absolute inset-0 border border-cyan-500/20 rounded-full transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100 rotate-180' : 'scale-50 opacity-0 rotate-0'}`}></div>
                    <div className={`absolute inset-4 border border-cyan-500/30 rounded-full border-dashed transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100 -rotate-180' : 'scale-90 opacity-0 rotate-0'}`}></div>
                    
                    <div className={`transition-all duration-700 absolute ${stage === 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <Clock size={48} className="text-cyan-400" />
                    </div>
                    <div className={`transition-all duration-700 absolute ${stage === 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <CloudRain size={56} className="text-cyan-200" />
                    </div>
                    <div className={`transition-all duration-700 absolute ${stage === 3 ? 'scale-125 opacity-100 blur-sm' : 'scale-50 opacity-0'}`}>
                         <Sparkle size={64} className="text-white fill-white/20" />
                    </div>
                </div>

                {/* Text Status */}
                <div className="text-center space-y-4 h-16">
                    <div className="text-xl md:text-2xl font-light tracking-[0.3em] text-cyan-100/90 font-serif italic">
                        {stage === 0 && ""}
                        {stage === 1 && t.rain_init}
                        {stage === 2 && t.rain_mem}
                        {stage === 3 && t.rain_sync}
                    </div>
                    <div className="w-32 h-[1px] bg-cyan-900/50 mx-auto overflow-hidden">
                        <div 
                            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300 ease-linear"
                            style={{ width: `${(stage / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

             <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-1000 ease-in-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
  }

  // --- Variable Theme Render ---
  if (isVariableTheme) {
    return (
        <div className="fixed inset-0 z-[99999] bg-green-950 text-emerald-100 overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
             {/* Skip */}
            <button 
                onClick={onComplete}
                className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-emerald-400/30 text-emerald-400 px-2 py-1 hover:bg-emerald-400 hover:text-black transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
                [SKIP_VAR]
            </button>

            {/* Background - Matrix Grid */}
            <div className={`absolute inset-0 bg-grid-hard opacity-20 transition-transform duration-[4000ms] ${stage > 0 ? 'scale-125' : 'scale-100'}`}></div>
            
            {/* Random Code Glitches */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute text-[10px] text-emerald-500 font-bold animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    >
                        {Math.random() > 0.5 ? '0x' + Math.random().toString(16).substring(2,6).toUpperCase() : 'ERR_NULL'}
                    </div>
                ))}
            </div>

            {/* Central Visuals */}
            <div className="relative z-10 flex flex-col items-center gap-12">
                
                {/* Icons Circle - Tech/Green */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className={`absolute inset-0 border-2 border-emerald-500/30 rounded-none transition-all duration-300 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}></div>
                    <div className={`absolute inset-2 border border-emerald-500/20 rounded-full border-dashed transition-all duration-1000 animate-spin-slow`}></div>
                    
                    {/* Central Icon Switch */}
                    <div className={`transition-all duration-500 absolute ${stage === 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <Cpu size={48} className="text-emerald-400" />
                    </div>
                    <div className={`transition-all duration-500 absolute ${stage === 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                         <GitBranch size={56} className="text-emerald-200" />
                    </div>
                    <div className={`transition-all duration-500 absolute ${stage === 3 ? 'scale-125 opacity-100 blur-sm' : 'scale-50 opacity-0'}`}>
                         <Activity size={64} className="text-white" />
                    </div>
                </div>

                {/* Text Status - Terminal Style */}
                <div className="text-center space-y-4 h-16 w-full px-4">
                    <div className="text-sm md:text-xl font-bold font-mono tracking-widest text-emerald-300 break-words whitespace-pre-wrap">
                        {stage === 0 && "> INIT"}
                        {stage === 1 && t.var_init}
                        {stage === 2 && t.var_mem}
                        {stage === 3 && t.var_sync}
                        <span className="animate-[blink_1s_infinite]">_</span>
                    </div>
                    
                    {/* Blocky Progress Bar */}
                    <div className="w-48 h-4 bg-emerald-900/50 mx-auto border border-emerald-500/30 p-0.5">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-300 ease-steps(5)"
                            style={{ width: `${(stage / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

             <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-500 ease-in-out ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
  }

  // --- Default Theme Render ---
  return (
    <div className="fixed inset-0 z-[99999] bg-ash-black text-ash-light overflow-hidden flex flex-col items-center justify-center font-mono cursor-none">
      
      {/* Abort Button */}
      <button 
        onClick={onComplete}
        className="absolute top-4 right-4 z-[100000] text-[10px] font-mono border border-blue-400/30 text-blue-400 px-2 py-1 hover:bg-blue-400 hover:text-black transition-colors opacity-70 hover:opacity-100 cursor-pointer"
      >
        [SKIP_DIVE]
      </button>

      {/* Background Gradient - "Deep Sea" */}
      <div className={`absolute inset-0 bg-gradient-to-b from-blue-950/20 to-black transition-opacity duration-1000 ${stage > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Data Rain (CSS Animation) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
            <div 
                key={i} 
                className="absolute top-[-100%] text-[10px] text-blue-500/50 writing-vertical-rl animate-data-rain"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 1}s`,
                    fontSize: `${10 + Math.random() * 8}px`
                }}
            >
                {Math.random() > 0.5 ? '010101' : 'A9F3C2'}
            </div>
        ))}
      </div>

      {/* Central Visuals */}
      <div className="relative z-10 flex flex-col items-center gap-8">
          
          {/* Icons Circle */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
              {/* Ripple Effect */}
              {stage >= 1 && (
                  <>
                    <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                  </>
              )}

              {/* Central Icon */}
              <div className={`transition-all duration-700 ${stage === 2 ? 'scale-125 text-white' : 'scale-100 text-blue-400'}`}>
                 {stage === 0 && <Database size={48} className="animate-pulse" />}
                 {stage === 1 && <Binary size={48} className="animate-bounce" />}
                 {stage >= 2 && <Brain size={64} />}
              </div>
          </div>

          {/* Text Status */}
          <div className="text-center space-y-2">
              <div className="text-xl md:text-3xl font-black uppercase tracking-widest text-blue-200">
                  {stage === 0 && t.accessing}
                  {stage === 1 && t.decompressing}
                  {stage >= 2 && t.syncing}
              </div>
              
              {/* Progress Bar */}
              <div className="w-48 md:w-64 h-1 bg-blue-900/50 mx-auto mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] transition-all duration-300 ease-linear"
                    style={{ width: `${(stage / 3) * 100}%` }}
                  ></div>
              </div>
              
              <div className="text-[10px] text-blue-500/60 font-mono mt-1">
                  SECTOR_MEM // {stage * 33}%
              </div>
          </div>
      </div>

      {/* Flash to White at end */}
      <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-500 ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>

    </div>
  );
};

export default SideStoryEntryAnimation;

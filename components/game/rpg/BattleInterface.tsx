
import React, { useEffect, useState } from 'react';
import { BattleState } from './types';
import { TUTORIAL_STEPS, VICTORY_MSG } from './tutorialData';
import { Swords, Shield, Zap, Skull, Crosshair, Scissors, EyeOff, Activity, ChevronRight, CheckCircle2, Terminal, Play, Hourglass } from 'lucide-react';
import { Language } from '../../../types';

interface BattleInterfaceProps {
  state: BattleState;
  onAction: (action: 'attack' | 'heal' | 'cut' | 'stealth' | 'spike') => void;
  onTutorialNext: () => void;
  onVictoryConfirm: () => void;
  language: Language;
  nickname?: string;
  enemyName?: string; // Optional override
}

const BattleInterface: React.FC<BattleInterfaceProps> = ({ state, onAction, onTutorialNext, onVictoryConfirm, language, nickname, enemyName }) => {
  const { 
      playerHp, playerMaxHp, playerShield, 
      enemyHp, enemyMaxHp, enemyShield,
      logs, cdCut, cdStealth, cdRepair, cdSpike,
      tutorialStep, showVictory,
      animation, animationKey, turn
  } = state;

  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  
  // Secret Author Channel State
  const [secretClicks, setSecretClicks] = useState(0);
  const [showCheatInput, setShowCheatInput] = useState(false);
  const [cheatCode, setCheatCode] = useState('');

  const isMyTurn = turn === 'player';

  // Trigger effect when animation state changes
  useEffect(() => {
      if (animation) {
          setActiveEffect(animation);
          // Effects have different durations
          const duration = animation === 'stealth' ? 2000 : 1000;
          const timer = setTimeout(() => setActiveEffect(null), duration);
          return () => clearTimeout(timer);
      }
  }, [animation, animationKey]);

  const currentTutorial = tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length ? TUTORIAL_STEPS[tutorialStep] : null;
  const highlightBtn = currentTutorial?.highlight;
  const playerName = nickname || 'PLAYER_UNIT';
  const targetName = enemyName || 'SENTINEL_X';
  const isPvP = !!enemyName;

  // Render Byaki Avatar
  const ByakiAvatar = () => (
      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 border-emerald-400 overflow-hidden relative shrink-0 bg-black shadow-[0_0_15px_rgba(16,185,129,0.5)]">
          <img src="https://free.picui.cn/free/2025/12/28/69513b509851e.jpg" className="w-full h-full object-cover" alt="Byaki" />
          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
      </div>
  );

  const handleSecretClick = () => {
      const newCount = secretClicks + 1;
      setSecretClicks(newCount);
      if (newCount === 5) {
          setShowCheatInput(true);
          setSecretClicks(0);
      }
  };

  const handleCheatSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (cheatCode === '5531517') {
          onVictoryConfirm(); // Instant win/skip
      } else {
          setCheatCode('');
          setShowCheatInput(false);
      }
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center p-0 lg:p-4 font-mono select-none ${activeEffect === 'enemy_attack' ? 'animate-shake-violent' : ''}`}>
        {/* Darkened Background */}
        <div className={`absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in ${activeEffect === 'enemy_attack' ? 'bg-red-900/20' : ''}`}></div>

        {/* Global Damage Flash for Enemy Attack */}
        {activeEffect === 'enemy_attack' && (
            <div className="absolute inset-0 bg-red-500/20 z-50 pointer-events-none animate-pulse mix-blend-overlay"></div>
        )}

        {/* Hidden Cheat Input Overlay */}
        {showCheatInput && (
            <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in" onClick={() => setShowCheatInput(false)}>
                <form 
                    onSubmit={handleCheatSubmit} 
                    onClick={e => e.stopPropagation()}
                    className="flex flex-col gap-3 w-64 border border-ash-gray/30 p-4 bg-ash-black shadow-hard"
                >
                    <div className="text-ash-gray font-mono text-[10px] uppercase flex items-center gap-2">
                        <Terminal size={12} />
                        <span>AUTHOR_CHANNEL // OVERRIDE</span>
                    </div>
                    <input 
                        type="password" 
                        value={cheatCode}
                        onChange={(e) => setCheatCode(e.target.value)}
                        className="bg-ash-dark border-b border-ash-gray text-ash-light px-2 py-1 font-mono text-xs outline-none focus:border-emerald-500 transition-colors"
                        placeholder="ENTER_PASSCODE"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-ash-light text-ash-black text-xs font-bold py-2 uppercase tracking-widest hover:bg-white transition-colors"
                    >
                        EXECUTE
                    </button>
                </form>
            </div>
        )}

        <div className="relative w-full max-w-5xl h-full lg:h-[600px] border-2 border-red-900/50 bg-ash-black flex flex-col shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden">
            
            {/* Header */}
            <div className="h-12 border-b border-red-900/30 flex items-center justify-between px-4 bg-red-950/20 shrink-0 relative z-20">
                <div className="flex items-center gap-2 text-red-500 font-bold font-mono text-xs lg:text-sm">
                    <Swords size={16} />
                    <span>COMBAT_MODE // {isPvP ? 'DUEL' : 'ACTIVE'}</span>
                </div>
                {/* Secret Trigger Area */}
                <div 
                    onClick={handleSecretClick}
                    className="text-[10px] text-red-400/50 font-mono animate-pulse cursor-default active:text-red-300 transition-colors select-none"
                >
                    THREAT DETECTED
                </div>
            </div>

            {/* Main Content Area - Flex Column on Mobile/Tablet Portrait, Row on Desktop */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                
                {/* Scene (Top/Left) - Enemy Focused */}
                <div className="flex-1 relative bg-[url('https://free.picui.cn/free/2025/12/29/6952916c871a6.jpg')] bg-cover bg-center flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70"></div>
                    
                    {/* Enemy Entity (Centered & Stable) */}
                    <div className={`relative z-10 flex flex-col items-center gap-4 w-full max-w-xs transition-opacity duration-300 ${currentTutorial ? 'opacity-20 lg:opacity-100' : 'opacity-100'}`}>
                        {/* Enemy Frame (No Rotation, Static) */}
                        <div className={`w-32 h-32 lg:w-48 lg:h-48 bg-black/80 border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center relative overflow-hidden group ${activeEffect === 'attack' || activeEffect === 'spike' ? 'animate-shake-violent' : ''}`}>
                            {/* Inner Glitch Effect */}
                            <div className="absolute inset-0 bg-red-900/20"></div>
                            {/* Corner Decors */}
                            <div className="absolute top-0 left-0 w-2 h-2 bg-red-600"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-600"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-600"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-600"></div>
                            
                            {/* Icon - Static */}
                            {isPvP ? (
                                <div className="text-red-500 font-mono font-black text-6xl lg:text-8xl select-none animate-[pulse_0.2s_infinite]">
                                    {targetName.substring(0, 1)}
                                </div>
                            ) : (
                                <Skull size={64} className={`text-red-500 lg:scale-125 transition-all ${activeEffect === 'cut' ? 'opacity-50 blur-sm scale-90' : ''}`} />
                            )}
                            <div className="absolute inset-2 border border-red-500/30"></div>

                            {/* --- VISUAL EFFECTS ON ENEMY --- */}
                            
                            {/* Attack Slash (SVG) - Enhanced */}
                            {activeEffect === 'attack' && (
                                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                    <div className="absolute w-[200%] h-2 bg-white -rotate-45 animate-slash-critical shadow-[0_0_20px_white]"></div>
                                    <div className="absolute w-[150%] h-1 bg-cyan-400 rotate-12 animate-slash-critical delay-75 shadow-[0_0_15px_cyan]"></div>
                                </div>
                            )}

                            {/* Cut Data Effect (Laser X + Glitch) */}
                            {activeEffect === 'cut' && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                                    <div className="absolute inset-0 bg-red-600/30 mix-blend-color-burn animate-pulse"></div>
                                    
                                    {/* Laser Lines */}
                                    <div className="absolute w-[150%] h-1 bg-red-500 shadow-[0_0_20px_red] rotate-45 animate-laser-cut"></div>
                                    <div className="absolute w-[150%] h-1 bg-red-500 shadow-[0_0_20px_red] -rotate-45 animate-laser-cut" style={{ animationDelay: '0.1s' }}></div>
                                    
                                    {/* Glitch Boxes */}
                                    <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-red-500 mix-blend-screen animate-ping opacity-50"></div>
                                    <div className="absolute bottom-1/4 right-1/4 w-12 h-2 bg-white mix-blend-overlay animate-pulse"></div>
                                </div>
                            )}

                            {/* Data Spike Effect (Shield Break) */}
                            {activeEffect === 'spike' && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <div className="absolute w-full h-[200%] bg-blue-500/50 animate-[spin_0.5s_linear] opacity-50 blur-xl"></div>
                                    <Zap size={80} className="text-yellow-400 absolute animate-ping" />
                                    <div className="absolute inset-0 border-4 border-blue-400 animate-ping rounded-full"></div>
                                </div>
                            )}

                        </div>

                        {/* Enemy Status Bar */}
                        <div className="w-full bg-black border border-red-900 relative p-1 shadow-hard">
                            <div className="flex justify-between text-[10px] font-mono text-red-500 mb-1 font-bold tracking-widest px-1">
                                <span>{targetName}</span>
                                <span>{enemyHp} / {enemyMaxHp}</span>
                            </div>
                            <div className="h-3 w-full bg-red-950/50 border border-red-900/50 relative">
                                {/* HP Bar */}
                                <div 
                                    className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                                    style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
                                ></div>
                                {/* Enemy Shield Overlay */}
                                {enemyShield > 0 && (
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-blue-400/60 border-r-2 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" 
                                        style={{ width: `${Math.min(100, (enemyShield / enemyMaxHp) * 100)}%` }}
                                    ></div>
                                )}
                            </div>
                            {enemyShield > 0 && (
                                <div className="text-[9px] font-mono text-blue-300 mt-1 flex items-center justify-end gap-1">
                                    <Shield size={8} /> {enemyShield}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Control Panel (Bottom/Right) - Player Status + Logs + Actions */}
                <div className="w-full lg:w-96 bg-ash-black flex flex-col shrink-0 h-auto border-t-2 lg:border-t-0 border-red-900/30 relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                    
                    {/* Turn Indicator (PvP Only or Always) */}
                    {isPvP && (
                        <div className={`h-8 flex items-center justify-center text-xs font-black uppercase tracking-widest border-b border-ash-dark transition-colors duration-500 ${isMyTurn ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-red-900/20 text-red-500/50 border-red-900/30'}`}>
                            {isMyTurn ? (
                                <span className="flex items-center gap-2 animate-pulse"><Play size={10} fill="currentColor" /> YOUR TURN</span>
                            ) : (
                                <span className="flex items-center gap-2"><Hourglass size={10} className="animate-spin-slow" /> OPPONENT TURN</span>
                            )}
                        </div>
                    )}

                    {/* Logs (Flexible Height) */}
                    <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 text-ash-gray border-b border-ash-dark/50 bg-black/20 min-h-[80px] max-h-[120px] lg:max-h-none lg:h-auto inner-shadow">
                        {logs.map((log, i) => (
                            <div key={i} className="border-l-2 border-ash-dark pl-2">{log}</div>
                        ))}
                    </div>

                    {/* Player Status (Moved Here) */}
                    <div className="p-3 lg:p-4 bg-ash-dark/30 border-b border-ash-dark/50 relative overflow-hidden">
                        {/* Heal Effect Overlay - Digital Ascending */}
                        {activeEffect === 'heal' && (
                            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                                <div className="absolute inset-0 bg-green-500/10"></div>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div 
                                        key={i}
                                        className="absolute text-green-400 text-[10px] font-bold animate-particle-rise"
                                        style={{ 
                                            left: `${Math.random() * 100}%`,
                                            top: '100%',
                                            animationDelay: `${Math.random() * 0.5}s`,
                                            opacity: Math.random()
                                        }}
                                    >+</div>
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-green-300 font-bold text-xl animate-float-up-fast drop-shadow-[0_0_5px_rgba(74,222,128,0.8)] border-y border-green-500/50 bg-black/50 px-4 py-1">
                                        SYSTEM REPAIR
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Stealth Effect Overlay - Advanced Holographic Shield */}
                        {(activeEffect === 'stealth' || playerShield > 0) && (
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
                                {/* Only show the big deploy animation on activation */}
                                {activeEffect === 'stealth' && (
                                    <>
                                        {/* Rotating Hexagon */}
                                        <div className="w-64 h-64 border-2 border-cyan-400/50 absolute animate-shield-deploy" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                                        {/* Inner Pulse */}
                                        <div className="w-48 h-48 border border-cyan-300/30 absolute animate-shield-deploy" style={{ animationDelay: '0.1s', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                                        
                                        <div className="text-cyan-300 font-bold text-lg animate-pulse relative z-20 bg-black/80 px-4 py-1 border-x-2 border-cyan-500/80 shadow-[0_0_15px_cyan]">
                                            SHIELD_DEPLOYED
                                        </div>
                                    </>
                                )}
                                
                                {/* Passive Shield Grid */}
                                <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIzNCI+PHBhdGggZD0iTTEwIDAgTDIwIDUgTDIwIDE1IEwxMCAyMCBMMCAxNSBZNCA1IFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyZDNlZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-20 ${activeEffect === 'stealth' ? 'animate-pulse' : ''}`}></div>
                            </div>
                        )}

                        <div className="flex justify-between items-end mb-2 relative z-20">
                            <span className="text-red-500 font-black font-mono text-xs lg:text-sm tracking-wider">{playerName}</span>
                            <div className="text-[10px] font-mono text-ash-light">
                                <span className="text-emerald-400 font-bold">{playerHp}</span> 
                                <span className="opacity-50">/{playerMaxHp}</span>
                            </div>
                        </div>
                        
                        <div className="w-full h-3 bg-ash-black border border-ash-gray relative z-20">
                            {/* HP Bar */}
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                                style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                            ></div>
                            {/* Shield Overlay */}
                            {playerShield > 0 && (
                                <div 
                                    className="absolute top-0 left-0 h-full bg-cyan-400/60 border-r-2 border-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse" 
                                    style={{ width: `${Math.min(100, (playerShield / playerMaxHp) * 100)}%` }}
                                ></div>
                            )}
                        </div>
                        {playerShield > 0 && (
                            <div className="text-[9px] font-mono text-cyan-300 mt-1 flex items-center gap-1 relative z-20">
                                <Shield size={10} className="animate-pulse" /> SHIELD_INTEGRITY: {playerShield}
                            </div>
                        )}
                    </div>

                    {/* Actions Grid - Updated Layout for 5 buttons */}
                    <div className={`p-3 lg:p-4 bg-ash-black pb-6 lg:pb-4 transition-opacity duration-300 ${!isMyTurn && isPvP ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {/* Row 1: Basic & Anti-Shield */}
                            <button 
                                onClick={() => onAction('attack')}
                                className={`p-3 border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                                    ${highlightBtn === 'attack' ? 'border-emerald-400 bg-emerald-900/20 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse' : 'border-ash-gray/30 hover:bg-ash-dark text-ash-light'}
                                `}
                            >
                                <Crosshair size={16} />
                                <span className="text-[10px] font-bold">ATTACK</span>
                            </button>

                            <button 
                                onClick={() => onAction('spike')}
                                disabled={cdSpike > 0}
                                className={`p-3 border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                                    ${cdSpike > 0 ? 'opacity-50 cursor-not-allowed border-yellow-900/30 text-yellow-800' : 
                                      highlightBtn === 'spike' ? 'border-yellow-400 bg-yellow-900/20 animate-pulse' : 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-950/20'}
                                `}
                            >
                                <Zap size={16} />
                                <span className="text-[10px] font-bold">SPIKE</span>
                                {cdSpike > 0 && <span className="absolute top-1 right-2 font-mono text-[9px]">{cdSpike}</span>}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {/* Row 2: Heavy & Stealth */}
                            <button 
                                onClick={() => onAction('cut')}
                                disabled={cdCut > 0}
                                className={`p-3 border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                                    ${cdCut > 0 ? 'opacity-50 cursor-not-allowed border-red-900/30 text-red-800' : 
                                      highlightBtn === 'cut' ? 'border-emerald-400 bg-emerald-900/20 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse' : 'border-red-500/50 text-red-400 hover:bg-red-950/20'}
                                `}
                            >
                                <Scissors size={16} />
                                <span className="text-[10px] font-bold">CUT DATA</span>
                                {cdCut > 0 && <span className="absolute top-1 right-2 font-mono text-[9px]">{cdCut}</span>}
                            </button>

                            <button 
                                onClick={() => onAction('stealth')}
                                disabled={cdStealth > 0}
                                className={`p-3 border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                                    ${cdStealth > 0 ? 'opacity-50 cursor-not-allowed border-blue-900/30 text-blue-800' : 
                                      highlightBtn === 'stealth' ? 'border-emerald-400 bg-emerald-900/20 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse' : 'border-blue-500/50 text-blue-400 hover:bg-blue-950/20'}
                                `}
                            >
                                <EyeOff size={16} />
                                <span className="text-[10px] font-bold">STEALTH</span>
                                {cdStealth > 0 && <span className="absolute top-1 right-2 font-mono text-[9px]">{cdStealth}</span>}
                            </button>
                        </div>

                        {/* Row 3: Repair (Full Width) */}
                        <button 
                            onClick={() => onAction('heal')}
                            disabled={cdRepair > 0}
                            className={`w-full p-2 border-2 flex items-center justify-center gap-2 transition-all relative group
                                ${cdRepair > 0 ? 'opacity-50 cursor-not-allowed border-green-900/30 text-green-800' : 
                                  highlightBtn === 'heal' ? 'border-emerald-400 bg-emerald-900/20 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse' : 'border-green-500/50 text-green-400 hover:bg-green-950/20'}
                            `}
                        >
                            <Activity size={16} />
                            <span className="text-[10px] font-bold">REPAIR SYSTEM</span>
                            {cdRepair > 0 && <span className="font-mono text-[9px] ml-2">[{cdRepair}]</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tutorial Overlay - Centered */}
            {currentTutorial && (
                <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
                    <div className="pointer-events-auto w-full max-w-2xl bg-black/95 border-2 border-emerald-500 p-4 lg:p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-start gap-3 lg:gap-6 animate-slide-in relative">
                        <ByakiAvatar />
                        <div className="flex-1">
                            <div className="text-emerald-500 font-bold font-mono text-xs mb-1 tracking-wider border-b border-emerald-500/30 pb-1 w-max">Z.Byaki // REMOTE_LINK</div>
                            <p className="text-emerald-100 text-xs lg:text-base leading-relaxed font-mono mt-1">
                                {currentTutorial.text[language] || currentTutorial.text['en']}
                            </p>
                        </div>
                        <button 
                            onClick={onTutorialNext}
                            className="absolute bottom-2 right-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/50 px-3 py-2 rounded-none transition-colors animate-pulse"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Victory Overlay */}
            {showVictory && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-black border-2 border-emerald-500 p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-scale-up text-center relative">
                        <div className="absolute -top-6 lg:-top-8 left-1/2 -translate-x-1/2">
                            <ByakiAvatar />
                        </div>
                        
                        <div className="mt-8 mb-6 space-y-2">
                            <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                <CheckCircle2 size={24} /> VICTORY
                            </h2>
                            <p className="text-emerald-100/80 font-mono text-sm leading-relaxed">
                                {VICTORY_MSG[language] || VICTORY_MSG['en']}
                            </p>
                        </div>

                        <button 
                            onClick={onVictoryConfirm}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-widest transition-colors shadow-hard"
                        >
                            {language === 'en' ? 'CONFIRM & EXIT' : '确认并退出'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default BattleInterface;

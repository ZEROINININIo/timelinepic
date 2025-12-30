
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RPGPosition, RPGObject, Language } from '../../types';
import { Maximize, X, MessageCircle, AlertTriangle, FastForward, Activity } from 'lucide-react';
import VirtualJoystick from './VirtualJoystick';
import { MAP_WIDTH, MAP_HEIGHT, PLAYER_SIZE, SPEED, ENEMY_SPEED } from './rpg/constants';
import { BattleState } from './rpg/types';
import { MAP_OBJECTS } from './rpg/mapData';
import { TUTORIAL_STEPS } from './rpg/tutorialData';
import AssetLoader from './rpg/AssetLoader';
import MapRenderer from './rpg/MapRenderer';
import BattleInterface from './rpg/BattleInterface';

interface RPGMapProps {
  language: Language;
  onNavigate?: (tab: string) => void;
  nickname: string | null;
}

const RPGMap: React.FC<RPGMapProps> = ({ language, onNavigate, nickname }) => {
  // Use Refs for High-Frequency Game Loop Data (Zero Re-renders during movement)
  const playerPosRef = useRef<RPGPosition>({ x: 500, y: 700 });
  const worldRef = useRef<HTMLDivElement>(null);
  const playerElemRef = useRef<HTMLDivElement>(null);
  const hudPosRef = useRef<HTMLDivElement>(null);
  
  // Enemy Refs
  const enemyPosRef = useRef<RPGPosition>({ x: 1400, y: 300 });
  const enemyElemRef = useRef<HTMLDivElement>(null);
  const isEnemyDefeatedRef = useRef<boolean>(false); // Initialize as false to ensure visibility check works
  
  const activeObjRef = useRef<RPGObject | null>(null);
  const directionRef = useRef<'up'|'down'|'left'|'right'>('up');
  
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // React State for UI updates only
  const [activeObj, setActiveObj] = useState<RPGObject | null>(null);
  const [viewingExhibit, setViewingExhibit] = useState<RPGObject | null>(null);
  const [direction, setDirection] = useState<'up'|'down'|'left'|'right'>('up');
  
  // Battle State
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  
  // Loading State
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());
  const [failedAssets, setFailedAssets] = useState<Set<string>>(new Set());

  // System Logs State
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  const playerName = nickname || 'USR_01';

  // --- SYSTEM LOG SIMULATION ---
  useEffect(() => {
      const operations = ['LOAD', 'SYNC', 'CACHE', 'EXEC', 'PING'];
      const modules = ['core_sys', 'render_pipe', 'audio_bus', 'net_layer', 'entity_mgr', 'physics', 'ai_nav'];
      const extensions = ['.dat', '.bin', '.js', '.wasm', '.cfg'];

      const interval = setInterval(() => {
          // Only update sometimes to feel more organic
          if (Math.random() > 0.3) {
              const op = operations[Math.floor(Math.random() * operations.length)];
              const mod = modules[Math.floor(Math.random() * modules.length)];
              const ext = extensions[Math.floor(Math.random() * extensions.length)];
              const addr = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
              const newLine = `[0x${addr}] ${op}: ${mod}${ext} ... OK`;
              
              setSystemLogs(prev => [newLine, ...prev].slice(0, 4));
          }
      }, 150);

      return () => clearInterval(interval);
  }, []);

  // --- ASSET PRELOADING ---
  const totalAssets = MAP_OBJECTS.filter(obj => obj.imageUrl).length;

  useEffect(() => {
      // Check enemy status
      const defeated = localStorage.getItem('nova_enemy_defeated');
      isEnemyDefeatedRef.current = defeated === 'true';
      if (defeated === 'true' && enemyElemRef.current) {
          enemyElemRef.current.style.display = 'none';
      }

      const assets = MAP_OBJECTS.filter(obj => obj.imageUrl);
      if (assets.length === 0) {
          setIsPreloading(false);
          return;
      }

      const isCached = localStorage.getItem('nova_assets_cached') === 'true';
      const uniqueUrls = Array.from(new Set(assets.map(a => a.imageUrl!)));
      
      const promises = uniqueUrls.map(url => {
          return new Promise<void>((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                  setLoadedAssets(prev => new Set(prev).add(url)); // Simulating count by URL
                  resolve();
              };
              img.onerror = () => {
                  setFailedAssets(prev => new Set(prev).add(url));
                  resolve();
              };
          });
      });

      Promise.all(promises).then(() => {
          localStorage.setItem('nova_assets_cached', 'true');
          const delay = isCached ? 0 : 800;
          setTimeout(() => setIsPreloading(false), delay);
      });
  }, []);

  // --- INPUT HANDLING ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- COLLISION & INTERACTION UTILS ---
  const checkCollision = useCallback((x: number, y: number) => {
      if (x < 0 || x + PLAYER_SIZE > MAP_WIDTH || y < 0 || y + PLAYER_SIZE > MAP_HEIGHT) return true;
      for (const obj of MAP_OBJECTS) {
          if (obj.type === 'decoration' || obj.type === 'npc') continue; 
          if (
              x < obj.x + obj.width &&
              x + PLAYER_SIZE > obj.x &&
              y < obj.y + obj.height &&
              y + PLAYER_SIZE > obj.y
          ) {
              return true;
          }
      }
      return false;
  }, []);

  const findInteractionTarget = useCallback((x: number, y: number) => {
      let nearest: RPGObject | null = null;
      let minDist = 70;
      for (const obj of MAP_OBJECTS) {
          if (obj.type !== 'exhibit' && obj.type !== 'npc') continue;
          const cx = obj.x + obj.width / 2;
          const cy = obj.y + obj.height / 2;
          const px = x + PLAYER_SIZE / 2;
          const py = y + PLAYER_SIZE / 2;
          const dist = Math.sqrt(Math.pow(cx - px, 2) + Math.pow(cy - py, 2));
          if (dist < minDist) {
              minDist = dist;
              nearest = obj;
          }
      }
      return nearest;
  }, []);

  // --- BATTLE LOGIC ---
  const startBattle = useCallback(() => {
      setBattleState({
          active: true,
          turn: 'player',
          playerHp: 150,
          playerMaxHp: 150,
          playerShield: 0,
          enemyHp: 600,
          enemyMaxHp: 600,
          logs: ['>> BATTLE_START: SENTINEL_X ENCOUNTERED', '>> THREAT_LEVEL: EXTREME'],
          cdCut: 0,
          cdStealth: 0,
          tutorialStep: 0, // Start Tutorial
          showVictory: false,
          animation: undefined,
          animationKey: 0
      });
      keysPressed.current.clear();
  }, []);

  const handleTutorialNext = () => {
      if (battleState) {
          if (battleState.tutorialStep < TUTORIAL_STEPS.length - 1) {
              setBattleState({ ...battleState, tutorialStep: battleState.tutorialStep + 1 });
          } else {
              setBattleState({ ...battleState, tutorialStep: -1 }); // End Tutorial
          }
      }
  };

  const battleAction = (action: 'attack' | 'heal' | 'cut' | 'stealth') => {
      if (!battleState || battleState.turn !== 'player' || battleState.tutorialStep !== -1) return;

      let newLog = '';
      let newEnemyHp = battleState.enemyHp;
      let newPlayerHp = battleState.playerHp;
      let newPlayerShield = battleState.playerShield;
      let newCdCut = Math.max(0, battleState.cdCut - 1);
      let newCdStealth = Math.max(0, battleState.cdStealth - 1);

      if (action === 'attack') {
          const dmg = Math.floor(Math.random() * 10) + 15;
          newEnemyHp = Math.max(0, battleState.enemyHp - dmg);
          newLog = `>> ${playerName} [ATTACK]: ${dmg} DMG`;
      } else if (action === 'heal') {
          const heal = Math.floor(Math.random() * 20) + 40;
          newPlayerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + heal);
          newLog = `>> ${playerName} [REPAIR]: +${heal} HP`;
      } else if (action === 'cut') {
          if (battleState.cdCut > 0) return;
          const dmg = Math.floor(Math.random() * 30) + 80;
          newEnemyHp = Math.max(0, battleState.enemyHp - dmg);
          newLog = `>> ${playerName} [CUT_DATA]: ${dmg} CRITICAL`;
          newCdCut = 3;
      } else if (action === 'stealth') {
          if (battleState.cdStealth > 0) return;
          const shieldGain = 50;
          newPlayerShield += shieldGain;
          newLog = `>> ${playerName} [DATA_STEALTH]: +${shieldGain} ARMOR`;
          newCdStealth = 3;
      }

      setBattleState(prev => prev ? ({
          ...prev,
          playerHp: newPlayerHp,
          playerShield: newPlayerShield,
          enemyHp: newEnemyHp,
          turn: 'enemy',
          logs: [newLog, ...prev.logs].slice(0, 8),
          cdCut: newCdCut,
          cdStealth: newCdStealth,
          animation: action,
          animationKey: Date.now()
      }) : null);

      if (newEnemyHp <= 0) {
          // Delay victory screen
          setTimeout(() => {
              setBattleState(prev => prev ? ({ ...prev, showVictory: true }) : null);
          }, 800);
      } else {
          setTimeout(enemyTurn, 1000);
      }
  };

  const enemyTurn = () => {
      setBattleState(prev => {
          if (!prev || prev.enemyHp <= 0) return prev;
          
          const dmg = Math.floor(Math.random() * 15) + 25;
          let remainingDmg = dmg;
          let newShield = prev.playerShield;
          let newHp = prev.playerHp;

          if (newShield > 0) {
              if (newShield >= remainingDmg) {
                  newShield -= remainingDmg;
                  remainingDmg = 0;
              } else {
                  remainingDmg -= newShield;
                  newShield = 0;
              }
          }
          newHp = Math.max(0, newHp - remainingDmg);
          
          if (newHp <= 0) {
              setTimeout(loseBattle, 800);
          }

          const blockedLog = dmg - remainingDmg > 0 ? ` (${dmg - remainingDmg} BLOCKED)` : '';
          return {
              ...prev,
              playerHp: newHp,
              playerShield: newShield,
              turn: 'player',
              logs: [`>> SENTINEL [ATTACK]: ${dmg} DMG${blockedLog}`, ...prev.logs].slice(0, 8),
              animation: 'enemy_attack',
              animationKey: Date.now()
          };
      });
  };

  const handleVictoryConfirm = () => {
      localStorage.setItem('nova_enemy_defeated', 'true');
      isEnemyDefeatedRef.current = true;
      setBattleState(null);
      if (enemyElemRef.current) enemyElemRef.current.style.display = 'none';
  };

  const loseBattle = () => {
      setBattleState(null);
      playerPosRef.current = { x: 500, y: 700 };
      if (playerElemRef.current) playerElemRef.current.style.transform = `translate3d(500px, 700px, 0)`;
      enemyPosRef.current = { x: 1400, y: 300 };
      if (enemyElemRef.current) enemyElemRef.current.style.transform = `translate3d(1400px, 300px, 0)`;
      alert('MISSION FAILED: EMERGENCY EVACUATION TRIGGERED');
  };

  // --- MAIN GAME LOOP ---
  const gameLoop = useCallback(() => {
      if (viewingExhibit || isPreloading || battleState?.active) {
          requestRef.current = requestAnimationFrame(gameLoop);
          return;
      }

      let dx = 0;
      let dy = 0;

      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) dy -= SPEED;
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) dy += SPEED;
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) dx -= SPEED;
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) dx += SPEED;

      if (dx !== 0 || dy !== 0) {
          let newDir: 'up' | 'down' | 'left' | 'right' = directionRef.current;
          if (Math.abs(dx) > Math.abs(dy)) {
              newDir = dx > 0 ? 'right' : 'left';
          } else {
              newDir = dy > 0 ? 'down' : 'up';
          }
          if (newDir !== directionRef.current) {
              directionRef.current = newDir;
              setDirection(newDir);
          }

          let nextX = playerPosRef.current.x + dx;
          let nextY = playerPosRef.current.y + dy;

          if (checkCollision(nextX, playerPosRef.current.y)) nextX = playerPosRef.current.x;
          if (checkCollision(nextX, nextY)) nextY = playerPosRef.current.y;

          playerPosRef.current = { x: nextX, y: nextY };

          if (playerElemRef.current) {
              playerElemRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
          }
          if (worldRef.current) {
              const vx = window.innerWidth/2 - nextX - PLAYER_SIZE/2;
              const vy = window.innerHeight/2 - nextY - PLAYER_SIZE/2;
              worldRef.current.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
          }
          if (hudPosRef.current) {
              hudPosRef.current.innerText = `POS: ${Math.round(nextX)}, ${Math.round(nextY)}`;
          }

          const nearest = findInteractionTarget(nextX, nextY);
          if (nearest?.id !== activeObjRef.current?.id) {
              activeObjRef.current = nearest;
              setActiveObj(nearest);
          }
      }

      // Enemy AI
      if (!isEnemyDefeatedRef.current) {
          const ex = enemyPosRef.current.x;
          const ey = enemyPosRef.current.y;
          const px = playerPosRef.current.x;
          const py = playerPosRef.current.y;
          const distX = px - ex;
          const distY = py - ey;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < 50) {
              startBattle();
          } else if (distance > 0) {
              enemyPosRef.current.x += (distX / distance) * ENEMY_SPEED;
              enemyPosRef.current.y += (distY / distance) * ENEMY_SPEED;
              if (enemyElemRef.current) {
                  enemyElemRef.current.style.transform = `translate3d(${enemyPosRef.current.x}px, ${enemyPosRef.current.y}px, 0)`;
              }
          }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
  }, [viewingExhibit, isPreloading, checkCollision, findInteractionTarget, battleState]);

  useEffect(() => {
      requestRef.current = requestAnimationFrame(gameLoop);
      return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameLoop]);

  // Initial Placement
  useEffect(() => {
      if (playerElemRef.current) playerElemRef.current.style.transform = `translate3d(${playerPosRef.current.x}px, ${playerPosRef.current.y}px, 0)`;
      if (worldRef.current) {
          const vx = window.innerWidth/2 - playerPosRef.current.x - PLAYER_SIZE/2;
          const vy = window.innerHeight/2 - playerPosRef.current.y - PLAYER_SIZE/2;
          worldRef.current.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
      }
      if (enemyElemRef.current && !isEnemyDefeatedRef.current) {
          enemyElemRef.current.style.transform = `translate3d(${enemyPosRef.current.x}px, ${enemyPosRef.current.y}px, 0)`;
      }
  }, [isPreloading]);

  const handleInteract = () => {
      if (activeObj && (activeObj.type === 'exhibit' || activeObj.type === 'npc')) {
          setViewingExhibit(activeObj);
      }
  };

  useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
          if (e.code === 'Space' || e.code === 'Enter') {
              if (viewingExhibit) setViewingExhibit(null);
              else handleInteract();
          }
          if (e.code === 'Escape' && viewingExhibit) setViewingExhibit(null);
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeObj, viewingExhibit]);

  // --- RENDER ---
  if (isPreloading) {
      return <AssetLoader loadedCount={loadedAssets.size + failedAssets.size} totalCount={totalAssets} onSkip={() => setIsPreloading(false)} />;
  }

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden font-mono select-none touch-none">
        
        {/* Environment Layer - Set Z-Index Low */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1),#000000_90%)] pointer-events-none z-0"></div>

        {/* Game World Layer - Higher Z-Index */}
        <div ref={worldRef} className="absolute will-change-transform z-10" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            <MapRenderer objects={MAP_OBJECTS} activeObjId={activeObj?.id || null} />

            {/* Player: Four-Pointed Star (Nova) - Enhanced Visibility & Positioning Fix */}
            <div 
                ref={playerElemRef} 
                className="absolute z-40 transition-transform duration-75 ease-linear will-change-transform top-0 left-0" 
                style={{ width: PLAYER_SIZE, height: PLAYER_SIZE }}
            >
                {/* Nickname Label */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-500 font-black text-[10px] whitespace-nowrap tracking-wider uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)] bg-black/50 px-1 border border-red-900/50">
                    {playerName}
                </div>

                <div 
                    className="w-full h-full relative flex items-center justify-center"
                    style={{
                        transform: direction === 'right' ? 'rotate(90deg)' : direction === 'left' ? 'rotate(-90deg)' : direction === 'down' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    {/* Background Glow/Contrast for Player - No Filter */}
                    <div className="absolute inset-0 bg-black rounded-full border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 fill-current relative z-10 p-1">
                        <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
                    </svg>
                    {/* Core Pulse */}
                    <div className="absolute w-2 h-2 bg-white rounded-full animate-ping z-20"></div>
                    <div className="absolute w-2 h-2 bg-emerald-100 rounded-full z-20"></div>
                </div>
            </div>

            {/* Enemy - Stabilized Visibility (No Rotation) & Positioning Fix */}
            <div 
                ref={enemyElemRef} 
                className="absolute z-20 transition-transform duration-100 ease-linear will-change-transform top-0 left-0" 
                style={{ width: 40, height: 40 }}
            >
                <div className="w-full h-full bg-red-950/80 border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)] relative">
                    <div className="absolute inset-0 bg-red-500/30 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-red-400"></div>
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-400"></div>
                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-red-400"></div>
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-red-400"></div>
                </div>
            </div>
        </div>

        {/* HUD */}
        <div className="fixed top-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/50 border border-ash-gray/30 px-3 py-1 text-[10px] font-mono text-ash-light backdrop-blur-sm">
                <span className="text-emerald-500 font-bold">STATUS:</span> ONLINE
            </div>
            <div ref={hudPosRef} className="bg-black/50 border border-ash-gray/30 px-3 py-1 text-[10px] font-mono text-ash-gray backdrop-blur-sm">
                POS: 500, 700
            </div>
            {/* File Loading Monitor */}
            <div className="bg-black/70 border border-ash-gray/30 p-2 text-[9px] font-mono text-ash-gray/80 backdrop-blur-sm w-48 overflow-hidden flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-emerald-500/70 border-b border-ash-gray/20 pb-1 mb-1">
                    <Activity size={8} className="animate-pulse" />
                    <span>SYS_MONITOR // ACTIVE</span>
                </div>
                {systemLogs.map((log, i) => (
                    <div key={i} className={`truncate transition-all duration-300 ${i === 0 ? 'text-ash-light' : 'opacity-60'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>

        {/* Interaction Prompt */}
        {activeObj && !viewingExhibit && !battleState?.active && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <button 
                    onClick={handleInteract}
                    className="bg-emerald-600 text-black px-6 py-3 font-bold uppercase tracking-widest border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                    {activeObj.type === 'npc' ? 'TALK' : 'INSPECT'} [SPACE]
                </button>
            </div>
        )}

        {/* Battle Interface */}
        {battleState?.active && (
            <BattleInterface 
                state={battleState}
                onAction={battleAction}
                onTutorialNext={handleTutorialNext}
                onVictoryConfirm={handleVictoryConfirm}
                language={language}
                nickname={playerName}
            />
        )}

        {/* Exhibit Viewer Modal */}
        {viewingExhibit && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in" onClick={() => setViewingExhibit(null)}>
                <div className="w-full max-w-4xl border-2 border-ash-light bg-ash-black relative flex flex-col md:flex-row shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setViewingExhibit(null)} className="absolute top-2 right-2 p-2 text-ash-gray hover:text-white z-50">
                        <X size={24} />
                    </button>
                    {viewingExhibit.imageUrl && (
                        <div className="w-full md:w-2/3 bg-black flex items-center justify-center border-b md:border-b-0 md:border-r border-ash-dark p-4 relative group">
                            <div className="absolute inset-0 bg-grid-hard opacity-20"></div>
                            <img src={viewingExhibit.imageUrl} alt={viewingExhibit.label} className="max-w-full max-h-[60vh] object-contain shadow-2xl relative z-10" />
                            <button onClick={() => window.open(viewingExhibit.imageUrl, '_blank')} className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                                <Maximize size={16} />
                            </button>
                        </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-ash-gray uppercase tracking-widest border-b border-ash-dark pb-2">
                            {viewingExhibit.type === 'npc' ? <MessageCircle size={14} /> : <AlertTriangle size={14} />}
                            {viewingExhibit.type === 'npc' ? 'NEURAL_LINK' : 'ARCHIVE_DATA'}
                        </div>
                        <h2 className={`text-2xl font-black uppercase mb-4 ${viewingExhibit.color || 'text-ash-light'}`}>
                            {viewingExhibit.label}
                        </h2>
                        <div className="text-sm font-mono text-ash-gray leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {viewingExhibit.description?.[language] || viewingExhibit.description?.['en']}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {!battleState?.active && !viewingExhibit && !isPreloading && (
            <VirtualJoystick 
                onMove={(dx, dy) => {
                    // Simulate key press for loop
                    if (dx < 0) keysPressed.current.add('ArrowLeft');
                    else keysPressed.current.delete('ArrowLeft');
                    if (dx > 0) keysPressed.current.add('ArrowRight');
                    else keysPressed.current.delete('ArrowRight');
                    if (dy < 0) keysPressed.current.add('ArrowUp');
                    else keysPressed.current.delete('ArrowUp');
                    if (dy > 0) keysPressed.current.add('ArrowDown');
                    else keysPressed.current.delete('ArrowDown');
                }} 
                onStop={() => keysPressed.current.clear()} 
            />
        )}
    </div>
  );
};

export default RPGMap;

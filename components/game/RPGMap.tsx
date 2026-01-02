
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RPGPosition, RPGObject, Language, RemotePlayer } from '../../types';
import { Maximize, X, MessageCircle, AlertTriangle, Crown } from 'lucide-react';
import VirtualJoystick from './VirtualJoystick';
import { MAP_WIDTH, MAP_HEIGHT, PLAYER_SIZE, SPEED, ENEMY_SPEED } from './rpg/constants';
import { BattleState } from './rpg/types';
import { MAP_OBJECTS } from './rpg/mapData';
import { TUTORIAL_STEPS } from './rpg/tutorialData';
import AssetLoader from './rpg/AssetLoader';
import MapRenderer from './rpg/MapRenderer';
import BattleInterface from './rpg/BattleInterface';
import RemotePlayersLayer from './rpg/RemotePlayersLayer';
import GameUI from './rpg/GameUI';

// API Configuration
const API_URL = 'https://cdn.zeroxv.cn/nova_api/api.php';
// Constants
const IDLE_HEARTBEAT = 2000;
const COMBAT_HEARTBEAT = 400; // Faster polling during combat/setup
const MESSAGE_LIFETIME = 6000; 

// Balance Constants
const MAX_HP_PLAYER = 300;
const MAX_HP_ENEMY_PVE = 600;
const MAX_HP_ENEMY_PVP = 300;

interface RPGMapProps {
  language: Language;
  onNavigate?: (tab: string) => void;
  nickname: string | null;
  onOpenGuestbook?: () => void;
}

const RPGMap: React.FC<RPGMapProps> = ({ language, onNavigate, nickname, onOpenGuestbook }) => {
  // Use Refs for High-Frequency Game Loop Data (Zero Re-renders during movement)
  const playerPosRef = useRef<RPGPosition>({ x: 500, y: 700 });
  const worldRef = useRef<HTMLDivElement>(null);
  const playerElemRef = useRef<HTMLDivElement>(null);
  const hudPosRef = useRef<HTMLDivElement>(null); // Kept for logic if needed, though prop drilling handles display
  
  // Secret Room Overlay Ref
  const teaRoomOverlayRef = useRef<HTMLDivElement>(null);
  
  // Tea NPC Refs & State
  const teaPosRef = useRef<RPGPosition>({ x: 80, y: 150 }); 
  const teaElemRef = useRef<HTMLDivElement>(null);
  const [teaStage, setTeaStage] = useState(0); 
  const isTeaFollowing = teaStage >= 4;

  // Enemy Refs - Initialize defeated state from local storage synchronously if possible to avoid flash
  const isEnemyDefeatedRef = useRef<boolean>(
      typeof window !== 'undefined' ? localStorage.getItem('nova_enemy_defeated') === 'true' : false
  );
  const enemyPosRef = useRef<RPGPosition>({ x: 1400, y: 300 });
  const enemyElemRef = useRef<HTMLDivElement>(null);
  
  const activeObjRef = useRef<RPGObject | null>(null);
  const directionRef = useRef<'up'|'down'|'left'|'right'>('up');
  
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // React State for UI updates only
  const [activeObj, setActiveObj] = useState<RPGObject | null>(null);
  const [viewingExhibit, setViewingExhibit] = useState<RPGObject | null>(null);
  const [pendingLink, setPendingLink] = useState<{ url: string, title: string } | null>(null);
  const [direction, setDirection] = useState<'up'|'down'|'left'|'right'>('up');
  const [playerPosState, setPlayerPosState] = useState({ x: 500, y: 700 }); // synced occasionally for UI
  
  // Battle State
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const lastProcessedActionIdRef = useRef<string>(""); // To track remote actions
  
  // Loading State
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());
  const [failedAssets, setFailedAssets] = useState<Set<string>>(new Set());

  // Multiplayer State
  const [otherPlayers, setOtherPlayers] = useState<RemotePlayer[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);
  
  // Player Buffer for Anti-Flicker
  const playersBufferRef = useRef<Map<string, RemotePlayer & { localLastSeen: number }>>(new Map());
  
  // Duplicate Name Prevention
  const [isDuplicateNameDetected, setIsDuplicateNameDetected] = useState(false);
  const [duplicateNameAlert, setDuplicateNameAlert] = useState(false); // To show UI modal

  // Fix: Use sessionStorage to persist ID across remounts (prevents ghosts)
  const sessionIdRef = useRef<string>(
    (function() {
        if (typeof window === 'undefined') return `user-${Math.floor(Math.random() * 1000000)}`;
        
        let id = sessionStorage.getItem('nova_rpg_session_id');
        if (!id) {
            id = `user-${Math.floor(Math.random() * 1000000)}`;
            sessionStorage.setItem('nova_rpg_session_id', id);
        }
        return id;
    })()
  );
  
  // PvP State
  const [nearbyPlayer, setNearbyPlayer] = useState<RemotePlayer | null>(null);
  const [pvpInvite, setPvpInvite] = useState<RemotePlayer | null>(null);
  const [pvpTarget, setPvpTarget] = useState<RemotePlayer | null>(null);
  const [localSuffix, setLocalSuffix] = useState<string>('');
  
  // Ignore list for rejected invites OR recent opponents (to prevent loop)
  const ignoredInvitesRef = useRef<Set<string>>(new Set());

  // Chat State
  const [myChatMsg, setMyChatMsg] = useState<{text: string, ts: number} | null>(null);
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  
  // System Logs State
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Timer Ref for Dynamic Polling
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerName = (nickname || 'USR_01') + localSuffix;

  // Reset duplicate detection when nickname changes
  useEffect(() => {
      setIsDuplicateNameDetected(false);
      setDuplicateNameAlert(false);
  }, [nickname]);

  // Tea Dialogue Data
  const teaDialogues = [
      "你好...",
      "看我干嘛？看图片去啊",
      "难不成还要我陪你看？",
      "好吧.."
  ];

  // --- OPTIMIZATION: Memoize Joystick Handlers ---
  const handleJoystickMove = useCallback((dx: number, dy: number) => {
      if (dx < 0) keysPressed.current.add('ArrowLeft');
      else keysPressed.current.delete('ArrowLeft');
      if (dx > 0) keysPressed.current.add('ArrowRight');
      else keysPressed.current.delete('ArrowRight');
      if (dy < 0) keysPressed.current.add('ArrowUp');
      else keysPressed.current.delete('ArrowUp');
      if (dy > 0) keysPressed.current.add('ArrowDown');
      else keysPressed.current.delete('ArrowDown');
  }, []);

  const handleJoystickStop = useCallback(() => {
      keysPressed.current.clear();
  }, []);

  // --- OPTIMIZATION: Process Remote Players Data ---
  const processedOtherPlayers = useMemo(() => {
      const myId = sessionIdRef.current;
      const uniqueMap = new Map<string, RemotePlayer>();

      otherPlayers.forEach(p => {
          // 1. Filter out self (we render self locally)
          if (p.id === myId) return;

          // 2. Deduplicate by nickname (Keep latest active)
          const existing = uniqueMap.get(p.nickname);
          if (!existing || (p.last_active > existing.last_active)) {
              uniqueMap.set(p.nickname, p);
          }
      });

      // Cap at 15 players to prevent rendering lag
      return Array.from(uniqueMap.values()).slice(0, 15).map(p => {
          const px = Number(p.x);
          const py = Number(p.y);
          if (isNaN(px) || isNaN(py)) return null;
          return { ...p, safeX: px, safeY: py };
      }).filter(p => p !== null) as (RemotePlayer & { safeX: number, safeY: number })[];
  }, [otherPlayers]);

  // --- CHAT MESSAGE EXPIRY (Local Only) ---
  useEffect(() => {
      if (myChatMsg) {
          const timer = setTimeout(() => {
              if (!myChatMsg.text.startsWith('[[') || myChatMsg.text.startsWith('[[ROOT::')) {
                  setMyChatMsg(null);
              }
          }, MESSAGE_LIFETIME);
          return () => clearTimeout(timer);
      }
  }, [myChatMsg]);

  // --- MULTIPLAYER HEARTBEAT & SYNC ---
  const sendHeartbeat = useCallback(async () => {
      if (isPreloading || !isEnemyDefeatedRef.current || isDuplicateNameDetected) {
          heartbeatTimerRef.current = setTimeout(sendHeartbeat, IDLE_HEARTBEAT);
          return;
      }

      try {
          const payload = {
              id: sessionIdRef.current,
              nickname: playerName,
              x: Math.round(playerPosRef.current.x),
              y: Math.round(playerPosRef.current.y),
              map: 'main',
              msg: myChatMsg?.text || null,
              msg_ts: myChatMsg?.ts || null,
              tea: isTeaFollowing // Broadcast local tea status
          };

          const res = await fetch(`${API_URL}?action=heartbeat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              const data: RemotePlayer[] = await res.json();
              
              if (Array.isArray(data)) {
                  // Duplicate Name Check
                  const myId = sessionIdRef.current;
                  const hasDuplicate = data.some(p => p.nickname === playerName && p.id !== myId);
                  
                  if (hasDuplicate) {
                      setIsDuplicateNameDetected(true);
                      setIsOnline(false);
                      setDuplicateNameAlert(true);
                      return; // Stop heartbeat loop
                  }

                  const now = Date.now();
                  data.forEach(p => {
                      playersBufferRef.current.set(p.id, { ...p, localLastSeen: now });
                  });

                  const expiration = 6000;
                  for (const [id, p] of playersBufferRef.current.entries()) {
                      if (now - p.localLastSeen > expiration) {
                          playersBufferRef.current.delete(id);
                      }
                  }

                  const bufferedPlayers = Array.from(playersBufferRef.current.values());
                  setIsOnline(true);
                  setOtherPlayers(bufferedPlayers);
              }
          } else {
              setIsOnline(false);
          }
      } catch (e) {
          console.warn("Heartbeat failed", e);
          setIsOnline(false);
      } finally {
          const isHighAlert = battleState?.active || pvpInvite !== null || (myChatMsg?.text && myChatMsg.text.startsWith('[[DUEL_REQ'));
          const interval = isHighAlert ? COMBAT_HEARTBEAT : IDLE_HEARTBEAT;
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          heartbeatTimerRef.current = setTimeout(sendHeartbeat, interval);
      }
  }, [isPreloading, playerName, myChatMsg, isTeaFollowing, isDuplicateNameDetected, battleState?.active, pvpInvite]);

  // Start/Restart Polling Loop when dependencies change (e.g. nickname, status)
  useEffect(() => {
      sendHeartbeat();
      return () => {
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
      };
  }, [sendHeartbeat]);

  // --- INCOMING SIGNAL PROCESSOR (Chat, Invite, Battle) ---
  useEffect(() => {
      if (processedOtherPlayers.length > 0) {
          const myId = sessionIdRef.current;

          const invite = processedOtherPlayers.find(p => p.msg === `[[DUEL_REQ::${myId}]]`);
          if (invite && !battleState?.active && !pvpInvite && !ignoredInvitesRef.current.has(invite.id)) {
              setPvpInvite(invite);
          }

          const accept = processedOtherPlayers.find(p => p.msg === `[[DUEL_ACC::${myId}]]`);
          if (accept && !battleState?.active && !ignoredInvitesRef.current.has(accept.id)) {
              startPvPBattle(accept, false); 
              setMyChatMsg(null); 
          }

          if (!battleState?.active && myChatMsg?.text.startsWith('[[DUEL_REQ')) {
              const targetIdMatch = myChatMsg.text.match(/\[\[DUEL_REQ::(.*?)\]\]/);
              if (targetIdMatch) {
                  const targetId = targetIdMatch[1];
                  const opponent = processedOtherPlayers.find(p => p.id === targetId);
                  
                  if (opponent && opponent.msg && (opponent.msg.startsWith('[[ACT') || opponent.msg.startsWith('[[DUEL_ACC'))) {
                      startPvPBattle(opponent, false);
                      setMyChatMsg(null);
                  }
              }
          }

          const reject = processedOtherPlayers.find(p => p.msg === `[[DUEL_REJ::${myId}]]`);
          if (reject && myChatMsg?.text?.includes(reject.id) && myChatMsg.text.startsWith('[[DUEL_REQ')) {
               setMyChatMsg(null);
               alert(`${reject.nickname} rejected your duel request.`);
          }

          if (battleState?.active && pvpTarget) {
              const opponent = processedOtherPlayers.find(p => p.id === pvpTarget.id);
              if (opponent && opponent.msg && opponent.msg.startsWith('[[ACT::')) {
                  const match = opponent.msg.match(/\[\[ACT::(.*?)::(.*?)::(.*?)\]\]/);
                  if (match) {
                      const [_, type, valStr, actionId] = match;
                      if (actionId !== lastProcessedActionIdRef.current) {
                          lastProcessedActionIdRef.current = actionId;
                          handleIncomingBattleAction(type, parseInt(valStr), opponent.nickname);
                      }
                  }
              }
          }
      }
  }, [processedOtherPlayers, battleState?.active, pvpInvite, pvpTarget, myChatMsg]);

  // --- AUTO CANCEL INVITE IF SENDER STOPS ---
  useEffect(() => {
      if (pvpInvite) {
          const inviter = processedOtherPlayers.find(p => p.id === pvpInvite.id);
          if (!inviter || (inviter.msg !== `[[DUEL_REQ::${sessionIdRef.current}]]` && !inviter.msg?.startsWith('[[ACT'))) {
              setPvpInvite(null); 
          }
      }
  }, [processedOtherPlayers, pvpInvite]);

  // --- SYSTEM LOG SIMULATION ---
  useEffect(() => {
      const operations = ['LOAD', 'SYNC', 'CACHE', 'EXEC', 'PING'];
      const modules = ['core_sys', 'render_pipe', 'audio_bus', 'net_layer', 'entity_mgr', 'physics', 'ai_nav'];
      const extensions = ['.dat', '.bin', '.js', '.wasm', '.cfg'];

      const interval = setInterval(() => {
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
  const totalAssets = MAP_OBJECTS.filter(obj => obj.imageUrl).length + 1;

  useEffect(() => {
      if (isEnemyDefeatedRef.current && enemyElemRef.current) {
          enemyElemRef.current.style.display = 'none';
      }

      const assets = MAP_OBJECTS.filter(obj => obj.imageUrl);
      assets.push({ id: 'npc-tea-asset', type: 'npc', x:0, y:0, width:0, height:0, imageUrl: 'https://cdn.picui.cn/vip/2026/01/02/6957e8e438965.png' });

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
                  setLoadedAssets(prev => new Set(prev).add(url));
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
          if (obj.type === 'decoration' || obj.type === 'npc' || obj.type === 'terminal') continue; 
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
          if (obj.type !== 'exhibit' && obj.type !== 'npc' && obj.type !== 'terminal') continue;
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

      const tx = teaPosRef.current.x + 20; 
      const ty = teaPosRef.current.y + 20;
      const px = x + PLAYER_SIZE / 2;
      const py = y + PLAYER_SIZE / 2;
      const teaDist = Math.sqrt(Math.pow(tx - px, 2) + Math.pow(ty - py, 2));
      
      if (teaDist < minDist) {
          return {
              id: 'npc-tea',
              x: teaPosRef.current.x,
              y: teaPosRef.current.y,
              width: 40, height: 40,
              type: 'npc',
              label: 'TEA',
              imageUrl: 'https://cdn.picui.cn/vip/2026/01/02/6957e8e438965.png',
          } as RPGObject;
      }

      return nearest;
  }, []);

  // --- PVP HELPERS ---
  const findNearbyPlayer = useCallback((x: number, y: number) => {
      let nearest: RemotePlayer | null = null;
      let minDist = 60;

      for (const p of processedOtherPlayers) {
          const dist = Math.sqrt(Math.pow(p.safeX - x, 2) + Math.pow(p.safeY - y, 2));
          if (dist < minDist) {
              minDist = dist;
              nearest = p;
          }
      }
      return nearest;
  }, [processedOtherPlayers]);

  const sendPvPInvite = () => {
      if (nearbyPlayer) {
          const msg = `[[DUEL_REQ::${nearbyPlayer.id}]]`;
          setMyChatMsg({ text: msg, ts: Date.now() });
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat();
          
          alert(`Duel request sent to ${nearbyPlayer.nickname}! Waiting for response...`);
      }
  };

  const acceptPvP = () => {
      if (pvpInvite) {
          setMyChatMsg({ text: `[[DUEL_ACC::${pvpInvite.id}]]`, ts: Date.now() });
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat(); 
          
          startPvPBattle(pvpInvite, true);
          setPvpInvite(null);
      }
  };

  const rejectPvP = () => {
      if (pvpInvite) {
          const rejMsg = `[[DUEL_REJ::${pvpInvite.id}]]`;
          setMyChatMsg({ text: rejMsg, ts: Date.now() });
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat();

          ignoredInvitesRef.current.add(pvpInvite.id);
          setTimeout(() => {
              ignoredInvitesRef.current.delete(pvpInvite.id);
          }, 10000); 

          setPvpInvite(null);
      }
  };

  const cancelPvPInvite = () => {
      setMyChatMsg(null);
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
      sendHeartbeat();
  };

  const cleanupPvPState = () => {
      if (pvpTarget) {
          ignoredInvitesRef.current.add(pvpTarget.id);
          setTimeout(() => {
              ignoredInvitesRef.current.delete(pvpTarget.id);
          }, 15000); 
      }
      setPvpTarget(null);
      setBattleState(null);
      setMyChatMsg(null); 
      
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
      sendHeartbeat();
  };

  const loseBattle = () => {
      if (pvpTarget) {
          const uniqueId = Date.now();
          const loseMsg = `[[ACT::LOSE::0::${uniqueId}]]`;
          setMyChatMsg({ text: loseMsg, ts: uniqueId });
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat();

          setLocalSuffix(' (战败者)');
          alert("DEFEAT: You have been marked as defeated.");
          cleanupPvPState();
      } else {
          setBattleState(null);
          playerPosRef.current = { x: 500, y: 700 };
          if (playerElemRef.current) playerElemRef.current.style.transform = `translate3d(500px, 700px, 0)`;
          enemyPosRef.current = { x: 1400, y: 300 };
          if (enemyElemRef.current) enemyElemRef.current.style.transform = `translate3d(1400px, 300px, 0)`;
          alert('MISSION FAILED: EMERGENCY EVACUATION TRIGGERED');
      }
  };

  // --- BATTLE LOGIC HELPERS (PvE & PvP) ---

  const startBattle = () => {
      setBattleState({
          active: true,
          turn: 'player',
          playerHp: MAX_HP_PLAYER,
          playerMaxHp: MAX_HP_PLAYER,
          playerShield: 0,
          enemyHp: MAX_HP_ENEMY_PVE,
          enemyMaxHp: MAX_HP_ENEMY_PVE,
          enemyShield: 0,
          logs: ['>> HOSTILE DETECTED', '>> INITIATING COMBAT PROTOCOL'],
          cdCut: 0,
          cdStealth: 0,
          cdRepair: 0,
          cdSpike: 0,
          tutorialStep: 0,
          showVictory: false,
          animation: undefined,
          animationKey: 0
      });
      keysPressed.current.clear();
  };

  const handleTutorialNext = () => {
      setBattleState(prev => {
          if (!prev) return null;
          const nextStep = prev.tutorialStep + 1;
          return {
              ...prev,
              tutorialStep: nextStep >= TUTORIAL_STEPS.length ? -1 : nextStep
          };
      });
  };

  const enemyTurnPvE = () => {
      setBattleState(prev => {
          if (!prev || prev.enemyHp <= 0) return prev;

          let dmg = 0;
          let log = '';
          let newHp = prev.playerHp;
          let newShield = prev.playerShield;
          let anim: BattleState['animation'] = undefined;

          if (Math.random() > 0.7) {
              dmg = 35;
              log = '>> WARNING: HIGH ENERGY SIGNATURE DETECTED';
          } else {
              dmg = 15;
              log = `>> ENEMY ATTACK: ${dmg} DAMAGE`;
          }

          if (newShield > 0) {
              if (newShield >= dmg) {
                  newShield -= dmg;
                  dmg = 0;
                  log += ' (BLOCKED)';
              } else {
                  dmg -= newShield;
                  newShield = 0;
              }
          }

          newHp = Math.max(0, newHp - dmg);
          if (dmg > 0) anim = 'enemy_attack';

          if (newHp <= 0) {
              setTimeout(loseBattle, 1000);
          }

          return {
              ...prev,
              playerHp: newHp,
              playerShield: newShield,
              enemyShield: prev.enemyShield, 
              logs: [log, ...prev.logs].slice(0, 8),
              animation: anim,
              animationKey: Date.now(),
              turn: 'player'
          };
      });
  };

  const startPvPBattle = (opponent: RemotePlayer, isMyTurn: boolean = false) => {
      setPvpTarget(opponent);
      setBattleState({
          active: true,
          turn: isMyTurn ? 'player' : 'enemy', 
          playerHp: MAX_HP_PLAYER,
          playerMaxHp: MAX_HP_PLAYER,
          playerShield: 0,
          enemyHp: MAX_HP_ENEMY_PVP,
          enemyMaxHp: MAX_HP_ENEMY_PVP,
          enemyShield: 0,
          logs: [`>> DUEL START: ${opponent.nickname}`, `>> TURN: ${isMyTurn ? 'YOURS' : 'OPPONENT'}`],
          cdCut: 0,
          cdStealth: 0,
          cdRepair: 0,
          cdSpike: 0,
          tutorialStep: -1,
          showVictory: false,
          animation: undefined,
          animationKey: 0
      });
      keysPressed.current.clear();
  };

  const handleIncomingBattleAction = (type: string, value: number, actorName: string) => {
      if (!battleState) return;

      if (type === 'WIN') {
          loseBattle();
          return;
      }
      if (type === 'LOSE') {
          setBattleState(prev => prev ? ({ ...prev, showVictory: true, enemyHp: 0, logs: [`>> ${actorName} SIGNAL LOST`, ...prev.logs].slice(0, 8) }) : null);
          return;
      }

      setBattleState(prev => {
          if (!prev || prev.playerHp <= 0) return prev;

          let newHp = prev.playerHp;
          let newShield = prev.playerShield;
          let newEnemyHp = prev.enemyHp;
          let newEnemyShield = prev.enemyShield || 0;
          let log = "";
          let anim: BattleState['animation'] = undefined;

          if (type === 'ATK' || type === 'CUT') {
              let damage = value;
              if (newShield > 0) {
                  if (newShield >= damage) {
                      newShield -= damage;
                      damage = 0;
                  } else {
                      damage -= newShield;
                      newShield = 0;
                  }
              }
              newHp = Math.max(0, newHp - damage);
              log = `>> ${actorName} [ATTACK]: ${value} DMG`;
              anim = 'enemy_attack';
              
              if (newHp <= 0) setTimeout(loseBattle, 1000);

          } else if (type === 'SPIKE') {
              let damage = value;
              newShield = 0; 
              newHp = Math.max(0, newHp - damage);
              log = `>> ${actorName} [DATA_SPIKE]: SHIELD BROKEN & ${value} DMG`;
              anim = 'enemy_attack';
              if (newHp <= 0) setTimeout(loseBattle, 1000);

          } else if (type === 'HEAL') {
              newEnemyHp = Math.min(prev.enemyMaxHp, prev.enemyHp + value);
              log = `>> ${actorName} [REPAIR]: +${value} HP`;
          } else if (type === 'STL') {
              newEnemyShield += value; 
              log = `>> ${actorName} [STEALTH]: SHIELD UP`;
          }

          return {
              ...prev,
              playerHp: newHp,
              playerShield: newShield,
              enemyHp: newEnemyHp,
              enemyShield: newEnemyShield,
              logs: [log, ...prev.logs].slice(0, 8),
              animation: anim,
              animationKey: Date.now(),
              turn: 'player' 
          };
      });
  };

  const battleAction = (action: 'attack' | 'heal' | 'cut' | 'stealth' | 'spike') => {
      if (!battleState) return;
      
      if (pvpTarget && battleState.turn !== 'player') {
          return; 
      }

      let newLog = '';
      let newEnemyHp = battleState.enemyHp;
      let newPlayerHp = battleState.playerHp;
      let newPlayerShield = battleState.playerShield;
      let newEnemyShield = battleState.enemyShield;
      let newCdCut = Math.max(0, battleState.cdCut - 1);
      let newCdStealth = Math.max(0, battleState.cdStealth - 1);
      let newCdRepair = Math.max(0, battleState.cdRepair - 1);
      let newCdSpike = Math.max(0, battleState.cdSpike - 1);
      
      const dice = Math.floor(Math.random() * 6) + 1;
      let diceRollValue: number | undefined = dice;
      
      let signalType = "";
      let signalValue = 0;

      if (action === 'attack') {
          let mult = 1.0;
          let flavor = "HIT";
          if (dice === 1) { mult = 0.5; flavor = "GLANCE"; }
          else if (dice === 2) { mult = 0.8; flavor = "WEAK"; }
          else if (dice === 3) { mult = 1.0; flavor = "HIT"; }
          else if (dice === 4) { mult = 1.2; flavor = "GOOD"; }
          else if (dice === 5) { mult = 1.5; flavor = "CRIT"; }
          else if (dice === 6) { mult = 2.5; flavor = "MAX!!"; }

          const baseDmg = 30; 
          const dmg = Math.floor(baseDmg * mult);
          let damageCalc = dmg;
          
          if (newEnemyShield > 0) {
              if (newEnemyShield >= damageCalc) {
                  newEnemyShield -= damageCalc;
                  damageCalc = 0;
              } else {
                  damageCalc -= newEnemyShield;
                  newEnemyShield = 0;
              }
          }
          
          newEnemyHp = Math.max(0, battleState.enemyHp - damageCalc);
          newLog = `>> [DICE:${dice}] ${flavor}: ${dmg} DMG`;
          signalType = "ATK";
          signalValue = dmg;
      } else if (action === 'heal') {
          if (battleState.cdRepair > 0) return;
          const heal = dice * 10 + 10;
          newPlayerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + heal);
          newLog = `>> [DICE:${dice}] REPAIR: +${heal} HP`;
          newCdRepair = 3;
          signalType = "HEAL";
          signalValue = heal;
      } else if (action === 'cut') {
          if (battleState.cdCut > 0) return;
          const dmg = 50 + (dice * 15);
          let damageCalc = dmg;

          if (newEnemyShield > 0) {
              if (newEnemyShield >= damageCalc) {
                  newEnemyShield -= damageCalc;
                  damageCalc = 0;
              } else {
                  damageCalc -= newEnemyShield;
                  newEnemyShield = 0;
              }
          }

          newEnemyHp = Math.max(0, battleState.enemyHp - damageCalc);
          newLog = `>> [DICE:${dice}] CUT_DATA: ${dmg} DMG`;
          newCdCut = 4;
          signalType = "CUT";
          signalValue = dmg;
      } else if (action === 'stealth') {
          if (battleState.cdStealth > 0) return;
          const shieldGain = dice * 20;
          newPlayerShield += shieldGain;
          newLog = `>> [DICE:${dice}] SHIELD: +${shieldGain}`;
          newCdStealth = 4;
          signalType = "STL";
          signalValue = shieldGain;
      } else if (action === 'spike') {
          if (battleState.cdSpike > 0) return;
          const dmg = dice * 8;
          newEnemyShield = 0; 
          newEnemyHp = Math.max(0, battleState.enemyHp - dmg); 
          newLog = `>> [DICE:${dice}] BREAK: ${dmg} DMG`;
          newCdSpike = 3;
          signalType = "SPIKE";
          signalValue = dmg;
      }

      setBattleState(prev => prev ? ({
          ...prev,
          playerHp: newPlayerHp,
          playerShield: newPlayerShield,
          enemyHp: newEnemyHp,
          enemyShield: newEnemyShield,
          logs: [newLog, ...prev.logs].slice(0, 8),
          cdCut: newCdCut,
          cdStealth: newCdStealth,
          cdRepair: newCdRepair,
          cdSpike: newCdSpike,
          animation: action,
          animationKey: Date.now(),
          turn: pvpTarget ? 'enemy' : 'enemy', 
          lastDiceRoll: diceRollValue 
      }) : null);

      if (pvpTarget) {
          const uniqueId = Date.now();
          const protocolMsg = `[[ACT::${signalType}::${signalValue}::${uniqueId}]]`;
          setMyChatMsg({ text: protocolMsg, ts: uniqueId });
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat(); 

          if (newEnemyHp <= 0) {
              setTimeout(() => {
                  const winId = Date.now() + 10;
                  const winMsg = `[[ACT::WIN::0::${winId}]]`;
                  setMyChatMsg({ text: winMsg, ts: winId });
                  
                  if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
                  sendHeartbeat();
                  
                  setBattleState(prev => prev ? ({ ...prev, showVictory: true }) : null);
              }, 500);
          }
      } else {
          if (newEnemyHp <= 0) {
              setTimeout(() => {
                  setBattleState(prev => prev ? ({ ...prev, showVictory: true }) : null);
              }, 800);
          } else {
              setTimeout(enemyTurnPvE, 1000);
          }
      }
  };

  const handleVictoryConfirm = () => {
      if (pvpTarget) {
          alert("VICTORY! HONOR PRESERVED.");
          cleanupPvPState();
      } else {
          localStorage.setItem('nova_enemy_defeated', 'true');
          isEnemyDefeatedRef.current = true;
          setBattleState(null);
          if (enemyElemRef.current) enemyElemRef.current.style.display = 'none';
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat();
      }
  };

  const handleSendChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (chatInputValue.trim()) {
          let msg = chatInputValue.trim();
          
          if (msg.startsWith('/root ')) {
              msg = `[[ROOT::${msg.slice(6)}]]`;
          }

          setMyChatMsg({ text: msg, ts: Date.now() });
          setChatInputValue("");
          setShowChatInput(false);
          
          if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
          sendHeartbeat(); 
      }
  };

  const handleConfirmLink = () => {
      if (pendingLink) {
          window.open(pendingLink.url, '_blank');
          setPendingLink(null);
      }
  };

  const handleCloseViewer = () => {
      setViewingExhibit(null);
  };

  const handleInteract = useCallback(() => {
      if (!activeObj) return;

      if (activeObj.type === 'terminal') {
          if (activeObj.id === 'terminal-guestbook') {
              if (onOpenGuestbook) onOpenGuestbook();
          } else if (activeObj.id === 'link-main') {
              setPendingLink({ url: 'https://bf.zeroxv.cn', title: 'MAIN_SITE' });
          } else if (activeObj.id === 'link-ost') {
              setPendingLink({ url: 'https://ost.zeroxv.cn', title: 'OST_ROOM' });
          }
      } else if (activeObj.type === 'npc') {
          if (activeObj.id === 'npc-tea') {
              if (teaStage < 4) { 
                  setMyChatMsg({ text: `[TEA]: ${teaDialogues[teaStage]}`, ts: Date.now() });
                  setTeaStage(prev => prev + 1);
              } else {
                  setMyChatMsg({ text: `[TEA]: ...Following.`, ts: Date.now() });
                  setTeaStage(prev => prev + 1);
              }
          } else {
              setViewingExhibit(activeObj);
          }
      } else {
          setViewingExhibit(activeObj);
      }
  }, [activeObj, teaStage, onOpenGuestbook]);

  // Interaction Key Listener
  useEffect(() => {
      const handler = (e: KeyboardEvent) => {
          if (e.code === 'Space' && !battleState?.active && !viewingExhibit && !pendingLink && !showChatInput) {
              e.preventDefault();
              handleInteract();
          }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
  }, [handleInteract, battleState, viewingExhibit, pendingLink, showChatInput]);

  // --- MAIN GAME LOOP ---
  const gameLoop = useCallback(() => {
      if (viewingExhibit || isPreloading || battleState?.active || pendingLink || showChatInput || showPlayerList) {
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
          
          // Throttled State Update for HUD UI (performance optimization)
          if (Math.random() > 0.8) setPlayerPosState({ x: nextX, y: nextY });

          if (playerElemRef.current) {
              playerElemRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
          }
          if (worldRef.current) {
              const vx = window.innerWidth/2 - nextX - PLAYER_SIZE/2;
              const vy = window.innerHeight/2 - nextY - PLAYER_SIZE/2;
              worldRef.current.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
          }

          // Object Interaction
          const nearestObj = findInteractionTarget(nextX, nextY);
          if (nearestObj?.id !== activeObjRef.current?.id) {
              activeObjRef.current = nearestObj;
              setActiveObj(nearestObj);
          }

          // Player Interaction (PvP)
          const nearestPlayer = findNearbyPlayer(nextX, nextY);
          if (nearestPlayer && nearestPlayer.id !== nearbyPlayer?.id) {
              setNearbyPlayer(nearestPlayer);
          } else if (!nearestPlayer && nearbyPlayer) {
              setNearbyPlayer(null);
          }
          
          // Check for Secret Room Overlay
          if (teaRoomOverlayRef.current) {
              if (nextX < 200 && nextY < 250) {
                  teaRoomOverlayRef.current.style.opacity = '0';
              } else {
                  teaRoomOverlayRef.current.style.opacity = '1';
              }
          }
      }

      // Tea NPC Follow Logic
      const remoteTeaOwner = processedOtherPlayers.find(p => p.tea);
      
      let targetTeaX = 80; // Default Spawn
      let targetTeaY = 150;
      let shouldMoveTea = false;

      if (isTeaFollowing) {
          // Follow Local
          targetTeaX = playerPosRef.current.x;
          targetTeaY = playerPosRef.current.y;
          shouldMoveTea = true;
      } else if (remoteTeaOwner) {
          // Follow Remote
          targetTeaX = remoteTeaOwner.safeX;
          targetTeaY = remoteTeaOwner.safeY;
          shouldMoveTea = true;
      }

      // Smooth move Tea to target
      if (shouldMoveTea) {
          const tx = teaPosRef.current.x;
          const ty = teaPosRef.current.y;
          const distX = targetTeaX - tx;
          const distY = targetTeaY - ty;
          const distance = Math.sqrt(distX * distX + distY * distY);
          
          if (distance > 60) {
              const moveSpeed = SPEED * 0.95; 
              teaPosRef.current.x += (distX / distance) * moveSpeed;
              teaPosRef.current.y += (distY / distance) * moveSpeed;
          }
      } else {
          // Return to spawn
          const sx = 80;
          const sy = 150;
          const distX = sx - teaPosRef.current.x;
          const distY = sy - teaPosRef.current.y;
          const distance = Math.sqrt(distX * distX + distY * distY);
          if (distance > 5) {
              teaPosRef.current.x += (distX / distance) * 2;
              teaPosRef.current.y += (distY / distance) * 2;
          }
      }
      
      if (teaElemRef.current) {
          teaElemRef.current.style.transform = `translate3d(${teaPosRef.current.x}px, ${teaPosRef.current.y}px, 0)`;
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
  }, [viewingExhibit, isPreloading, checkCollision, findInteractionTarget, findNearbyPlayer, nearbyPlayer, battleState, isTeaFollowing, pendingLink, showChatInput, showPlayerList, processedOtherPlayers]);

  useEffect(() => {
      requestRef.current = requestAnimationFrame(gameLoop);
      return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameLoop]);

  // Initial Placement
  useEffect(() => {
      if (playerElemRef.current) playerElemRef.current.style.transform = `translate3d(${playerPosRef.current.x}px, ${playerPosRef.current.y}px, 0)`;
      if (teaElemRef.current) teaElemRef.current.style.transform = `translate3d(${teaPosRef.current.x}px, ${teaPosRef.current.y}px, 0)`;
      if (worldRef.current) {
          const vx = window.innerWidth/2 - playerPosRef.current.x - PLAYER_SIZE/2;
          const vy = window.innerHeight/2 - playerPosRef.current.y - PLAYER_SIZE/2;
          worldRef.current.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
      }
      if (enemyElemRef.current && !isEnemyDefeatedRef.current) {
          enemyElemRef.current.style.transform = `translate3d(${enemyPosRef.current.x}px, ${enemyPosRef.current.y}px, 0)`;
      }
  }, [isPreloading]);

  // --- RENDER ---
  if (isPreloading) {
      return <AssetLoader loadedCount={loadedAssets.size + failedAssets.size} totalCount={totalAssets} onSkip={() => setIsPreloading(false)} />;
  }

  // Use fixed positioning and dvh to fix iOS scroll/viewport issues
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#050505] relative overflow-hidden font-mono select-none touch-none">
        
        {/* Environment Layer - Set Z-Index Low */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1),#000000_90%)] pointer-events-none z-0"></div>

        {/* Game World Layer - Higher Z-Index */}
        <div ref={worldRef} className="absolute will-change-transform z-10" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            <MapRenderer objects={MAP_OBJECTS} activeObjId={activeObj?.id || null} />

            {/* Remote Players Layer (Extracted) */}
            <RemotePlayersLayer 
                players={processedOtherPlayers} 
                nearbyPlayer={nearbyPlayer}
                setNearbyPlayer={setNearbyPlayer}
                battleActive={!!battleState?.active}
                onSendPvP={sendPvPInvite}
                myId={sessionIdRef.current}
            />

            {/* Secret Room Overlay */}
            <div 
                ref={teaRoomOverlayRef}
                className="absolute bg-ash-black z-30 transition-opacity duration-700 ease-in-out border-b-2 border-r-2 border-ash-dark"
                style={{
                    left: 0, top: 0,
                    width: 200, height: 250
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="text-[10px] font-mono text-ash-gray rotate-45">???</div>
                </div>
            </div>

            {/* Dynamic NPC: TEA */}
            <div
                ref={teaElemRef}
                className={`
                    absolute flex items-center justify-center z-20 will-change-transform
                    ${(!isTeaFollowing && !processedOtherPlayers.some(p => p.tea)) && activeObj?.id === 'npc-tea' ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : ''}
                `}
                style={{
                    width: (isTeaFollowing || processedOtherPlayers.some(p => p.tea)) ? PLAYER_SIZE : 40, 
                    height: (isTeaFollowing || processedOtherPlayers.some(p => p.tea)) ? PLAYER_SIZE : 40,
                    top: 0, 
                    left: 0,
                    transition: 'width 0.3s, height 0.3s'
                }}
            >
                {(isTeaFollowing || processedOtherPlayers.some(p => p.tea)) ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 font-black text-[10px] whitespace-nowrap tracking-wider uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)] bg-black/50 px-1 border border-amber-900/50">TEA</div>
                        <div className="absolute inset-0 bg-black rounded-full border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 fill-current relative z-10 p-1 animate-spin-slow">
                            <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
                        </svg>
                        <div className="absolute w-2 h-2 bg-white rounded-full animate-ping z-20"></div>
                        <div className="absolute w-2 h-2 bg-amber-100 rounded-full z-20"></div>
                    </div>
                ) : (
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-500/50 relative bg-black">
                        <img src="https://cdn.picui.cn/vip/2026/01/02/6957e8e438965.png" alt="TEA" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
                    </div>
                )}
            </div>

            {/* Player: Four-Pointed Star */}
            <div 
                ref={playerElemRef} 
                className="absolute z-40 transition-transform duration-75 ease-linear will-change-transform top-0 left-0 cursor-pointer pointer-events-auto" 
                style={{ width: PLAYER_SIZE, height: PLAYER_SIZE }}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowChatInput(true);
                }}
            >
                {/* My Chat Bubble */}
                {myChatMsg && (!myChatMsg.text.startsWith('[[') || myChatMsg.text.startsWith('[[ROOT::')) && (
                    <div className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 animate-bounce w-max max-w-[200px] rounded-sm leading-tight text-center whitespace-normal break-words ${
                        myChatMsg.text.startsWith('[[ROOT::') 
                        ? 'bg-amber-950/90 border-2 border-amber-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.6)] px-3 py-2' 
                        : 'bg-black/90 border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] px-2 py-1'
                    }`}>
                        {myChatMsg.text.startsWith('[[ROOT::') ? (
                            <>
                                <div className="flex items-center justify-center gap-1 border-b border-amber-500/50 pb-1 mb-1 text-[8px] font-black tracking-widest text-amber-500">
                                    <Crown size={10} /> CREATOR
                                    </div>
                                <div className="font-serif italic text-xs">
                                    {myChatMsg.text.slice(8, -2)}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500"></div>
                            </>
                        ) : (
                            <>
                                <div className="text-[10px]">{myChatMsg.text}</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-500"></div>
                            </>
                        )}
                    </div>
                )}

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
                    <div className="absolute inset-0 bg-black rounded-full border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 fill-current relative z-10 p-1">
                        <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
                    </svg>
                    <div className="absolute w-2 h-2 bg-white rounded-full animate-ping z-20"></div>
                    <div className="absolute w-2 h-2 bg-emerald-100 rounded-full z-20"></div>
                </div>
            </div>

            {/* Enemy */}
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

        {/* Game UI Layer (HUD, Modals, Chat Input) */}
        <GameUI 
            isOnline={isOnline}
            isLocalMode={!isEnemyDefeatedRef.current}
            isDuplicateName={isDuplicateNameDetected}
            playerName={playerName}
            playerPos={playerPosState}
            systemLogs={systemLogs}
            onlineCount={processedOtherPlayers.length}
            
            onShowPlayerList={() => setShowPlayerList(true)}
            onClosePlayerList={() => setShowPlayerList(false)}
            showPlayerList={showPlayerList}
            playerList={processedOtherPlayers}
            
            pvpInvite={pvpInvite}
            onAcceptPvP={acceptPvP}
            onRejectPvP={rejectPvP}
            
            myInviteSent={!!(myChatMsg?.text && myChatMsg.text.startsWith('[[DUEL_REQ'))}
            onCancelInvite={cancelPvPInvite}
            
            duplicateAlert={duplicateNameAlert}
            onDuplicateResolve={() => {
                setDuplicateNameAlert(false);
                if (onOpenGuestbook) onOpenGuestbook();
            }}
            
            showChatInput={showChatInput}
            setShowChatInput={setShowChatInput}
            chatInputValue={chatInputValue}
            setChatInputValue={setChatInputValue}
            onSendChat={handleSendChat}
            
            pendingLink={pendingLink}
            onConfirmLink={handleConfirmLink}
            onCancelLink={() => setPendingLink(null)}
            
            activeObj={activeObj}
            viewingExhibit={viewingExhibit}
            battleActive={!!battleState?.active}
            onInteract={handleInteract}
        />

        {/* Battle Interface */}
        {battleState?.active && (
            <BattleInterface 
                state={battleState}
                onAction={battleAction}
                onTutorialNext={handleTutorialNext}
                onVictoryConfirm={handleVictoryConfirm}
                language={language}
                nickname={playerName}
                enemyName={pvpTarget?.nickname}
            />
        )}

        {/* Exhibit Viewer Modal */}
        {viewingExhibit && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in" onClick={handleCloseViewer}>
                <div className="w-full max-w-4xl border-2 border-ash-light bg-ash-black relative flex flex-col md:flex-row shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden" onClick={e => e.stopPropagation()}>
                    <button onClick={handleCloseViewer} className="absolute top-2 right-2 p-2 text-ash-gray hover:text-white z-50">
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

        {/* Chat Toggle Button (Mobile/Tablet Only for easier access) handled in GameUI via prop if needed, 
            but kept here if logic requires it. Actually moved to GameUI. */}

        {!battleState?.active && !viewingExhibit && !isPreloading && !pendingLink && !showChatInput && !showPlayerList && (
            <VirtualJoystick 
                onMove={handleJoystickMove} 
                onStop={handleJoystickStop} 
            />
        )}
    </div>
  );
};

export default React.memo(RPGMap);

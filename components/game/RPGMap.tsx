
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RPGPosition, RPGObject, Language, RemotePlayer } from '../../types';
import { Maximize, X, MessageCircle, AlertTriangle, FastForward, Activity, Globe, Music, ExternalLink, MessageSquare, Users, Signal, Send, Swords, Skull, Ban, Crown } from 'lucide-react';
import VirtualJoystick from './VirtualJoystick';
import { MAP_WIDTH, MAP_HEIGHT, PLAYER_SIZE, SPEED, ENEMY_SPEED } from './rpg/constants';
import { BattleState } from './rpg/types';
import { MAP_OBJECTS } from './rpg/mapData';
import { TUTORIAL_STEPS } from './rpg/tutorialData';
import AssetLoader from './rpg/AssetLoader';
import MapRenderer from './rpg/MapRenderer';
import BattleInterface from './rpg/BattleInterface';

// API Configuration
const API_URL = 'https://cdn.zeroxv.cn/nova_api/api.php';
const HEARTBEAT_INTERVAL = 1500; // Faster polling for PvP
const MESSAGE_LIFETIME = 6000; // 6 seconds display time for local echo

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
  const hudPosRef = useRef<HTMLDivElement>(null);
  
  // Secret Room Overlay Ref
  const teaRoomOverlayRef = useRef<HTMLDivElement>(null);
  
  // Tea NPC Refs & State
  const teaPosRef = useRef<RPGPosition>({ x: 80, y: 150 }); 
  const teaElemRef = useRef<HTMLDivElement>(null);
  const [teaStage, setTeaStage] = useState(0); 
  const isTeaFollowing = teaStage >= 4;

  // Enemy Refs
  const enemyPosRef = useRef<RPGPosition>({ x: 1400, y: 300 });
  const enemyElemRef = useRef<HTMLDivElement>(null);
  const isEnemyDefeatedRef = useRef<boolean>(false);
  
  const activeObjRef = useRef<RPGObject | null>(null);
  const directionRef = useRef<'up'|'down'|'left'|'right'>('up');
  
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // React State for UI updates only
  const [activeObj, setActiveObj] = useState<RPGObject | null>(null);
  const [viewingExhibit, setViewingExhibit] = useState<RPGObject | null>(null);
  const [pendingLink, setPendingLink] = useState<{ url: string, title: string } | null>(null);
  const [direction, setDirection] = useState<'up'|'down'|'left'|'right'>('up');
  
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
  const sessionIdRef = useRef<string>(`user-${Math.floor(Math.random() * 1000000)}`);
  
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

  const playerName = (nickname || 'USR_01') + localSuffix;

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
      return otherPlayers.map(p => {
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
              // Only clear visible text bubbles locally. Protocol messages (starts with [[) are cleared by next heartbeat implicitly or action logic.
              // EXCEPTION: ROOT messages are visible chat, so they should expire.
              if (!myChatMsg.text.startsWith('[[') || myChatMsg.text.startsWith('[[ROOT::')) {
                  setMyChatMsg(null);
              }
          }, MESSAGE_LIFETIME);
          return () => clearTimeout(timer);
      }
  }, [myChatMsg]);

  // --- MULTIPLAYER HEARTBEAT & SYNC ---
  const sendHeartbeat = useCallback(async () => {
      if (isPreloading) return;

      try {
          const payload = {
              id: sessionIdRef.current,
              nickname: playerName,
              x: Math.round(playerPosRef.current.x),
              y: Math.round(playerPosRef.current.y),
              map: 'main',
              msg: myChatMsg?.text || null,
              msg_ts: myChatMsg?.ts || null
          };

          const res = await fetch(`${API_URL}?action=heartbeat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              const data = await res.json();
              setIsOnline(true);
              if (Array.isArray(data)) {
                  setOtherPlayers(data);
              }
          } else {
              setIsOnline(false);
          }
      } catch (e) {
          console.warn("Heartbeat failed", e);
          setIsOnline(false);
      }
  }, [isPreloading, playerName, myChatMsg]);

  // Polling Interval
  useEffect(() => {
      sendHeartbeat(); // Initial
      const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
      return () => clearInterval(interval);
  }, [sendHeartbeat]);

  // --- INCOMING SIGNAL PROCESSOR (Chat, Invite, Battle) ---
  useEffect(() => {
      if (processedOtherPlayers.length > 0) {
          const myId = sessionIdRef.current;

          // 1. Check for Invites (Receiver)
          // Ensure we don't process invites from ignored IDs (rejected recently OR JUST FOUGHT)
          const invite = processedOtherPlayers.find(p => p.msg === `[[DUEL_REQ::${myId}]]`);
          if (invite && !battleState?.active && !pvpInvite && !ignoredInvitesRef.current.has(invite.id)) {
              setPvpInvite(invite);
          }

          // 2. Check for Accept (Sender)
          const accept = processedOtherPlayers.find(p => p.msg === `[[DUEL_ACC::${myId}]]`);
          if (accept && !battleState?.active && !ignoredInvitesRef.current.has(accept.id)) {
              // Sender receives Accept -> Sender goes SECOND (turn: enemy)
              startPvPBattle(accept, false); 
              setMyChatMsg(null); // Clear my invite
          }

          // 3. Check for Reject (Sender)
          const reject = processedOtherPlayers.find(p => p.msg === `[[DUEL_REJ::${myId}]]`);
          if (reject && myChatMsg?.text?.includes(reject.id) && myChatMsg.text.startsWith('[[DUEL_REQ')) {
               setMyChatMsg(null);
               alert(`${reject.nickname} rejected your duel request.`);
          }

          // 4. Check for Combat Actions (If in battle)
          if (battleState?.active && pvpTarget) {
              const opponent = processedOtherPlayers.find(p => p.id === pvpTarget.id);
              
              // Protocol: [[ACT::TYPE::VAL::ID]]
              if (opponent && opponent.msg && opponent.msg.startsWith('[[ACT::')) {
                  const match = opponent.msg.match(/\[\[ACT::(.*?)::(.*?)::(.*?)\]\]/);
                  if (match) {
                      const [_, type, valStr, actionId] = match;
                      
                      // Check if this is a new action we haven't processed
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
          // If inviter is gone OR inviter is no longer sending the specific request msg
          if (!inviter || inviter.msg !== `[[DUEL_REQ::${sessionIdRef.current}]]`) {
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
      const defeated = localStorage.getItem('nova_enemy_defeated');
      isEnemyDefeatedRef.current = defeated === 'true';
      if (defeated === 'true' && enemyElemRef.current) {
          enemyElemRef.current.style.display = 'none';
      }

      const assets = MAP_OBJECTS.filter(obj => obj.imageUrl);
      assets.push({ id: 'npc-tea-asset', type: 'npc', x:0, y:0, width:0, height:0, imageUrl: 'https://free.picui.cn/free/2026/01/01/695673e4dfd7d.png' });

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
              imageUrl: 'https://free.picui.cn/free/2026/01/01/695673e4dfd7d.png',
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
          sendHeartbeat(); // Instant Push
          alert(`Duel request sent to ${nearbyPlayer.nickname}! Waiting for response...`);
      }
  };

  const acceptPvP = () => {
      if (pvpInvite) {
          setMyChatMsg({ text: `[[DUEL_ACC::${pvpInvite.id}]]`, ts: Date.now() });
          sendHeartbeat(); // Instant Push
          
          // Receiver goes FIRST (Turn = player)
          startPvPBattle(pvpInvite, true);
          setPvpInvite(null);
      }
  };

  const rejectPvP = () => {
      if (pvpInvite) {
          // Send Rejection Signal
          const rejMsg = `[[DUEL_REJ::${pvpInvite.id}]]`;
          setMyChatMsg({ text: rejMsg, ts: Date.now() });
          sendHeartbeat(); // Force push

          // Ignore this player's invites temporarily to prevent loop
          ignoredInvitesRef.current.add(pvpInvite.id);
          setTimeout(() => {
              ignoredInvitesRef.current.delete(pvpInvite.id);
          }, 10000); // 10 seconds ignore

          setPvpInvite(null);
      }
  };

  const cancelPvPInvite = () => {
      setMyChatMsg(null);
      sendHeartbeat();
  };

  // Helper to cleanup PvP State after match (Win or Lose)
  const cleanupPvPState = () => {
      if (pvpTarget) {
          // Ignore this opponent for 15 seconds to prevent accidental re-engagement loop
          ignoredInvitesRef.current.add(pvpTarget.id);
          setTimeout(() => {
              ignoredInvitesRef.current.delete(pvpTarget.id);
          }, 15000); 
      }
      setPvpTarget(null);
      setBattleState(null);
      setMyChatMsg(null); // Clear any combat signals
      sendHeartbeat();
  };

  const loseBattle = () => {
      if (pvpTarget) {
          // PvP Loss - Send Surrender Signal just in case
          const uniqueId = Date.now();
          const loseMsg = `[[ACT::LOSE::0::${uniqueId}]]`;
          setMyChatMsg({ text: loseMsg, ts: uniqueId });
          sendHeartbeat(); // Force push

          setLocalSuffix(' (战败者)');
          alert("DEFEAT: You have been marked as defeated.");
          cleanupPvPState();
      } else {
          // PvE Loss
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
          playerHp: 200,
          playerMaxHp: 200,
          playerShield: 0,
          enemyHp: 500,
          enemyMaxHp: 500,
          logs: ['>> HOSTILE DETECTED', '>> INITIATING COMBAT PROTOCOL'],
          cdCut: 0,
          cdStealth: 0,
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

          // Simple AI: 30% chance heavy attack, 70% normal
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
              logs: [log, ...prev.logs].slice(0, 8),
              animation: anim,
              animationKey: Date.now(),
              turn: 'player'
          };
      });
  };

  // isMyTurn param determines who acts first
  const startPvPBattle = (opponent: RemotePlayer, isMyTurn: boolean = false) => {
      setPvpTarget(opponent);
      setBattleState({
          active: true,
          turn: isMyTurn ? 'player' : 'enemy', 
          playerHp: 200,
          playerMaxHp: 200,
          playerShield: 0,
          enemyHp: 200,
          enemyMaxHp: 200,
          logs: [`>> DUEL START: ${opponent.nickname}`, `>> TURN: ${isMyTurn ? 'YOURS' : 'OPPONENT'}`],
          cdCut: 0,
          cdStealth: 0,
          tutorialStep: -1,
          showVictory: false,
          animation: undefined,
          animationKey: 0
      });
      keysPressed.current.clear();
  };

  // --- INCOMING BATTLE ACTION HANDLER ---
  const handleIncomingBattleAction = (type: string, value: number, actorName: string) => {
      if (!battleState) return;

      // Handle explicit End Game signals first
      if (type === 'WIN') {
          // Opponent claims they won -> I lost
          loseBattle();
          return;
      }
      if (type === 'LOSE') {
          // Opponent admits defeat -> I win
          setBattleState(prev => prev ? ({ ...prev, showVictory: true, enemyHp: 0, logs: [`>> ${actorName} SIGNAL LOST`, ...prev.logs].slice(0, 8) }) : null);
          return;
      }

      setBattleState(prev => {
          if (!prev || prev.playerHp <= 0) return prev;

          let newHp = prev.playerHp;
          let newShield = prev.playerShield;
          let newEnemyHp = prev.enemyHp;
          let log = "";
          let anim: BattleState['animation'] = undefined;

          if (type === 'ATK' || type === 'CUT') {
              // Opponent attacked ME
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
              
              // Check Defeat locally (failsafe, though attacker usually sends WIN)
              if (newHp <= 0) setTimeout(loseBattle, 1000);

          } else if (type === 'HEAL') {
              // Opponent healed themselves. Update their Phantom HP on my screen.
              newEnemyHp = Math.min(prev.enemyMaxHp, prev.enemyHp + value);
              log = `>> ${actorName} [REPAIR]: +${value} HP`;
          } else if (type === 'STL') {
              // Opponent used shield
              log = `>> ${actorName} [STEALTH]: SHIELD UP`;
          }

          return {
              ...prev,
              playerHp: newHp,
              playerShield: newShield,
              enemyHp: newEnemyHp,
              logs: [log, ...prev.logs].slice(0, 8),
              animation: anim,
              animationKey: Date.now(),
              turn: 'player' // Opponent moved, now IT IS MY TURN
          };
      });
  };

  // --- LOCAL BATTLE ACTION (Sending) ---
  const battleAction = (action: 'attack' | 'heal' | 'cut' | 'stealth') => {
      if (!battleState) return;
      
      // Strict Turn Check for PvP
      if (pvpTarget && battleState.turn !== 'player') {
          return; 
      }

      let newLog = '';
      let newEnemyHp = battleState.enemyHp;
      let newPlayerHp = battleState.playerHp;
      let newPlayerShield = battleState.playerShield;
      let newCdCut = Math.max(0, battleState.cdCut - 1);
      let newCdStealth = Math.max(0, battleState.cdStealth - 1);
      
      let signalType = "";
      let signalValue = 0;

      if (action === 'attack') {
          const dmg = Math.floor(Math.random() * 10) + 15;
          newEnemyHp = Math.max(0, battleState.enemyHp - dmg);
          newLog = `>> ${playerName} [ATTACK]: ${dmg} DMG`;
          signalType = "ATK";
          signalValue = dmg;
      } else if (action === 'heal') {
          const heal = Math.floor(Math.random() * 20) + 40;
          newPlayerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + heal);
          newLog = `>> ${playerName} [REPAIR]: +${heal} HP`;
          signalType = "HEAL";
          signalValue = heal;
      } else if (action === 'cut') {
          if (battleState.cdCut > 0) return;
          const dmg = Math.floor(Math.random() * 30) + 80;
          newEnemyHp = Math.max(0, battleState.enemyHp - dmg);
          newLog = `>> ${playerName} [CUT_DATA]: ${dmg} CRITICAL`;
          newCdCut = 3;
          signalType = "CUT";
          signalValue = dmg;
      } else if (action === 'stealth') {
          if (battleState.cdStealth > 0) return;
          const shieldGain = 50;
          newPlayerShield += shieldGain;
          newLog = `>> ${playerName} [DATA_STEALTH]: +${shieldGain} ARMOR`;
          newCdStealth = 3;
          signalType = "STL";
          signalValue = shieldGain;
      }

      // Update Local UI
      setBattleState(prev => prev ? ({
          ...prev,
          playerHp: newPlayerHp,
          playerShield: newPlayerShield,
          enemyHp: newEnemyHp,
          logs: [newLog, ...prev.logs].slice(0, 8),
          cdCut: newCdCut,
          cdStealth: newCdStealth,
          animation: action,
          animationKey: Date.now(),
          turn: pvpTarget ? 'enemy' : 'enemy' // Pass turn to enemy
      }) : null);

      // --- SEND SIGNAL IF PVP ---
      if (pvpTarget) {
          const uniqueId = Date.now();
          const protocolMsg = `[[ACT::${signalType}::${signalValue}::${uniqueId}]]`;
          setMyChatMsg({ text: protocolMsg, ts: uniqueId });
          
          // Force immediate push to server for responsiveness
          setTimeout(sendHeartbeat, 0); 

          if (newEnemyHp <= 0) {
              // If I defeated the enemy locally, send a WIN signal to force their defeat
              setTimeout(() => {
                  const winId = Date.now() + 10;
                  const winMsg = `[[ACT::WIN::0::${winId}]]`;
                  setMyChatMsg({ text: winMsg, ts: winId });
                  sendHeartbeat();
                  
                  setBattleState(prev => prev ? ({ ...prev, showVictory: true }) : null);
              }, 500);
          }
      } else {
          // PvE Logic (Enemy Turn Automation)
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
          // PvP Win
          alert("VICTORY! HONOR PRESERVED.");
          cleanupPvPState();
      } else {
          // PvE Win
          localStorage.setItem('nova_enemy_defeated', 'true');
          isEnemyDefeatedRef.current = true;
          setBattleState(null);
          if (enemyElemRef.current) enemyElemRef.current.style.display = 'none';
      }
  };

  const handleSendChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (chatInputValue.trim()) {
          let msg = chatInputValue.trim();
          
          // Hidden Author Command
          if (msg.startsWith('/root ')) {
              msg = `[[ROOT::${msg.slice(6)}]]`;
          }

          setMyChatMsg({ text: msg, ts: Date.now() });
          setChatInputValue("");
          setShowChatInput(false);
          sendHeartbeat(); // Push update immediately
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
              if (teaStage < 4) { // 4 is hardcoded length of teaDialogues
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
      if (isTeaFollowing) {
          const px = playerPosRef.current.x;
          const py = playerPosRef.current.y;
          const tx = teaPosRef.current.x;
          const ty = teaPosRef.current.y;
          
          // Target position: slightly behind player
          const distX = px - tx;
          const distY = py - ty;
          const distance = Math.sqrt(distX * distX + distY * distY);
          
          if (distance > 60) {
              const moveSpeed = SPEED * 0.95; // Slightly slower
              teaPosRef.current.x += (distX / distance) * moveSpeed;
              teaPosRef.current.y += (distY / distance) * moveSpeed;
              
              if (teaElemRef.current) {
                  teaElemRef.current.style.transform = `translate3d(${teaPosRef.current.x}px, ${teaPosRef.current.y}px, 0)`;
              }
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
  }, [viewingExhibit, isPreloading, checkCollision, findInteractionTarget, findNearbyPlayer, nearbyPlayer, battleState, isTeaFollowing, pendingLink, showChatInput, showPlayerList]);

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
        {/* We use the memoized MapRenderer here */}
        <div ref={worldRef} className="absolute will-change-transform z-10" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            <MapRenderer objects={MAP_OBJECTS} activeObjId={activeObj?.id || null} />

            {/* Remote Players (Ghosts) - Rendered from memoized list */}
            {processedOtherPlayers.map(p => (
                <div 
                    key={p.id}
                    className="absolute top-0 left-0 z-30 flex flex-col items-center transition-transform duration-[2000ms] ease-linear will-change-transform cursor-pointer"
                    style={{ 
                        width: PLAYER_SIZE, 
                        height: PLAYER_SIZE,
                        transform: `translate3d(${p.safeX}px, ${p.safeY}px, 0)` 
                    }}
                    onClick={(e) => {
                        // Manual Click fallback if joystick disabled
                        e.stopPropagation();
                        setNearbyPlayer(p);
                    }}
                >
                    {/* Remote Chat Bubble - No Time Expiry Check to fix visibility issues */}
                    {p.msg && (!p.msg.startsWith('[[') || p.msg.startsWith('[[ROOT::')) && (
                        <div className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 animate-bounce w-max max-w-[200px] rounded-sm leading-tight text-center whitespace-normal break-words ${
                            p.msg.startsWith('[[ROOT::') 
                            ? 'bg-amber-950/90 border-2 border-amber-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.6)] px-3 py-2' 
                            : 'bg-black/90 border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] px-2 py-1'
                        }`}>
                            {p.msg.startsWith('[[ROOT::') ? (
                                <>
                                    <div className="flex items-center justify-center gap-1 border-b border-amber-500/50 pb-1 mb-1 text-[8px] font-black tracking-widest text-amber-500">
                                        <Crown size={10} /> CREATOR
                                    </div>
                                    <div className="font-serif italic text-xs">
                                        {p.msg.slice(8, -2)}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500"></div>
                                </>
                            ) : (
                                <>
                                    <div className="text-[10px]">{p.msg}</div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-500"></div>
                                </>
                            )}
                        </div>
                    )}

                    {/* PvP Invite Indicator bubble */}
                    {p.msg && p.msg.startsWith('[[DUEL_REQ') && (
                        <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-white text-[9px] px-1 whitespace-nowrap z-50 animate-pulse">
                            ⚔️ CHALLENGING
                        </div>
                    )}

                    <div className="absolute -top-6 text-[8px] font-mono text-cyan-500 font-bold bg-black/50 px-1 border border-cyan-900/50 whitespace-nowrap">
                        {p.nickname} <span className="animate-pulse">///</span>
                    </div>
                    
                    {/* Interaction Trigger for PvP */}
                    {nearbyPlayer?.id === p.id && !battleState?.active && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                sendPvPInvite();
                            }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 border border-red-400 shadow-hard hover:scale-110 transition-transform z-50 flex items-center gap-1"
                        >
                            <Swords size={10} /> DUEL
                        </button>
                    )}
                    
                    <div className="w-full h-full relative flex items-center justify-center opacity-60">
                        {/* Ghost Glow */}
                        <div className="absolute inset-0 bg-cyan-900/30 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
                        
                        <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 fill-current relative z-10 p-1">
                            <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
                        </svg>
                    </div>
                </div>
            ))}

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
                    ${!isTeaFollowing && activeObj?.id === 'npc-tea' ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : ''}
                `}
                style={{
                    width: isTeaFollowing ? PLAYER_SIZE : 40, 
                    height: isTeaFollowing ? PLAYER_SIZE : 40,
                    top: 0, 
                    left: 0,
                    transition: 'width 0.3s, height 0.3s'
                }}
            >
                {isTeaFollowing ? (
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
                        <img src="https://free.picui.cn/free/2026/01/01/695673e4dfd7d.png" alt="TEA" className="w-full h-full object-cover" />
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

        {/* HUD */}
        <div className="fixed top-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/50 border border-ash-gray/30 px-3 py-1 text-[10px] font-mono text-ash-light backdrop-blur-sm">
                <span className="text-emerald-500 font-bold">STATUS:</span> {isOnline ? 'ONLINE' : 'CONNECTING...'}
            </div>
            <div ref={hudPosRef} className="bg-black/50 border border-ash-gray/30 px-3 py-1 text-[10px] font-mono text-ash-gray backdrop-blur-sm">
                POS: 500, 700
            </div>
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
            {/* Online Players Counter & Trigger */}
            <button 
                onClick={() => setShowPlayerList(true)}
                className="bg-black/50 border border-cyan-500/30 px-3 py-1 text-[10px] font-mono text-cyan-400 backdrop-blur-sm flex items-center gap-2 pointer-events-auto hover:bg-cyan-950/30 transition-colors"
            >
                <Users size={12} />
                <span>ECHOES: {otherPlayers.length}</span>
                <Signal size={10} className={`animate-pulse ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            </button>
        </div>

        {/* Sender Cancel PvP Button */}
        {myChatMsg?.text.startsWith('[[DUEL_REQ') && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[160] animate-slide-in">
                <button 
                    onClick={cancelPvPInvite}
                    className="bg-red-950/90 border-2 border-red-500 text-red-100 font-bold px-4 py-2 flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-red-900 transition-colors uppercase text-xs"
                >
                    <Ban size={14} /> CANCEL INVITE
                </button>
            </div>
        )}

        {/* PvP Invite Modal */}
        {pvpInvite && (
            <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => {}}>
                <div className="bg-ash-black border-2 border-red-500 p-6 shadow-[0_0_30px_rgba(220,38,38,0.5)] w-full max-w-sm text-center relative animate-shake-violent">
                    <Swords size={48} className="mx-auto text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-2">DUEL CHALLENGE</h2>
                    <p className="text-ash-light font-mono text-sm mb-6">
                        <span className="text-emerald-400 font-bold">{pvpInvite.nickname}</span> wants to battle you!
                    </p>
                    <div className="flex gap-4">
                        <button onClick={acceptPvP} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 uppercase tracking-widest transition-colors shadow-hard">
                            ACCEPT
                        </button>
                        <button onClick={rejectPvP} className="flex-1 border border-ash-gray text-ash-gray hover:text-ash-light py-3 uppercase tracking-widest transition-colors">
                            DECLINE
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Player List Modal */}
        {showPlayerList && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPlayerList(false)}>
                <div className="bg-ash-black border-2 border-cyan-500 p-6 shadow-hard w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowPlayerList(false)} className="absolute top-2 right-2 text-cyan-500 hover:text-cyan-300"><X size={16} /></button>
                    <h3 className="text-cyan-500 font-black mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} /> SIGNAL_TRACING
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* Self */}
                        <div className="flex justify-between items-center text-xs font-mono border-b border-cyan-900/30 pb-1 text-emerald-400">
                            <span>{playerName} (YOU)</span>
                            <span>[{Math.round(playerPosRef.current.x)}, {Math.round(playerPosRef.current.y)}]</span>
                        </div>
                        {/* Others - Use processed list */}
                        {processedOtherPlayers.map(p => (
                            <div key={p.id} className="flex justify-between items-center text-xs font-mono border-b border-cyan-900/30 pb-1 text-cyan-300/80">
                                <span>{p.nickname}</span>
                                <span>[{Math.round(p.safeX)}, {Math.round(p.safeY)}]</span>
                            </div>
                        ))}
                        {otherPlayers.length === 0 && <div className="text-[10px] text-cyan-900 italic py-2">NO_ECHOES_DETECTED</div>}
                    </div>
                </div>
            </div>
        )}

        {/* Chat Input Modal */}
        {showChatInput && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowChatInput(false)}>
                <div 
                    className="bg-black border-2 border-emerald-500 p-4 w-full max-w-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] relative"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-[10px] font-mono text-emerald-500 mb-2 uppercase flex items-center gap-2">
                        <MessageSquare size={12} /> GLOBAL_CHAT // BROADCAST
                    </div>
                    <form onSubmit={handleSendChat} className="flex gap-2">
                        <input 
                            type="text" 
                            autoFocus
                            value={chatInputValue}
                            onChange={(e) => setChatInputValue(e.target.value)}
                            placeholder="Type message..."
                            maxLength={60}
                            className="flex-1 bg-emerald-950/20 border-b border-emerald-500/50 text-emerald-100 text-sm p-2 outline-none focus:border-emerald-400 placeholder:text-emerald-500/30"
                        />
                        <button type="submit" className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 px-3 hover:bg-emerald-500 hover:text-black transition-colors">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* Interaction Prompt */}
        {activeObj && !viewingExhibit && !battleState?.active && !pendingLink && !showChatInput && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <button 
                    onClick={handleInteract}
                    className="bg-emerald-600 text-black px-6 py-3 font-bold uppercase tracking-widest border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2"
                >
                    {activeObj.type === 'terminal' ? (activeObj.id === 'terminal-guestbook' ? <MessageSquare size={16} /> : 'LINK') : activeObj.type === 'npc' ? 'TALK' : 'INSPECT'} [SPACE]
                </button>
            </div>
        )}

        {/* External Link Confirmation Modal */}
        {pendingLink && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setPendingLink(null)}>
                <div className="w-full max-w-sm bg-black border-2 border-sky-500 p-6 shadow-[0_0_30px_rgba(56,189,248,0.2)] relative" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-2 right-2">
                        <button onClick={() => setPendingLink(null)} className="text-sky-700 hover:text-sky-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-sky-500/50 flex items-center justify-center bg-sky-950/20 animate-pulse">
                            <ExternalLink size={32} className="text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-sky-400 uppercase tracking-widest mb-1">
                                {pendingLink.title}
                            </h2>
                            <p className="text-xs font-mono text-sky-600/80">
                                ESTABLISHING_EXTERNAL_CONNECTION...
                            </p>
                        </div>
                    </div>

                    <div className="bg-sky-900/10 border border-sky-800/30 p-3 mb-6 text-[10px] font-mono text-sky-300/70 text-center break-all">
                        TARGET: {pendingLink.url}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleConfirmLink}
                            className="flex-1 bg-sky-600 hover:bg-sky-500 text-black font-bold py-3 uppercase tracking-wider transition-colors shadow-hard"
                        >
                            CONFIRM
                        </button>
                        <button 
                            onClick={() => setPendingLink(null)}
                            className="flex-1 border border-sky-800 text-sky-600 hover:text-sky-400 hover:border-sky-500 py-3 uppercase tracking-wider transition-colors"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
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
                // Pass Enemy info override if PvP
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

        {/* Chat Toggle Button (Mobile/Tablet Only for easier access) */}
        {!battleState?.active && !viewingExhibit && !pendingLink && (
            <button 
                onClick={() => setShowChatInput(true)}
                className="fixed bottom-32 right-8 z-[60] bg-black/80 text-emerald-400 p-3 rounded-full border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95 transition-all lg:hidden"
            >
                <MessageCircle size={24} />
            </button>
        )}

        {!battleState?.active && !viewingExhibit && !isPreloading && !pendingLink && !showChatInput && !showPlayerList && (
            <VirtualJoystick 
                onMove={handleJoystickMove} 
                onStop={handleJoystickStop} 
            />
        )}
    </div>
  );
};

export default RPGMap;

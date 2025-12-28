
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RPGPosition, RPGObject, Language } from '../../types';
import { Image as ImageIcon, Maximize, X, MessageCircle, Wifi, AlertTriangle, CheckCircle2, Loader2, HardDrive, FastForward } from 'lucide-react';
import VirtualJoystick from './VirtualJoystick';

interface RPGMapProps {
  language: Language;
  onNavigate?: (tab: string) => void;
}

// Map Config
const MAP_WIDTH = 1800; // Expanded width for the larger Fan Art Sector
const MAP_HEIGHT = 800;
const PLAYER_SIZE = 32;
const SPEED = 5;

// Gallery Exhibits Definition
const MAP_OBJECTS: RPGObject[] = [
    // --- MAIN HALL EXHIBITS ---

    // Guide NPC - Byaki AI (Main Hall Center-ish)
    { 
        id: 'npc-guide-byaki', 
        x: 580, y: 550, 
        width: 40, height: 40, 
        type: 'npc', 
        label: 'GUIDE', 
        color: 'text-emerald-300',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/69513b509851e.jpg',
        description: {
            'zh-CN': '【系统引导】\n\n1. 操作：使用 WASD / 方向键 或 屏幕摇杆 移动，接近物体按 [SPACE] 或点击按钮交互。\n\n2. 坐标：当前位于「泛宇」(Pan-Universe)。\n\n3. 说明：这里既非「现世」，亦非「主宇」。它是一个独立于时间轴之外的数据切片。\n\n要想知道泛宇究竟是什么... 请持续关注后续的剧情更新。',
            'zh-TW': '【系統引導】\n\n1. 操作：使用 WASD / 方向鍵 或 螢幕搖桿 移動，接近物體按 [SPACE] 或點擊按鈕交互。\n\n2. 坐標：當前位於「泛宇」(Pan-Universe)。\n\n3. 說明：這裡既非「現世」，亦非「主宇」。它是一個獨立於時間軸之外的數據切片。\n\n要想知道泛宇究竟是什麼... 請持續關注後續的劇情更新。',
            'en': '[SYSTEM GUIDE]\n\n1. CONTROLS: WASD / Arrows / Virtual Stick to move. [SPACE] or Tap to interact.\n\n2. LOC: "Pan-Universe".\n\n3. INFO: Neither Reality nor Main Universe. An independent data slice outside the timeline.\n\nTo learn what the Pan-Universe truly is... please stay tuned for future updates.'
        }
    },

    // Center Pedestal - LOGO
    { 
        id: 'exhibit-logo', 
        x: 480, y: 350, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'NOVA_CORE', 
        color: 'text-ash-light',
        imageUrl: 'https://free.picui.cn/free/2025/12/08/6936e856897d6.png',
        description: {
            'zh-CN': 'Nova Labs 标识 ',
            'zh-TW': 'Nova Labs 標識 ',
            'en': 'Nova Labs Emblem '
        }
    },
    
    // Top Right Corner - Zeri Maid
    { 
        id: 'exhibit-zeri', 
        x: 850, y: 100, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'ENCRYPTED_FILE', 
        color: 'text-fuchsia-400',
        imageUrl: 'https://free.picui.cn/free/2025/12/13/693ce46f44fd2.jpg',
        description: {
            'zh-CN': '黑历史数据 // 绝对机密 、零点最终还是找回了这张图片。',
            'zh-TW': '黑歷史數據 // 絕對機密 ',
            'en': 'BLACK_HISTORY // TOP SECRET '
        }
    },

    // Top Left - Byaki Avatar
    { 
        id: 'exhibit-byaki', 
        x: 150, y: 100, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'BYAKI_TERM', 
        color: 'text-emerald-400',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/69513b509851e.jpg',
        description: {
            'zh-CN': '白栖的终端头像数据 // 记录于档案建立之初。',
            'zh-TW': '白栖的終端頭像數據 // 記錄於檔案建立之初。',
            'en': 'Byaki\'s Terminal Avatar // Recorded at archive inception.'
        }
    },

    // Left Middle - Point Standard
    { 
        id: 'exhibit-point', 
        x: 100, y: 450, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'POINT_STD', 
        color: 'text-blue-400',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/69514ed472fda.png',
        description: {
            'zh-CN': '零点 // 标准记录影像。',
            'zh-TW': '零點 // 標準記錄影像。',
            'en': 'Point // Standard Record Image.'
        }
    },

    // Bottom Right - Dusk Watch
    { 
        id: 'exhibit-watch', 
        x: 850, y: 650, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'MEM_WATCH', 
        color: 'text-ash-gray',
        imageUrl: 'https://free.picui.cn/free/2025/12/12/693b069e37e26.png',
        description: {
            'zh-CN': '暮雨的怀表 // “宁静地思考”。',
            'zh-TW': '暮雨的懷錶 // “寧靜地思考”。',
            'en': 'Dusk\'s Pocket Watch // "Peaceful Thinking".'
        }
    },

    // --- FAN ART SECTOR (Expanded) ---
    
    // Center Left - Point Main V2 (New)
    { 
        id: 'exhibit-point-main-v2', 
        x: 1330, y: 380, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'POINT_V2', 
        color: 'text-blue-300',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141d2121e8.png',
        description: {
            'zh-CN': '零点 (Main Ver.) // 另一种姿态记录。',
            'zh-TW': '零點 (Main Ver.) // 另一種姿態記錄。',
            'en': 'Point (Main Ver.) // Alternative stance record.'
        }
    },

    // -- Top Row --

    { 
        id: 'exhibit-zelo-pyo', 
        x: 1200, y: 180, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'ZELO_PYO', 
        color: 'text-amber-200',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/6951401cc2492.png',
        description: {
            'zh-CN': '泽洛和普忧 // 温馨的日常一刻。',
            'zh-TW': '澤洛和普憂 // 溫馨的日常一刻。',
            'en': 'Zelo & Pyo // A heartwarming daily moment.'
        }
    },
    { 
        id: 'exhibit-fumo-zelo', 
        x: 1320, y: 180, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'FUMO_ZELO', 
        color: 'text-amber-200',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/6951403272a00.png',
        description: {
            'zh-CN': 'fumo泽洛 (After Ver.) // 软乎乎的。',
            'zh-TW': 'fumo澤洛 (After Ver.) // 軟乎乎的。',
            'en': 'Fumo Zelo (After Ver.) // Soft and squishy.'
        }
    },
    { 
        id: 'exhibit-stars-after', 
        x: 1440, y: 180, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'STAR_VIS', 
        color: 'text-amber-200',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141ce09665.jpg',
        description: {
            'zh-CN': '来自星星 (After Ver.) // 仰望星空。',
            'zh-TW': '來自星星 (After Ver.) // 仰望星空。',
            'en': 'From Stars (After Ver.) // Looking up at the starry sky.'
        }
    },
    { 
        id: 'exhibit-zelo-after', 
        x: 1560, y: 180, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'ZELO_AFT', 
        color: 'text-amber-200',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141ce7c80e.jpg',
        description: {
            'zh-CN': 'After 泽洛 // 时间线变动后的记录。',
            'zh-TW': 'After 澤洛 // 時間線變動後的記錄。',
            'en': 'After Zelo // Record after timeline divergence.'
        }
    },
    { 
        id: 'exhibit-point-main', 
        x: 1680, y: 180, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'POINT_M', 
        color: 'text-blue-300',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141d14b818.png',
        description: {
            'zh-CN': '零点 (Main Ver.) // 初始设定。',
            'zh-TW': '零點 (Main Ver.) // 初始設定。',
            'en': 'Point (Main Ver.) // Initial setting.'
        }
    },

    // -- Bottom Row --

    { 
        id: 'exhibit-group-zelo', 
        x: 1200, y: 600, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'GRP_ZELO', 
        color: 'text-amber-300',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141d39388a.jpg',
        description: {
            'zh-CN': '群友泽洛 (After Ver.) // 社区创作。',
            'zh-TW': '群友澤洛 (After Ver.) // 社區創作。',
            'en': 'Group Friend Zelo (After Ver.) // Community creation.'
        }
    },
    { 
        id: 'exhibit-furry-zelo-after', 
        x: 1320, y: 600, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'FUR_ZELO', 
        color: 'text-amber-500',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141d31a0d3.jpg',
        description: {
            'zh-CN': 'Furry 泽洛 (After Ver.) // 毛茸茸的变体。',
            'zh-TW': 'Furry 澤洛 (After Ver.) // 毛茸茸的變體。',
            'en': 'Furry Zelo (After Ver.) // Fluffy variant.'
        }
    },
    { 
        id: 'exhibit-zelo-craft', 
        x: 1440, y: 600, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'CRAFT_Z', 
        color: 'text-pink-300',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141d45e52a.jpg',
        description: {
            'zh-CN': '泽洛小手工 // 特别感谢 uuz。',
            'zh-TW': '澤洛小手工 // 特別感謝 uuz。',
            'en': 'Zelo Craft // Special thanks to uuz.'
        }
    },
    { 
        id: 'exhibit-furry-zelo-sec', 
        x: 1560, y: 600, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'FUR_SEC', 
        color: 'text-amber-600',
        imageUrl: 'https://cdn.zeroxv.cn/sc/d963.jpg',
        description: {
            'zh-CN': 'Furry 泽洛 (二次设定) // 另一种可能。',
            'zh-TW': 'Furry 澤洛 (二次設定) // 另一種可能。',
            'en': 'Furry Zelo (Secondary) // Another possibility.'
        }
    },
    { 
        id: 'exhibit-cute-point', 
        x: 1680, y: 600, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'CUTE_PT', 
        color: 'text-blue-200',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/695141ce69502.jpg',
        description: {
            'zh-CN': '萌萌零点 // 可爱暴击。',
            'zh-TW': '萌萌零點 // 可愛暴擊。',
            'en': 'Cute Point // Critical Cuteness.'
        }
    },

    // --- WALLS ---

    // Main Hall Outer Walls (Top/Bottom)
    { id: 'w_top', x: 0, y: 0, width: 1000, height: 50, type: 'wall' }, 
    { id: 'w_bottom', x: 0, y: 750, width: 1000, height: 50, type: 'wall' }, 
    { id: 'w_left', x: 0, y: 0, width: 50, height: 800, type: 'wall' }, 
    
    // Main Hall Right Wall (Split for corridor entrance at y: 350-450)
    { id: 'w_right_top', x: 950, y: 0, width: 50, height: 350, type: 'wall' },
    { id: 'w_right_bottom', x: 950, y: 450, width: 50, height: 350, type: 'wall' },

    // Corridor Walls (Connecting Main Hall to Fan Room)
    { id: 'corr_top', x: 1000, y: 350, width: 150, height: 50, type: 'wall' },
    { id: 'corr_bottom', x: 1000, y: 450, width: 150, height: 50, type: 'wall' },

    // Fan Art Room Walls (Box at x: 1150 to 1750)
    // Top Wall of Fan Room (y: 100)
    { id: 'fan_top', x: 1150, y: 100, width: 600, height: 50, type: 'wall' },
    // Bottom Wall of Fan Room (y: 700)
    { id: 'fan_bottom', x: 1150, y: 700, width: 600, height: 50, type: 'wall' },
    // Right Wall of Fan Room
    { id: 'fan_right', x: 1750, y: 100, width: 50, height: 650, type: 'wall' },
    // Left Wall Segments of Fan Room
    { id: 'fan_left_top', x: 1150, y: 100, width: 50, height: 250, type: 'wall' }, // Connects to corridor top (350)
    { id: 'fan_left_bottom', x: 1150, y: 500, width: 50, height: 250, type: 'wall' }, 

    // Pillars (Decorations in Main Hall)
    { id: 'p1', x: 200, y: 200, width: 50, height: 400, type: 'wall' },
    { id: 'p2', x: 750, y: 200, width: 50, height: 400, type: 'wall' }
];

const RPGMap: React.FC<RPGMapProps> = ({ language, onNavigate }) => {
  const [playerPos, setPlayerPos] = useState<RPGPosition>({ x: 500, y: 700 }); // Start at bottom center of Main Hall
  const [activeObj, setActiveObj] = useState<RPGObject | null>(null);
  const [viewingExhibit, setViewingExhibit] = useState<RPGObject | null>(null);
  const [direction, setDirection] = useState<'up'|'down'|'left'|'right'>('up');
  
  // Resource Monitoring State
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());
  const [failedAssets, setFailedAssets] = useState<Set<string>>(new Set());
  
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const mapRef = useRef<HTMLDivElement>(null);

  // Compute numbered labels for exhibits
  // M-xx for Main Hall (x < 1050), F-xx for Fan Art (x >= 1050)
  const objectsWithIndex = useMemo(() => {
      let mCount = 0;
      let fCount = 0;
      return MAP_OBJECTS.map(obj => {
          if (obj.type !== 'exhibit') return obj;
          
          const isFan = obj.x > 1050;
          let displayNum = '';
          if (isFan) {
              fCount++;
              displayNum = `F-${String(fCount).padStart(2, '0')}`;
          } else {
              mCount++;
              displayNum = `M-${String(mCount).padStart(2, '0')}`;
          }
          
          return {
              ...obj,
              displayNumber: displayNum
          };
      });
  }, []);

  // Calculate total images to load (exhibits + npc)
  const totalAssets = MAP_OBJECTS.filter(obj => obj.imageUrl).length;

  // Handle Image Load (Can be called from Preloader or lazy load)
  const handleImageLoad = (id: string) => {
      setLoadedAssets(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
      });
  };

  // Pre-load Logic
  useEffect(() => {
      const assets = MAP_OBJECTS.filter(obj => obj.imageUrl);
      const total = assets.length;
      if (total === 0) {
          setIsPreloading(false);
          return;
      }

      // Check if assets were cached in a previous session
      const isCached = localStorage.getItem('nova_assets_cached') === 'true';

      // De-duplicate URLs for network efficiency
      const uniqueUrls = Array.from(new Set(assets.map(a => a.imageUrl!)));
      
      const promises = uniqueUrls.map(url => {
          return new Promise<void>((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                  // Find all objects with this URL and mark them as loaded
                  const relatedIds = assets.filter(a => a.imageUrl === url).map(a => a.id);
                  setLoadedAssets(prev => {
                      const next = new Set(prev);
                      relatedIds.forEach(id => next.add(id));
                      return next;
                  });
                  resolve();
              };
              img.onerror = () => {
                  const relatedIds = assets.filter(a => a.imageUrl === url).map(a => a.id);
                  setFailedAssets(prev => {
                      const next = new Set(prev);
                      relatedIds.forEach(id => next.add(id));
                      return next;
                  });
                  resolve(); // Resolve even on error to continue
              };
          });
      });

      Promise.all(promises).then(() => {
          // Mark as cached for future visits
          localStorage.setItem('nova_assets_cached', 'true');
          
          // Add a small delay for smooth transition (reduced if cached)
          const delay = isCached ? 0 : 800;
          setTimeout(() => {
              setIsPreloading(false);
          }, delay);
      });

  }, []);

  // Input Handling
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

  // Collision Logic
  const checkCollision = (x: number, y: number) => {
      // Boundaries
      if (x < 0 || x + PLAYER_SIZE > MAP_WIDTH || y < 0 || y + PLAYER_SIZE > MAP_HEIGHT) return true;
      
      // Objects
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
  };

  // Interaction Logic
  const checkInteraction = (x: number, y: number) => {
      let nearest: RPGObject | null = null;
      let minDist = 70; // Interaction radius

      for (const obj of MAP_OBJECTS) {
          // Allow exhibit AND npc
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
      setActiveObj(nearest);
  };

  // Game Loop
  const gameLoop = useCallback(() => {
      if (viewingExhibit || isPreloading) return; // Pause game when viewing or loading

      let dx = 0;
      let dy = 0;

      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) dy -= SPEED;
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) dy += SPEED;
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) dx -= SPEED;
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) dx += SPEED;

      if (dx !== 0 || dy !== 0) {
          if (Math.abs(dx) > Math.abs(dy)) {
              setDirection(dx > 0 ? 'right' : 'left');
          } else {
              setDirection(dy > 0 ? 'down' : 'up');
          }

          setPlayerPos(prev => {
              let nextX = prev.x + dx;
              let nextY = prev.y + dy;

              if (checkCollision(nextX, prev.y)) nextX = prev.x;
              if (checkCollision(nextX, nextY)) nextY = prev.y;

              checkInteraction(nextX, nextY);
              return { x: nextX, y: nextY };
          });
      }

      requestRef.current = requestAnimationFrame(gameLoop);
  }, [viewingExhibit, isPreloading]);

  useEffect(() => {
      requestRef.current = requestAnimationFrame(gameLoop);
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [gameLoop]);

  // Interaction Handler
  const handleInteract = () => {
      if (activeObj && (activeObj.type === 'exhibit' || activeObj.type === 'npc')) {
          setViewingExhibit(activeObj);
      }
  };

  useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
          if (e.code === 'Space' || e.code === 'Enter') {
              if (viewingExhibit) {
                  setViewingExhibit(null); // Close on space
              } else {
                  handleInteract();
              }
          }
          if (e.code === 'Escape' && viewingExhibit) {
              setViewingExhibit(null);
          }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeObj, viewingExhibit]);

  // Viewport centering
  const viewportStyle = {
      transform: `translate(${window.innerWidth/2 - playerPos.x}px, ${window.innerHeight/2 - playerPos.y}px)`
  };

  // --- Preloader Render ---
  if (isPreloading) {
      const percentage = Math.floor(((loadedAssets.size + failedAssets.size) / totalAssets) * 100);
      
      return (
          <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center font-mono select-none z-[100] relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-hard opacity-10 animate-[pulse_4s_infinite]"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-8">
                  <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                      <HardDrive size={48} className="text-emerald-500 relative z-10 animate-bounce" />
                  </div>

                  <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs font-bold text-ash-light uppercase tracking-widest">
                          <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> DOWNLOADING_ASSETS</span>
                          <span className="text-emerald-500">{percentage}%</span>
                      </div>
                      
                      <div className="w-full h-2 bg-ash-dark border border-ash-gray/30 overflow-hidden relative">
                          <div 
                              className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                              style={{ width: `${percentage}%` }}
                          ></div>
                          {/* Glitch bar */}
                          <div className="absolute top-0 bottom-0 w-1 bg-white/50 animate-[shimmer_2s_infinite]" style={{ left: `${percentage}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-ash-gray/50 font-mono">
                          <span>FILES: {loadedAssets.size + failedAssets.size} / {totalAssets}</span>
                          <span>CACHING_TEXTURES...</span>
                      </div>
                  </div>

                  {failedAssets.size > 0 && (
                      <div className="text-[10px] text-red-500 font-bold border border-red-900/50 bg-red-950/20 px-2 py-1 flex items-center gap-2">
                          <AlertTriangle size={10} />
                          WARNING: {failedAssets.size} FILES FAILED
                      </div>
                  )}

                  <button 
                      onClick={() => setIsPreloading(false)}
                      className="mt-8 text-[10px] text-ash-gray/50 hover:text-emerald-400 border border-ash-gray/30 hover:border-emerald-500/50 px-4 py-2 uppercase tracking-widest transition-all bg-black/50 backdrop-blur-sm flex items-center gap-2 group"
                  >
                      [SKIP_PRELOAD]
                      <FastForward size={10} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      );
  }

  // Current Loading Percentage for HUD
  const loadPercent = Math.floor((loadedAssets.size / totalAssets) * 100);

  // --- Main Game Render ---
  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden font-mono select-none">
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 bg-grid-hard opacity-20 pointer-events-none"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1),#000000_90%)] pointer-events-none"></div>

        {/* Game World Container */}
        <div 
            className="absolute transition-transform duration-100 ease-linear will-change-transform"
            style={viewportStyle}
        >
            <div 
                ref={mapRef}
                className="relative bg-ash-dark/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-4 border-ash-dark"
                style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            >
                {/* Floor Decals - Main Hall */}
                <div className="absolute top-[400px] left-[500px] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-2 border-dashed border-ash-gray/10 rounded-full"></div>
                
                {/* Floor Decals - Fan Art Sector */}
                <div className="absolute top-[400px] left-[1450px] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-amber-900/20 bg-amber-950/10 rotate-45"></div>
                <div className="absolute top-[300px] left-[1450px] -translate-x-1/2 text-[20px] font-black text-amber-900/30 tracking-widest pointer-events-none whitespace-nowrap">
                    [ FAN_SECTOR ]
                </div>

                {/* Objects */}
                {objectsWithIndex.map(obj => (
                    <div
                        key={obj.id}
                        className={`
                            absolute flex items-center justify-center
                            ${obj.type === 'wall' ? 'bg-ash-black border border-ash-gray/30 shadow-hard' : ''}
                            ${obj.type === 'exhibit' ? 'bg-black/80 border-2 border-ash-light/50 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}
                            ${obj.type === 'npc' ? 'z-20' : ''}
                            ${activeObj?.id === obj.id ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : ''}
                        `}
                        style={{
                            left: obj.x,
                            top: obj.y,
                            width: obj.width,
                            height: obj.height,
                            borderRadius: obj.type === 'npc' ? '9999px' : '0'
                        }}
                    >
                        {/* NPC Rendering */}
                        {obj.type === 'npc' && obj.imageUrl && (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Avatar Circle */}
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-black animate-[pulse_3s_infinite]">
                                    <img 
                                        src={obj.imageUrl} 
                                        alt="NPC" 
                                        className="w-full h-full object-cover"
                                        onLoad={() => handleImageLoad(obj.id)}
                                    />
                                </div>
                                {/* Status Indicator */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <MessageCircle size={16} className="text-emerald-400 animate-bounce mb-1" fill="currentColor" />
                                    <div className="text-[8px] bg-black text-emerald-400 px-1 border border-emerald-500/50 whitespace-nowrap">{obj.label}</div>
                                </div>
                            </div>
                        )}

                        {/* Exhibit Rendering */}
                        {obj.type === 'exhibit' && (
                            <>
                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden group">
                                    {obj.imageUrl ? (
                                        <img 
                                            src={obj.imageUrl} 
                                            alt="exhibit" 
                                            className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" 
                                            onLoad={() => handleImageLoad(obj.id)}
                                        />
                                    ) : (
                                        <ImageIcon size={20} className="text-ash-gray" />
                                    )}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-black text-ash-light px-2 border border-ash-gray/50 z-10">
                                        {obj.label}
                                    </div>
                                </div>
                                {/* Number Badge */}
                                {(obj as any).displayNumber && (
                                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 z-20 border-l border-b border-black/50 pointer-events-none">
                                        {(obj as any).displayNumber}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {/* Player: Data Entity */}
                <div 
                    className="absolute z-20 transition-transform duration-75 will-change-transform mix-blend-screen"
                    style={{
                        left: playerPos.x,
                        top: playerPos.y,
                        width: PLAYER_SIZE,
                        height: PLAYER_SIZE
                    }}
                >
                    <div className="relative w-full h-full group">
                        {/* Core Data Block */}
                        <div className={`
                            absolute inset-0 bg-emerald-500/10 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] 
                            flex items-center justify-center overflow-hidden backdrop-blur-[1px]
                            ${keysPressed.current.size > 0 ? 'animate-pulse' : ''}
                        `}>
                            {/* Inner Digital Rain */}
                            <div className="absolute inset-0 flex flex-col text-[6px] text-emerald-500/70 font-mono leading-[6px] tracking-tighter opacity-80">
                                {Array.from({length: 6}).map((_, i) => (
                                    <div key={i} className="animate-data-rain" style={{ animationDuration: `${0.5 + Math.random()}s` }}>
                                        {Math.random().toString(2).substring(2, 8)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Directional Indicator (Triangle) */}
                        <div 
                            className={`absolute top-1/2 left-1/2 w-0 h-0 border-4 border-transparent transition-transform duration-200 z-10
                                ${direction === 'up' ? '-translate-y-4 border-b-emerald-300' : ''}
                                ${direction === 'down' ? 'translate-y-2 border-t-emerald-300' : ''}
                                ${direction === 'left' ? '-translate-x-4 border-r-emerald-300' : ''}
                                ${direction === 'right' ? 'translate-x-2 border-l-emerald-300' : ''}
                            `}
                        ></div>

                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white/80"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white/80"></div>

                        {/* Floating Label */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[6px] font-black bg-black text-emerald-400 px-1.5 py-0.5 border border-emerald-900 shadow-hard-sm whitespace-nowrap">
                            USR_01
                        </div>
                    </div>
                    
                    {/* Flashlight Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none mix-blend-screen"></div>
                </div>
            </div>
        </div>

        {/* HUD Overlay with Resource Monitor (Dynamic State) */}
        <div className="fixed top-6 left-6 z-50 text-[10px] font-mono text-ash-gray select-none">
            <div className="border-l-2 border-emerald-500 pl-3 bg-black/60 backdrop-blur-[2px] p-2 shadow-hard-sm border-y border-r border-emerald-500/20">
                <div className="text-ash-light font-bold text-lg leading-none mb-1">NOVA_GALLERY</div>
                <div className="opacity-70 mb-2">SECTOR_00 // ARCHIVE_HALL</div>
                
                {/* Resource Monitor Status */}
                <div className="border-t border-dashed border-emerald-500/30 pt-2 flex flex-col gap-1 w-32">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-600"><Wifi size={10} /> RES_SYNC</span>
                        <span className={loadPercent === 100 ? "text-emerald-400" : "text-amber-400 animate-pulse"}>
                            {loadPercent}%
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-ash-dark border border-emerald-900/50">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_5px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${loadPercent}%` }}
                        ></div>
                    </div>
                    
                    <div className="text-[8px] text-emerald-500/80 flex items-center gap-1 mt-0.5">
                        {loadPercent === 100 ? <CheckCircle2 size={8} /> : <Loader2 size={8} className="animate-spin" />} 
                        {loadPercent === 100 ? 'ASSETS_PRELOADED' : 'CACHING...'}
                    </div>
                </div>

                {playerPos.x > 1050 && (
                    <div className="text-amber-500 animate-pulse mt-2 pt-2 border-t border-amber-900/30 font-bold">[ FAN_ART_ZONE ]</div>
                )}
            </div>
        </div>

        {/* Interaction Prompt */}
        {activeObj && !viewingExhibit && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/90 border border-emerald-500 text-emerald-400 px-6 py-3 animate-fade-in z-40 flex flex-col items-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="text-xs font-bold mb-1 flex items-center gap-2">
                    {activeObj.type === 'npc' ? <MessageCircle size={14} /> : <Maximize size={14} />} 
                    {activeObj.type === 'npc' ? 'TALK' : 'VIEW EXHIBIT'}
                </div>
                <div className="text-[10px] animate-pulse opacity-70">[SPACE] TO INTERACT</div>
                
                {/* Mobile Tap Area */}
                <button className="absolute inset-0 w-full h-full opacity-0" onClick={handleInteract}></button>
            </div>
        )}

        {/* EXHIBIT / NPC DIALOGUE MODAL */}
        {viewingExhibit && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-zoom-in-fast" onClick={() => setViewingExhibit(null)}>
                <div className="relative max-w-5xl max-h-full flex flex-col items-center w-full" onClick={e => e.stopPropagation()}>
                    
                    {/* Content Display */}
                    {viewingExhibit.type === 'npc' ? (
                        /* NPC Dialogue Style */
                        <div className="bg-ash-black/90 border-2 border-emerald-500 p-6 md:p-10 max-w-2xl w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col gap-6">
                            <div className="flex items-center gap-4 border-b border-emerald-900/50 pb-4">
                                <div className="w-16 h-16 rounded-full border-2 border-emerald-400 overflow-hidden shrink-0">
                                    <img src={viewingExhibit.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-emerald-400 uppercase tracking-widest">{viewingExhibit.label}</h2>
                                    <div className="text-[10px] text-emerald-600 font-mono">SYS_VER: 3.14.15 // ONLINE</div>
                                </div>
                            </div>
                            <div className="text-sm md:text-base font-mono text-emerald-100 leading-relaxed whitespace-pre-wrap">
                                {viewingExhibit.description ? viewingExhibit.description[language] || viewingExhibit.description['en'] : '...'}
                            </div>
                            <button 
                                onClick={() => setViewingExhibit(null)}
                                className="self-end px-6 py-2 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors font-bold uppercase text-xs"
                            >
                                {language === 'en' ? 'CLOSE LINK' : '断开连接'}
                            </button>
                        </div>
                    ) : (
                        /* Standard Exhibit Style */
                        <>
                            <div className="relative border-4 border-ash-dark bg-ash-black shadow-[0_0_100px_rgba(255,255,255,0.1)] mb-6 group">
                                <img 
                                    src={viewingExhibit.imageUrl} 
                                    alt="Exhibit" 
                                    className="max-h-[70vh] object-contain block"
                                />
                                <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                                <div className="absolute top-4 left-4 bg-black/80 text-ash-light px-2 py-1 text-xs font-mono border border-ash-gray">
                                    IMG_SOURCE: {viewingExhibit.label}
                                </div>
                            </div>

                            <div className="bg-ash-black/80 border-t-2 border-emerald-500/50 p-6 text-center max-w-2xl backdrop-blur-md">
                                <h2 className="text-xl md:text-2xl font-black text-ash-light mb-2 uppercase tracking-widest">
                                    {viewingExhibit.label}
                                </h2>
                                <p className="text-sm font-mono text-emerald-400/80 leading-relaxed">
                                    {viewingExhibit.description ? viewingExhibit.description[language] || viewingExhibit.description['en'] : 'NO_DATA'}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Close Button (Global) */}
                    <button 
                        onClick={() => setViewingExhibit(null)}
                        className="absolute top-4 right-4 md:-right-16 md:top-0 bg-ash-black text-ash-light p-3 border border-ash-gray hover:bg-ash-light hover:text-ash-black transition-colors rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
        )}

        {/* Mobile Controls */}
        <VirtualJoystick onMove={(dx, dy) => {
             if (dy < 0) keysPressed.current.add('ArrowUp'); else keysPressed.current.delete('ArrowUp');
             if (dy > 0) keysPressed.current.add('ArrowDown'); else keysPressed.current.delete('ArrowDown');
             if (dx < 0) keysPressed.current.add('ArrowLeft'); else keysPressed.current.delete('ArrowLeft');
             if (dx > 0) keysPressed.current.add('ArrowRight'); else keysPressed.current.delete('ArrowRight');
        }} onStop={() => keysPressed.current.clear()} />
        
        {/* Mobile Interact Button */}
        {activeObj && !viewingExhibit && (
            <button 
                onClick={handleInteract}
                className="fixed bottom-8 right-8 z-[200] w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 animate-pulse md:hidden shadow-[0_0_20px_rgba(16,185,129,0.3)] active:bg-emerald-500/40 transition-colors"
            >
                {activeObj.type === 'npc' ? <MessageCircle size={24} /> : <Maximize size={24} />}
            </button>
        )}
    </div>
  );
};

export default RPGMap;

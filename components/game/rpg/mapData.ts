
import { RPGObject } from '../../../types';

export const MAP_OBJECTS: RPGObject[] = [
    // --- MAIN HALL EXHIBITS ---

    // Guide NPC - Byaki AI
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

    // Top Left - Byaki Avatar (Updated with Hint)
    { 
        id: 'exhibit-byaki', 
        x: 280, y: 150, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'BYAKI_TERM', 
        color: 'text-emerald-400',
        imageUrl: 'https://free.picui.cn/free/2025/12/28/69513b509851e.jpg',
        description: {
            'zh-CN': '白栖的终端头像数据 // 记录于档案建立之初。\n\n> 备注：总觉得左边的这堵墙后面...好像有谁在喝茶的声音？',
            'zh-TW': '白栖的終端頭像數據 // 記錄於檔案建立之初。\n\n> 備註：總覺得左邊的這堵牆後面...好像有誰在喝茶的聲音？',
            'en': 'Byaki\'s Terminal Avatar // Recorded at archive inception.\n\n> Note: I swear I can hear someone drinking tea behind the wall to the left...'
        }
    },

    // Left Middle - Point Standard
    { 
        id: 'exhibit-point', 
        x: 300, y: 450, 
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

    // --- OFFICIAL COMMUNITY GALLERY (Was Fan Art Sector) ---
    
    // Center Left - Point Main V2
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

    // [DELETED] terminal-guestbook was here

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
    // New Exhibit: Fumofumo Zelo (Official)
    { 
        id: 'exhibit-fumofumo-zelo', 
        x: 1320, y: 180, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'FUMOFUMO_Z', 
        color: 'text-amber-200',
        imageUrl: 'https://free.picui.cn/free/2026/01/01/69566fa7cdf8f.jpg',
        description: {
            'zh-CN': 'Fumofumo 泽洛 // 毛茸茸的可爱。',
            'zh-TW': 'Fumofumo 澤洛 // 毛茸茸的可愛。',
            'en': 'Fumofumo Zelo // Fluffy cuteness.'
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

    // --- UNOFFICIAL COMMUNITY GALLERY (New Sector) ---
    
    // Moved from Official: Fumo Zelo
    { 
        id: 'exhibit-fumo-zelo', 
        x: 2000, y: 380, 
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

    // First Entry: Zeri by mor
    { 
        id: 'exhibit-zeri-mor', 
        x: 2150, y: 380, 
        width: 40, height: 40, 
        type: 'exhibit', 
        label: 'ZERI_MOR', 
        color: 'text-pink-300',
        imageUrl: 'https://free.picui.cn/free/2026/01/01/69566c8fdea59.jpg',
        description: {
            'zh-CN': '芷漓 (By mor) // 非官方社区图集。',
            'zh-TW': '芷漓 (By mor) // 非官方社區圖集。',
            'en': 'Zeri (By mor) // Unofficial Community Gallery.'
        }
    },

    // --- STAR MAP PAVILION BRANCH (Public & Secret Access) ---
    
    // NPC: Pyo (Curator)
    { 
        id: 'npc-pyo', 
        x: 80, y: 350, 
        width: 40, height: 40, 
        type: 'npc', 
        label: 'PYO', 
        color: 'text-indigo-300',
        imageUrl: 'https://free.picui.cn/free/2026/01/01/69567c58abbc0.png',
        description: {
            'zh-CN': '我是星图馆代理馆长普忧。在这里，你可以回到来时的站点，服务是免费的，不用客气。',
            'zh-TW': '我是星圖館代理館長普憂。在這裡，你可以回到來時的站點，服務是免費的，不用客氣。',
            'en': 'I am Pyo, acting curator of the Star Map Pavilion. Here you can return to the station you came from. The service is free, please make yourself at home.'
        }
    },

    // Link: Main Site
    { 
        id: 'link-main', 
        x: 40, y: 500, 
        width: 40, height: 40, 
        type: 'terminal', 
        label: 'MAIN_NODE', 
        color: 'text-sky-400',
        description: {
            'zh-CN': '【主站传送门】\n\n跳转至: bf.zeroxv.cn\n\n[点击确认]',
            'zh-TW': '【主站傳送門】\n\n跳轉至: bf.zeroxv.cn\n\n[點擊確認]',
            'en': '[MAIN SITE PORTAL]\n\nWarp to: bf.zeroxv.cn\n\n[CLICK TO CONFIRM]'
        }
    },

    // Link: OST Site
    { 
        id: 'link-ost', 
        x: 120, y: 500, 
        width: 40, height: 40, 
        type: 'terminal', 
        label: 'AUDIO_NODE', 
        color: 'text-purple-400',
        description: {
            'zh-CN': '【OST 传送门】\n\n跳转至: ost.zeroxv.cn\n\n[点击确认]',
            'zh-TW': '【OST 傳送門】\n\n跳轉至: ost.zeroxv.cn\n\n[點擊確認]',
            'en': '[OST SITE PORTAL]\n\nWarp to: ost.zeroxv.cn\n\n[CLICK TO CONFIRM]'
        }
    },

    // --- WALLS ---

    // Top and Bottom Outer Boundaries
    { id: 'w_top', x: 200, y: 0, width: 800, height: 50, type: 'wall' }, 
    { id: 'w_bottom', x: 200, y: 750, width: 800, height: 50, type: 'wall' }, 
    
    // --- MAIN HALL LEFT WALL (Reconstructed for Public Access) ---
    // This wall sits at x=200.
    
    // 1. Top Section (Solid - Blocks Tea Room)
    { id: 'w_main_left_top', x: 200, y: 0, width: 50, height: 150, type: 'wall' },
    
    // 2. Middle Section (FAKE - Entrance to Secret Tea Room)
    { id: 'fake_wall_secret', x: 200, y: 150, width: 50, height: 100, type: 'decoration', label: 'FAKE_WALL' },
    
    // 3. Middle-Lower Section (Solid - Separator)
    { id: 'w_main_left_mid', x: 200, y: 250, width: 50, height: 100, type: 'wall' },

    // [OPEN GAP here at y=350 to y=450 for Star Map Pavilion Entrance]

    // 4. Bottom Section (Solid)
    { id: 'w_main_left_lower', x: 200, y: 450, width: 50, height: 350, type: 'wall' },

    // --- LEFT WING (Tea Room + Star Map Pavilion) ---
    // Encloses the area 0 < x < 200
    { id: 'w_secret_top', x: 0, y: 0, width: 200, height: 50, type: 'wall' },
    { id: 'w_secret_left', x: 0, y: 0, width: 50, height: 800, type: 'wall' },
    
    // Separator between Tea Room (Hidden) and Star Map (Public)
    // Wall at y=250. 
    // Replaced the gap with a FAKE WALL to allow hidden entry but appear solid.
    { id: 'w_secret_div_1', x: 0, y: 250, width: 70, height: 50, type: 'wall' },
    { id: 'fake_wall_star_tea', x: 70, y: 250, width: 60, height: 50, type: 'decoration', label: 'FAKE_WALL' },
    { id: 'w_secret_div_2', x: 130, y: 250, width: 70, height: 50, type: 'wall' },

    // Bottom of Star Map Pavilion
    { id: 'w_star_bottom', x: 0, y: 600, width: 200, height: 50, type: 'wall' },

    // Main Hall Right Wall
    { id: 'w_right_top', x: 950, y: 0, width: 50, height: 350, type: 'wall' },
    { id: 'w_right_bottom', x: 950, y: 450, width: 50, height: 350, type: 'wall' },

    // Corridor Walls (Main -> Official)
    { id: 'corr_top', x: 1000, y: 350, width: 150, height: 50, type: 'wall' },
    { id: 'corr_bottom', x: 1000, y: 450, width: 150, height: 50, type: 'wall' },

    // Official Community Gallery Walls (Was Fan Art Room)
    { id: 'fan_top', x: 1150, y: 100, width: 600, height: 50, type: 'wall' },
    { id: 'fan_bottom', x: 1150, y: 700, width: 600, height: 50, type: 'wall' },
    
    // Right Wall (Split for next corridor)
    { id: 'fan_right_top', x: 1750, y: 100, width: 50, height: 250, type: 'wall' },
    { id: 'fan_right_bottom', x: 1750, y: 500, width: 50, height: 250, type: 'wall' },
    
    { id: 'fan_left_top', x: 1150, y: 100, width: 50, height: 250, type: 'wall' },
    { id: 'fan_left_bottom', x: 1150, y: 500, width: 50, height: 250, type: 'wall' }, 

    // Corridor Walls (Official -> Unofficial)
    { id: 'corr2_top', x: 1800, y: 350, width: 100, height: 50, type: 'wall' },
    { id: 'corr2_bottom', x: 1800, y: 450, width: 100, height: 50, type: 'wall' },

    // Unofficial Community Gallery Walls (New Room)
    { id: 'unoff_top', x: 1900, y: 100, width: 600, height: 50, type: 'wall' },
    { id: 'unoff_bottom', x: 1900, y: 700, width: 600, height: 50, type: 'wall' },
    { id: 'unoff_right', x: 2500, y: 100, width: 50, height: 650, type: 'wall' },
    { id: 'unoff_left_top', x: 1900, y: 100, width: 50, height: 250, type: 'wall' },
    { id: 'unoff_left_bottom', x: 1900, y: 500, width: 50, height: 250, type: 'wall' }, 

    // Pillars
    { id: 'p1', x: 300, y: 200, width: 50, height: 100, type: 'wall' }, // Shifted p1
    { id: 'p2', x: 750, y: 200, width: 50, height: 400, type: 'wall' }
];

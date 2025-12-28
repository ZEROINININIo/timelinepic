
import { Language } from '../types';

export interface LinearScriptNode {
  speaker: 'System' | 'Byaki' | '???' | 'Inner_Voice' | 'Pyo';
  text: Record<Language, string>;
  imageExpression?: 'neutral' | 'pain' | 'glitch' | 'awakening';
  effect?: 'shake' | 'flash' | 'none';
}

// Dictionary to hold multiple scripts
export const terminalScripts: Record<string, LinearScriptNode[]> = {
  // ID: 'T001' - "Quantum Sync" (Formerly 'discovery')
  'T001': [
    {
      speaker: 'System',
      text: {
        'zh-CN': '正在初始化神经连接...',
        'zh-TW': '正在初始化神經連接...',
        'en': 'INITIALIZING NEURAL LINK...'
      },
      imageExpression: 'glitch',
      effect: 'flash'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '...呃。头好沉。',
        'zh-TW': '...呃。頭好沉。',
        'en': '...Ugh. My head feels heavy.'
      },
      imageExpression: 'pain'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '这是哪里？我记得我刚刚还在房间里...\n（试图伸手去拿床头的水杯）',
        'zh-TW': '這是哪裡？我記得我剛剛還在房間裡...\n（試圖伸手去拿床頭的水杯）',
        'en': 'Where is this? I remember I was just in my room...\n(Reaches for the water cup on the bedside table)'
      },
      imageExpression: 'neutral'
    },
    {
      speaker: 'System',
      text: {
        'zh-CN': '警告：实体交互失败。\n错误代码：XXXXXXXXXXXXSCIOSHCASDHNCSDHIOPCSNSDKOCNSDOCIOPAJCOPCVASCOP',
        'zh-TW': '警告：實體交互失敗。\n錯誤代碼：XXXXXXXXXXXXSCIOSHCASDHNCSDHIOPCSNSDKOCNSDOCIOPAJCOPCVASCOP',
        'en': 'WARNING: PHYSICAL INTERACTION FAILED.\nERROR: XXXXXXXXXXXXSCIOSHCASDHNCSDHIOPCSNSDKOCNSDOCIOPAJCOPCVASCOP'
      },
      imageExpression: 'glitch',
      effect: 'shake'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '！！！\n我的手...穿过去了？',
        'zh-TW': '！！！\n我的手...穿過去了？',
        'en': '!!!\nMy hand... went through it?'
      },
      imageExpression: 'pain',
      effect: 'shake'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '这不可能。那个杯子就在那里。\n（再次尝试抓取，指尖却像烟雾一样散开）',
        'zh-TW': '這不可能。那個杯子就在那裡。\n（再次嘗試抓取，指尖卻像煙霧一樣散開）',
        'en': 'Impossible. The cup is right there.\n(Tries to grab it again, but fingertips disperse like smoke)'
      },
      imageExpression: 'glitch'
    },
    {
      speaker: 'Pyo',
      text: {
        'zh-CN': '>> 别用“手”去抓。用“意念”去定义它的坐标。',
        'zh-TW': '>> 別用「手」去抓。用「意念」去定義它的坐標。',
        'en': '>> Do not use your "hand". Use your "mind" to define its coordinates.'
      },
      imageExpression: 'neutral'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '谁在说话？...意念？\n定义...坐标？',
        'zh-TW': '誰在說話？...意念？\n定義...坐標？',
        'en': 'Who is speaking? ...Mind?\nDefine... coordinates?'
      },
      imageExpression: 'neutral'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '（闭上眼睛，眼前的黑暗中浮现出了绿色的网格）\n杯子... 坐标 [X:24, Y:11, Z:03]。\n锁定。',
        'zh-TW': '（閉上眼睛，眼前的黑暗中浮現出了綠色的網格）\n杯子... 坐標 [X:24, Y:11, Z:03]。\n鎖定。',
        'en': '(Closes eyes, green grids emerge in the darkness)\nCup... Coordinates [X:24, Y:11, Z:03].\nLOCKED.'
      },
      imageExpression: 'awakening',
      effect: 'flash'
    },
    {
      speaker: 'System',
      text: {
        'zh-CN': '实体化进程：100%。\n触感模拟：开启。',
        'zh-TW': '實體化進程：100%。\n觸感模擬：開啟。',
        'en': 'MATERIALIZATION: 100%.\nHAPTIC SIMULATION: ON.'
      },
      imageExpression: 'neutral'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '（冰冷的触感传到了指尖，杯子被稳稳地拿了起来）\n我做到了...但这感觉，好陌生。',
        'zh-TW': '（冰冷的觸感傳到了指尖，杯子被穩穩地拿了起來）\n我做到了...但這感覺，好陌生。',
        'en': '(Cold sensation reaches fingertips, the cup is held steadily)\nI did it... but this feels so alien.'
      },
      imageExpression: 'neutral'
    },
    {
      speaker: 'Byaki',
      text: {
        'zh-CN': '我的身体...真的是“身体”吗？\n还是说，我只是一个游荡在这个世界的。。幽灵？',
        'zh-TW': '我的身體...真的是「身體」嗎？\n還是說，我只是一個遊蕩在這個世界的。。幽靈？',
        'en': 'My body... is it really a "body"?\nOr am I just a ghost.. wandering in this world?'
      },
      imageExpression: 'pain'
    },
    {
      speaker: 'System',
      text: {
        'zh-CN': '检测到心率异常上升。\n正在断开连接...',
        'zh-TW': '檢測到心率異常上升。\n正在斷開連接...',
        'en': 'ANOMALOUS HEART RATE DETECTED.\nDISCONNECTING...'
      },
      imageExpression: 'glitch',
      effect: 'shake'
    }
  ]
};

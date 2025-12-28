
import { Character } from '../types';

export const characters: Character[] = [
  {
    id: "point",
    alias: "Z.Point",
    themeColor: "text-zinc-400",
    stats: {
      strength: 5,
      intelligence: 8,
      agility: 9,
      mental: 7,
      resonance: 10
    },
    translations: {
      'zh-CN': {
        name: "零点",
        role: "前线",
        tags: ["活力", "搞事", "直觉系"],
        quote: "只要跑得够快，麻烦就追不上我！……大概？",
        description: [
          "团队的主心骨，性格活泼外向，具有极高的独立性。",
          "脑袋里经常装着小坏心思，容易吃苦头，但恢复得也快。",
          "和芷漓、泽洛都很亲密，是从小到大一直陪伴着的伙伴。",
          "对公行动较保守，但对重要任务有自己的盘算，且拥有三人中最强的隐形实力。"
        ]
      },
      'zh-TW': {
        name: "零點",
        role: "前線",
        tags: ["活力", "搞事", "直覺系"],
        quote: "只要跑得夠快，麻煩就追不上我！……大概？",
        description: [
          "團隊的主心骨，性格活潑外向，具有極高的獨立性。",
          "腦袋裡經常裝著小壞心思，容易吃苦頭，但恢復得也快。",
          "和芷漓、澤洛都很親密，是從小到大一直陪伴著的夥伴。",
          "對公行動較保守，但對重要任務有自己的盤算，且擁有三人中原最強的隱形實力。"
        ]
      },
      'en': {
        name: "Point",
        role: "Frontline",
        tags: ["Energetic", "Troublemaker", "Intuitive"],
        quote: "As long as I run fast enough, trouble can't catch me! ...Probably?",
        description: [
          "The backbone of the team with a lively and outgoing personality, possessing high independence.",
          "Often has mischievous ideas in her head and gets into trouble easily, but recovers just as quickly.",
          "Very close with Zeri and Zelo; they have been companions since childhood.",
          "Acts conservatively in public operations but has her own calculations for important missions, possessing the strongest hidden strength among the three."
        ]
      }
    }
  },
  {
    id: "zeri",
    alias: "Z.Zeri / Liz",
    themeColor: "text-pink-400",
    stats: {
      strength: 2,
      intelligence: 11,
      agility: 5,
      mental: 2,
      resonance: 5
    },
    translations: {
      'zh-CN': {
        name: "芷漓",
        role: "科研",
        tags: ["冷静"],
        quote: "数据不会说谎，但解读数据的人经常犯蠢。",
        description: [
          "安静、沉稳、理性，典型的冷系科研型人格。",
          "生活规律、家里整洁，有点小洁癖气质。对工作极度认真，脑子里永远是研究与任务。",
          "表面淡定，实际上偶尔会耍小心机（例如诱骗零点加班）。",
          "嘴硬心软，非常关心队友，尤其是零点。低调害羞，不喜欢别人叫她“小名”，也不喜欢穿可爱的衣服。"
        ]
      },
      'zh-TW': {
        name: "芷漓",
        role: "科研",
        tags: ["冷靜"],
        quote: "數據不會說謊，但解讀數據的人經常犯蠢。",
        description: [
          "安靜、沉穩、理性，典型的冷系科研型人格。",
          "生活規律、家裡整潔，有點小潔癖氣質。對工作極度認真，腦子裡永遠是研究與任務。",
          "表面淡定，實際上偶爾會耍小心機（例如誘騙零點加班）。",
          "嘴硬心軟，非常關心隊友，尤其是零點。低調害羞，不喜歡別人叫她「小名」，也不喜歡穿可愛的衣服。"
        ]
      },
      'en': {
        name: "Zeri",
        role: "Research",
        tags: ["Calm", "Rational"],
        quote: "Data doesn't lie, but the people interpreting it often make stupid mistakes.",
        description: [
          "Quiet, steady, and rational. A typical cool-headed researcher personality.",
          "Lives a disciplined life with a tidy home, showing signs of mild mysophobia. Extremely serious about work; her mind is always on research and missions.",
          "Appears calm on the surface but occasionally plays little tricks (like tricking Point into working overtime).",
          "Sharp-tongued but soft-hearted, she cares deeply about her teammates, especially Point. Low-key and shy, she dislikes being called by her 'nickname' or wearing cute clothes."
        ]
      }
    }
  },
  {
    id: "zelo",
    alias: "Z.Zelo",
    themeColor: "text-blue-400",
    stats: {
      strength: 4,
      intelligence: 5,
      agility: 6,
      mental: 10,
      resonance: 5
    },
    translations: {
      'zh-CN': {
        name: "泽洛",
        role: "支援",
        tags: ["元气","乐观主义"],
        quote: "不管发生什么，我都会全力支持计划哦~",
        description: [
          "性格外向活泼，对任何事情都充满希望。",
          "有时像小孩般贪玩，对工作不太上心，经常充当实验辅助员。",
          "有自己的需求时并不强迫他人帮助。",
          "对零点和芷漓都很了解，是亲人般的存在。可爱系角色，不管哪方面都透露着少女感。"
        ]
      },
      'zh-TW': {
        name: "澤洛",
        role: "支援",
        tags: ["元氣","樂觀主義"],
        quote: "不管發生什麼，我都會全力支持計畫哦~",
        description: [
          "性格外向活潑，對任何事情都充滿希望。",
          "有時像小孩般貪玩，對工作不太上心，經常充當實驗輔助員。",
          "有自己的需求時並不強迫他人幫助。",
          "對零點和芷漓都很了解，是親人般的存在。可愛系角色，不管哪方面都透露著少女感。"
        ]
      },
      'en': {
        name: "Zelo",
        role: "Support",
        tags: ["Genki", "Optimist"],
        quote: "No matter what happens, I'll support the plan with all I've got~",
        description: [
          "Outgoing and lively, full of hope for everything.",
          "Sometimes playful like a child and not very focused on work, often acting as an experimental assistant.",
          "Does not force others to help when she has her own needs.",
          "Understands Point and Zeri very well and is like family to them. A cute character who exudes a girlish charm in every aspect."
        ]
      }
    }
  },
  {
    id: "void",
    alias: "Void [[MASK::Z.Byaki]]",
    themeColor: "text-white",
    stats: {
      strength: 0,
      intelligence: 10,
      agility: 10,
      mental: 0,
      resonance: 10
    },
    translations: {
      'zh-CN': {
        name: "零空",
        role: "？？？",
        tags: ["神秘", "高维", "BUG"],
        quote: "干涉。",
        description: [
          "来自“空界”的高位存在，和三人关系特殊。",
          "拥有无限的生命和特殊的记忆系统。实力非常强，能轻松完成现实上任何难以做到的事情。",
          "看似散漫，但在关键节点非常可靠。",
          "对零点比较宠，会帮忙但也让零点不要经常召唤它（会损害零点）。",
          "**“当 Void 需要被世界理解时，它会以白栖的方式存在。”**",
          "**“记忆裁剪并不会改变 Void 是“谁”，只会改变 Void 能以多像“白栖”的方式出现。”**"
        ]
      },
      'zh-TW': {
        name: "零空",
        role: "？？？",
        tags: ["神秘", "高維", "BUG"],
        quote: "干涉。",
        description: [
          "來自「空界」的高位存在，和三人關係特殊。",
          "擁有無限的生命和特殊的記憶系統。實力非常強，能輕鬆完成現實上任何難以做到的事情。",
          "看似散漫，但在關鍵節點非常可靠。",
          "對零點比較寵，會幫忙但也讓零點不要經常召喚它（會損害零點）。",
          "**“當 Void 需要被世界理解時，它會以白棲的方式存在。”**",
          "**“記憶裁剪並不會改變 Void 是「誰」，只會改變 Void 能以多像「白棲」的方式出現。”**"
        ]
      },
      'en': {
        name: "Void",
        role: "???",
        tags: ["Mysterious", "High-Dim", "BUG"],
        quote: "Interference.",
        description: [
          "A higher-dimensional existence from the 'Void', sharing a special relationship with the trio.",
          "Possesses infinite life and a special memory system. Extremely powerful, easily accomplishing things impossible in reality.",
          "Appears laid-back but is very reliable at critical moments.",
          "He is protective of Point, helping her but also warning her not to summon him too often (as it damages her).",
          "**\"When Void needs to be understood by the world, it exists as Byaki.\"**",
          "**\"Memory trimming does not change 'who' Void is, it only changes how much Void can appear like 'Byaki'.\"**"
        ]
      }
    }
  }
];

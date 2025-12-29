
import { Language } from '../../../types';

export const TUTORIAL_STEPS = [
    {
        speaker: 'Byaki',
        text: {
            'zh-CN': '哎呀，忘记说了！这个是“哨兵”，数据残渣形成的聚合体。别怕，我会连接你的终端进行辅助。兼容为你们世界的‘RPG’模式方便你理解我们的战斗形式。',
            'zh-TW': '哎呀，忘記說了！這個是「哨兵」，數據殘渣形成的聚合體。別怕，我會連接妳的終端進行輔助。已兼容妳們世界的「RPG」模式方便妳理解我們的戰鬥形式。',
            'en': 'Oh, forgot to mention! This is a "Sentinel", an aggregate of data residue. Don\'t worry, I\'ve linked to your terminal. I\'ve enabled a compatible "RPG" mode to help you understand our combat style.'
        },
        highlight: null
    },
    {
        speaker: 'Byaki',
        text: {
            'zh-CN': '这是【攻击】(ATTACK)，最基础的数据流冲击。虽然伤害普通，但胜在稳定，没有冷却时间。',
            'zh-TW': '這是【攻擊】(ATTACK)，最基礎的數據流衝擊。雖然傷害普通，但勝在穩定，沒有冷卻時間。',
            'en': 'This is [ATTACK], a basic data stream impact. Damage is standard, but it\'s stable and has no cooldown.'
        },
        highlight: 'attack'
    },
    {
        speaker: 'Byaki',
        text: {
            'zh-CN': '想速战速决就用【切断数据】(CUT DATA)！这是我以前的高级权限，伤害很高，但需要 3 回合缓冲。',
            'zh-TW': '想速戰速決就用【切斷數據】(CUT DATA)！這是我以前的高級權限，傷害很高，但需要 3 回合緩衝。',
            'en': 'Use [CUT DATA] for a quick finish! It uses my old high-level privileges for massive damage, but requires a 3-turn cooldown.'
        },
        highlight: 'cut'
    },
    {
        speaker: 'Byaki',
        text: {
            'zh-CN': '遇到危险记得保护自己。【数据隐秘】(STEALTH) 能生成护盾抵挡伤害，就像我把你藏在世界的夹缝中一样。',
            'zh-TW': '遇到危險記得保護自己。【數據隱密】(STEALTH) 能生成護盾抵擋傷害，就像我把妳藏在世界的夾縫中一樣。',
            'en': 'Protect yourself in danger. [STEALTH] generates a shield to block damage, just like how I hide you in the cracks of the world.'
        },
        highlight: 'stealth'
    },
    {
        speaker: 'Byaki',
        text: {
            'zh-CN': '在这个空间里，保持数据完整性就是保持生命。受伤了记得用【修复】(REPAIR)。你操控的是Xbot，不用担心自己的生命安全。好啦，交给你了！',
            'zh-TW': '在這個空間裡，保持數據完整性就是保持生命。受傷了記得用【修復】(REPAIR)。妳操控的是 Xbot，不用擔心自己的生命安全。好啦，交給妳了！',
            'en': 'Here, data integrity is life. Use [REPAIR] if damaged. You are controlling an Xbot, so don\'t worry about your physical safety. Good luck!'
        },
        highlight: 'heal'
    }
];

export const VICTORY_MSG = {
    'zh-CN': '干得好！目标已清除。以后这里就是安全的啦。你可以安心探索了。',
    'zh-TW': '做得好！目標已清除。我已經順手把這附近的殘留數據源都清理掉了，以後這裡就是安全的啦。妳可以安心探索了。',
    'en': 'Good job! Target eliminated. I\'ve cleaned up the residual data sources nearby. It\'s safe now. Feel free to explore.'
};

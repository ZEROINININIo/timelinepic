
export interface BattleState {
    active: boolean;
    turn: 'player' | 'enemy' | 'end';
    playerHp: number;
    playerMaxHp: number;
    playerShield: number;
    enemyHp: number;
    enemyMaxHp: number;
    enemyShield: number; // Added for PvP synchronization
    logs: string[];
    // Cooldowns
    cdCut: number;
    cdStealth: number;
    cdRepair: number; // New: Nerf heal spam
    cdSpike: number;  // New: Shield breaker skill
    // Story & Tutorial
    tutorialStep: number; // -1 means finished
    showVictory: boolean;
    // Visual Effects
    animation?: 'attack' | 'heal' | 'cut' | 'stealth' | 'spike' | 'enemy_attack';
    animationKey?: number;
    lastDiceRoll?: number; // Result of the last attack dice roll
}


export interface BattleState {
    active: boolean;
    turn: 'player' | 'enemy' | 'end';
    playerHp: number;
    playerMaxHp: number;
    playerShield: number;
    enemyHp: number;
    enemyMaxHp: number;
    logs: string[];
    // Cooldowns
    cdCut: number;
    cdStealth: number;
    // Story & Tutorial
    tutorialStep: number; // -1 means finished
    showVictory: boolean;
}

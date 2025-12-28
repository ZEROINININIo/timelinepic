
import { PuzzleConfig, GridTile } from '../types';

// Helper to generate a simple solvable 5x5 grid template
// This is a simplified static definition. In a real engine, we'd generate this.
// S = Source, T = Terminal, I = Straight, L = Corner, 3 = T-Shape, + = Cross
const createLevel = (id: string, unlockId: string, diff: number): PuzzleConfig => {
  return {
    id,
    difficulty: diff as 1|2|3|4|5,
    gridSize: 5,
    unlocksId: unlockId,
    layout: [
        // Row 0
        { x: 0, y: 0, type: 'source', rotation: 1, locked: true },
        { x: 1, y: 0, type: 'straight', rotation: 1 },
        { x: 2, y: 0, type: 'corner', rotation: 2 },
        { x: 3, y: 0, type: 'empty', rotation: 0 },
        { x: 4, y: 0, type: 'empty', rotation: 0 },
        // Row 1
        { x: 0, y: 1, type: 'empty', rotation: 0 },
        { x: 1, y: 1, type: 'empty', rotation: 0 },
        { x: 2, y: 1, type: 'straight', rotation: 0 },
        { x: 3, y: 1, type: 'empty', rotation: 0 },
        { x: 4, y: 1, type: 'empty', rotation: 0 },
        // Row 2 (Complex)
        { x: 0, y: 2, type: 'corner', rotation: 0 }, 
        { x: 1, y: 2, type: 'straight', rotation: 1 },
        { x: 2, y: 2, type: 'cross', rotation: 0 },
        { x: 3, y: 2, type: 'straight', rotation: 1 },
        { x: 4, y: 2, type: 'corner', rotation: 3 },
        // Row 3
        { x: 0, y: 3, type: 'straight', rotation: 0 },
        { x: 1, y: 3, type: 'empty', rotation: 0 },
        { x: 2, y: 3, type: 'straight', rotation: 0 },
        { x: 3, y: 3, type: 'empty', rotation: 0 },
        { x: 4, y: 3, type: 'straight', rotation: 0 },
        // Row 4
        { x: 0, y: 4, type: 'corner', rotation: 3 },
        { x: 1, y: 4, type: 'straight', rotation: 1 },
        { x: 2, y: 4, type: 't-shape', rotation: 0 },
        { x: 3, y: 4, type: 'straight', rotation: 1 },
        { x: 4, y: 4, type: 'terminal', rotation: 3, locked: true },
    ]
  };
};

export const puzzles: Record<string, PuzzleConfig> = {
  'hack-A004': createLevel('hack-A004', 'locked-chapter-004', 3),
  'hack-EXB': createLevel('hack-EXB', 'story-byaki-diary', 5),
  'hack-S001': {
      id: 'hack-S001',
      difficulty: 1,
      gridSize: 3,
      unlocksId: 'story-frag-rain-1',
      layout: [
          { x: 0, y: 0, type: 'source', rotation: 1, locked: true },
          { x: 1, y: 0, type: 'straight', rotation: 1 },
          { x: 2, y: 0, type: 'corner', rotation: 2 },
          
          { x: 0, y: 1, type: 'empty', rotation: 0 },
          { x: 1, y: 1, type: 'empty', rotation: 0 },
          { x: 2, y: 1, type: 'straight', rotation: 0 },

          { x: 0, y: 2, type: 'terminal', rotation: 0, locked: true },
          { x: 1, y: 2, type: 'straight', rotation: 1 },
          { x: 2, y: 2, type: 'corner', rotation: 3 },
      ]
  }
};

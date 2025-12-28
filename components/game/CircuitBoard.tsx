
import React, { useState, useEffect, useCallback } from 'react';
import { PuzzleConfig, GridTile, Direction } from '../../types';
import { RefreshCcw, Lock, Unlock, Zap } from 'lucide-react';

interface CircuitBoardProps {
  config: PuzzleConfig;
  onSuccess: () => void;
  onExit: () => void;
  isLightTheme: boolean;
}

// Connections for each tile type at 0 rotation (Up, Right, Down, Left)
// 1 = connects
const TILE_CONNECTIONS: Record<string, [number, number, number, number]> = {
  'empty': [0, 0, 0, 0],
  'straight': [1, 0, 1, 0], // Connects Up/Down by default
  'corner': [1, 1, 0, 0],   // Connects Up/Right by default (Top-Right corner)
  't-shape': [1, 1, 1, 0],  // Connects Up/Right/Down (T pointing Right)
  'cross': [1, 1, 1, 1],    // All
  'source': [0, 1, 0, 0],   // Points Right
  'terminal': [0, 0, 0, 1], // Accepts Left
};

const CircuitBoard: React.FC<CircuitBoardProps> = ({ config, onSuccess, onExit, isLightTheme }) => {
  const [grid, setGrid] = useState<GridTile[]>([]);
  const [poweredTiles, setPoweredTiles] = useState<Set<string>>(new Set());
  const [isSolved, setIsSolved] = useState(false);

  // Initialize Grid with Random Rotations
  useEffect(() => {
    const initGrid = config.layout.map(tile => ({
      ...tile,
      // Randomize rotation if not locked
      rotation: tile.locked ? tile.rotation : Math.floor(Math.random() * 4) as Direction
    }));
    setGrid(initGrid);
  }, [config]);

  // Check Power Flow (BFS)
  const calculatePower = useCallback(() => {
    if (grid.length === 0) return;

    const size = config.gridSize;
    const newPowered = new Set<string>();
    const queue: GridTile[] = [];

    // Find Source
    const source = grid.find(t => t.type === 'source');
    if (source) {
      queue.push(source);
      newPowered.add(`${source.x},${source.y}`);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const cx = current.x;
      const cy = current.y;

      // Get neighbors (Up, Right, Down, Left)
      const neighbors = [
        { x: cx, y: cy - 1, dir: 0 }, // Up
        { x: cx + 1, y: cy, dir: 1 }, // Right
        { x: cx, y: cy + 1, dir: 2 }, // Down
        { x: cx - 1, y: cy, dir: 3 }, // Left
      ];

      neighbors.forEach(({ x, y, dir }) => {
        if (x < 0 || x >= size || y < 0 || y >= size) return;
        
        const neighbor = grid.find(t => t.x === x && t.y === y);
        if (!neighbor || neighbor.type === 'empty') return;
        if (newPowered.has(`${x},${y}`)) return;

        // Check Connection Logic
        // 1. Does Current have a port facing Neighbor?
        // 2. Does Neighbor have a port facing Current?
        
        // Effective outputs of current tile given rotation
        // Rotation shifts connection array right (clockwise)
        const currentConns = getRotatedConnections(current.type, current.rotation);
        
        // Effective inputs of neighbor
        const neighborConns = getRotatedConnections(neighbor.type, neighbor.rotation);
        
        // Inverse direction index for neighbor (Up(0) -> Down(2), Right(1) -> Left(3))
        const neighborDir = (dir + 2) % 4;

        if (currentConns[dir] === 1 && neighborConns[neighborDir] === 1) {
          newPowered.add(`${x},${y}`);
          queue.push(neighbor);
        }
      });
    }

    setPoweredTiles(newPowered);

    // Check Win
    const terminal = grid.find(t => t.type === 'terminal');
    if (terminal && newPowered.has(`${terminal.x},${terminal.y}`)) {
      setIsSolved(true);
      setTimeout(onSuccess, 1500);
    }
  }, [grid, config.gridSize, onSuccess]);

  useEffect(() => {
    calculatePower();
  }, [grid, calculatePower]);

  const rotateTile = (index: number) => {
    if (isSolved || grid[index].locked) return;
    
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[index] = {
        ...newGrid[index],
        rotation: (newGrid[index].rotation + 1) % 4 as Direction
      };
      return newGrid;
    });
  };

  const getRotatedConnections = (type: string, rot: number) => {
    const base = TILE_CONNECTIONS[type] || [0,0,0,0];
    // Rotate array 'rot' times to the right
    const result = [...base];
    for(let i=0; i<rot; i++) {
      result.unshift(result.pop()!);
    }
    return result;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in font-mono select-none" onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div className="absolute top-8 w-full max-w-2xl px-8 flex justify-between items-center text-emerald-500">
        <div className="flex items-center gap-4">
            <Zap className={`animate-pulse ${isSolved ? 'text-emerald-400' : 'text-emerald-800'}`} />
            <div>
                <h2 className="text-xl font-black tracking-widest uppercase">Decryption_Protocol</h2>
                <p className="text-xs opacity-60">TARGET: {config.unlocksId}</p>
            </div>
        </div>
        <button onClick={onExit} className="border border-emerald-800 px-4 py-2 hover:bg-emerald-900/50 transition-colors uppercase text-xs font-bold">
            Abort
        </button>
      </div>

      {/* Game Grid */}
      <div 
        className="relative bg-black border-4 border-emerald-900/50 p-4 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
            gap: '4px'
        }}
      >
        {/* Overlay Glitch on Win */}
        {isSolved && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[2px] animate-pulse">
                <div className="bg-black border-2 border-emerald-400 p-6 text-center transform scale-110">
                    <Unlock size={48} className="mx-auto text-emerald-400 mb-2" />
                    <div className="text-2xl font-black text-emerald-400 tracking-widest glitch-text-heavy" data-text="ACCESS_GRANTED">ACCESS_GRANTED</div>
                </div>
            </div>
        )}

        {grid.map((tile, index) => {
            const isPowered = poweredTiles.has(`${tile.x},${tile.y}`);
            return (
                <div 
                    key={index}
                    onClick={() => rotateTile(index)}
                    className={`
                        w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center transition-all duration-300
                        ${tile.type === 'empty' ? '' : 'bg-emerald-950/20 border border-emerald-900/30'}
                        ${!tile.locked && !isSolved ? 'cursor-pointer hover:bg-emerald-900/40' : ''}
                    `}
                >
                    {/* Render Tile SVG based on Type and Rotation */}
                    <div 
                        className={`w-full h-full transition-transform duration-300 ${isPowered ? 'opacity-100 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'opacity-30'}`}
                        style={{ transform: `rotate(${tile.rotation * 90}deg)` }}
                    >
                        {renderTileSvg(tile.type, isPowered)}
                    </div>
                    {tile.locked && tile.type !== 'empty' && tile.type !== 'source' && tile.type !== 'terminal' && (
                        <div className="absolute top-0.5 right-0.5 opacity-30 text-emerald-700">
                            <Lock size={8} />
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      <div className="mt-8 text-xs text-emerald-700/50 font-mono text-center">
          CLICK TO ROTATE // CONNECT SOURCE TO TERMINAL
      </div>
    </div>
  );
};

// Helper to render SVG paths for tiles
const renderTileSvg = (type: string, active: boolean) => {
    const color = active ? '#34d399' : '#064e3b'; // Emerald-400 vs Emerald-900
    const stroke = active ? 4 : 2;
    
    switch(type) {
        case 'source':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth={stroke} />
                    <circle cx="50" cy="50" r="15" fill={active ? color : 'none'} className={active ? 'animate-pulse' : ''} />
                    <line x1="50" y1="50" x2="100" y2="50" stroke={color} strokeWidth={stroke} />
                </svg>
            );
        case 'terminal':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="25" y="25" width="50" height="50" fill="none" stroke={color} strokeWidth={stroke} />
                    {active && <path d="M35 50 L45 60 L65 40" fill="none" stroke={color} strokeWidth={stroke} />}
                    <line x1="0" y1="50" x2="25" y2="50" stroke={color} strokeWidth={stroke} />
                </svg>
            );
        case 'straight':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth={stroke} />
                </svg>
            );
        case 'corner':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50 0 L50 50 L100 50" fill="none" stroke={color} strokeWidth={stroke} />
                </svg>
            );
        case 't-shape':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50 0 L50 100 M50 50 L100 50" fill="none" stroke={color} strokeWidth={stroke} />
                </svg>
            );
        case 'cross':
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50 0 L50 100 M0 50 L100 50" fill="none" stroke={color} strokeWidth={stroke} />
                </svg>
            );
        default:
            return null;
    }
};

export default CircuitBoard;

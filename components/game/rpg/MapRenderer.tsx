
import React, { useMemo } from 'react';
import { RPGObject } from '../../../types';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';
import { Globe, Music } from 'lucide-react';

interface MapRendererProps {
  objects: RPGObject[];
  activeObjId: string | null;
}

const MapRenderer: React.FC<MapRendererProps> = ({ objects, activeObjId }) => {
  // Compute display labels
  const objectsWithIndex = useMemo(() => {
      let mCount = 0;
      let oCount = 0;
      let uCount = 0;
      
      return objects.map(obj => {
          let displayNumber: string | undefined;
          
          if (obj.type === 'exhibit') {
              if (obj.x > 1850) {
                  // Unofficial Zone
                  uCount++;
                  displayNumber = `U-${String(uCount).padStart(2, '0')}`;
              } else if (obj.x > 1050) {
                  // Official Zone
                  oCount++;
                  displayNumber = `O-${String(oCount).padStart(2, '0')}`;
              } else {
                  // Main Zone
                  mCount++;
                  displayNumber = `M-${String(mCount).padStart(2, '0')}`;
              }
          }
          return { ...obj, displayNumber };
      });
  }, [objects]);

  return (
    <div 
        className="relative bg-ash-dark/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-4 border-ash-dark will-change-transform"
        style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
    >
        {/* Floor Decals - Main Hall */}
        <div className="absolute top-[400px] left-[500px] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-2 border-dashed border-ash-gray/10 rounded-full pointer-events-none"></div>
        
        {/* Floor Decals - Official Community Sector */}
        <div className="absolute top-[400px] left-[1450px] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-amber-900/20 bg-amber-950/10 rotate-45 pointer-events-none"></div>
        <div className="absolute top-[300px] left-[1450px] -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="text-[20px] font-black text-amber-900/30 tracking-widest whitespace-nowrap">
                [ OFFICIAL_GALLERY ]
            </div>
            <div className="text-[12px] font-bold text-amber-900/20 tracking-[0.2em] mt-1 whitespace-nowrap">
                官方社区图集
            </div>
        </div>

        {/* Floor Decals - Unofficial Community Sector */}
        <div className="absolute top-[400px] left-[2200px] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-emerald-900/20 bg-emerald-950/10 -rotate-45 pointer-events-none"></div>
        <div className="absolute top-[300px] left-[2200px] -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="text-[20px] font-black text-emerald-900/30 tracking-widest whitespace-nowrap">
                [ UNOFFICIAL_GALLERY ]
            </div>
            <div className="text-[12px] font-bold text-emerald-900/20 tracking-[0.2em] mt-1 whitespace-nowrap">
                非官方社区图集
            </div>
        </div>

        {/* Static Objects */}
        {objectsWithIndex.map(obj => {
            const isFakeWall = obj.label === 'FAKE_WALL';
            const isWall = obj.type === 'wall' || isFakeWall;
            const isTerminal = obj.type === 'terminal';
            // Determine active state purely for styling to avoid deep re-renders if possible, 
            // but since we are memoized, this is fine.
            const isActive = activeObjId === obj.id;

            return (
                <div
                    key={obj.id}
                    className={`
                        absolute flex items-center justify-center
                        ${isWall ? 'bg-ash-black border border-ash-gray/30 shadow-hard' : ''}
                        ${obj.type === 'exhibit' ? 'bg-black/80 border-2 border-ash-light/50 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}
                        ${obj.type === 'npc' ? 'z-20' : ''}
                        ${isActive && !isTerminal ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : ''}
                        ${isTerminal ? 'z-10' : ''}
                    `}
                    style={{
                        left: obj.x,
                        top: obj.y,
                        width: obj.width,
                        height: obj.height,
                        borderRadius: obj.type === 'npc' || isTerminal ? '9999px' : '0',
                        zIndex: isWall ? 5 : undefined
                    }}
                >
                    {/* Exhibit Content */}
                    {obj.type === 'exhibit' && obj.imageUrl && (
                        <div className="w-full h-full relative overflow-hidden group">
                            {/* Low res placeholder or simplified loading could go here for perf */}
                            <img 
                                src={obj.imageUrl} 
                                alt={obj.label} 
                                loading="lazy"
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0 will-change-[opacity,filter]"
                            />
                            {/* Number Label */}
                            <div className="absolute top-0 right-0 bg-ash-light text-ash-black text-[8px] font-bold font-mono px-1">
                                {obj.displayNumber}
                            </div>
                        </div>
                    )}

                    {/* NPC Content */}
                    {obj.type === 'npc' && obj.imageUrl && (
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-500/50 relative">
                            <img 
                                src={obj.imageUrl} 
                                alt={obj.label} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
                        </div>
                    )}

                    {/* Terminal Content (New Visuals) */}
                    {isTerminal && (
                        <div className="w-full h-full relative flex items-center justify-center">
                            {/* Floor Base */}
                            <div className={`absolute inset-0 rounded-full border-2 ${isActive ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]' : 'border-sky-900/50'} bg-black/50`}></div>
                            {/* Inner Ring */}
                            <div className={`absolute inset-2 rounded-full border border-dashed border-sky-500/50 animate-spin-slow`}></div>
                            {/* Hologram Icon */}
                            <div className={`relative z-20 text-sky-400 ${isActive ? 'animate-bounce text-sky-300' : 'opacity-80'}`}>
                                {obj.id === 'link-main' ? <Globe size={20} /> : <Music size={20} />}
                            </div>
                            {/* Light Beam */}
                            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-t from-sky-500/30 to-transparent blur-sm pointer-events-none origin-bottom transform -translate-y-2"></div>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
  );
};

// Optimization: Memoize the entire component to prevent re-renders when parent state changes (e.g. coordinates)
// MapRenderer only needs to update when objects change or the active target changes.
export default React.memo(MapRenderer);

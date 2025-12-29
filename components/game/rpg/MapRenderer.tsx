
import React, { useMemo } from 'react';
import { RPGObject } from '../../../types';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';

interface MapRendererProps {
  objects: RPGObject[];
  activeObjId: string | null;
}

const MapRenderer: React.FC<MapRendererProps> = ({ objects, activeObjId }) => {
  // Compute display labels
  const objectsWithIndex = useMemo(() => {
      let mCount = 0;
      let fCount = 0;
      return objects.map(obj => {
          let displayNumber: string | undefined;
          
          if (obj.type === 'exhibit') {
              const isFan = obj.x > 1050;
              if (isFan) {
                  fCount++;
                  displayNumber = `F-${String(fCount).padStart(2, '0')}`;
              } else {
                  mCount++;
                  displayNumber = `M-${String(mCount).padStart(2, '0')}`;
              }
          }
          return { ...obj, displayNumber };
      });
  }, [objects]);

  return (
    <div 
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

        {/* Static Objects */}
        {objectsWithIndex.map(obj => (
            <div
                key={obj.id}
                className={`
                    absolute flex items-center justify-center
                    ${obj.type === 'wall' ? 'bg-ash-black border border-ash-gray/30 shadow-hard' : ''}
                    ${obj.type === 'exhibit' ? 'bg-black/80 border-2 border-ash-light/50 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}
                    ${obj.type === 'npc' ? 'z-20' : ''}
                    ${activeObjId === obj.id ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : ''}
                `}
                style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                    borderRadius: obj.type === 'npc' ? '9999px' : '0'
                }}
            >
                {/* Exhibit Content */}
                {obj.type === 'exhibit' && obj.imageUrl && (
                    <div className="w-full h-full relative overflow-hidden group">
                        <img 
                            src={obj.imageUrl} 
                            alt={obj.label} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
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
            </div>
        ))}
    </div>
  );
};

export default MapRenderer;

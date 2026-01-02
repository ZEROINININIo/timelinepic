
import React from 'react';
import { RemotePlayer } from '../../../types';
import { Swords, Crown } from 'lucide-react';
import { PLAYER_SIZE } from './constants';

interface RemotePlayersLayerProps {
  players: (RemotePlayer & { safeX: number, safeY: number })[];
  nearbyPlayer: RemotePlayer | null;
  setNearbyPlayer: (p: RemotePlayer | null) => void;
  battleActive: boolean;
  onSendPvP: () => void;
  myId: string;
}

const RemotePlayersLayer: React.FC<RemotePlayersLayerProps> = ({
  players,
  nearbyPlayer,
  setNearbyPlayer,
  battleActive,
  onSendPvP,
  myId
}) => {
  return (
    <>
      {players.map(p => (
        <div 
            key={p.id}
            className="absolute top-0 left-0 z-30 flex flex-col items-center transition-transform duration-[2000ms] ease-linear will-change-transform cursor-pointer"
            style={{ 
                width: PLAYER_SIZE, 
                height: PLAYER_SIZE,
                transform: `translate3d(${p.safeX}px, ${p.safeY}px, 0)` 
            }}
            onClick={(e) => {
                // Manual Click fallback if joystick disabled
                e.stopPropagation();
                setNearbyPlayer(p);
            }}
        >
            {/* Remote Chat Bubble - No Time Expiry Check to fix visibility issues */}
            {p.msg && (!p.msg.startsWith('[[') || p.msg.startsWith('[[ROOT::')) && (
                <div className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 animate-bounce w-max max-w-[200px] rounded-sm leading-tight text-center whitespace-normal break-words ${
                    p.msg.startsWith('[[ROOT::') 
                    ? 'bg-amber-950/90 border-2 border-amber-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.6)] px-3 py-2' 
                    : 'bg-black/90 border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] px-2 py-1'
                }`}>
                    {p.msg.startsWith('[[ROOT::') ? (
                        <>
                            <div className="flex items-center justify-center gap-1 border-b border-amber-500/50 pb-1 mb-1 text-[8px] font-black tracking-widest text-amber-500">
                                <Crown size={10} /> CREATOR
                            </div>
                            <div className="font-serif italic text-xs">
                                {p.msg.slice(8, -2)}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500"></div>
                        </>
                    ) : (
                        <>
                            <div className="text-[10px]">{p.msg}</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-500"></div>
                        </>
                    )}
                </div>
            )}

            {/* PvP Invite Indicator bubble */}
            {p.msg && p.msg.startsWith('[[DUEL_REQ') && (
                <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-white text-[9px] px-1 whitespace-nowrap z-50 animate-pulse">
                    ⚔️ CHALLENGING
                </div>
            )}

            <div className="absolute -top-6 text-[8px] font-mono text-cyan-500 font-bold bg-black/50 px-1 border border-cyan-900/50 whitespace-nowrap">
                {p.nickname} <span className="animate-pulse">///</span>
            </div>
            
            {/* Interaction Trigger for PvP */}
            {nearbyPlayer?.id === p.id && !battleActive && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSendPvP();
                    }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 border border-red-400 shadow-hard hover:scale-110 transition-transform z-50 flex items-center gap-1"
                >
                    <Swords size={10} /> DUEL
                </button>
            )}
            
            <div className="w-full h-full relative flex items-center justify-center opacity-60">
                {/* Ghost Glow */}
                <div className="absolute inset-0 bg-cyan-900/30 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
                
                <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 fill-current relative z-10 p-1">
                    <path d="M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z" />
                </svg>
            </div>
        </div>
      ))}
    </>
  );
};

export default React.memo(RemotePlayersLayer);

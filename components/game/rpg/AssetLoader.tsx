
import React from 'react';
import { Loader2, HardDrive, FastForward } from 'lucide-react';

interface AssetLoaderProps {
  loadedCount: number;
  totalCount: number;
  onSkip: () => void;
}

const AssetLoader: React.FC<AssetLoaderProps> = ({ loadedCount, totalCount, onSkip }) => {
  const percentage = Math.floor((loadedCount / totalCount) * 100);

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center font-mono select-none z-[100] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-hard opacity-10 animate-[pulse_4s_infinite]"></div>
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-8">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                <HardDrive size={48} className="text-emerald-500 relative z-10 animate-bounce" />
            </div>
            <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-bold text-ash-light uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> DOWNLOADING_ASSETS</span>
                    <span className="text-emerald-500">{percentage}%</span>
                </div>
                <div className="w-full h-2 bg-ash-dark border border-ash-gray/30 overflow-hidden relative">
                    <div className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-ash-gray/50 font-mono">
                    <span>FILES: {loadedCount} / {totalCount}</span>
                    <span>CACHING_TEXTURES...</span>
                </div>
            </div>
            <button onClick={onSkip} className="mt-8 text-[10px] text-ash-gray/50 hover:text-emerald-400 border border-ash-gray/30 px-4 py-2 uppercase tracking-widest transition-all bg-black/50 backdrop-blur-sm flex items-center gap-2 group">
                [SKIP_PRELOAD] <FastForward size={10} />
            </button>
        </div>
    </div>
  );
};

export default AssetLoader;

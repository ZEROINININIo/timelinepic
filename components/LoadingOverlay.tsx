
import React from 'react';
import { Loader2, HardDrive } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-ash-black text-ash-gray font-mono z-50">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-ash-light/20 blur-xl rounded-full animate-pulse"></div>
        <HardDrive size={48} className="text-ash-light relative z-10 animate-bounce" />
      </div>
      
      <div className="flex items-center gap-2 text-lg font-bold tracking-widest text-ash-light">
        <Loader2 size={20} className="animate-spin" />
        <span>LOADING_MODULE...</span>
      </div>
      
      <div className="mt-2 w-64 h-1 bg-ash-dark border border-ash-gray/30 overflow-hidden">
        <div className="h-full bg-ash-light w-1/2 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-ash-light to-transparent opacity-50"></div>
      </div>
      
      <div className="mt-4 text-[10px] opacity-50">
        &gt; DECRYPTING_ASSETS<br/>
        &gt; ESTABLISHING_LINK
      </div>
    </div>
  );
};

export default LoadingOverlay;

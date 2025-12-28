
import React, { useEffect, useState } from 'react';
import { Scan, Fingerprint, Aperture } from 'lucide-react';

interface GalleryEntryProps {
  onComplete: () => void;
}

const GalleryEntry: React.FC<GalleryEntryProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 0: Init
    // Stage 1: Scanning (0.8s)
    // Stage 2: Access Granted (2.5s)
    // Stage 3: Fade out (3.5s)
    // Complete: 4.0s
    
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2500);
    const t3 = setTimeout(() => setStage(3), 3500);
    const t4 = setTimeout(onComplete, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-black text-ash-light flex flex-col items-center justify-center font-mono select-none overflow-hidden cursor-none">
      
      {/* Background Grid */}
      <div className={`absolute inset-0 bg-grid-hard opacity-20 transition-transform duration-[4000ms] ease-out ${stage > 0 ? 'scale-110' : 'scale-100'}`}></div>

      {/* Central Visual */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${stage === 3 ? 'opacity-0 scale-150 blur-sm' : 'opacity-100 scale-100'}`}>
        
        <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center mb-8">
            {/* Spinning Rings */}
            <div className={`absolute inset-0 border-2 border-ash-gray/30 rounded-full border-dashed animate-spin-slow transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>
            <div className={`absolute inset-4 border border-ash-light/20 rounded-full animate-spin-reverse-slow transition-all duration-1000 delay-100 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>
            
            {/* Icon */}
            <div className={`transition-all duration-500 ${stage === 2 ? 'text-emerald-400 scale-110' : 'text-ash-gray'}`}>
                {stage === 0 && <Aperture size={48} className="animate-pulse" />}
                {stage === 1 && <Scan size={48} className="animate-bounce" />}
                {stage >= 2 && <Fingerprint size={64} className="animate-pulse" />}
            </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
            <div className="h-6 overflow-hidden">
                <div className={`text-xl md:text-3xl font-black uppercase tracking-[0.3em] transition-transform duration-500 ${stage === 0 ? 'translate-y-0' : '-translate-y-full'}`}>
                    INITIALIZING
                </div>
                <div className={`text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-emerald-500 transition-transform duration-500 ${stage === 1 ? '-translate-y-full' : stage > 1 ? '-translate-y-[200%]' : 'translate-y-0'}`}>
                    SCANNING...
                </div>
                <div className={`text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-ash-light transition-transform duration-500 ${stage === 2 ? '-translate-y-[200%]' : 'translate-y-0'}`}>
                    ACCESS GRANTED
                </div>
            </div>

            <div className="text-[10px] text-ash-gray font-mono h-4">
                {stage === 0 && "LOADING_ASSETS..."}
                {stage === 1 && "VERIFYING_BIOMETRICS..."}
                {stage >= 2 && "WELCOME, OPERATOR."}
            </div>
        </div>

        {/* Progress Line */}
        <div className="mt-8 w-64 h-1 bg-ash-dark border border-ash-gray/30 overflow-hidden">
            <div 
                className="h-full bg-ash-light shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out"
                style={{ width: stage === 0 ? '10%' : stage === 1 ? '60%' : '100%' }}
            ></div>
        </div>

      </div>

      {/* Flash Overlay */}
      <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-700 ${stage === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

export default GalleryEntry;
    
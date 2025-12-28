
import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Check } from 'lucide-react';
import { Language } from '../types';

interface FullscreenToggleProps {
  isSetupMode?: boolean;
  language?: Language;
}

const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ isSetupMode = false, language }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  const getRecLabel = () => {
    if (!language) return '';
    if (language === 'zh-CN') return '(不推荐开启)';
    if (language === 'zh-TW') return '(不推薦開啟)';
    return '(NOT REC)';
  };

  if (isSetupMode) {
     return (
        <button 
            onClick={toggleFullscreen}
            className={`w-full flex items-center justify-between p-3 border font-mono text-xs transition-colors ${
                isFullscreen 
                ? 'border-amber-500 bg-amber-500/20 text-amber-400' 
                : 'border-amber-800/50 text-amber-800 hover:border-amber-600 hover:text-amber-600'
            }`}
        >
            <span className="flex items-center gap-2">
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />} 
              FULLSCREEN
              <span className="opacity-60 text-[10px] scale-90 origin-left">{getRecLabel()}</span>
            </span>
            {isFullscreen ? <Check size={14} /> : <span>OFF</span>}
        </button>
     );
  }

  return (
    <button 
      onClick={toggleFullscreen}
      className={`flex items-center justify-between w-full px-3 py-3 border-2 transition-all duration-300 shadow-hard group
        ${isFullscreen 
          ? 'bg-ash-light text-ash-black border-ash-light' 
          : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
        }`}
    >
      <div className="flex items-center gap-3">
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        <span className="text-[10px] font-mono font-bold uppercase">
            Display
        </span>
      </div>
      
      <span className="text-[10px] font-mono font-bold">
        {isFullscreen ? 'FULL' : 'WIN'}
      </span>
    </button>
  );
};

export default FullscreenToggle;

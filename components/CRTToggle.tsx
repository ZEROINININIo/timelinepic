import React, { useEffect } from 'react';
import { Monitor, Zap, Check } from 'lucide-react';
import { Language } from '../types';

interface CRTToggleProps {
  value?: boolean;
  onChange?: (val: boolean) => void;
  isSetupMode?: boolean;
  language?: Language;
}

const CRTToggle: React.FC<CRTToggleProps> = ({ value, onChange, isSetupMode = false, language }) => {
  
  useEffect(() => {
    if (value !== undefined) {
      if (value) {
        document.body.classList.add('crt-enabled');
      } else {
        document.body.classList.remove('crt-enabled');
      }
    }
  }, [value]);

  const handleClick = () => {
    if (onChange && value !== undefined) {
      onChange(!value);
    }
  };

  const getRecLabel = () => {
    if (!language) return '';
    if (language === 'zh-CN') return '(推荐启用)';
    if (language === 'zh-TW') return '(推薦啟用)';
    return '(RECOMMENDED)';
  };

  if (isSetupMode) {
     return (
        <button 
            onClick={handleClick}
            className={`w-full flex items-center justify-between p-3 border font-mono text-xs transition-colors ${
                value 
                ? 'border-amber-500 bg-amber-500/20 text-amber-400' 
                : 'border-amber-800/50 text-amber-800 hover:border-amber-600 hover:text-amber-600'
            }`}
        >
            <span className="flex items-center gap-2">
              <Monitor size={14} /> 
              CRT_EFFECTS
              <span className="opacity-60 text-[10px] scale-90 origin-left">{getRecLabel()}</span>
            </span>
            {value ? <Check size={14} /> : <span>OFF</span>}
        </button>
     );
  }

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center justify-between w-full px-3 py-3 border-2 transition-all duration-300 shadow-hard group
        ${value 
          ? 'bg-ash-light text-ash-black border-ash-light' 
          : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
        }`}
    >
      <div className="flex items-center gap-3">
        <Monitor size={16} />
        <span className="text-[10px] font-mono font-bold uppercase">
            CRT FX
        </span>
      </div>
      
      <div className="flex items-center gap-2">
         {value ? (
             <>
                <span className="text-[10px] font-mono font-bold">ON</span>
                <Zap size={10} className="fill-current animate-pulse" />
             </>
         ) : (
            <span className="text-[10px] font-mono font-bold">OFF</span>
         )}
      </div>
    </button>
  );
};

export default CRTToggle;
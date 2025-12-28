import React, { useEffect } from 'react';
import { Sun, Moon, Check } from 'lucide-react';

interface ThemeToggleProps {
  value?: boolean; // true = dark (default in CSS), false = light (but logic was inverted in old component)
  // Actually, previous logic: isLight = true -> class 'light-theme'.
  // Let's stick to: value=true -> Light Theme.
  onChange?: (val: boolean) => void;
  isSetupMode?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange, isSetupMode = false }) => {
  
  // Previous logic: isLight adds 'light-theme'. Default CSS is Dark.
  // So value=true means Light Theme active.
  
  useEffect(() => {
    if (value !== undefined) {
      if (value) { // isLight
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }
  }, [value]);

  const handleClick = () => {
    if (onChange && value !== undefined) {
      onChange(!value);
    }
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
                {value ? <Sun size={14} /> : <Moon size={14} />} 
                THEME: {value ? 'LIGHT' : 'DARK'}
           </span>
           <Check size={14} className={!value && !onChange ? 'hidden' : ''} /> {/* Always show check or state */}
       </button>
    );
 }

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center justify-between w-full px-3 py-3 border-2 transition-all duration-300 shadow-hard group
        ${value 
          ? 'bg-ash-black text-ash-light border-ash-light' 
          : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:border-ash-light hover:text-ash-light'
        }`}
    >
      <div className="flex items-center gap-3">
        {value ? <Sun size={16} /> : <Moon size={16} />}
        <span className="text-[10px] font-mono font-bold uppercase">
            Theme
        </span>
      </div>
      <span className="text-[10px] font-mono font-bold">
        {value ? 'LIGHT' : 'DARK'}
      </span>
    </button>
  );
};

export default ThemeToggle;

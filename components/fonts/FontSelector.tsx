
import React from 'react';
import { Type } from 'lucide-react';
import { Language } from '../../types';
import { ReaderFont, fontOptions } from './fontConfig';

interface FontSelectorProps {
  value: ReaderFont;
  onChange: (font: ReaderFont) => void;
  language: Language;
  isSetupMode?: boolean;
}

const FontSelector: React.FC<FontSelectorProps> = ({ value, onChange, language, isSetupMode = false }) => {
  
  if (isSetupMode) {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold text-amber-600 mb-2 uppercase flex items-center gap-2">
            <Type size={14} /> {language === 'en' ? 'TEXT_FONT' : '阅读字体'}
        </label>
        <div className="flex gap-2">
            {fontOptions.map(font => (
                <button
                    key={font.id}
                    onClick={() => onChange(font.id)}
                    className={`flex-1 py-2 px-1 border text-[10px] uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${font.cssClass} ${
                        value === font.id
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.3)]'
                        : 'border-amber-900/50 text-amber-800 hover:border-amber-700 hover:text-amber-600'
                    }`}
                >
                    <span className="font-bold">{font.label[language] || font.label['en']}</span>
                    <span className="text-[8px] opacity-80 scale-90">{font.note[language] || font.note['en']}</span>
                </button>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-2 border-ash-gray/30 bg-ash-black/50">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-ash-gray uppercase">
            <Type size={12} /> {language === 'en' ? 'READER_FONT' : '阅读字体'}
        </div>
        <div className="flex gap-2">
            {fontOptions.map(font => (
                <button
                    key={font.id}
                    onClick={() => onChange(font.id)}
                    className={`flex-1 py-2 border transition-all text-[10px] flex flex-col items-center justify-center gap-0.5 ${font.cssClass} ${
                        value === font.id
                        ? 'bg-ash-light text-ash-black border-ash-light shadow-hard-sm'
                        : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:text-ash-light hover:border-ash-gray'
                    }`}
                >
                    <span className="font-bold">{font.label[language] || font.label['en']}</span>
                    <span className="text-[8px] opacity-70 scale-90 font-normal font-sans">{font.note[language] || font.note['en']}</span>
                </button>
            ))}
        </div>
    </div>
  );
};

export default FontSelector;

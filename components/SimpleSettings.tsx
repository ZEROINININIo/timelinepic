
import React, { useState } from 'react';
import { Settings, X, Globe, Monitor, Volume2, Music } from 'lucide-react';
import { Language } from '../types';
import CRTToggle from './CRTToggle';
import BackgroundMusic from './BackgroundMusic';

interface SimpleSettingsProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  bgmPlaying: boolean;
  setBgmPlaying: (val: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (val: number) => void;
}

const SimpleSettings: React.FC<SimpleSettingsProps> = ({
  language, setLanguage, crtEnabled, setCrtEnabled, bgmPlaying, setBgmPlaying, bgmVolume, setBgmVolume
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-20 z-[90] p-2 text-ash-gray hover:text-ash-light transition-colors"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsOpen(false)}>
          <div className="bg-ash-black border-2 border-ash-gray p-6 w-full max-w-sm shadow-hard relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-ash-gray hover:text-white"><X size={20} /></button>
            
            <h2 className="text-xl font-black text-ash-light mb-6 flex items-center gap-2">
                <Settings size={24} /> SYSTEM_CONFIG
            </h2>

            <div className="space-y-6">
                {/* Language */}
                <div className="space-y-2">
                    <div className="text-xs font-mono text-ash-gray flex items-center gap-2"><Globe size={12} /> LANGUAGE</div>
                    <div className="flex gap-2">
                        {(['zh-CN', 'zh-TW', 'en'] as Language[]).map(l => (
                            <button
                                key={l}
                                onClick={() => setLanguage(l)}
                                className={`flex-1 py-2 text-xs font-bold border ${language === l ? 'bg-ash-light text-black border-ash-light' : 'bg-transparent text-ash-gray border-ash-gray/30'}`}
                            >
                                {l === 'en' ? 'EN' : l === 'zh-CN' ? '简' : '繁'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visual */}
                <div className="space-y-2">
                    <div className="text-xs font-mono text-ash-gray flex items-center gap-2"><Monitor size={12} /> VISUAL</div>
                    <CRTToggle value={crtEnabled} onChange={setCrtEnabled} />
                </div>

                {/* Audio (Mirroring Global BGM) */}
                <div className="space-y-2">
                    <div className="text-xs font-mono text-ash-gray flex items-center gap-2"><Volume2 size={12} /> AUDIO</div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setBgmPlaying(!bgmPlaying)} className={`p-2 border ${bgmPlaying ? 'bg-green-900/30 text-green-400 border-green-500' : 'text-ash-gray border-ash-gray/30'}`}>
                            <Music size={16} />
                        </button>
                        <input 
                            type="range" min="0" max="1" step="0.05" value={bgmVolume} 
                            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-ash-dark appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-ash-light"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleSettings;

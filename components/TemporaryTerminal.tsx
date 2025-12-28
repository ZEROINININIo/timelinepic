
import React, { useState, useEffect } from 'react';
import { X, Radio, Wifi, Battery, Terminal, Cpu } from 'lucide-react';
import { Language } from '../types';
import { terminalScripts, LinearScriptNode } from '../data/T001';

interface TemporaryTerminalProps {
  onClose: () => void;
  onComplete?: () => void; // New prop for script completion
  language: Language;
  scriptId: string;
}

const TemporaryTerminal: React.FC<TemporaryTerminalProps> = ({ onClose, onComplete, language, scriptId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Flatten scripts if we eventually have multiple files (T001, T002...) importing into a central registry
  // For now, T001 exports the dictionary directly.
  const currentScript = terminalScripts[scriptId];
  const currentNode: LinearScriptNode | undefined = currentScript ? currentScript[currentIndex] : undefined;

  useEffect(() => {
    if (!currentScript) {
        console.error(`Script ID "${scriptId}" not found.`);
        onClose();
        return;
    }

    if (!currentNode) {
        // End of script reached via index increment
        if (onComplete) {
            onComplete();
        } else {
            onClose(); 
        }
        return;
    }

    const fullText = currentNode.text[language] || currentNode.text['en'];
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;
    const speed = 40; 

    const timer = setInterval(() => {
      if (charIndex < fullText.length) {
        charIndex++;
        setDisplayedText(fullText.substring(0, charIndex));
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [currentIndex, language, scriptId, currentScript]);

  const handleInteraction = () => {
    if (!currentNode) return;
    
    const fullText = currentNode.text[language] || currentNode.text['en'];
    
    if (isTyping) {
        // Instant complete
        setDisplayedText(fullText);
        setIsTyping(false);
    } else {
        // Next node
        if (currentScript && currentIndex < currentScript.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // End of script interaction
            if (onComplete) {
                onComplete();
            } else {
                onClose();
            }
        }
    }
  };

  if (!currentNode) return null;

  const isGlitch = currentNode.imageExpression === 'glitch';
  const isPain = currentNode.imageExpression === 'pain';
  const isAwakening = currentNode.imageExpression === 'awakening';
  const isSystem = currentNode.speaker === 'System';

  // Dynamic Border Color based on state
  const borderColor = isPain ? 'border-red-900/50' : isAwakening ? 'border-emerald-500' : 'border-emerald-900/50';
  const glowColor = isPain ? 'shadow-red-900/20' : isAwakening ? 'shadow-emerald-500/30' : 'shadow-emerald-500/10';

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in font-mono cursor-pointer" onClick={handleInteraction}>
        <div 
            className={`w-full max-w-3xl bg-black border-2 ${borderColor} shadow-[0_0_50px_${glowColor}] flex flex-col relative overflow-hidden min-h-[400px] md:min-h-[500px] transition-colors duration-500`}
            onClick={(e) => e.stopPropagation()} // Prevent click through to background
        >
            
            {/* Scanlines & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
            {isGlitch && <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none z-20 mix-blend-overlay"></div>}
            
            {/* Header */}
            <div className={`flex justify-between items-center p-3 border-b ${borderColor} bg-black/50 z-10 shrink-0`}>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-600">
                    <Radio size={14} className="animate-pulse" />
                    INTERNAL_LOG // {scriptId.toUpperCase()}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-emerald-800">
                    <span className="flex items-center gap-1"><Wifi size={10} /> 1ms</span>
                    <span className="flex items-center gap-1"><Battery size={10} /> inf</span>
                    <button onClick={onClose} className="hover:text-emerald-300 transition-colors"><X size={16} /></button>
                </div>
            </div>

            {/* Main Content Area */}
            <div 
                className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full"
                onClick={handleInteraction}
            >
                {/* Center Visual / Avatar */}
                <div className="mb-8 relative">
                    {isSystem ? (
                        <div className="w-24 h-24 border-2 border-dashed border-emerald-900/50 rounded-full flex items-center justify-center animate-spin-slow opacity-50">
                            <Terminal size={32} className="text-emerald-700" />
                        </div>
                    ) : (
                        <div className={`relative w-32 h-32 md:w-40 md:h-40 border ${borderColor} p-1 ${isGlitch || isPain ? 'animate-shake-violent' : ''} transition-all duration-500`}>
                            <img 
                                src="https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/d19ea972df034757/byq.jpg" 
                                alt="Byaki" 
                                className={`w-full h-full object-cover filter ${isPain ? 'sepia hue-rotate-[-50deg] saturate-200' : isAwakening ? 'brightness-125 contrast-125' : 'sepia hue-rotate-50 contrast-125 saturate-50'} ${isGlitch ? 'opacity-50 blur-[1px]' : 'opacity-90'}`} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                            {isAwakening && (
                                <div className="absolute inset-0 border-2 border-emerald-400 opacity-50 animate-ping"></div>
                            )}
                        </div>
                    )}
                </div>

                {/* Text Area */}
                <div className="w-full max-w-lg space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700/50">
                        {isSystem ? <Cpu size={12} /> : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                        {currentNode.speaker}
                    </div>
                    
                    <div className={`font-mono text-sm md:text-lg leading-relaxed whitespace-pre-wrap ${isSystem ? 'text-emerald-500 font-bold' : isPain ? 'text-red-400' : 'text-emerald-100'} min-h-[80px]`}>
                        {displayedText}
                        <span className={`inline-block w-2 h-4 bg-current ml-1 align-middle ${isTyping ? 'opacity-100' : 'animate-[blink_1s_infinite]'}`}></span>
                    </div>
                </div>

                {/* Click Hint */}
                {!isTyping && (
                    <div className="absolute bottom-8 text-[10px] text-emerald-900 animate-bounce cursor-pointer">
                        [TAP TO CONTINUE]
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default TemporaryTerminal;

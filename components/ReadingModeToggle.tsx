
import React, { useState } from 'react';
import { BookOpen, Gamepad2, Info, X, AlertTriangle } from 'lucide-react';
import { Language, ReadingMode } from '../types';
import { navigationData } from '../data/navigationData';

interface ReadingModeToggleProps {
  value: ReadingMode;
  onChange: (mode: ReadingMode) => void;
  language: Language;
  isSetupMode?: boolean;
}

const ReadingModeToggle: React.FC<ReadingModeToggleProps> = ({ value, onChange, language, isSetupMode = false }) => {
  const t = navigationData[language];
  // Default to showing info
  const [showInfo, setShowInfo] = useState(true);
  // New state for handling the confirmation UI
  const [showWarning, setShowWarning] = useState(false);

  const infoText = {
    'zh-CN': {
      std: "传统而又有特殊文字动画效果的阅读体验，最大程度的还原向。",
      vn: "目前正在技术验证测试中，可能会出现错误，例如文字错位，效果应用异常等，推荐使用普通文档阅读模式。您也可以体验先行版的游戏模式，就像完全视觉小说一样。"
    },
    'zh-TW': {
      std: "傳統而又有特殊文字動畫效果的閱讀體驗，最大程度的還原向。",
      vn: "目前正在技術驗證測試中，可能會出現錯誤，例如文字錯位，效果應用異常等，推薦使用普通文檔閱讀模式。您也可以體驗先行版的遊戲模式，就像完全視覺小說一樣。"
    },
    'en': {
      std: "Traditional reading experience with special text animation effects, focusing on maximum restoration.",
      vn: "Currently in tech preview. Errors like text misalignment or effect anomalies may occur. Standard mode is recommended, but feel free to try this early access Visual Novel experience."
    }
  }[language];

  const warningText = {
      'zh-CN': "确认切换至AVG模式（技术预览）？可能会遇到显示错误。",
      'zh-TW': "確認切換至AVG模式（技術預覽）？可能會遇到顯示錯誤。",
      'en': "Switch to VN Mode (Beta)? You may encounter visual bugs."
  }[language];

  const handleVNClick = () => {
      // If already in VN mode, do nothing
      if (value === 'visual_novel') return;
      
      // Instead of window.confirm, we show the warning in the UI
      setShowWarning(true);
      setShowInfo(true);
  };

  const confirmSwitch = () => {
      onChange('visual_novel');
      setShowWarning(false);
  };

  const cancelSwitch = () => {
      setShowWarning(false);
  };

  const handleStandardClick = () => {
      onChange('standard');
      setShowWarning(false); // Clear warning if switching back to standard
  };

  const renderInfoTooltip = () => (
      <div className={`mt-2 p-3 border-2 ${showWarning ? 'border-red-500/50 bg-black/95' : 'border-ash-gray/50 bg-black/90'} text-[10px] font-mono leading-relaxed relative animate-fade-in shadow-hard-sm z-50`}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowInfo(false); setShowWarning(false); }}
            className={`absolute top-1 right-1 ${showWarning ? 'text-red-500 hover:text-red-300' : 'text-ash-gray hover:text-red-500'}`}
          >
              <X size={12} />
          </button>

          {showWarning ? (
              <div className="animate-fade-in text-red-400">
                  <div className="font-black mb-2 flex items-center gap-2 border-b border-red-900/50 pb-1">
                      <AlertTriangle size={12} /> EXPERIMENTAL_MODE
                  </div>
                  <p className="mb-3">{warningText}</p>
                  <div className="flex gap-2">
                      <button 
                        onClick={confirmSwitch} 
                        className="flex-1 bg-red-900/30 border border-red-500 hover:bg-red-500 hover:text-black py-1.5 transition-colors font-bold uppercase"
                      >
                          {language === 'en' ? 'CONFIRM' : '确认切换'}
                      </button>
                      <button 
                        onClick={cancelSwitch} 
                        className="flex-1 border border-ash-gray/30 hover:border-ash-light hover:text-ash-light py-1.5 transition-colors uppercase"
                      >
                          {language === 'en' ? 'CANCEL' : '取消'}
                      </button>
                  </div>
              </div>
          ) : (
              <>
                <div className="mb-2">
                    <span className="font-bold text-ash-light border-b border-ash-gray/30 block mb-1">MODE_A // {t.modeStd}</span>
                    <span className="opacity-80 text-ash-gray">{infoText.std}</span>
                </div>
                <div>
                    <span className="font-bold text-emerald-500 border-b border-emerald-900/30 block mb-1">MODE_B // {t.modeVN}</span>
                    <span className="opacity-80 text-ash-gray">{infoText.vn}</span>
                </div>
              </>
          )}
      </div>
  );

  if (isSetupMode) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-amber-600 uppercase flex items-center gap-2">
                <Gamepad2 size={14} /> {t.readingMode}
            </label>
            <button 
                onClick={() => { setShowInfo(!showInfo); setShowWarning(false); }}
                className={`p-1 hover:text-amber-500 transition-colors ${showInfo ? 'text-amber-500' : 'text-amber-800'}`}
                title="Info"
            >
                <Info size={12} />
            </button>
        </div>
        
        {showInfo && (
            <div className={`mb-3 p-2 border ${showWarning ? 'border-amber-500 bg-amber-950/50' : 'border-amber-800/50 bg-amber-950/30'} text-amber-600 text-[10px] font-mono`}>
                {showWarning ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-2 font-bold text-amber-500 mb-2">
                            <AlertTriangle size={12} /> CONFIRM_SWITCH
                        </div>
                        <p className="mb-3 text-amber-600/80">{warningText}</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={confirmSwitch}
                                className="flex-1 py-1 bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
                            >
                                {language === 'en' ? 'YES' : '是'}
                            </button>
                            <button 
                                onClick={cancelSwitch}
                                className="flex-1 py-1 border border-amber-800 text-amber-700 hover:text-amber-500 hover:border-amber-500 transition-colors"
                            >
                                {language === 'en' ? 'NO' : '否'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="mb-2"><strong className="text-amber-500 block mb-0.5">{t.modeStd}:</strong> {infoText.std}</p>
                        <p><strong className="text-amber-500 block mb-0.5">{t.modeVN}:</strong> {infoText.vn}</p>
                    </>
                )}
            </div>
        )}

        <div className="flex gap-2">
            <button
                onClick={handleStandardClick}
                className={`flex-1 py-2 px-1 border text-[10px] uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                    value === 'standard'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.3)]'
                    : 'border-amber-900/50 text-amber-800 hover:border-amber-700 hover:text-amber-600'
                }`}
            >
                <BookOpen size={12} />
                <span className="font-bold">{t.modeStd}</span>
            </button>
            <button
                onClick={handleVNClick}
                className={`flex-1 py-2 px-1 border text-[10px] uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                    value === 'visual_novel'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.3)]'
                    : 'border-amber-900/50 text-amber-800 hover:border-amber-700 hover:text-amber-600'
                }`}
            >
                <Gamepad2 size={12} />
                <span className="font-bold">{t.modeVN}</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-2 border-ash-gray/30 bg-ash-black/50">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-ash-gray uppercase">
            <div className="flex items-center gap-2">
                <Gamepad2 size={12} /> {t.readingMode}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); setShowWarning(false); }}
                className={`hover:text-ash-light transition-colors ${showInfo ? 'text-ash-light' : ''}`}
            >
                <Info size={12} />
            </button>
        </div>

        {showInfo && renderInfoTooltip()}

        <div className="flex gap-2">
            <button
                onClick={handleStandardClick}
                className={`flex-1 py-2 border transition-all text-[10px] flex flex-col items-center justify-center gap-0.5 ${
                    value === 'standard'
                    ? 'bg-ash-light text-ash-black border-ash-light shadow-hard-sm'
                    : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:text-ash-light hover:border-ash-gray'
                }`}
            >
                <BookOpen size={12} />
                <span className="font-bold">{t.modeStd}</span>
            </button>
            <button
                onClick={handleVNClick}
                className={`flex-1 py-2 border transition-all text-[10px] flex flex-col items-center justify-center gap-0.5 ${
                    value === 'visual_novel'
                    ? 'bg-ash-light text-ash-black border-ash-light shadow-hard-sm'
                    : 'bg-ash-black text-ash-gray border-ash-gray/50 hover:text-ash-light hover:border-ash-gray'
                }`}
            >
                <Gamepad2 size={12} />
                <span className="font-bold">{t.modeVN}</span>
            </button>
        </div>
    </div>
  );
};

export default ReadingModeToggle;

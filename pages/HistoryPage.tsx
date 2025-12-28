import React, { useState, useEffect } from 'react';
import { Clock, Trash2, ArrowRight, Terminal } from 'lucide-react';

interface HistoryItem {
  chapterId: string;
  chapterIndex: number;
  title: string;
  timestamp: number;
}

interface HistoryPageProps {
  onNavigate: (index: number) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const loaded = localStorage.getItem('nova_history');
      return loaded ? JSON.parse(loaded) : [];
    } catch {
      return [];
    }
  });

  const clearHistory = () => {
    localStorage.removeItem('nova_history');
    setHistory([]);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toISOString().replace('T', ' ').substring(0, 19);
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto h-full overflow-y-auto bg-ash-black text-ash-light font-mono">
      <header className="mb-8 border-b-2 border-dashed border-ash-gray pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-ash-light mb-2 flex items-center gap-3">
            <Terminal size={24} /> 
            /VAR/LOG/USER_ACTIVITY
          </h2>
          <p className="text-ash-gray text-xs">Access Level: READ_ONLY</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-xs font-bold bg-ash-dark border border-ash-gray px-4 py-2 hover:bg-ash-light hover:text-ash-black hover:border-ash-light transition-colors"
          >
            <Trash2 size={14} /> PURGE_LOGS
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="border-2 border-ash-gray border-dashed p-12 flex flex-col items-center justify-center text-ash-gray space-y-4">
          <Clock size={48} />
          <p className="font-bold">STATUS: IDLE</p>
          <p className="text-xs">Waiting for input...</p>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="flex text-[10px] text-ash-gray pb-2 px-4 border-b border-ash-dark mb-2 uppercase tracking-wider">
            <span className="w-48">TIMESTAMP [UTC]</span>
            <span className="flex-1">PROCESS_NAME / TARGET</span>
            <span className="w-10">CMD</span>
          </div>
          
          {history.map((item, idx) => (
            <div 
              key={`${item.chapterId}-${item.timestamp}`}
              className="group flex items-center p-3 border-b border-ash-dark hover:bg-ash-light hover:text-ash-black cursor-pointer transition-colors"
              onClick={() => onNavigate(item.chapterIndex)}
            >
              <div className="w-48 text-[10px] md:text-xs shrink-0 font-bold opacity-70 group-hover:opacity-100">
                {formatTime(item.timestamp)}
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="text-[10px] bg-ash-dark text-ash-gray group-hover:bg-ash-black group-hover:text-ash-light px-1 border border-ash-gray/50 w-fit">
                  EXEC: READ
                </span>
                <span className="text-sm font-bold truncate uppercase">
                  {item.title}
                </span>
              </div>
              
              <div className="w-10 flex justify-end">
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          ))}
          
          <div className="pt-8 font-mono text-xs text-ash-gray animate-pulse">
            _
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
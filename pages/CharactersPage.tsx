
import React, { useState } from 'react';
import { novelData } from '../data/novelData';
import { sideCharacters } from '../data/sideCharacters';
import { User, Activity, Shield, Sparkles, Hash, Zap, Cpu, Brain, Heart, Wind, Share2, Network } from 'lucide-react';
import { CharacterStats, Language } from '../types';
import MaskedText from '../components/MaskedText';

interface CharactersPageProps {
    language: Language;
}

// --- Data & Helpers for Relationship Graph ---

const relationships: Record<string, string[]> = {
  'point': ['zeri', 'zelo', 'void', 'dusk-rain'],
  'zeri': ['point', 'zelo', 'void', 'dusk-rain'],
  'zelo': ['point', 'zeri', 'void', 'dusk-rain'],
  'void': ['point', 'zeri', 'zelo', 'dusk-rain', 'byaki'],
  'byaki': ['void'], // Reverse link
};

const getCharInfo = (id: string, language: Language) => {
  // 1. Check Main Characters
  const main = novelData.characters.find(c => c.id === id);
  if (main) {
    const t = main.translations[language] || main.translations['zh-CN'];
    return {
      id: main.id,
      name: t.name,
      role: t.role,
      color: main.themeColor || 'text-ash-light',
      isMain: true
    };
  }
  
  // 2. Check Side Characters
  const side = sideCharacters.find(c => c.id === id);
  if (side) {
    const t = side.translations[language] || side.translations['zh-CN'];
    return {
      id: side.id,
      name: t.name,
      role: t.role,
      color: 'text-ash-gray',
      isMain: false
    };
  }

  return null;
};

// Helper to parse inline tags like [[MASK::...]]
const parseTextWithMask = (text: string) => {
  const parts = text.split(/(\[\[MASK::.*?\]\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('[[MASK::') && part.endsWith(']]')) {
      const content = part.slice(8, -2);
      return (
        <MaskedText key={index}>{content}</MaskedText>
      );
    }
    return part;
  });
};

// --- Components ---

const RelationshipGraph = ({ centerId, language, onSelect, isLightTheme }: { centerId: string, language: Language, onSelect: (id: string) => void, isLightTheme: boolean }) => {
    const relatedIds = relationships[centerId] || [];
    if (relatedIds.length === 0) return null;

    const centerInfo = getCharInfo(centerId, language);
    if (!centerInfo) return null;

    // Use a fixed coordinate system, scale via CSS
    const size = 800;  
    const center = size / 2;
    const radius = 280; 

    return (
        <div className="w-full h-full relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 text-xs font-bold uppercase flex items-center gap-2 text-ash-gray/70 bg-ash-black/50 px-2 py-1 border border-ash-gray/30">
                <Network size={14} /> 
                {language === 'en' ? 'Neural_Network' : '人际关系拓扑'}
            </div>
            
            <div className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden">
                 {/* Background Grid for Graph Area */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                 
                 <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-full max-h-full overflow-visible drop-shadow-2xl">
                     {/* Connecting Lines */}
                     {relatedIds.map((id, i) => {
                         const angle = (i * 2 * Math.PI) / relatedIds.length - Math.PI / 2;
                         const x = center + radius * Math.cos(angle);
                         const y = center + radius * Math.sin(angle);
                         const isDead = id === 'dusk-rain';
                         const isIdentity = centerId === 'void' && id === 'byaki';
                         const isNotEqual = centerId === 'byaki' && id === 'void';
                         
                         return (
                             <g key={`line-${id}`}>
                                <line 
                                    x1={center} y1={center}
                                    x2={x} y2={y}
                                    stroke="currentColor"
                                    strokeOpacity={isDead ? "0.15" : isIdentity ? "0.6" : "0.2"} 
                                    strokeWidth={isDead ? "1" : "3"}
                                    strokeDasharray={isDead || isNotEqual ? "8,6" : "none"} // Dashed for dead or non-equal
                                    className={isIdentity ? "text-ash-light" : "text-ash-gray"}
                                />
                                {/* Decor dots on line */}
                                {isIdentity ? (
                                    <g transform={`translate(${center + (x-center)*0.5}, ${center + (y-center)*0.5})`}>
                                        <circle r="12" className="fill-ash-black stroke-ash-light stroke-2" />
                                        <text dy="0.35em" textAnchor="middle" className="text-[16px] font-bold fill-ash-light select-none">≡</text>
                                    </g>
                                ) : isNotEqual ? (
                                    <g transform={`translate(${center + (x-center)*0.5}, ${center + (y-center)*0.5})`}>
                                        <circle r="12" className="fill-ash-black stroke-ash-gray stroke-2" />
                                        <text dy="0.35em" textAnchor="middle" className="text-[16px] font-bold fill-ash-gray select-none">≠</text>
                                    </g>
                                ) : isDead ? (
                                    <text x={center + (x-center)*0.5} y={center + (y-center)*0.5} fill="currentColor" textAnchor="middle" dy="0.3em" className="text-[12px] text-ash-gray font-mono opacity-50">×</text>
                                ) : (
                                    <circle cx={center + (x-center)*0.5} cy={center + (y-center)*0.5} r="4" className="text-ash-gray fill-ash-black stroke-2 stroke-current" />
                                )}
                             </g>
                         );
                     })}

                     {/* Center Node */}
                     <g className="filter drop-shadow-xl">
                        {/* Pulse Effect Background */}
                        <circle cx={center} cy={center} r="95" className={`${centerInfo.color} fill-current opacity-10 animate-pulse`} />
                        <circle cx={center} cy={center} r="75" className="fill-ash-black stroke-[4px] stroke-current text-ash-gray" />
                        {/* Center Icon/Text */}
                        <text x={center} y={center} dy="0.35em" textAnchor="middle" className={`text-[40px] font-mono font-black uppercase ${centerInfo.color} fill-current pointer-events-none select-none`}>
                            {centerInfo.name.substring(0, 1)}
                        </text>
                     </g>

                     {/* Satellite Nodes */}
                     {relatedIds.map((id, i) => {
                         const angle = (i * 2 * Math.PI) / relatedIds.length - Math.PI / 2;
                         const x = center + radius * Math.cos(angle);
                         const y = center + radius * Math.sin(angle);
                         const info = getCharInfo(id, language);
                         const isDead = id === 'dusk-rain';
                         
                         if (!info) return null;

                         return (
                             <g 
                                key={id} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(info.isMain) onSelect(id);
                                }}
                                className={`transition-all duration-300 ${info.isMain ? 'cursor-pointer hover:scale-110' : 'cursor-default opacity-90'} ${isDead ? 'grayscale' : ''}`}
                             >
                                 <circle cx={x} cy={y} r="55" className={`${info.color} fill-current ${isDead ? 'opacity-[0.03]' : 'opacity-10'}`} />
                                 <circle cx={x} cy={y} r="45" className={`fill-ash-black stroke-2 stroke-current ${info.color} ${isDead ? 'stroke-dashed opacity-50' : ''}`} strokeDasharray={isDead ? "4,4" : "none"} />
                                 
                                 {isDead ? (
                                    <>
                                        {/* Death Cross */}
                                        <path d={`M${x-15} ${y-15} L${x+15} ${y+15} M${x+15} ${y-15} L${x-15} ${y+15}`} stroke="currentColor" strokeWidth="2" className={`${info.color} opacity-40`} />
                                        
                                        {/* Status Text inside */}
                                        <text x={x} y={y} dy="0.3em" textAnchor="middle" className={`text-[10px] font-mono font-bold uppercase ${info.color} fill-current select-none opacity-70`}>
                                            OFFLINE
                                        </text>
                                        
                                        {/* Name with Strikethrough below */}
                                        <text x={x} y={y+65} dy="0.3em" textAnchor="middle" className={`text-[16px] font-mono font-bold uppercase ${info.color} fill-current select-none opacity-50 line-through decoration-current`}>
                                            {info.name}
                                        </text>
                                    </>
                                 ) : (
                                     <>
                                        <text x={x} y={y} dy="-0.6em" textAnchor="middle" className={`text-[18px] font-mono font-bold uppercase ${info.color} fill-current select-none`}>
                                            {info.name}
                                        </text>
                                        <text x={x} y={y} dy="1.4em" textAnchor="middle" className="text-[12px] font-mono uppercase fill-ash-gray select-none tracking-tighter">
                                            {info.role}
                                        </text>
                                     </>
                                 )}
                             </g>
                         );
                     })}
                 </svg>
            </div>
            
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-ash-gray/50 text-right">
                LINK_STATUS: STABLE<br/>
                NODES: {relatedIds.length + 1}
            </div>
        </div>
    );
};

// Simple Radar Chart Component
const RadarChart = ({ stats, colorClass }: { stats: CharacterStats; colorClass: string }) => {
  const size = 100;
  const center = size / 2;
  const radius = 40;
  const maxStat = 10;
  
  // Calculate points for the pentagon
  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / maxStat) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const statValues = [stats.strength, stats.intelligence, stats.mental, stats.resonance, stats.agility];
  const points = statValues.map((val, i) => getPoint(val, i, 5)).join(' ');

  // Helper labels
  const labels = [
    { label: "STR", x: 50, y: 5 },
    { label: "INT", x: 95, y: 35 },
    { label: "MEN", x: 80, y: 95 },
    { label: "RES", x: 20, y: 95 },
    { label: "AGI", x: 5, y: 35 },
  ];

  return (
    <div className="relative w-full aspect-square max-w-[180px] xl:max-w-[220px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
        {/* Background Grid (Pentagon) */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
           <polygon 
             key={scale}
             points={Array(5).fill(maxStat * scale).map((val, i) => getPoint(val, i, 5)).join(' ')}
             fill="none"
             stroke="var(--ash-gray)"
             strokeWidth="0.5"
             opacity="0.3"
           />
        ))}
        {/* Axes */}
        {labels.map((_, i) => (
             <line 
                key={i}
                x1={center} y1={center}
                x2={getPoint(maxStat, i, 5).split(',')[0]}
                y2={getPoint(maxStat, i, 5).split(',')[1]}
                stroke="var(--ash-gray)"
                strokeWidth="0.5"
                opacity="0.3"
             />
        ))}

        {/* Data Polygon */}
        <polygon 
          points={points} 
          fill="currentColor" 
          fillOpacity="0.2"
          stroke="currentColor" 
          strokeWidth="2"
          className={colorClass}
        />
        {/* Points */}
        {statValues.map((val, i) => {
            const [x, y] = getPoint(val, i, 5).split(',');
            return <circle key={i} cx={x} cy={y} r="1.5" className={`${colorClass} fill-current`} />
        })}
        
        {/* Labels */}
        {labels.map((l, i) => (
            <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize="6" fill="var(--ash-gray)" className="font-mono font-bold">{l.label}</text>
        ))}
      </svg>
    </div>
  );
};

export default function CharactersPage({ language }: CharactersPageProps) {
  const [selectedId, setSelectedId] = useState<string>(novelData.characters[0].id);

  const selectedChar = novelData.characters.find(c => c.id === selectedId) || novelData.characters[0];
  const tChar = selectedChar.translations[language] || selectedChar.translations['zh-CN'];

  const getIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('支援') || r.includes('重装') || r.includes('support') || r.includes('heavy')) return <Shield className="w-5 h-5" />;
    if (r.includes('科研') || r.includes('前线') || r.includes('research') || r.includes('frontline')) return <Activity className="w-5 h-5" />;
    if (r.includes('？？？') || r.includes('???')) return <Sparkles className="w-5 h-5" />;
    return <User className="w-5 h-5" />;
  };

  const statsList = [
      { label: "STRENGTH", val: selectedChar.stats.strength, icon: Zap },
      { label: "INTELLIGENCE", val: selectedChar.stats.intelligence, icon: Brain },
      { label: "AGILITY", val: selectedChar.stats.agility, icon: Wind },
      { label: "MENTAL", val: selectedChar.stats.mental, icon: Heart },
      { label: "RESONANCE", val: selectedChar.stats.resonance, icon: Cpu },
  ];

  return (
    <div className="flex flex-col h-full bg-halftone overflow-hidden">
      
      {/* Top Header */}
      <header className="p-4 md:p-6 border-b-2 border-ash-dark bg-ash-black z-20 flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-xl md:text-2xl font-black text-ash-light mb-1 uppercase tracking-tighter flex items-center gap-3">
                <User size={24} className="md:w-6 md:h-6" />
                {language === 'en' ? 'Personnel_File' : '人员档案'}
            </h2>
            <div className="text-[10px] font-mono text-ash-gray flex gap-2">
                <span className="bg-ash-dark px-1">CONFIDENTIAL</span>
                <span>// AUTH_REQ_LEVEL_5</span>
            </div>
        </div>
        <div className="hidden md:block text-right">
             <div className="text-xs text-ash-light font-bold font-mono border border-ash-gray px-2 py-1 inline-block">
                DB_STATUS: ONLINE
             </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
         
         {/* List Selection (Left Sidebar) */}
         <aside className="w-full md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-ash-dark bg-ash-black overflow-x-auto md:overflow-y-auto shrink-0 z-10 flex flex-row md:flex-col no-scrollbar">
             <div className="flex flex-row md:flex-col p-2 md:p-4 gap-2 md:gap-3 min-w-max md:min-w-0">
                 {novelData.characters.map(char => {
                     const charT = char.translations[language] || char.translations['zh-CN'];
                     return (
                        <button
                            key={char.id}
                            onClick={() => setSelectedId(char.id)}
                            className={`w-32 md:w-full text-left p-2 md:p-3 border-2 transition-all relative overflow-hidden group shrink-0 ${
                                selectedId === char.id 
                                ? 'border-ash-light bg-ash-light text-ash-black shadow-hard' 
                                : 'border-ash-gray/30 bg-ash-dark text-ash-gray hover:border-ash-gray hover:text-ash-white'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1 z-10 relative">
                                <span className="font-bold uppercase tracking-wider truncate text-xs md:text-sm">{charT.name}</span>
                                <div className="scale-75 origin-top-right">{getIcon(charT.role)}</div>
                            </div>
                            <div className="text-[10px] font-mono opacity-70 z-10 relative truncate">
                                {parseTextWithMask(char.alias || "")}
                            </div>
                            {selectedId === char.id && (
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50 pointer-events-none" />
                            )}
                        </button>
                     );
                 })}
             </div>
         </aside>

         {/* Content View: Split Pane Layout for Desktop */}
         <main key={selectedChar.id} className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-ash-black">
             
             {/* Left Pane: Info, Stats, Dossier (Scrollable) */}
             <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative">
                 {/* Background Decoration */}
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Hash size={300} strokeWidth={0.5} />
                 </div>

                 {/* Top Block: Identity & Stats */}
                 <div className="flex flex-col lg:flex-row gap-8 items-start">
                     {/* Identity */}
                     <div className="flex-1 space-y-4">
                         <div>
                             <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-ash-light mb-2 leading-none">
                                 {tChar.name}
                             </h1>
                             <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-mono text-ash-gray">
                                 <span className="px-2 py-1 bg-ash-light text-ash-black font-bold uppercase">
                                     {parseTextWithMask(selectedChar.alias || "")}
                                 </span>
                                 <span> // ROLE: {tChar.role}</span>
                                 <span> // ID: {selectedChar.id.toUpperCase()}</span>
                             </div>
                         </div>

                         {tChar.quote && (
                             <div className="border-l-4 border-ash-light pl-4 py-2 italic text-ash-light/80 font-serif text-base md:text-lg">
                                 "{tChar.quote}"
                             </div>
                         )}

                         <div className="flex flex-wrap gap-2">
                             {tChar.tags.map(tag => (
                                 <span key={tag} className="px-3 py-1 border border-ash-gray rounded-full text-xs font-mono hover:bg-ash-light hover:text-ash-black transition-colors cursor-default">
                                     #{tag}
                                 </span>
                             ))}
                         </div>
                     </div>

                     {/* Stats Box - Compact */}
                     <div className="w-full lg:w-[280px] bg-ash-dark p-4 border-2 border-ash-gray shadow-hard">
                         <div className="flex items-center justify-between mb-4 border-b border-ash-gray/20 pb-2">
                             <h3 className="text-[10px] font-bold uppercase flex items-center gap-2 text-ash-gray">
                                 <Activity size={12} /> {language === 'en' ? 'Combat_Data' : '战斗数据'}
                             </h3>
                             <div className="text-[10px] font-mono text-ash-gray">SYNC: {selectedChar.stats.resonance * 10}%</div>
                         </div>
                         
                         <RadarChart stats={selectedChar.stats} colorClass={selectedChar.themeColor || 'text-ash-light'} />
                         
                         <div className="space-y-2 mt-4">
                            {statsList.map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="flex items-center gap-2 text-ash-gray font-bold">
                                        <stat.icon size={10} /> {stat.label}
                                    </span>
                                    <div className="flex gap-[1px]">
                                        {Array(10).fill(0).map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-1 h-2 transition-all duration-300 ${i < stat.val ? (selectedChar.themeColor?.replace('text-', 'bg-') || 'bg-ash-light') : 'bg-ash-black border border-ash-dark'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                 </div>

                 {/* Dossier Text */}
                 <div className="bg-ash-dark/20 border-2 border-ash-gray/30 p-6">
                    <h3 className="text-lg font-bold uppercase border-b border-ash-gray pb-2 flex items-center gap-2 mb-4 text-ash-light">
                        <Share2 size={18} /> Field Analysis
                    </h3>
                    <div className="space-y-4 font-mono text-sm leading-relaxed text-ash-gray/90">
                        {tChar.description.map((para, idx) => {
                            // Split paragraph by ** for bold formatting
                            const parts = para.split('**');
                            return (
                                <div key={idx} className="flex gap-3">
                                    <span className="text-ash-light font-bold shrink-0">[{String(idx + 1).padStart(2, '0')}]</span>
                                    <p>
                                        {parts.map((part, i) => 
                                            i % 2 === 1 
                                            ? <strong key={i} className="text-ash-light font-black bg-ash-light/10 px-1 border border-ash-light/20">{part}</strong> 
                                            : parseTextWithMask(part)
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                 </div>
                 
                 {/* Mobile/Tablet Graph Fallback (Visible only on small screens) */}
                 <div className="xl:hidden h-[500px] bg-ash-dark/30 border-2 border-ash-gray p-4 relative">
                    <RelationshipGraph 
                        centerId={selectedChar.id} 
                        language={language} 
                        onSelect={setSelectedId}
                        isLightTheme={false} 
                    />
                 </div>
             </div>

             {/* Right Pane: Graph (Fixed on Desktop) */}
             <div className="hidden xl:flex w-[45%] 2xl:w-[40%] bg-ash-dark/10 border-l-2 border-ash-dark relative flex-col shadow-[inset_10px_0_20px_rgba(0,0,0,0.2)]">
                  {/* Graph Container taking full height */}
                  <div className="flex-1 w-full h-full p-8 overflow-hidden flex items-center justify-center">
                     <RelationshipGraph 
                        centerId={selectedChar.id} 
                        language={language} 
                        onSelect={setSelectedId}
                        isLightTheme={false} 
                     />
                  </div>
             </div>

         </main>
      </div>
    </div>
    );
}

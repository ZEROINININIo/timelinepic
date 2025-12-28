
import React, { useState } from 'react';
import { novelData } from '../data/novelData';
import { Globe, Box, Cpu, Users, FolderOpen, Image as ImageIcon, BookOpen, Network } from 'lucide-react';
import Reveal from '../components/Reveal';
import { Language } from '../types';

interface DatabasePageProps {
  language: Language;
}

const DatabasePage: React.FC<DatabasePageProps> = ({ language }) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const translations = {
    'zh-CN': {
      title: '世界数据库',
      all: '全部档案',
      world: '世界构造',
      org: '组织档案',
      tech: '技术文档',
      setting: '设定集',
      society: '社会人文',
      type: '类型',
    },
    'zh-TW': {
      title: '世界數據庫',
      all: '全部檔案',
      world: '世界構造',
      org: '組織檔案',
      tech: '技術文檔',
      setting: '設定集',
      society: '社會人文',
      type: '類型',
    },
    'en': {
      title: 'WORLD_DATABASE',
      all: 'ALL_FILES',
      world: 'WORLD',
      org: 'ORG',
      tech: 'TECH',
      setting: 'SETTINGS',
      society: 'SOCIETY',
      type: 'TYPE',
    }
  };

  const t = translations[language];

  const categories = [
    { id: 'All', label: t.all, icon: Box },
    { id: 'World', label: t.world, icon: Globe },
    { id: 'Organization', label: t.org, icon: Users },
    { id: 'Technology', label: t.tech, icon: Cpu },
    { id: 'Society', label: t.society, icon: Network },
    { id: 'Setting', label: t.setting, icon: BookOpen },
  ];

  const filteredLore = activeFilter === 'All' 
    ? novelData.lore 
    : novelData.lore.filter(l => l.category === activeFilter);

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto h-full overflow-y-auto bg-halftone">
      <Reveal>
        <header className="mb-6 md:mb-10 border-4 border-ash-light p-4 md:p-6 bg-ash-black shadow-hard">
          <h2 className="text-2xl md:text-3xl font-black text-ash-light mb-2 flex items-center gap-3">
              <FolderOpen size={24} className="md:w-8 md:h-8" />
              {t.title}
          </h2>
          <div className="h-2 w-full bg-ash-dark border border-ash-gray mt-4 flex">
              {/* Loading Bar Decoration */}
              <div className="h-full bg-ash-light w-2/3 animate-[scanline_2s_linear_infinite] bg-gradient-to-r from-ash-light via-ash-white to-ash-light" style={{ animationDirection: 'reverse' }}></div>
              <div className="h-full bg-ash-gray w-1/3 opacity-20"></div>
          </div>
        </header>
      </Reveal>

      {/* Filter Tabs - Physical Tab Style */}
      <div className="flex flex-wrap gap-2 md:gap-0 mb-6 md:mb-8 pl-0 md:pl-4 border-b-0 md:border-b-2 border-ash-light">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 md:px-6 md:py-3 border-2 md:border-b-0 md:mr-[-2px] text-xs md:text-sm font-bold font-mono transition-all relative md:top-[2px] flex-grow md:flex-grow-0 ${
              activeFilter === cat.id 
                ? 'bg-ash-light text-ash-black border-ash-light z-10 shadow-hard md:shadow-none' 
                : 'bg-ash-dark text-ash-gray border-ash-gray hover:bg-ash-gray hover:text-ash-black'
            }`}
          >
            <cat.icon size={14} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-8 pb-8">
        {filteredLore.map((entry, index) => {
          const tLore = entry.translations[language] || entry.translations['zh-CN'];
          
          return (
            <Reveal key={entry.id} delay={index * 100}>
              <div className="bg-ash-black border-2 border-ash-gray p-4 md:p-8 hover:border-ash-light transition-colors relative group">
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-3 md:w-4 h-3 md:h-4 border-t-2 border-l-2 border-ash-gray group-hover:border-ash-light"></div>
                <div className="absolute top-0 right-0 w-3 md:w-4 h-3 md:h-4 border-t-2 border-r-2 border-ash-gray group-hover:border-ash-light"></div>
                <div className="absolute bottom-0 left-0 w-3 md:w-4 h-3 md:h-4 border-b-2 border-l-2 border-ash-gray group-hover:border-ash-light"></div>
                <div className="absolute bottom-0 right-0 w-3 md:w-4 h-3 md:h-4 border-b-2 border-r-2 border-ash-gray group-hover:border-ash-light"></div>

                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 md:mb-6 border-b border-dashed border-ash-gray pb-4 gap-2 md:gap-0">
                  <h3 className="text-lg md:text-xl font-bold text-ash-light font-mono uppercase leading-tight">{tLore.title}</h3>
                  <span className="self-start text-[10px] font-mono text-ash-black bg-ash-gray px-2 py-1 font-bold">
                    {t.type}: {entry.category.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-4 text-ash-gray font-mono text-xs md:text-sm leading-6 md:leading-7">
                  {tLore.content.map((para, idx) => {
                    const trimmed = para.trim();
                    const imageMatch = trimmed.match(/^\[\[IMAGE::(.*?)\]\]$/);
                    
                    if (imageMatch) {
                        const content = imageMatch[1];
                        const [src, ...captionParts] = content.split('::');
                        const caption = captionParts.join('::');
                        return (
                          <div key={idx} className="my-6">
                              <div className="relative border-2 border-ash-gray p-2 bg-ash-dark/30 inline-block max-w-full">
                                  {/* Corners for image frame */}
                                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-ash-gray"></div>
                                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-ash-gray"></div>
                                  
                                  <img 
                                      src={src} 
                                      alt={caption}
                                      className="max-w-full h-auto max-h-64 object-contain mx-auto block grayscale-[20%] hover:grayscale-0 transition-all"
                                  />
                                  <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-2 bg-ash-dark border border-ash-gray px-2 py-0.5 z-10">
                                      <div className="text-[10px] font-mono text-ash-light flex items-center gap-2 uppercase font-bold">
                                          <ImageIcon size={10} />
                                          {caption}
                                      </div>
                                  </div>
                              </div>
                          </div>
                        );
                    }

                    const parts = para.split('**');
                    return (
                        <p key={idx}>
                            {parts.map((part, i) => 
                                i % 2 === 1 
                                ? <strong key={i} className="text-ash-light bg-ash-dark px-1 border border-ash-gray/50">{part}</strong> 
                                : part
                            )}
                        </p>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};

export default DatabasePage;

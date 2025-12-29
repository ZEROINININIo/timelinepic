
import React from 'react';
import { Language } from '../types';
import RPGMap from '../components/game/RPGMap';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  unlockedNodes: string[];
  onUnlockNode: (id: string) => void;
  nickname: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, language, nickname }) => {
  return (
    <div className="w-full h-full relative">
        <RPGMap onNavigate={onNavigate} language={language} nickname={nickname} />
    </div>
  );
};

export default HomePage;
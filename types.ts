
export type Language = 'zh-CN' | 'zh-TW' | 'en';

export type ReadingMode = 'standard' | 'visual_novel';

export interface CharacterStats {
  strength: number;    // 强度/破坏力
  intelligence: number;// 智力/演算力
  agility: number;     // 机动/反应
  mental: number;      // 精神/抗性
  resonance: number;   // 共鸣/量子适应性
}

export interface CharacterTranslation {
  name: string;
  role: string;
  description: string[];
  tags: string[];
  quote?: string;
}

export interface Character {
  id: string;
  alias?: string;
  stats: CharacterStats;
  themeColor?: string;
  translations: {
    'zh-CN': CharacterTranslation;
    'zh-TW': CharacterTranslation;
    'en': CharacterTranslation;
  };
}

export interface LoreTranslation {
  title: string;
  content: string[];
}

export interface LoreEntry {
  id: string;
  category: 'World' | 'Organization' | 'Technology' | 'Society' | 'Setting';
  translations: {
    'zh-CN': LoreTranslation;
    'zh-TW': LoreTranslation;
    'en': LoreTranslation;
  };
}

export interface ChapterTranslation {
  title: string;
  summary?: string;
  content: string;
}

export interface Chapter {
  id: string;
  date: string;
  status?: 'published' | 'locked' | 'corrupted';
  translations: {
    'zh-CN': ChapterTranslation;
    'zh-TW': ChapterTranslation;
    'en': ChapterTranslation;
  };
}

export interface SideStoryVolume {
  id: string;
  title: string; 
  titleEn: string;
  status: 'unlocked' | 'locked' | 'corrupted';
  chapters: Chapter[];
}

export interface NovelData {
  title: string;
  subtitle: string;
  intro: string;
  characters: Character[];
  lore: LoreEntry[];
  chapters: Chapter[];
}

export interface SideCharacterData {
  id: string;
  group: string; // Grouping for tree view
  isLocked?: boolean; // Lock status
  translations: {
    [key in Language]: {
      name: string;
      enName: string;
      role: string;
      tags: string[];
      description: string[];
      quote?: string;
    }
  }
}

// --- Visual Novel Types ---
export interface VNNode {
  id: string;
  type: 'dialogue' | 'narration' | 'system' | 'image';
  speaker?: string; // ID of the character or Raw Name
  speakerName?: string; // Display Name
  text: string;
  emotion?: 'neutral' | 'happy' | 'angry' | 'shocked' | 'sweat';
}

// --- Puzzle Game Types ---
export type TileType = 'empty' | 'straight' | 'corner' | 't-shape' | 'cross' | 'source' | 'terminal';
export type Direction = 0 | 1 | 2 | 3; // 0: Up, 1: Right, 2: Down, 3: Left (Clockwise)

export interface GridTile {
  x: number;
  y: number;
  type: TileType;
  rotation: Direction; // Current rotation
  locked?: boolean; // Cannot be rotated
}

export interface PuzzleConfig {
  id: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  gridSize: number; // e.g. 5 for 5x5
  layout: GridTile[]; // Initial layout
  unlocksId: string; // ID of content unlocked upon completion
}

export interface GameNode {
  id: string;
  x: number; 
  y: number;
  type: 'story' | 'puzzle' | 'core';
  status: 'locked' | 'unlocked' | 'completed';
  label: string;
  linkedContentId?: string; // Chapter ID or Puzzle ID
  connections: string[]; // IDs of connected nodes
}

// --- RPG Game Types ---
export interface RPGPosition {
  x: number;
  y: number;
}

export interface RPGObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'terminal' | 'decoration' | 'gate' | 'exhibit' | 'npc';
  label?: string;
  targetId?: string; 
  color?: string;
  icon?: any;
  // Gallery Content
  imageUrl?: string;
  description?: Record<Language, string>;
}

// --- Multiplayer Types ---
export interface RemotePlayer {
  id: string;
  nickname: string;
  x: number;
  y: number;
  last_active: number;
  msg?: string;
  msg_ts?: number;
}

// --- Guestbook Types ---
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
  isAdmin?: boolean;
}
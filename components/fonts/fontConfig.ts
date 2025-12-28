
export type ReaderFont = 'mono' | 'sans' | 'serif' | 'custom-02';

export interface FontOption {
  id: ReaderFont;
  label: Record<string, string>;
  note: Record<string, string>;
  cssClass: string;
}

export const fontOptions: FontOption[] = [
  {
    id: 'custom-02',
    label: { 'zh-CN': 'AliM', 'zh-TW': 'AliM', 'en': 'AliM' },
    note: { 'zh-CN': '视觉优先', 'zh-TW': '視覺優先', 'en': 'Visual Priority' },
    cssClass: 'font-custom-02'
  },
  {
    id: 'mono',
    label: { 'zh-CN': '终端体', 'zh-TW': '終端體', 'en': 'TERMINAL' },
    note: { 'zh-CN': '还原优先', 'zh-TW': '還原優先', 'en': 'Retro Priority' },
    cssClass: 'font-mono' // JetBrains Mono
  }
];

export const getFontClass = (fontId: ReaderFont): string => {
  const font = fontOptions.find(f => f.id === fontId);
  return font ? font.cssClass : 'font-mono';
};

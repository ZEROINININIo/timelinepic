
import { Chapter } from '../../types';

export const chapterA005: Chapter = {
  id: "locked-chapter-005",
  date: "档案记录: A-005",
  status: 'locked',
  translations: {
    'zh-CN': {
      title: "信号丢失 // 待重连",
      summary: "该时间线尚未观测到有效数据。",
      content: "SIGNAL_LOST"
    },
    'zh-TW': {
      title: "信號丟失 // 待重連",
      summary: "該時間線尚未觀測到有效數據。",
      content: "SIGNAL_LOST"
    },
    'en': {
      title: "SIGNAL_LOST // RECONNECTING",
      summary: "No valid data observed in this timeline yet.",
      content: "SIGNAL_LOST"
    }
  }
};

import { Chapter } from '../../types';

export const chapterA004: Chapter = {
  id: "locked-chapter-004",
  date: "档案记录: A-004",
  status: 'locked',
  translations: {
    'zh-CN': {
      title: "加密节点 // 拒绝访问",
      summary: "检测到未知的数据波动，该节点已被系统自动封锁。",
      content: "ACCESS DENIED"
    },
    'zh-TW': {
      title: "加密節點 // 拒絕訪問",
      summary: "檢測到未知的數據波動，該節點已被系統自動封鎖。",
      content: "ACCESS DENIED"
    },
    'en': {
      title: "ENCRYPTED_NODE // ACCESS_DENIED",
      summary: "Unknown data fluctuation detected. Node automatically locked by system.",
      content: "ACCESS DENIED"
    }
  }
};
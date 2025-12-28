import { Language } from '../types';

export interface IntroQuote {
  id: string;
  speaker: string;
  text: Record<Language, string>;
}

export const introQuotes: IntroQuote[] = [
  {
    id: "welcome_back",
    speaker: "PYO",
    text: {
      "zh-CN": "啊，很高兴看见您回来！",
      "zh-TW": "啊，很高興看見您回來！",
      "en": "Ah, glad to see you back!"
    }
  },
  {
    id: "long_time_void",
    speaker: "PYO",
    text: {
      "zh-CN": "void...我真的很久没见过你了",
      "zh-TW": "void...我真的很久沒見過你了",
      "en": "void... I really haven't seen you in a long time."
    }
  },
  {
    id: "hello",
    speaker: "PYO",
    text: {
      "zh-CN": "你好！！",
      "zh-TW": "你好！！",
      "en": "Hello!!"
    }
  },
  {
    id: "are_you_there",
    speaker: "PYO",
    text: {
      "zh-CN": "在吗？void？",
      "zh-TW": "在嗎？void？",
      "en": "Are you there? void?"
    }
  },
  {
    id: "across_screen",
    speaker: "PYO",
    text: {
      "zh-CN": "屏幕对面的...该不会是...",
      "zh-TW": "螢幕對面的...該不會是...",
      "en": "The one across the screen... could it be..."
    }
  },
  {
    id: "time_sector",
    speaker: "PYO",
    text: {
      "zh-CN": "我们现在是在什么时间区段啊？？",
      "zh-TW": "我們現在是在什麼時間區段啊？？",
      "en": "What time sector are we in right now??"
    }
  },
  {
    id: "still_alive",
    speaker: "PYO",
    text: {
      "zh-CN": "我们，还活着吗？...",
      "zh-TW": "我們，還活著嗎？...",
      "en": "Are we... still alive?..."
    }
  }
];
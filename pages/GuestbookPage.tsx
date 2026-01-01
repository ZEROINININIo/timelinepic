
import React, { useState, useEffect, useRef } from 'react';
import { Message, Language } from '../types';
import { MessageSquare, Send, Radio, Wifi, Database, User, ShieldAlert, Cpu, Terminal, CloudOff, Globe, Server, Loader2, ArrowLeft, Trash2, Lock, Key, Eye, Radar, Music, Activity, X } from 'lucide-react';
import Reveal from '../components/Reveal';
import MaskedText from '../components/MaskedText';
import VoidRadar from '../components/VoidRadar';

const STORAGE_KEY = 'nova_guestbook_data';
// REPLACE THIS URL WITH YOUR ACTUAL SERVER API URL
const API_URL = 'https://cdn.zeroxv.cn/nova_api/api.php'; 

interface GuestbookPageProps {
  language: Language;
  isLightTheme: boolean;
  nickname: string | null;
  onBack?: () => void;
  onNicknameChange?: (nick: string) => void;
}

const PRESET_MESSAGES: Message[] = [
    { id: 'sys-001', sender: 'System', content: 'UPLINK ESTABLISHED. PUBLIC CHANNEL OPEN.', timestamp: Date.now() - 10000000, isSystem: true },
    { id: 'npc-001', sender: 'Pyo', content: '哇！这居然还能连上？有人在吗？', timestamp: Date.now() - 9000000, isAdmin: true },
    { id: 'npc-002', sender: 'Byaki', content: '别在公共频段大喊大叫，Pyo。小心数据溢出。', timestamp: Date.now() - 8800000, isAdmin: true },
    { id: 'npc-003', sender: 'Pyo', content: '收到收到！不过这地方好久没这么热闹了。', timestamp: Date.now() - 8500000, isAdmin: true },
    { id: 'sys-002', sender: 'System', content: 'WARNING: EXTERNAL CONNECTION DETECTED.', timestamp: Date.now() - 1000, isSystem: true },
];

const GuestbookPage: React.FC<GuestbookPageProps> = ({ language, isLightTheme, nickname, onBack, onNicknameChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userNick, setUserNick] = useState(nickname || 'Guest');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // View Mode: 'list' or 'radar'
  const [viewMode, setViewMode] = useState<'list' | 'radar'>('list');
  
  // UI State
  const [viewingMsg, setViewingMsg] = useState<Message | null>(null);
  
  // Network States
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Anti-Spam & Admin States
  const [cooldown, setCooldown] = useState(0);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);

  // Sync userNick if nickname prop changes (e.g. loaded from URL in App)
  useEffect(() => {
      if (nickname) {
          setUserNick(nickname);
      }
  }, [nickname]);

  // Cooldown Timer
  useEffect(() => {
      if (cooldown > 0) {
          const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
          return () => clearTimeout(timer);
      }
  }, [cooldown]);

  // Load Messages (Hybrid: API -> Local Storage Fallback)
  useEffect(() => {
      loadMessages();
      // Set up polling for new messages every 10 seconds if connected
      const interval = setInterval(() => {
          if (isConnected) loadMessages(true); // Silent update
      }, 10000);
      return () => clearInterval(interval);
  }, [isConnected, adminMode]); // Reload if admin mode toggles to see hidden data if any

  const loadMessages = async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
          // Add timestamp to prevent caching
          let url = `${API_URL}?t=${Date.now()}`;
          if (adminMode && adminPass) {
              url += `&pwd=${encodeURIComponent(adminPass)}`;
          }

          const response = await fetch(url);
          if (!response.ok) throw new Error("Server error");
          
          const data = await response.json();
          if (Array.isArray(data)) {
              setMessages(data);
              setIsConnected(true);
          } else {
              throw new Error("Invalid data format");
          }
      } catch (e) {
          if (!silent) console.warn("Server unreachable, switching to offline mode.", e);
          setIsConnected(false);
          // Fallback to Local Storage (Only if not in admin mode attempts)
          if (!adminMode) {
              try {
                  const saved = localStorage.getItem(STORAGE_KEY);
                  if (saved) {
                      setMessages(JSON.parse(saved));
                  } else {
                      setMessages(PRESET_MESSAGES);
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_MESSAGES));
                  }
              } catch (err) {
                  setMessages(PRESET_MESSAGES);
              }
          }
      } finally {
          if (!silent) setIsLoading(false);
      }
  };

  // Auto Scroll
  useEffect(() => {
      if (viewMode === 'list' && scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages, viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || cooldown > 0) return;
      
      let finalContent = inputText.trim();
      let sender = userNick || 'Anonymous';

      // --- SLASH COMMAND PARSER ---
      // Transform "/cmd text" into "[[TAG::text]]" style for backend storage
      if (finalContent.startsWith('/')) {
          const firstSpace = finalContent.indexOf(' ');
          if (firstSpace > 0) {
              const cmd = finalContent.substring(1, firstSpace).toLowerCase();
              const payload = finalContent.substring(firstSpace + 1);
              
              if (cmd === 'alert') {
                  finalContent = `[[ALERT::${payload}]]`;
              } else if (cmd === 'radio') {
                  finalContent = `[[RADIO::${payload}]]`;
              } else if (cmd === 'secret') {
                  finalContent = `[[SECRET::${payload}]]`;
              } else if (cmd === 'log') {
                  finalContent = `[[LOG::${payload}]]`;
              }
          }
      }

      const newMsgObj: Message = {
          id: `temp-${Date.now()}`,
          sender: sender,
          content: finalContent,
          timestamp: Date.now()
      };

      if (isConnected) {
          setIsSending(true);
          try {
              const res = await fetch(API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newMsgObj)
              });
              
              if (res.ok) {
                  await loadMessages(true);
                  setInputText('');
                  setCooldown(5); // 5 Seconds cooldown
              } else if (res.status === 429) {
                  alert("发送太快了，请稍作休息！(Rate Limited)");
                  setCooldown(10);
              } else {
                  alert("Failed to send message to server.");
              }
          } catch (e) {
              alert("Connection lost. Message not sent.");
              setIsConnected(false);
          } finally {
              setIsSending(false);
          }
      } else {
          // Offline Mode Submit
          const updated = [...messages, newMsgObj];
          setMessages(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setInputText('');
          setCooldown(2);
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("CONFIRM DELETION?")) return;
      
      try {
          const res = await fetch(`${API_URL}?action=delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: id,
                  password: adminPass
              })
          });
          
          if (res.ok) {
              await loadMessages(true);
              setViewingMsg(null);
          } else {
              alert("Delete failed. Check password.");
          }
      } catch (e) {
          alert("Network error during deletion.");
      }
  };

  const handleNickChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUserNick(val);
      if (onNicknameChange) {
          onNicknameChange(val);
      }
  };

  const handleSecretClick = () => {
      setSecretClickCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
              setShowAdminLogin(true);
              return 0;
          }
          return newCount;
      });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Hardcoded check for frontend unlock, also used for backend requests
      if (adminPass === '5531517') {
          setAdminMode(true);
          setShowAdminLogin(false);
          loadMessages(); // Reload to potentially get admin data (IPs)
      } else {
          alert("ACCESS DENIED");
          setAdminPass('');
      }
  };

  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Content Renderer for Protocol Messages
  const renderMessageContent = (content: string, textClass: string) => {
      if (content.startsWith('[[ALERT::') && content.endsWith(']]')) {
          return (
              <span className="text-red-500 font-bold flex items-start gap-2">
                  <ShieldAlert size={14} className="shrink-0 mt-1 animate-pulse" />
                  <span>{content.slice(9, -2)}</span>
              </span>
          );
      }
      if (content.startsWith('[[RADIO::') && content.endsWith(']]')) {
          return (
              <span className="text-cyan-400 font-mono flex items-start gap-2">
                  <Radio size={14} className="shrink-0 mt-1" />
                  <span>{content.slice(9, -2)}</span>
              </span>
          );
      }
      if (content.startsWith('[[SECRET::') && content.endsWith(']]')) {
          return (
              <span className="flex items-start gap-2">
                  <Key size={14} className="shrink-0 mt-1 text-fuchsia-500" />
                  <MaskedText>{content.slice(10, -2)}</MaskedText>
              </span>
          );
      }
      if (content.startsWith('[[LOG::') && content.endsWith(']]')) {
          return (
              <span className="text-gray-500 font-mono text-xs block bg-black/10 p-1 border-l-2 border-gray-500">
                  {content.slice(7, -2)}
              </span>
          );
      }
      return <span className={textClass}>{content}</span>;
  };

  const t = {
      title: language === 'en' ? 'PUBLIC_CHANNEL' : '公共留言频段',
      subtitle: isConnected ? (language === 'en' ? 'Uplink Established // Cloud Sync' : '云端连接 // 实时同步') : (language === 'en' ? 'Offline Mode // Local Cache' : '离线模式 // 本地缓存'),
      placeholder: language === 'en' ? 'Enter transmission... (Try /alert, /radio)' : '输入讯息... (试着输入 /alert, /radio)',
      send: language === 'en' ? 'SEND' : '发送',
      nick: language === 'en' ? 'ID' : '昵称',
      status: isConnected ? 'ONLINE' : 'OFFLINE',
      back: language === 'en' ? 'RETURN' : '返回'
  };

  return (
    <div className={`h-full flex flex-col relative overflow-hidden font-mono ${isLightTheme ? 'bg-zinc-50' : 'bg-[#050505]'}`}>
        
        {/* Admin Login Modal */}
        {showAdminLogin && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAdminLogin(false)}>
                <div className="bg-ash-black border-2 border-red-500 p-6 shadow-hard w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <div className="text-red-500 font-bold mb-4 flex items-center gap-2"><Lock size={16} /> ADMIN_ACCESS</div>
                    <form onSubmit={handleAdminLogin} className="flex gap-2">
                        <input 
                            type="password" 
                            value={adminPass} 
                            onChange={e => setAdminPass(e.target.value)}
                            placeholder="Enter Key..."
                            className="bg-black border border-ash-gray text-ash-light px-2 py-1 flex-1 outline-none focus:border-red-500"
                            autoFocus
                        />
                        <button type="submit" className="bg-red-900/30 border border-red-500 text-red-500 px-3 font-bold hover:bg-red-500 hover:text-black transition-colors">
                            AUTH
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* Message Detail Modal */}
        {viewingMsg && (
            <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingMsg(null)}>
                <div 
                    className={`w-full max-w-md border-2 p-6 shadow-2xl relative ${isLightTheme ? 'bg-white border-zinc-400 text-zinc-900' : 'bg-ash-black border-emerald-500 text-ash-light'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => setViewingMsg(null)} className="absolute top-2 right-2 p-2 opacity-50 hover:opacity-100">
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-4 border-b border-dashed pb-2 border-current/30">
                        <div className={`p-2 rounded-full border ${isLightTheme ? 'bg-zinc-100' : 'bg-emerald-950/30 border-emerald-500/50'}`}>
                            {viewingMsg.isAdmin ? <Cpu size={24} /> : viewingMsg.isSystem ? <ShieldAlert size={24} /> : <User size={24} />}
                        </div>
                        <div>
                            <div className="font-bold text-lg uppercase">{viewingMsg.sender}</div>
                            <div className="text-[10px] font-mono opacity-60">{formatTime(viewingMsg.timestamp)}</div>
                        </div>
                        {adminMode && (
                            <button 
                                onClick={() => handleDelete(viewingMsg.id)} 
                                className="ml-auto text-red-500 border border-red-500 px-2 py-1 text-[10px] hover:bg-red-500 hover:text-white"
                            >
                                DELETE
                            </button>
                        )}
                    </div>

                    <div className="text-sm md:text-base leading-relaxed break-words min-h-[80px]">
                        {renderMessageContent(viewingMsg.content, isLightTheme ? 'text-zinc-800' : 'text-ash-light')}
                    </div>

                    <div className="mt-6 text-[10px] font-mono opacity-40 text-center uppercase">
                        Message_ID: {viewingMsg.id}
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className={`p-4 md:p-6 border-b-2 flex justify-between items-center shrink-0 z-10 ${isLightTheme ? 'bg-white border-emerald-200' : 'bg-ash-black border-emerald-900/30'}`}>
            <div className="flex items-center gap-4">
                {onBack && (
                    <button onClick={onBack} className="p-2 border border-current hover:bg-emerald-900/20 transition-colors text-emerald-500">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h1 className={`text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-3 ${isLightTheme ? 'text-emerald-800' : 'text-emerald-500'}`}>
                        {viewMode === 'list' ? <Radio className="animate-pulse" /> : <Radar className="animate-spin-slow" />}
                        {viewMode === 'list' ? t.title : 'VOID_RADAR // 虚空雷达'}
                        {adminMode && <span className="text-xs bg-red-500 text-black px-1">ADMIN</span>}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono opacity-60 mt-1">
                        {isConnected ? <Server size={12} className="text-emerald-500" /> : <CloudOff size={12} className="text-red-500" />}
                        {t.subtitle}
                        <span className="mx-2">|</span>
                        <Database size={12} /> {messages.length} LOGS
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <button 
                    onClick={() => setViewMode(prev => prev === 'list' ? 'radar' : 'list')}
                    className={`p-2 border transition-all ${viewMode === 'radar' ? 'bg-emerald-500 text-black border-emerald-400' : 'text-emerald-500 border-emerald-500/30 hover:border-emerald-500'}`}
                    title="Toggle View Mode"
                >
                    {viewMode === 'list' ? <Radar size={18} /> : <MessageSquare size={18} />}
                </button>

                {/* Secret Click Trigger Area */}
                <button 
                    onClick={handleSecretClick}
                    className={`hidden md:block px-3 py-1 border text-xs font-bold uppercase select-none active:scale-95 transition-transform ${isLightTheme ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : isConnected ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-400' : 'border-red-500/30 bg-red-900/10 text-red-400'}`}
                >
                    STATUS: {t.status}
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 relative overflow-hidden ${isLightTheme ? 'bg-zinc-50' : 'bg-black/50'}`}>
            
            {/* --- LIST VIEW --- */}
            {viewMode === 'list' && (
                <div 
                    ref={scrollRef}
                    className="absolute inset-0 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar"
                >
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[size:20px_20px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"></div>

                    {isLoading && messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-ash-gray gap-2 animate-pulse">
                            <Loader2 className="animate-spin" /> FETCHING_DATA...
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMe = msg.sender === userNick;
                        const isSystem = msg.isSystem;
                        const isAdmin = msg.isAdmin;

                        let bubbleClass = "";
                        let textClass = "";
                        
                        if (isSystem) {
                            bubbleClass = "w-full text-center my-4 opacity-70";
                            textClass = "text-[10px] md:text-xs bg-red-900/20 text-red-400 border border-red-900/50 px-3 py-1 inline-block";
                        } else if (isAdmin) {
                            bubbleClass = `max-w-[85%] md:max-w-[70%] self-start ${isLightTheme ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/50'} border-l-4`;
                            textClass = isLightTheme ? 'text-emerald-900' : 'text-emerald-100';
                        } else if (isMe) {
                            bubbleClass = `max-w-[85%] md:max-w-[70%] self-end ${isLightTheme ? 'bg-white border-zinc-300' : 'bg-ash-dark border-ash-gray/30'} border-r-4 ml-auto`;
                            textClass = isLightTheme ? 'text-zinc-800' : 'text-ash-white';
                        } else {
                            bubbleClass = `max-w-[85%] md:max-w-[70%] self-start ${isLightTheme ? 'bg-white border-zinc-200' : 'bg-ash-black border-ash-dark'} border-l-4`;
                            textClass = isLightTheme ? 'text-zinc-600' : 'text-ash-gray';
                        }

                        if (isSystem) {
                            return (
                                <div key={msg.id} className={bubbleClass}>
                                    <span className={textClass}>
                                        <ShieldAlert size={10} className="inline mr-1" />
                                        {msg.content}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <Reveal key={msg.id} className="w-full flex flex-col">
                                <div className={`p-3 md:p-4 border ${bubbleClass} shadow-sm relative group`}>
                                    {/* Admin Delete Button */}
                                    {adminMode && (
                                        <button 
                                            onClick={() => handleDelete(msg.id)}
                                            className="absolute -top-3 -right-3 bg-red-900 border border-red-500 text-red-500 p-1.5 hover:bg-red-500 hover:text-black transition-colors z-20"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}

                                    <div className="flex justify-between items-start mb-1 text-[10px] opacity-70 font-bold uppercase tracking-wider border-b border-dashed border-current/20 pb-1">
                                        <span className="flex items-center gap-1">
                                            {isAdmin ? <Cpu size={10} /> : <User size={10} />}
                                            {msg.sender}
                                            {/* Show IP if in Admin Mode and available */}
                                            {adminMode && (msg as any).ip && (
                                                <span className="ml-2 opacity-50 font-mono">
                                                    [{(msg as any).ip}]
                                                </span>
                                            )}
                                        </span>
                                        <span>{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div className={`text-sm md:text-base leading-relaxed break-words ${textClass}`}>
                                        {renderMessageContent(msg.content, textClass)}
                                    </div>
                                    {isAdmin && <div className="absolute -right-1 -top-1 w-2 h-2 bg-emerald-500 animate-pulse"></div>}
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            )}

            {/* --- RADAR VIEW --- */}
            {viewMode === 'radar' && (
                <VoidRadar 
                    messages={messages} 
                    onSelectMessage={setViewingMsg}
                    isLightTheme={isLightTheme}
                />
            )}

        </div>

        {/* Input Area */}
        <div className={`p-4 border-t-2 shrink-0 z-20 ${isLightTheme ? 'bg-white border-zinc-200' : 'bg-ash-black border-ash-dark'}`}>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${isLightTheme ? 'bg-zinc-100 border-zinc-300 text-zinc-600' : 'bg-ash-dark border-ash-gray text-ash-gray'}`}>
                        {t.nick}:
                    </span>
                    <input 
                        type="text" 
                        value={userNick}
                        onChange={handleNickChange}
                        className={`bg-transparent border-b text-xs font-mono w-32 px-1 focus:outline-none focus:border-emerald-500 transition-colors ${isLightTheme ? 'border-zinc-300 text-zinc-800' : 'border-ash-gray text-ash-light'}`}
                        maxLength={12}
                    />
                    {!isConnected && (
                        <span className="text-[10px] text-red-500 ml-auto flex items-center gap-1">
                            <CloudOff size={10} /> OFFLINE MODE
                        </span>
                    )}
                    {/* Command Hints */}
                    <div className="hidden md:flex gap-2 ml-auto">
                        <span className="text-[9px] px-1 border border-red-900/30 text-red-500 opacity-50 cursor-help" title="Use /alert message">/alert</span>
                        <span className="text-[9px] px-1 border border-cyan-900/30 text-cyan-500 opacity-50 cursor-help" title="Use /radio message">/radio</span>
                        <span className="text-[9px] px-1 border border-fuchsia-900/30 text-fuchsia-500 opacity-50 cursor-help" title="Use /secret message">/secret</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className={`flex-1 flex items-center border-2 transition-colors ${isLightTheme ? 'bg-zinc-50 border-zinc-300 focus-within:border-emerald-500' : 'bg-black border-ash-gray/50 focus-within:border-emerald-500/50'}`}>
                        <span className="pl-3 pr-1 text-emerald-500 font-bold">{'>'}</span>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={t.placeholder}
                            disabled={isSending || cooldown > 0}
                            className={`w-full bg-transparent border-none p-3 focus:outline-none font-mono text-sm ${isLightTheme ? 'text-black placeholder:text-zinc-400' : 'text-ash-white placeholder:text-ash-gray/30'}`}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSending || cooldown > 0}
                        className={`px-4 md:px-6 font-bold uppercase tracking-widest flex items-center gap-2 transition-all 
                            ${isSending || cooldown > 0 
                                ? 'opacity-50 cursor-wait bg-ash-dark border-ash-gray text-ash-gray' 
                                : isLightTheme 
                                    ? 'bg-emerald-600 text-white hover:brightness-110 active:scale-95' 
                                    : 'bg-emerald-900/30 text-emerald-400 border-2 border-emerald-500/50 hover:bg-emerald-900/50 hover:brightness-110 active:scale-95'
                            }
                        `}
                    >
                        {isSending ? '...' : cooldown > 0 ? `WAIT ${cooldown}s` : t.send} <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default GuestbookPage;

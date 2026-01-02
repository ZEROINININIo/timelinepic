
import React from 'react';
import { Activity, Users, Signal, Ban, AlertOctagon, Swords, X, MessageSquare, Send, ExternalLink, MessageCircle } from 'lucide-react';
import { RemotePlayer, RPGObject } from '../../../types';

interface GameUIProps {
  isOnline: boolean;
  isLocalMode: boolean;
  isDuplicateName: boolean;
  playerName: string;
  playerPos: { x: number, y: number };
  systemLogs: string[];
  onlineCount: number;
  
  // Handlers
  onShowPlayerList: () => void;
  onClosePlayerList: () => void;
  showPlayerList: boolean;
  playerList: (RemotePlayer & { safeX: number, safeY: number })[];
  
  pvpInvite: RemotePlayer | null;
  onAcceptPvP: () => void;
  onRejectPvP: () => void;
  
  myInviteSent: boolean;
  onCancelInvite: () => void;
  
  duplicateAlert: boolean;
  onDuplicateResolve: () => void;
  
  showChatInput: boolean;
  setShowChatInput: (show: boolean) => void;
  chatInputValue: string;
  setChatInputValue: (val: string) => void;
  onSendChat: (e: React.FormEvent) => void;
  
  pendingLink: { url: string, title: string } | null;
  onConfirmLink: () => void;
  onCancelLink: () => void;
  
  activeObj: RPGObject | null;
  viewingExhibit: RPGObject | null;
  battleActive: boolean;
  onInteract: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  isOnline, isLocalMode, isDuplicateName, playerName, playerPos, systemLogs, onlineCount,
  onShowPlayerList, onClosePlayerList, showPlayerList, playerList,
  pvpInvite, onAcceptPvP, onRejectPvP,
  myInviteSent, onCancelInvite,
  duplicateAlert, onDuplicateResolve,
  showChatInput, setShowChatInput, chatInputValue, setChatInputValue, onSendChat,
  pendingLink, onConfirmLink, onCancelLink,
  activeObj, viewingExhibit, battleActive, onInteract
}) => {
  return (
    <>
        {/* HUD */}
        <div className="fixed top-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/50 border border-ash-gray/30 px-3 py-1 text-[10px] font-mono text-ash-light backdrop-blur-sm">
                <span className="text-emerald-500 font-bold">STATUS:</span> {isOnline ? 'ONLINE' : (isLocalMode ? 'LOCAL_MODE' : (isDuplicateName ? 'OFFLINE (CONFLICT)' : 'CONNECTING...'))}
            </div>
            <div className="bg-black/50 border border-ash-gray/30 px-3 py-1 text-[10px] font-mono text-ash-gray backdrop-blur-sm">
                POS: {Math.round(playerPos.x)}, {Math.round(playerPos.y)}
            </div>
            <div className="bg-black/70 border border-ash-gray/30 p-2 text-[9px] font-mono text-ash-gray/80 backdrop-blur-sm w-48 overflow-hidden flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-emerald-500/70 border-b border-ash-gray/20 pb-1 mb-1">
                    <Activity size={8} className="animate-pulse" />
                    <span>SYS_MONITOR // ACTIVE</span>
                </div>
                {systemLogs.map((log, i) => (
                    <div key={i} className={`truncate transition-all duration-300 ${i === 0 ? 'text-ash-light' : 'opacity-60'}`}>
                        {log}
                    </div>
                ))}
            </div>
            {/* Online Players Counter & Trigger */}
            <button 
                onClick={onShowPlayerList}
                className="bg-black/50 border border-cyan-500/30 px-3 py-1 text-[10px] font-mono text-cyan-400 backdrop-blur-sm flex items-center gap-2 pointer-events-auto hover:bg-cyan-950/30 transition-colors"
            >
                <Users size={12} />
                <span>ECHOES: {onlineCount}</span>
                <Signal size={10} className={`animate-pulse ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            </button>
        </div>

        {/* Sender Cancel PvP Button */}
        {myInviteSent && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[160] animate-slide-in">
                <button 
                    onClick={onCancelInvite}
                    className="bg-red-950/90 border-2 border-red-500 text-red-100 font-bold px-4 py-2 flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-red-900 transition-colors uppercase text-xs"
                >
                    <Ban size={14} /> CANCEL INVITE
                </button>
            </div>
        )}

        {/* Duplicate Name Alert Modal */}
        {duplicateAlert && (
            <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                <div className="bg-ash-black border-2 border-red-500 p-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] w-full max-w-sm text-center relative animate-shake-violent">
                    <AlertOctagon size={48} className="mx-auto text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-2">SIGNAL CONFLICT</h2>
                    <p className="text-ash-light font-mono text-sm mb-6 leading-relaxed">
                        IDENTITY_DUPLICATE_DETECTED<br/>
                        <span className="text-red-400 font-bold">"{playerName}"</span> IS ALREADY ACTIVE.
                    </p>
                    <div className="bg-red-950/30 border border-red-500/30 p-2 mb-6 text-[10px] text-red-300 font-mono">
                        SYSTEM HAS FORCED OFFLINE MODE.<br/>PLEASE CHANGE YOUR NICKNAME IN GUESTBOOK.
                    </div>
                    <button 
                        onClick={onDuplicateResolve}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 uppercase tracking-widest transition-colors shadow-hard"
                    >
                        CHANGE IDENTITY
                    </button>
                </div>
            </div>
        )}

        {/* PvP Invite Modal */}
        {pvpInvite && (
            <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => {}}>
                <div className="bg-ash-black border-2 border-red-500 p-6 shadow-[0_0_30px_rgba(220,38,38,0.5)] w-full max-w-sm text-center relative animate-shake-violent">
                    <Swords size={48} className="mx-auto text-red-500 mb-4 animate-pulse" />
                    <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-2">DUEL CHALLENGE</h2>
                    <p className="text-ash-light font-mono text-sm mb-6">
                        <span className="text-emerald-400 font-bold">{pvpInvite.nickname}</span> wants to battle you!
                    </p>
                    <div className="flex gap-4">
                        <button onClick={onAcceptPvP} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 uppercase tracking-widest transition-colors shadow-hard">
                            ACCEPT
                        </button>
                        <button onClick={onRejectPvP} className="flex-1 border border-ash-gray text-ash-gray hover:text-ash-light py-3 uppercase tracking-widest transition-colors">
                            DECLINE
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Player List Modal */}
        {showPlayerList && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={onClosePlayerList}>
                <div className="bg-ash-black border-2 border-cyan-500 p-6 shadow-hard w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
                    <button onClick={onClosePlayerList} className="absolute top-2 right-2 text-cyan-500 hover:text-cyan-300"><X size={16} /></button>
                    <h3 className="text-cyan-500 font-black mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} /> SIGNAL_TRACING
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* Self */}
                        <div className="flex justify-between items-center text-xs font-mono border-b border-cyan-900/30 pb-1 text-emerald-400">
                            <span>{playerName} (YOU)</span>
                            <span>[{Math.round(playerPos.x)}, {Math.round(playerPos.y)}]</span>
                        </div>
                        {/* Others */}
                        {playerList.map(p => (
                            <div key={p.id} className="flex justify-between items-center text-xs font-mono border-b border-cyan-900/30 pb-1 text-cyan-300/80">
                                <span className="flex items-center gap-1">
                                    {p.nickname}
                                    {p.tea && <span className="text-amber-500 text-[8px] border border-amber-500/50 px-1 ml-1">TEA</span>}
                                </span>
                                <span>[{Math.round(p.safeX)}, {Math.round(p.safeY)}]</span>
                            </div>
                        ))}
                        {playerList.length === 0 && <div className="text-[10px] text-cyan-900 italic py-2">NO_ECHOES_DETECTED</div>}
                    </div>
                </div>
            </div>
        )}

        {/* Chat Input Modal */}
        {showChatInput && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowChatInput(false)}>
                <div 
                    className="bg-black border-2 border-emerald-500 p-4 w-full max-w-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] relative"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-[10px] font-mono text-emerald-500 mb-2 uppercase flex items-center gap-2">
                        <MessageSquare size={12} /> GLOBAL_CHAT // BROADCAST
                    </div>
                    <form onSubmit={onSendChat} className="flex gap-2">
                        <input 
                            type="text" 
                            autoFocus
                            value={chatInputValue}
                            onChange={(e) => setChatInputValue(e.target.value)}
                            placeholder="Type message..."
                            maxLength={60}
                            className="flex-1 bg-emerald-950/20 border-b border-emerald-500/50 text-emerald-100 text-sm p-2 outline-none focus:border-emerald-400 placeholder:text-emerald-500/30"
                        />
                        <button type="submit" className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 px-3 hover:bg-emerald-500 hover:text-black transition-colors">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* Interaction Prompt */}
        {activeObj && !viewingExhibit && !battleActive && !pendingLink && !showChatInput && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <button 
                    onClick={onInteract}
                    className="bg-emerald-600 text-black px-6 py-3 font-bold uppercase tracking-widest border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2"
                >
                    {activeObj.type === 'terminal' ? (activeObj.id === 'terminal-guestbook' ? <MessageSquare size={16} /> : 'LINK') : activeObj.type === 'npc' ? 'TALK' : 'INSPECT'} [SPACE]
                </button>
            </div>
        )}

        {/* External Link Confirmation Modal */}
        {pendingLink && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onCancelLink}>
                <div className="w-full max-w-sm bg-black border-2 border-sky-500 p-6 shadow-[0_0_30px_rgba(56,189,248,0.2)] relative" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-2 right-2">
                        <button onClick={onCancelLink} className="text-sky-700 hover:text-sky-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-sky-500/50 flex items-center justify-center bg-sky-950/20 animate-pulse">
                            <ExternalLink size={32} className="text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-sky-400 uppercase tracking-widest mb-1">
                                {pendingLink.title}
                            </h2>
                            <p className="text-xs font-mono text-sky-600/80">
                                ESTABLISHING_EXTERNAL_CONNECTION...
                            </p>
                        </div>
                    </div>

                    <div className="bg-sky-900/10 border border-sky-800/30 p-3 mb-6 text-[10px] font-mono text-sky-300/70 text-center break-all">
                        TARGET: {pendingLink.url}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onConfirmLink}
                            className="flex-1 bg-sky-600 hover:bg-sky-500 text-black font-bold py-3 uppercase tracking-wider transition-colors shadow-hard"
                        >
                            CONFIRM
                        </button>
                        <button 
                            onClick={onCancelLink}
                            className="flex-1 border border-sky-800 text-sky-600 hover:text-sky-400 hover:border-sky-500 py-3 uppercase tracking-wider transition-colors"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Chat Toggle Button (Mobile/Tablet Only for easier access) */}
        {!battleActive && !viewingExhibit && !pendingLink && (
            <button 
                onClick={() => setShowChatInput(true)}
                className="fixed bottom-32 right-8 z-[60] bg-black/80 text-emerald-400 p-3 rounded-full border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95 transition-all lg:hidden"
            >
                <MessageCircle size={24} />
            </button>
        )}
    </>
  );
};

export default React.memo(GameUI);

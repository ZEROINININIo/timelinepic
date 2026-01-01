
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Radar, Scan, Crosshair, MapPin } from 'lucide-react';

interface VoidRadarProps {
  messages: Message[];
  onSelectMessage: (msg: Message) => void;
  isLightTheme: boolean;
}

const VoidRadar: React.FC<VoidRadarProps> = ({ messages, onSelectMessage, isLightTheme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredMsg, setHoveredMsg] = useState<Message | null>(null);
  const [scanAngle, setScanAngle] = useState(0);

  // Helper to hash string to angle (0 - 2PI)
  const getAngle = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Normalize to 0-1 then to radians
    const normalized = Math.abs(hash % 360) / 360;
    return normalized * Math.PI * 2;
  };

  // Helper to map time to distance (0 - 1, 0 is center/now)
  const getRadius = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const maxTime = 1000 * 60 * 60 * 24; // 24 Hours window for radar
    // Newer messages are closer to center (0)
    let r = diff / maxTime;
    if (r > 1) r = 1; 
    // Invert visual: Center is viewer.
    // Actually, let's make Center = NOW.
    // However, for radar, usually center is user position.
    // Let's say Center = Present Time. Edge = Past.
    return Math.pow(r, 0.5); // Non-linear to cluster recent msgs
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Setup Canvas
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(cx, cy) - 20;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Colors
      const gridColor = isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(16, 185, 129, 0.2)';
      const scanColor = isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(16, 185, 129, 0.5)';
      const blipColor = isLightTheme ? '#000' : '#34d399';
      const blipColorAdmin = '#ef4444'; // Red
      const blipColorSys = '#3b82f6'; // Blue

      // Draw Grid Rings
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw Crosshair
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.stroke();

      // Update Scan Line
      setScanAngle(prev => (prev + 0.02) % (Math.PI * 2));
      
      // Draw Scan Sector
      const gradient = ctx.createConicGradient(scanAngle, cx, cy);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.8, 'transparent');
      gradient.addColorStop(1, scanColor);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Messages as Blips
      const recentMessages = messages.slice(0, 50); // Limit to 50 recent
      let foundHover = null;

      recentMessages.forEach(msg => {
        const angle = getAngle(msg.sender);
        const dist = getRadius(msg.timestamp) * maxRadius;
        
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        // Interaction Check (Mouse is handled outside, but we calculate pos here)
        // Simplification: We rely on HTML overlay for tooltips or just visual coolness
        
        // Draw Blip
        let color = blipColor;
        let size = 3;
        if (msg.isAdmin) { color = blipColorAdmin; size = 4; }
        if (msg.isSystem) { color = blipColorSys; size = 3; }

        // Fade blip if scan line passed recently (optional complex effect) or just static
        // Let's make them static but glowing
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Pulse effect
        if (Math.random() > 0.95) {
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = color + '40'; // Low opacity
            ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [messages, isLightTheme, scanAngle]);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
        {/* Canvas Layer */}
        <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-10" />
        
        {/* Overlay UI */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className={`text-xs font-mono font-bold flex items-center gap-2 ${isLightTheme ? 'text-zinc-500' : 'text-emerald-500'}`}>
                <Radar size={16} className="animate-spin-slow" />
                SIGNAL_MONITOR // ACTIVE
            </div>
            <div className={`text-[10px] font-mono mt-1 ${isLightTheme ? 'text-zinc-400' : 'text-emerald-500/50'}`}>
                RANGE: 24H_TIMELINE
            </div>
        </div>

        {/* Hover/Click Interactive Layer (HTML on top of Canvas for easier clicking) */}
        {/* For simplicity in this demo, we list the latest signals on the side */}
        <div className="absolute right-4 top-16 bottom-16 w-48 overflow-y-auto z-20 no-scrollbar pointer-events-auto space-y-2 dir-rtl">
            {messages.slice(0, 8).map((msg, i) => (
                <div 
                    key={msg.id}
                    onClick={() => onSelectMessage(msg)}
                    className={`
                        text-left p-2 border-r-2 text-[10px] font-mono cursor-pointer transition-all hover:-translate-x-2
                        ${isLightTheme 
                            ? 'bg-white/80 border-zinc-300 text-zinc-600 hover:bg-zinc-100' 
                            : 'bg-black/60 border-emerald-500/30 text-emerald-400/80 hover:bg-emerald-900/40 hover:text-emerald-300 hover:border-emerald-400'
                        }
                    `}
                >
                    <div className="font-bold flex justify-between">
                        <span>{msg.sender.substring(0,8)}</span>
                        <Scan size={10} />
                    </div>
                    <div className="truncate opacity-70">{msg.content}</div>
                </div>
            ))}
        </div>

        <div className="absolute bottom-4 z-20 text-[10px] font-mono opacity-50 text-center w-full">
            <span className="animate-pulse">SCANNING_VOID_FREQUENCIES...</span>
        </div>
    </div>
  );
};

export default VoidRadar;

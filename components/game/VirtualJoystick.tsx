
import React, { useState, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onStop }) => {
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  
  // No interval, direct state update
  const startMove = (dx: number, dy: number, btnId: string) => {
    setActiveBtn(btnId);
    onMove(dx, dy);
  };

  const stopMove = () => {
    setActiveBtn(null);
    onStop();
  };

  // Helper for button props
  const getButtonProps = (dx: number, dy: number, id: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        startMove(dx, dy, id);
    },
    onPointerUp: (e: React.PointerEvent) => {
        e.preventDefault();
        e.currentTarget.releasePointerCapture(e.pointerId);
        stopMove();
    },
    onPointerCancel: (e: React.PointerEvent) => {
        stopMove();
    },
    className: `w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-100 touch-none select-none ${
        activeBtn === id 
        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-95 border-2 border-emerald-400' 
        : 'bg-ash-dark/90 border-2 border-ash-gray/50 text-ash-light active:bg-ash-light active:text-black backdrop-blur-sm'
    }`
  });

  return (
    <div className="fixed bottom-8 left-8 z-[200] md:hidden grid grid-cols-3 gap-2 opacity-90 select-none touch-none">
        <div></div>
        <button {...getButtonProps(0, -1, 'up')}>
            <ArrowUp size={24} strokeWidth={3} />
        </button>
        <div></div>

        <button {...getButtonProps(-1, 0, 'left')}>
            <ArrowLeft size={24} strokeWidth={3} />
        </button>
        
        {/* Center Decor */}
        <div className="w-14 h-14 flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full border border-ash-light transition-colors ${activeBtn ? 'bg-emerald-500' : 'bg-ash-gray/30'}`}></div>
        </div>

        <button {...getButtonProps(1, 0, 'right')}>
            <ArrowRight size={24} strokeWidth={3} />
        </button>

        <div></div>
        <button {...getButtonProps(0, 1, 'down')}>
            <ArrowDown size={24} strokeWidth={3} />
        </button>
        <div></div>
    </div>
  );
};

export default VirtualJoystick;

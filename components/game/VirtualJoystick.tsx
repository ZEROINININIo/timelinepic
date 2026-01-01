
import React, { useState, useRef, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const lastDirRef = useRef<{dx: number, dy: number} | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Configuration
  const MAX_RADIUS = 40; // Max distance the stick can move
  const DEAD_ZONE = 10;  // Threshold to register movement

  useEffect(() => {
    const checkVisibility = () => {
        // More robust check: 
        // 1. Explicit touch capability check
        // 2. Or small screen
        // 3. Or user agent sniffing (fallback)
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth < 1024;
        
        setIsVisible(hasTouch || isSmallScreen);
    };
    
    checkVisibility();
    window.addEventListener('resize', checkVisibility);
    return () => window.removeEventListener('resize', checkVisibility);
  }, []);

  const updateJoystick = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Clamp stick position
      let stickX = dx;
      let stickY = dy;
      
      if (distance > MAX_RADIUS) {
          const angle = Math.atan2(dy, dx);
          stickX = Math.cos(angle) * MAX_RADIUS;
          stickY = Math.sin(angle) * MAX_RADIUS;
      }

      setPosition({ x: stickX, y: stickY });

      // Determine directional input
      if (distance > DEAD_ZONE) {
          let moveX = 0;
          let moveY = 0;

          if (Math.abs(dx) > Math.abs(dy)) {
              moveX = dx > 0 ? 1 : -1;
          } else {
              moveY = dy > 0 ? 1 : -1;
          }

          if (!lastDirRef.current || lastDirRef.current.dx !== moveX || lastDirRef.current.dy !== moveY) {
              onStop(); // Clear previous
              onMove(moveX, moveY);
              lastDirRef.current = { dx: moveX, dy: moveY };
          }
      } else {
          if (lastDirRef.current) {
              onStop();
              lastDirRef.current = null;
          }
      }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling/gestures
    if (active) return;
    
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!active) return;
    
    // Find the tracked touch
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
            const touch = e.changedTouches[i];
            updateJoystick(touch.clientX, touch.clientY);
            break;
        }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!active) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
            setActive(false);
            setPosition({ x: 0, y: 0 });
            touchIdRef.current = null;
            onStop();
            lastDirRef.current = null;
            break;
        }
    }
  };

  if (!isVisible) return null;

  return (
    <div 
        className="fixed bottom-8 left-8 w-32 h-32 z-[200] touch-none select-none"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: 'none' }} // Explicit CSS touch-action
    >
        {/* Visual Container */}
        <div className={`w-full h-full rounded-full border-2 border-ash-gray/30 bg-black/40 backdrop-blur-md relative flex items-center justify-center transition-opacity duration-200 ${active ? 'opacity-100 ring-2 ring-emerald-500/30' : 'opacity-60'}`}>
            {/* Base Decor */}
            <div className="absolute inset-0 rounded-full border border-ash-gray/10 scale-75"></div>
            
            {/* The Stick */}
            <div 
                className={`w-12 h-12 rounded-full bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)] absolute border-2 border-emerald-300 transition-transform duration-75`}
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }}
            >
                {/* Stick highlight */}
                <div className="absolute top-2 left-2 w-4 h-4 bg-white/30 rounded-full blur-[1px]"></div>
            </div>
        </div>
        
        {/* Helper Text */}
        {!active && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-ash-gray/50 whitespace-nowrap pointer-events-none">DRAG TO MOVE</div>}
    </div>
  );
};

export default VirtualJoystick;

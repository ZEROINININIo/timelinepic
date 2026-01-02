
import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastCheckTimeRef = useRef(0);

  useEffect(() => {
    // Only enable on devices with fine pointers (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    
    const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setIsVisible(e.matches);
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
        mediaQuery.addListener(handleMediaQueryChange);
    }
    
    setIsVisible(mediaQuery.matches);
    
    if (!mediaQuery.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      // Direct DOM update to avoid React render cycle on every frame
      if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      
      const now = Date.now();
      // Throttle the heavy `closest` check to run only every 100ms
      // Visual update of cursor position remains 60fps, but state update is throttled
      if (now - lastCheckTimeRef.current > 100) {
          const target = e.target as HTMLElement;
          // Optimization: Simple check for interactive elements
          const isClickable = target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer');
          setIsPointer(!!isClickable);
          lastCheckTimeRef.current = now;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Use passive listener for better scroll performance
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
          mediaQuery.removeListener(handleMediaQueryChange);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] text-white mix-blend-difference will-change-transform"
      style={{ 
        // Initial position off-screen to prevent flash
        transform: 'translate3d(-100px, -100px, 0)',
      }}
    >
      <div className={`transition-transform duration-100 ease-out ${isClicking ? 'scale-75' : 'scale-100'}`}>
        {!isPointer ? (
            // Default State: Tactical Arrow
            <div className="-translate-x-[2px] -translate-y-[2px]">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
                    <path d="M2 2L9 19L12.5 11.5L20 8L2 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </div>
        ) : (
            // Hover State: Dynamic Reticle
            <div className="-translate-x-1/2 -translate-y-1/2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    {/* Spinning Outer Brackets */}
                    <g className="origin-center animate-[spin_8s_linear_infinite]">
                        <path d="M4 4H9M4 4V9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 4H15M20 4V9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4 20H9M4 20V15" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 20H15M20 20V15" stroke="currentColor" strokeWidth="1.5" />
                    </g>
                    {/* Static Center Dot */}
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    {/* Inner Crosshair - Subtle Pulse */}
                    <g className="origin-center opacity-50">
                         <path d="M12 7V9M12 15V17M7 12H9M15 12H17" stroke="currentColor" strokeWidth="1" />
                    </g>
                </svg>
            </div>
        )}
      </div>
    </div>
  );
};

export default CustomCursor;

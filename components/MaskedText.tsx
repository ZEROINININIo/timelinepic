
import React, { useState } from 'react';

interface MaskedTextProps {
  children: React.ReactNode;
}

const MaskedText: React.FC<MaskedTextProps> = ({ children }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span 
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent elements (like list selection)
        setIsRevealed(!isRevealed);
      }}
      className={`
        px-1 mx-0.5 rounded-sm select-none cursor-help transition-all duration-300 inline-block align-middle
        ${isRevealed 
          ? 'bg-ash-light text-ash-black' 
          : 'bg-ash-gray text-transparent hover:text-ash-black hover:bg-ash-light'
        }
      `}
      title="REDACTED_DATA [CLICK TO REVEAL]"
    >
      {children}
    </span>
  );
};

export default MaskedText;

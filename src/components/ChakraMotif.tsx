import React from 'react';

interface ChakraMotifProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const ChakraMotif: React.FC<ChakraMotifProps> = ({
  className = 'text-blue-700',
  size = 32,
  animate = false,
}) => {
  // 24 spokes representing continuous diligence and industrial precision
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? 'animate-spin' : ''}`}
      style={{ animationDuration: '18s' }}
      aria-label="Ashoka Chakra motif"
    >
      {/* Outer Rim */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4.5" />
      <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />

      {/* Central Hub */}
      <circle cx="50" cy="50" r="11" fill="currentColor" />
      <circle cx="50" cy="50" r="5" fill="#ffffff" />

      {/* 24 Spokes */}
      {spokes.map((angle, idx) => (
        <g key={idx} transform={`rotate(${angle} 50 50)`}>
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="50" cy="8" r="1.5" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
};

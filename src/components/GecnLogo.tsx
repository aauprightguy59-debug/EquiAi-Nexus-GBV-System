import React from "react";

interface GecnLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const GecnLogo: React.FC<GecnLogoProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Gender Equality Club Nigeria Logo"
    >
      <defs>
        {/* Outer Ring Gradient */}
        <radialGradient id="purpleRing" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#670054" />
          <stop offset="100%" stopColor="#4d003f" />
        </radialGradient>

        {/* Inner Yellow Disc Gradient */}
        <radialGradient id="yellowDisc" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="60%" stopColor="#fec925" />
          <stop offset="100%" stopColor="#f5b300" />
        </radialGradient>

        {/* Text Path for "GENDER EQUALITY CLUB" on top */}
        <path
          id="topTextPath"
          d="M 28 100 A 72 72 0 0 1 172 100"
          fill="none"
        />

        {/* Text Path for "NIGERIA" on bottom */}
        <path
          id="bottomTextPath"
          d="M 166 100 A 66 66 0 0 1 34 100"
          fill="none"
        />

        {/* Magenta Silhouette Gradient */}
        <linearGradient id="magentaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff00a0" />
          <stop offset="100%" stopColor="#d9007e" />
        </linearGradient>
      </defs>

      {/* 1. Outer Circular Ring (Purple & Gold Border) */}
      <circle cx="100" cy="100" r="98" fill="#fec925" />
      <circle cx="100" cy="100" r="94" fill="url(#purpleRing)" />
      
      {/* Thin Inner Gold Rim */}
      <circle cx="100" cy="100" r="76" fill="#fec925" />
      <circle cx="100" cy="100" r="74" fill="url(#yellowDisc)" />

      {/* 2. Curved Text around Outer Ring */}
      {/* Top Arc: GENDER EQUALITY CLUB */}
      <text
        fill="#FFFFFF"
        fontSize="12.5"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="2.8"
      >
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          GENDER EQUALITY CLUB
        </textPath>
      </text>

      {/* Decorative Star/Sunburst Icons on sides */}
      {/* Left Sunburst */}
      <g transform="translate(24, 137) scale(0.65)">
        <circle cx="0" cy="0" r="4" fill="#fec925" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1="0"
            y1="-4"
            x2="0"
            y2="-7"
            stroke="#fec925"
            strokeWidth="1.8"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>

      {/* Right Sunburst */}
      <g transform="translate(176, 137) scale(0.65)">
        <circle cx="0" cy="0" r="4" fill="#fec925" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1="0"
            y1="-4"
            x2="0"
            y2="-7"
            stroke="#fec925"
            strokeWidth="1.8"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>

      {/* Bottom Arc: NIGERIA */}
      <text
        fill="#FFFFFF"
        fontSize="13.5"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="4.5"
      >
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          NIGERIA
        </textPath>
      </text>

      {/* 3. Center Art: Protective Open Hand & Rising Woman Figure with Gender Symbols */}
      <g id="center-emblem" fill="url(#magentaGrad)">
        {/* Supporting / Uplifting Hand (Swooping from left to right cradling the figure) */}
        <path
          d="M 75 67 
             C 61 75, 54 90, 56 109 
             C 58 126, 68 141, 88 147 
             C 107 153, 129 148, 147 122 
             C 142 129, 131 137, 120 140 
             C 103 144, 88 139, 78 129 
             C 69 119, 67 107, 72 94 
             C 77 82, 85 75, 94 70 
             Z"
        />

        {/* Hand Thumb & Palm Palm Contour */}
        <path
          d="M 92 147 
             C 103 148, 114 144, 125 137 
             C 134 131, 142 124, 147 117 
             C 145 125, 136 137, 125 142 
             C 114 147, 102 148, 92 147 
             Z"
        />

        {/* Empowered Woman / Human Body Figure standing on the hand */}
        {/* Dress / Body Torso */}
        <path
          d="M 94 92 
             L 106 92 
             L 114 117 
             L 96 123 
             Z"
        />

        {/* Legs */}
        <path
          d="M 98 123 L 95 137 L 99 137 L 102 123 Z"
        />
        <path
          d="M 106 121 L 104 135 L 108 135 L 110 121 Z"
        />

        {/* Upper Torso & Arms Raised Upwards */}
        <path
          d="M 93 92 
             C 89 82, 83 75, 78 69 
             C 87 72, 94 77, 98 84 
             L 102 84 
             C 106 77, 113 72, 122 69 
             C 117 75, 111 82, 107 92 
             Z"
        />

        {/* Head with Linked Gender Equality / Intertwined Symbols above */}
        {/* Female Symbol (Circle + Cross) & Male Symbol (Circle + Arrow) */}
        <g stroke="url(#magentaGrad)" strokeWidth="2.2" fill="none">
          {/* Female Circle & Cross */}
          <circle cx="95" cy="59" r="6" />
          <line x1="95" y1="65" x2="95" y2="70" strokeWidth="2.2" />
          <line x1="92" y1="67.5" x2="98" y2="67.5" strokeWidth="2.2" />

          {/* Male Circle & Arrow */}
          <circle cx="105" cy="59" r="6" />
          <line x1="109" y1="55" x2="114" y2="50" strokeWidth="2.2" />
          <polyline points="110,50 114,50 114,54" strokeWidth="2.2" />
        </g>
      </g>
    </svg>
  );
};

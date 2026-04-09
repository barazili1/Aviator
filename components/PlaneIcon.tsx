
import React from 'react';

interface PlaneProps {
  className?: string;
  thrum?: boolean;
}

export const PlaneIcon: React.FC<PlaneProps> = ({ className, thrum }) => (
  <div className={`perspective-500 transform-style-3d inline-block ${className}`}>
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={`animate-plane-3d-realistic transform-style-3d overflow-visible`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="transform-style-3d">
        {/* Main Body with 3D shadow path */}
        <path 
          className={thrum ? 'animate-thrum' : ''}
          d="M21 16.5L14 12L21 7.5V16.5ZM3 12L10 16.5V7.5L3 12ZM12 12L12 2L10 10L12 12ZM12 12L12 22L14 14L12 12Z" 
        />
        
        {/* Decorative highlights for depth */}
        <path 
          d="M12 12L10 10L12 5L12 12Z" 
          fill="white" 
          fillOpacity="0.2"
        />

        {/* Propeller - Nose position adjusted for 3D perspective */}
        <g transform="translate(12, 2)">
          <rect 
            x="-4" 
            y="-0.5" 
            width="8" 
            height="1" 
            fill="white" 
            opacity="0.9"
            className="animate-propeller-spin"
          />
        </g>
      </g>
    </svg>
  </div>
);

export const DetailedPlane: React.FC<PlaneProps> = ({ className, thrum }) => (
  <div className={`perspective-500 transform-style-3d inline-block ${className}`}>
    <svg 
      viewBox="0 0 120 60" 
      fill="none" 
      className={`animate-plane-3d-realistic transform-style-3d overflow-visible`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Deep Red Metallic Gradient */}
        <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#880e28" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#880e28" />
        </linearGradient>
        
        {/* Light Reflection/Inner Glow */}
        <linearGradient id="innerHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="40%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="black" stopOpacity="0.3" />
        </linearGradient>

        {/* Advanced Neon Glow Filter */}
        <filter id="neon-glow-pro" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="blur1" />
          <feFlood floodColor="#e11d48" result="color1" />
          <feComposite in="color1" in2="blur1" operator="in" result="glow1" />
          
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur2" />
          <feFlood floodColor="#e11d48" floodOpacity="0.7" result="color2" />
          <feComposite in="color2" in2="blur2" operator="in" result="glow2" />
          
          <feMerge>
            <feMergeNode in="glow2" />
            <feMergeNode in="glow1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Atmospheric Particles */}
      <g opacity="0.6">
        <circle cx="15" cy="15" r="1.2" fill="#e11d48">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="105" cy="45" r="0.8" fill="#e11d48">
          <animate attributeName="opacity" values="0;0.8;0" dur="4.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="10" r="1" fill="#e11d48">
          <animate attributeName="opacity" values="0.1;0.7;0.1" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* The Geometric Aviator Structure */}
      <g filter="url(#neon-glow-pro)" className={`transform-style-3d ${thrum ? 'animate-thrum' : ''}`}>
        <g className="transform-style-3d">
          {/* Symmetrical Base Shape */}
          <path 
            d="M15 15 L40 28 L80 28 L105 15 L112 20 L92 30 L112 40 L105 45 L80 32 L40 32 L15 45 L8 40 L28 30 L8 20 Z" 
            fill="url(#planeGrad)"
          />
          
          {/* Subtle Structural Highlight Overlay */}
          <path 
            d="M15 15 L40 28 L80 28 L105 15 L112 20 L92 30 L112 40 L105 45 L80 32 L40 32 L15 45 L8 40 L28 30 L8 20 Z" 
            fill="url(#innerHighlight)"
            fillOpacity="0.6"
          />

          {/* Propeller (at the nose 8, 30) */}
          <g transform="translate(8, 30)">
            <ellipse 
              cx="0" 
              cy="0" 
              rx="2" 
              ry="15" 
              fill="white" 
              fillOpacity="0.8"
              className="animate-propeller-spin"
            />
            <circle cx="0" cy="0" r="3" fill="#880e28" />
          </g>

          {/* Internal Center Detail Line */}
          <path 
            d="M45 30 L75 30" 
            stroke="white" 
            strokeOpacity="0.5" 
            strokeWidth="1" 
            strokeLinecap="round" 
          />
        </g>
      </g>
    </svg>
  </div>
);

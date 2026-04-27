/**
 * VietnamFlag — Pure CSS animated waving Vietnamese flag.
 *
 * Renders a realistic waving flag with the golden star on red background.
 * Sizes: 'sm' (24px), 'md' (36px), 'lg' (48px).
 * Uses CSS clip-path + keyframe animation for the wave effect.
 */

import React from 'react';

interface VietnamFlagProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  xs: { w: 20, h: 14, star: 6, pole: 28 },
  sm: { w: 28, h: 19, star: 8, pole: 36 },
  md: { w: 40, h: 27, star: 12, pole: 48 },
  lg: { w: 56, h: 37, star: 16, pole: 64 }
};

const VietnamFlag: React.FC<VietnamFlagProps> = ({
  size = 'sm',
  className = ''
}) => {
  const s = SIZES[size];

  return (
    <>
      <style>{`
        @keyframes vn-flag-wave {
          0% { transform: perspective(200px) rotateY(0deg) skewY(0deg); }
          15% { transform: perspective(200px) rotateY(-4deg) skewY(-1.5deg); }
          30% { transform: perspective(200px) rotateY(3deg) skewY(1deg); }
          45% { transform: perspective(200px) rotateY(-3deg) skewY(-1deg); }
          60% { transform: perspective(200px) rotateY(2deg) skewY(0.5deg); }
          75% { transform: perspective(200px) rotateY(-2deg) skewY(-0.5deg); }
          100% { transform: perspective(200px) rotateY(0deg) skewY(0deg); }
        }

        @keyframes vn-flag-shadow {
          0%, 100% { box-shadow: 1px 1px 3px rgba(0,0,0,0.15); }
          30% { box-shadow: 2px 1px 5px rgba(0,0,0,0.2); }
          60% { box-shadow: 0px 1px 3px rgba(0,0,0,0.1); }
        }

        .vn-flag-container {
          display: inline-flex;
          align-items: flex-start;
          position: relative;
        }

        .vn-flag-pole {
          width: 2px;
          border-radius: 1px;
          background: linear-gradient(180deg, #c4a035 0%, #b8942c 50%, #a68526 100%);
          box-shadow: 0 0 2px rgba(196, 160, 53, 0.4);
          flex-shrink: 0;
        }

        .vn-flag-cloth {
          position: relative;
          background: linear-gradient(160deg, #da251d 0%, #c41e18 40%, #da251d 100%);
          border-radius: 0 2px 2px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: left center;
          animation: vn-flag-wave 3s ease-in-out infinite, vn-flag-shadow 3s ease-in-out infinite;
          will-change: transform;
          overflow: hidden;
        }

        /* Subtle fabric texture overlay */
        .vn-flag-cloth::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.02) 2px,
            rgba(0, 0, 0, 0.02) 4px
          );
          pointer-events: none;
        }

        /* Golden star */
        .vn-star {
          position: relative;
          color: #ffcd00;
          filter: drop-shadow(0 0 1px rgba(255, 205, 0, 0.5));
          line-height: 1;
          z-index: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .vn-flag-cloth { animation: none !important; }
        }
      `}</style>

      <span className={`vn-flag-container ${className}`}>
        <span className="vn-flag-pole" style={{ height: `${s.pole}px` }} />
        <span
          className="vn-flag-cloth"
          style={{ width: `${s.w}px`, height: `${s.h}px` }}
        >
          <span className="vn-star" style={{ fontSize: `${s.star}px` }}>
            ★
          </span>
        </span>
      </span>
    </>
  );
};

export default VietnamFlag;

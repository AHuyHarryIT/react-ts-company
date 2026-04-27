/**
 * FallingStars — Subtle golden star particle effect for the holiday period.
 *
 * Renders lightweight CSS-only falling stars that drift slowly across the
 * viewport.  Uses will-change + pointer-events:none to avoid any impact on
 * interactivity or performance.
 */

import React, { useMemo } from 'react';

interface FallingStarsProps {
  /** Number of star particles (default 18) */
  count?: number;
}

const STAR_CHARS = ['✦', '★', '✧', '⭐'];

const FallingStars: React.FC<FallingStarsProps> = ({ count = 18 }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        char: STAR_CHARS[i % STAR_CHARS.length],
        left: `${(i * 5.5 + Math.random() * 3) % 100}%`,
        size: 11 + Math.random() * 10,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.2
      })),
    [count]
  );

  return (
    <>
      <style>{`
        @keyframes holiday-star-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: var(--star-opacity, 0.2); }
          85% { opacity: var(--star-opacity, 0.2); }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .holiday-star {
          position: fixed;
          pointer-events: none;
          z-index: 50;
          color: #d4a853;
          will-change: transform, opacity;
          animation: holiday-star-fall var(--star-dur, 12s) linear infinite;
          animation-delay: var(--star-delay, 0s);
          text-shadow: 0 0 6px rgba(212, 168, 83, 0.3);
        }

        /* On mobile: show up to 15 stars, scaled appropriately */
        @media (max-width: 639px) {
          .holiday-star:nth-child(n+16) { display: none; }
          .holiday-star { font-size: 8px !important; }
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .holiday-star { display: none; }
        }
      `}</style>

      {stars.map((s) => (
        <span
          key={s.id}
          className="holiday-star"
          style={
            {
              left: s.left,
              top: '-20px',
              fontSize: `${s.size}px`,
              '--star-dur': `${s.duration}s`,
              '--star-delay': `${s.delay}s`,
              '--star-opacity': s.opacity
            } as React.CSSProperties
          }
        >
          {s.char}
        </span>
      ))}
    </>
  );
};

export default FallingStars;

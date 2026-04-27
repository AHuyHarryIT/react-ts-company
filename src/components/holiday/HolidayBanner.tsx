/**
 * HolidayBanner — Elegant banner celebrating 30/4 & 1/5.
 *
 * Design: warm gold + deep red tones, minimalistic, not flashy.
 * MOBILE: Compact single-line strip (no vertical stacking).
 * DESKTOP: Full-width card with emblem + countdown.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HolidayBannerProps {
  daysUntil: number;
  phase: 'before' | 'during' | 'after';
}

const HolidayBanner: React.FC<HolidayBannerProps> = ({ daysUntil, phase }) => {
  const isCountdown = phase === 'before' && daysUntil > 0;

  return (
    <AnimatePresence>
      {
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <style>{`
            /* ═══════ Holiday Banner ═══════ */
            .holiday-banner {
              position: relative;
              overflow: hidden;
              border-radius: 12px;
              padding: 0;
              background: linear-gradient(135deg, #b31b15 0%, #94130e 50%, #b31b15 100%);
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow:
                0 4px 12px rgba(179, 27, 21, 0.25),
                0 1px 3px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
            }

            /* Gold shimmer overlay */
            .holiday-banner::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(
                110deg,
                transparent 20%,
                rgba(212, 168, 83, 0.06) 40%,
                rgba(212, 168, 83, 0.12) 50%,
                rgba(212, 168, 83, 0.06) 60%,
                transparent 80%
              );
              animation: holiday-shimmer 6s ease-in-out infinite;
            }

            @keyframes holiday-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }

            /* ─── Inner content: ALWAYS horizontal ─── */
            .holiday-banner-inner {
              position: relative;
              z-index: 2;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 14px;
            }

            /* Desktop: more padding */
            @media (min-width: 640px) {
              .holiday-banner { border-radius: 16px; }
              .holiday-banner-inner {
                gap: 16px;
                padding: 16px 20px;
              }
            }

            /* Star emblem — hidden on mobile for compactness */
            .holiday-emblem {
              display: none;
            }
            @media (min-width: 640px) {
              .holiday-emblem {
                display: flex;
                flex-shrink: 0;
                width: 44px;
                height: 44px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(212, 168, 83, 0.2) 0%, rgba(212, 168, 83, 0.05) 70%);
                border: 1.5px solid rgba(212, 168, 83, 0.3);
                animation: holiday-emblem-glow 3s ease-in-out infinite;
              }
            }

            @keyframes holiday-emblem-glow {
              0%, 100% { box-shadow: 0 0 12px rgba(212, 168, 83, 0.15); }
              50% { box-shadow: 0 0 20px rgba(212, 168, 83, 0.3); }
            }

            .holiday-star-icon {
              font-size: 22px;
              filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.4));
            }

            /* Text content */
            .holiday-text {
              flex: 1;
              min-width: 0;
              overflow: hidden;
            }

            /* Mobile marquee wrapper */
            .holiday-title-marquee {
              display: flex;
              overflow: hidden;
              mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
              -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            }

            @media (min-width: 640px) {
              .holiday-title-marquee {
                display: block;
                mask-image: none;
                -webkit-mask-image: none;
                overflow: visible;
              }
            }

            .holiday-title-track {
              display: flex;
              gap: 48px;
              animation: holiday-marquee 14s linear infinite;
              white-space: nowrap;
            }

            @keyframes holiday-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-50% - 24px)); }
            }

            @media (min-width: 640px) {
              .holiday-title-track {
                animation: none;
                display: block;
                white-space: normal;
              }
            }

            .holiday-title {
              font-size: 12px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: 0.2px;
              margin: 0;
              text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
              line-height: 1.35;
              white-space: nowrap;
            }

            /* Duplicate text for seamless loop — hidden on desktop */
            .holiday-title-dup { display: inline; }
            @media (min-width: 640px) {
              .holiday-title-dup { display: none; }
            }

            @media (min-width: 640px) {
              .holiday-title {
                font-size: 15px;
                white-space: normal;
                margin-bottom: 3px;
              }
            }

            /* Subtitle: hidden on mobile */
            .holiday-subtitle {
              display: none;
            }
            @media (min-width: 640px) {
              .holiday-subtitle {
                display: block;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
                line-height: 1.4;
                font-weight: 400;
              }
            }

            /* Countdown badge — compact on mobile */
            .holiday-countdown {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              border-radius: 8px;
              background: rgba(212, 168, 83, 0.12);
              border: 1px solid rgba(212, 168, 83, 0.2);
            }

            @media (min-width: 640px) {
              .holiday-countdown {
                flex-direction: column;
                gap: 0;
                padding: 8px 16px;
                border-radius: 12px;
              }
            }

            .holiday-countdown-num {
              font-size: 16px;
              font-weight: 800;
              color: #ffffff;
              line-height: 1;
              text-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
              font-family: 'Outfit', sans-serif;
            }

            @media (min-width: 640px) {
              .holiday-countdown-num { font-size: 28px; }
            }

            .holiday-countdown-label {
              font-size: 9px;
              color: rgba(255, 255, 255, 0.7);
              font-weight: 500;
              letter-spacing: 0.3px;
              text-transform: uppercase;
            }

            @media (min-width: 640px) {
              .holiday-countdown-label {
                font-size: 10px;
                margin-top: 2px;
              }
            }

            /* "During" badge */
            .holiday-live-badge {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              gap: 5px;
              padding: 4px 10px;
              border-radius: 100px;
              background: rgba(212, 168, 83, 0.15);
              border: 1px solid rgba(212, 168, 83, 0.25);
            }

            @media (min-width: 640px) {
              .holiday-live-badge {
                gap: 6px;
                padding: 6px 14px;
              }
            }

            .holiday-live-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #ffd700;
              box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
              animation: holiday-live-pulse 2s ease-in-out infinite;
            }

            @keyframes holiday-live-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.8); }
            }

            .holiday-live-text {
              font-size: 10px;
              font-weight: 600;
              color: #ffffff;
              letter-spacing: 0.5px;
            }


            .holiday-corner { display: none; }
            @media (min-width: 640px) {
              .holiday-corner {
                display: block;
                position: absolute;
                width: 50px;
                height: 50px;
                pointer-events: none;
                opacity: 0.12;
              }
              .holiday-corner-tl {
                top: 0; left: 0;
                border-top: 2px solid #d4a853;
                border-left: 2px solid #d4a853;
                border-top-left-radius: 16px;
              }
              .holiday-corner-br {
                bottom: 0; right: 0;
                border-bottom: 2px solid #d4a853;
                border-right: 2px solid #d4a853;
                border-bottom-right-radius: 16px;
              }
            }

            /* Floating mini stars — desktop only */
            .holiday-float-star { display: none; }
            @media (min-width: 640px) {
              .holiday-float-star {
                display: block;
                position: absolute;
                pointer-events: none;
                color: #d4a853;
                animation: holiday-float var(--hf-dur, 4s) ease-in-out infinite;
                animation-delay: var(--hf-delay, 0s);
              }
            }

            @keyframes holiday-float {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
              50% { transform: translateY(-6px) scale(1.1); opacity: 0.3; }
            }

            /* Dark mode */
            .dark .holiday-banner {
              background: linear-gradient(135deg, #8b1511 0%, #700f0b 50%, #8b1511 100%);
              border-color: rgba(255, 255, 255, 0.1);
            }

            @media (prefers-reduced-motion: reduce) {
              .holiday-banner::before,
              .holiday-emblem,
              .holiday-live-dot,
              .holiday-float-star { animation: none !important; }
            }
          `}</style>

          <div className="holiday-banner" id="holiday-banner-30-4">
            {/* Corner accents (desktop only) */}
            <div className="holiday-corner holiday-corner-tl" />
            <div className="holiday-corner holiday-corner-br" />

            {/* Floating stars decoration (desktop only via CSS) */}
            {[
              { top: '15%', right: '12%', size: 10, dur: 3.5, delay: 0 },
              { top: '60%', right: '8%', size: 8, dur: 4.2, delay: 1.2 },
              { top: '25%', left: '80%', size: 7, dur: 5, delay: 0.7 },
              { top: '70%', left: '15%', size: 9, dur: 3.8, delay: 2 },
              { top: '40%', right: '25%', size: 6, dur: 4.5, delay: 1.5 }
            ].map((star, i) => (
              <span
                key={i}
                className="holiday-float-star"
                style={
                  {
                    top: star.top,
                    ...(star.right
                      ? { right: star.right }
                      : { left: star.left }),
                    fontSize: `${star.size}px`,
                    '--hf-dur': `${star.dur}s`,
                    '--hf-delay': `${star.delay}s`
                  } as unknown as React.CSSProperties
                }
              >
                ✦
              </span>
            ))}

            {/* Main content — ALWAYS horizontal */}
            <div className="holiday-banner-inner">
              {/* Star emblem (desktop only via CSS) */}
              <div className="holiday-emblem">
                <span className="holiday-star-icon">⭐</span>
              </div>

              {/* Text */}
              <div className="holiday-text">
                <div className="holiday-title-marquee">
                  <div className="holiday-title-track">
                    <p className="holiday-title">
                      🇻🇳 Mừng Ngày Giải phóng miền Nam 30/4 & Quốc tế Lao động
                      1/5 ⭐ Chúc nghỉ lễ vui vẻ!
                    </p>
                    {/* Duplicate for seamless loop on mobile */}
                    <p
                      className="holiday-title holiday-title-dup"
                      aria-hidden="true"
                    >
                      🇻🇳 Mừng Ngày Giải phóng miền Nam 30/4 & Quốc tế Lao động
                      1/5 ⭐ Chúc nghỉ lễ vui vẻ!
                    </p>
                  </div>
                </div>
                <p className="holiday-subtitle">
                  {phase === 'before'
                    ? 'Chúc toàn thể Cán bộ – Nhân viên Công ty Vinh Vinh Phát một mùa lễ an lành, hạnh phúc!'
                    : 'Chúc mừng ngày lễ lớn! Chúc toàn thể CBCNV nghỉ lễ vui vẻ, an toàn!'}
                </p>
              </div>

              {/* Right: Countdown or Live badge */}
              {isCountdown ? (
                <div className="holiday-countdown">
                  <span className="holiday-countdown-num">{daysUntil}</span>
                  <span className="holiday-countdown-label">ngày nữa</span>
                </div>
              ) : (
                <div className="holiday-live-badge">
                  <span className="holiday-live-dot" />
                  <span className="holiday-live-text">NGÀY LỄ</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>
  );
};

export default HolidayBanner;

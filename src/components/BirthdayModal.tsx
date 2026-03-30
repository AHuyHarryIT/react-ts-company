import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Button, Image, Modal, Typography } from 'antd';
import React, { useEffect, useMemo } from 'react';

import cake1 from '@assets/images/birthdayCakes/birthdayCake1.jpg';
import cake2 from '@assets/images/birthdayCakes/birthdayCake2.png';
import {
  default as cake3,
  default as cake5
} from '@assets/images/birthdayCakes/birthdayCake3.jpg';

const { Title, Text } = Typography;

export interface BirthdayModalProps {
  employees?: string[];
  companyName?: string;
  open?: boolean;
  onClose?: () => void;
  autoCloseMs?: number;
  title?: string;
  brandColor?: string;
}

const IMAGES = [cake1, cake2, cake3, cake5];

const BASE_WISHES = [
  'Chúc {name} một tuổi mới thật rực rỡ và nhiều niềm vui! 🎉',
  'Hy vọng tuổi mới mang đến cho {name} thật nhiều sức khỏe và may mắn!',
  '{name} luôn hạnh phúc, thành công và tràn đầy năng lượng tích cực!',
  'Mong {name} đạt được mọi mục tiêu và ước mơ trong năm tới!',
  '{name} sẽ có thật nhiều kỷ niệm đẹp cùng đồng nghiệp và người thân!',
  'Tuổi mới thật "bùng nổ" với nhiều dự án thành công nha {name}!',
  'Chúc {name} cười thật nhiều mỗi ngày và luôn được yêu thương!',
  'Mong mọi điều tốt lành luôn đồng hành cùng {name}!'
];

const CONFETTI_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFD93D',
  '#FF9FF3',
  '#54A0FF',
  '#5F27CD',
  '#F368E0',
  '#FF6348',
  '#2ED573'
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function makeWish(name: string): string {
  return pickRandom(BASE_WISHES).replace('{name}', name);
}

const BirthdayModal: React.FC<BirthdayModalProps> = ({
  employees = [],
  companyName = 'Công Ty Vinh Vinh Phát',
  open = false,
  onClose,
  autoCloseMs = 10000,
  title = 'Chúc Mừng Sinh Nhật!',
  brandColor = '#ff6b9d'
}) => {
  const randomImage = useMemo(() => pickRandom(IMAGES), []);
  const wishes = useMemo(() => employees.map((e) => makeWish(e)), [employees]);

  const isMany = employees.length > 3;
  const maxWishes = isMany ? Math.min(employees.length, 5) : employees.length;
  const displayWishes = wishes.slice(0, maxWishes);
  const hasMore = wishes.length > maxWishes;

  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;
    const t = setTimeout(() => setTimeout(() => onClose?.(), 300), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  const handleClose = () => setTimeout(() => onClose?.(), 300);

  return (
    <>
      <style>
        {`
        /* ═══════════════════════════════════════════════════════════════ */
        /*  BIRTHDAY MODAL — Bright & Festive Premium Design            */
        /* ═══════════════════════════════════════════════════════════════ */

        .bd-modal { 
          width: min(88vw, 400px) !important;
          max-height: 92vh !important;
          margin: 0 auto !important;
        }
        @media (min-width: 480px) { .bd-modal { width: min(78vw, 440px) !important; } }
        @media (min-width: 768px) { .bd-modal { width: min(55vw, 480px) !important; } }
        @media (min-width: 1024px) { .bd-modal { width: min(40vw, 500px) !important; } }

        @media (prefers-reduced-motion: reduce) {
          .bd-modal *, .bd-modal *::before, .bd-modal *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* —— Modal container — Bright warm gradient —— */
        .bd-modal .ant-modal-content {
          position: relative;
          background: linear-gradient(160deg, #fff9f0 0%, #ffffff 30%, #fff5f8 60%, #fef0f5 100%);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 107, 157, 0.15);
          box-shadow: 
            0 24px 60px -12px rgba(255, 107, 157, 0.18),
            0 12px 24px -8px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.8);
          padding: 0;
        }

        /* —— Top ribbon — vibrant gradient bar —— */
        .bd-ribbon {
          position: relative;
          background: linear-gradient(135deg, ${brandColor}, #ff8fab, #ffa07a);
          padding: 14px 20px;
          text-align: center;
          overflow: hidden;
        }
        .bd-ribbon::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(255,255,255,0.2) 50%, 
            transparent 100%
          );
          transform: translateX(-100%);
          animation: bd-ribbon-shine 4s ease-in-out infinite;
        }
        @keyframes bd-ribbon-shine {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }

        .bd-ribbon-emoji {
          font-size: 28px;
          display: block;
          margin-bottom: 4px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
          animation: bd-bounce 2s ease-in-out infinite;
        }
        @keyframes bd-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }

        .bd-ribbon-title {
          margin: 0 !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #fff !important;
          text-shadow: 0 2px 8px rgba(0,0,0,0.15);
          letter-spacing: -0.3px;
        }

        .bd-ribbon-company {
          margin-top: 2px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 500;
          letter-spacing: 0.8px;
        }

        /* —— Body wrapper —— */
        .bd-body {
          position: relative;
          z-index: 2;
          padding: 16px 18px 20px;
          max-height: calc(92vh - 90px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${brandColor}25 transparent;
        }
        .bd-body::-webkit-scrollbar { width: 3px; }
        .bd-body::-webkit-scrollbar-thumb { 
          background: ${brandColor}30; 
          border-radius: 3px; 
        }

        /* —— Cake image —— */
        .bd-cake-wrap {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
          max-height: 210px;
          box-shadow: 
            0 8px 28px rgba(255, 107, 157, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 2px solid rgba(255, 107, 157, 0.1);
        }
        .bd-cake-wrap:hover { 
          transform: scale(1.02) translateY(-2px);
          box-shadow: 
            0 12px 36px rgba(255, 107, 157, 0.2),
            0 6px 16px rgba(0, 0, 0, 0.08);
        }

        .bd-cake-wrap img {
          display: block;
          width: 100%;
          height: 210px;
          object-fit: cover;
          object-position: center;
        }

        @media (max-width: 479px) {
          .bd-cake-wrap { max-height: 160px; }
          .bd-cake-wrap img { height: 160px; }
        }

        /* —— Name badges —— */
        .bd-names {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 12px;
        }

        .bd-name-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: linear-gradient(135deg, ${brandColor}10, ${brandColor}05);
          border: 1px solid ${brandColor}20;
          transition: all 0.25s ease;
          cursor: default;
        }
        .bd-name-badge:hover {
          background: linear-gradient(135deg, ${brandColor}18, ${brandColor}10);
          border-color: ${brandColor}40;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${brandColor}15;
        }

        .bd-name-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${brandColor}, #ff8fab);
          box-shadow: 0 0 6px ${brandColor}50;
          animation: bd-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes bd-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.85); }
        }

        .bd-name-text {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .bd-name-more {
          padding: 5px 12px;
          background: ${brandColor}08;
          border-color: ${brandColor}18;
        }
        .bd-name-more .bd-name-text {
          color: ${brandColor};
          font-size: 12px;
        }

        /* —— Divider —— */
        .bd-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 0;
        }
        .bd-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${brandColor}20, transparent);
        }
        .bd-divider-star {
          color: #ffd93d;
          font-size: 14px;
          filter: drop-shadow(0 0 4px rgba(255, 217, 61, 0.4));
          animation: bd-star-spin 4s linear infinite;
        }
        @keyframes bd-star-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .bd-divider-count {
          font-size: 11px;
          color: #9ca3af;
          white-space: nowrap;
        }

        /* —— Wish cards —— */
        .bd-wishes {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${brandColor}20 transparent;
          padding-right: 2px;
        }
        .bd-wishes::-webkit-scrollbar { width: 3px; }
        .bd-wishes::-webkit-scrollbar-thumb { 
          background: ${brandColor}25; 
          border-radius: 3px; 
        }

        .bd-wish-card {
          position: relative;
          padding: 10px 14px;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #f3f0ef;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .bd-wish-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, ${brandColor}, #ffa07a);
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .bd-wish-card:hover {
          background: #fffaf8;
          border-color: ${brandColor}25;
          transform: translateX(3px);
          box-shadow: 0 4px 16px rgba(255, 107, 157, 0.08);
        }
        .bd-wish-card:hover::before { opacity: 1; }

        .bd-wish-content {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .bd-wish-heart {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, ${brandColor}15, #ffa07a12);
          color: ${brandColor};
          font-size: 12px;
          margin-top: 1px;
        }

        .bd-wish-text {
          font-size: 13px !important;
          line-height: 1.55 !important;
          color: #4b5563 !important;
          margin: 0 !important;
        }

        .bd-wish-more {
          background: linear-gradient(135deg, ${brandColor}06, #ffa07a06);
          border-color: ${brandColor}15;
          border-style: dashed;
        }
        .bd-wish-more .bd-wish-text {
          color: ${brandColor} !important;
          font-style: italic;
          font-size: 12px !important;
        }

        /* —— Compact mode for many people —— */
        .bd-wishes.many .bd-wish-card { padding: 8px 12px; }
        .bd-wishes.many .bd-wish-text { font-size: 12px !important; }
        .bd-wishes.many .bd-wish-heart { width: 24px; height: 24px; font-size: 10px; }

        /* —— CTA Button —— */
        .bd-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: 18px;
        }

        .bd-cta {
          position: relative;
          height: 42px !important;
          padding: 0 32px !important;
          border-radius: 100px !important;
          border: none !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          color: #fff !important;
          background: linear-gradient(135deg, ${brandColor}, #ff8fab, #ffa07a) !important;
          background-size: 200% 200% !important;
          animation: bd-gradient-shift 4s ease infinite;
          box-shadow: 
            0 6px 20px ${brandColor}30,
            0 2px 6px rgba(0, 0, 0, 0.08) !important;
          transition: all 0.3s ease !important;
          overflow: hidden;
        }
        .bd-cta:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 
            0 10px 30px ${brandColor}40,
            0 4px 8px rgba(0, 0, 0, 0.1) !important;
        }
        .bd-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-100%);
          animation: bd-cta-shine 3s ease-in-out infinite;
        }

        @keyframes bd-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes bd-cta-shine {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }

        /* ═══════ Decorations ═══════ */
        .bd-decors {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes bd-confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(var(--bd-fall, 400px)) rotate(720deg); opacity: 0; }
        }
        .bd-confetti {
          position: absolute;
          border-radius: 2px;
          animation: bd-confetti var(--bd-dur, 4s) ease-in infinite;
          animation-delay: var(--bd-delay, 0s);
          will-change: transform, opacity;
        }

        @keyframes bd-emoji-rise {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { opacity: 0.7; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-120px) scale(1.1); opacity: 0; }
        }
        .bd-emoji {
          position: absolute;
          animation: bd-emoji-rise var(--bd-dur, 5s) ease-out infinite;
          animation-delay: var(--bd-delay, 0s);
          will-change: transform, opacity;
        }

        @keyframes bd-sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .bd-sparkle {
          position: absolute;
          color: #ffd93d;
          font-size: 10px;
          animation: bd-sparkle var(--bd-dur, 2.5s) ease-in-out infinite;
          animation-delay: var(--bd-delay, 0s);
          will-change: transform, opacity;
        }

        /* —— Empty state —— */
        .bd-empty {
          padding: 16px 0;
          text-align: center;
        }

        /* —— Mobile tweaks —— */
        @media (max-width: 479px) {
          .bd-modal { width: 92vw !important; }
          .bd-ribbon { padding: 12px 16px; }
          .bd-ribbon-emoji { font-size: 24px; }
          .bd-ribbon-title { font-size: 17px !important; }
          .bd-body { padding: 12px 14px 16px; }
          .bd-name-badge { padding: 4px 10px; }
          .bd-name-text { font-size: 12px; }
          .bd-wish-text { font-size: 12px !important; }
          .bd-wishes { max-height: 160px; }
          .bd-cta { height: 38px !important; padding: 0 24px !important; font-size: 13px !important; }
        }
        `}
      </style>

      <Modal
        className="bd-modal"
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        closeIcon={false}
        styles={{ body: { padding: 0 } }}
      >
        {/* ═══ Decorations ═══ */}
        <div className="bd-decors">
          {/* Confetti */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`cf-${i}`}
              className="bd-confetti"
              style={
                {
                  left: `${2 + ((i * 5) % 96)}%`,
                  top: '-3%',
                  width: `${5 + Math.random() * 5}px`,
                  height: `${5 + Math.random() * 5}px`,
                  backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  borderRadius: i % 3 === 0 ? '50%' : '2px',
                  '--bd-dur': `${3 + Math.random() * 3}s`,
                  '--bd-delay': `${Math.random() * 4}s`,
                  '--bd-fall': `${300 + Math.random() * 300}px`
                } as React.CSSProperties
              }
            />
          ))}

          {/* Sparkles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`sp-${i}`}
              className="bd-sparkle"
              style={
                {
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 90}%`,
                  '--bd-dur': `${2 + Math.random() * 2}s`,
                  '--bd-delay': `${Math.random() * 3}s`
                } as React.CSSProperties
              }
            >
              ✦
            </div>
          ))}

          {/* Floating emojis */}
          {['🎂', '🎁', '🎈', '🎊', '💖', '🌟', '🎵', '🧁'].map((emoji, i) => (
            <div
              key={`em-${i}`}
              className="bd-emoji"
              style={
                {
                  left: `${5 + i * 12}%`,
                  bottom: '-5%',
                  fontSize: `${14 + Math.random() * 6}px`,
                  '--bd-dur': `${5 + Math.random() * 3}s`,
                  '--bd-delay': `${i * 0.7 + Math.random()}s`
                } as React.CSSProperties
              }
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* ═══ Ribbon Header ═══ */}
        <div className="bd-ribbon">
          <span className="bd-ribbon-emoji">🎂</span>
          <Title level={3} className="bd-ribbon-title">
            {title}
          </Title>
          <div className="bd-ribbon-company">{companyName}</div>
        </div>

        {/* ═══ Body ═══ */}
        <div className="bd-body">
          {/* Cake image */}
          <div className="bd-cake-wrap">
            <Image
              src={randomImage}
              alt="Birthday Cake"
              preview={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              placeholder
            />
          </div>

          {/* Name badges */}
          {employees.length > 0 && (
            <div className="bd-names">
              {employees.slice(0, 8).map((name, idx) => (
                <div key={idx} className="bd-name-badge">
                  <span className="bd-name-dot" />
                  <span className="bd-name-text">{name}</span>
                </div>
              ))}
              {employees.length > 8 && (
                <div className="bd-name-badge bd-name-more">
                  <span className="bd-name-text">
                    +{employees.length - 8} người nữa
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="bd-divider">
            <div className="bd-divider-line" />
            <span className="bd-divider-star">⭐</span>
            {employees.length > 1 && (
              <span className="bd-divider-count">{employees.length} người</span>
            )}
            <div className="bd-divider-line" />
          </div>

          {/* Wishes */}
          {employees.length > 0 ? (
            <div className={`bd-wishes ${isMany ? 'many' : ''}`}>
              {displayWishes.map((wish, i) => (
                <div key={i} className="bd-wish-card">
                  <div className="bd-wish-content">
                    <div className="bd-wish-heart">
                      <HeartFilled />
                    </div>
                    <Text className="bd-wish-text">{wish}</Text>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="bd-wish-card bd-wish-more">
                  <div className="bd-wish-content">
                    <div className="bd-wish-heart">
                      <HeartOutlined />
                    </div>
                    <Text className="bd-wish-text">
                      ...và {wishes.length - maxWishes} lời chúc nữa cho tất cả
                      mọi người! 🎉
                    </Text>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bd-empty">
              <Text style={{ fontSize: '13px', color: '#9ca3af' }}>
                Hôm nay chưa có sinh nhật nào 🎂
              </Text>
            </div>
          )}

          {/* CTA Button */}
          <div className="bd-cta-wrap">
            <Button
              type="primary"
              size="large"
              onClick={handleClose}
              className="bd-cta"
              icon={<HeartOutlined style={{ fontSize: '13px' }} />}
            >
              Gửi lời chúc 💝
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BirthdayModal;

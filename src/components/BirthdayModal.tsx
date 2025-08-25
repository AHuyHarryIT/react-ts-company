import { HeartOutlined, StarFilled, GiftTwoTone } from '@ant-design/icons';
import { Button, Image, Modal, Typography, Tag, Divider } from 'antd';
import React, { useEffect, useMemo } from 'react';

import cake1 from '@assets/images/birthdayCakes/birthdayCake1.jpg';
import cake2 from '@assets/images/birthdayCakes/birthdayCake2.png';
import {
  default as cake3,
  default as cake5
} from '@assets/images/birthdayCakes/birthdayCake3.jpg';

const { Title, Text } = Typography;

export interface BirthdayModalProps {
  /** Danh sách tên nhân viên có sinh nhật */
  employees?: string[];
  /** Tên công ty hiển thị tiêu đề */
  companyName?: string;
  /** Hiển thị modal */
  open?: boolean;
  /** Callback khi đóng modal */
  onClose?: () => void;
  /** Tự động đóng sau X mili-giây (mặc định 10s). Đặt 0 để không tự đóng. */
  autoCloseMs?: number;
  /** Ghi đè tiêu đề modal */
  title?: string;
  /** Màu thương hiệu chính (hex) */
  brandColor?: string;
}

const IMAGES = [cake1, cake2, cake3, cake5];

const BASE_WISHES = [
  'Chúc {name} một tuổi mới thật rực rỡ và nhiều niềm vui! 🎉',
  'Hy vọng tuổi mới mang đến cho {name} thật nhiều sức khỏe và may mắn!',
  '{name} luôn hạnh phúc, thành công và tràn đầy năng lượng tích cực!',
  'Mong {name} đạt được mọi mục tiêu và ước mơ trong năm tới!',
  '{name} sẽ có thật nhiều kỷ niệm đẹp cùng đồng nghiệp và người thân!',
  'Tuổi mới thật “bùng nổ” với nhiều dự án thành công nha {name}!',
  'Chúc {name} cười thật nhiều mỗi ngày và luôn được yêu thương!',
  'Mong mọi điều tốt lành luôn đồng hành cùng {name}!'
];

const BALLOON_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9'
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

  // Logic thông minh cho nhiều người
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
        /* —— Mobile-first responsive sizing —— */
        .birthday-modal { 
          width: min(85vw, 340px) !important; 
          max-height: 80vh !important;
          margin: 0 auto !important;
        }
        @media (min-width: 480px) { 
          .birthday-modal { width: min(75vw, 380px) !important; } 
        }
        @media (min-width: 768px) { 
          .birthday-modal { width: min(60vw, 420px) !important; max-height: 85vh !important; } 
        }
        @media (min-width: 1024px) { 
          .birthday-modal { width: min(45vw, 480px) !important; max-height: 90vh !important; } 
        }

        /* —— Prefers-reduced-motion —— */
        @media (prefers-reduced-motion: reduce) {
          .animate, .sparkle, .confetti, .balloon, .ribbon-shimmer, .shine { 
            animation: none !important; transition: none !important; 
          }
        }

        /* —— Dark mode —— */
        @media (prefers-color-scheme: dark) {
          .birthday-modal .ant-modal-content {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          }
          .ribbon {
            background: linear-gradient(135deg, ${brandColor}, #8b5cf6) !important;
          }
        }

        /* —— Modern glass effect —— */
        .birthday-modal .ant-modal-content {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(16px);
          padding: 0;
        }

        .birthday-modal .ant-modal-content::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: 20px;
          background: linear-gradient(
            45deg, 
            ${brandColor}40, 
            #ffd93d40, 
            #6bcf7f40, 
            #45b7d140
          );
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.6;
        }

        /* —— Compact header —— */
        .ribbon {
          position: relative;
          background: linear-gradient(135deg, ${brandColor}, #ff8fab);
          padding: 12px 16px;
          text-align: center;
        }

        .ribbon::after {
          content: '';
          position: absolute;
          inset: auto 0 -1px 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine { 
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }

        .ribbon-title {
          margin: 0;
          font-size: 16px !important;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .brand-sub {
          margin: 2px 0 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        /* —— Compact body —— */
        .body-wrap { 
          padding: 12px 14px 14px;
          max-height: calc(80vh - 80px);
          overflow-y: auto;
        }
        @media (min-width: 768px) { 
          .body-wrap { padding: 16px 18px 18px; } 
        }

        /* —— Cake image - căn giữa và hiển thị đầy đủ —— */
        .cake {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
          aspect-ratio: 16 / 9;
          max-height: 180px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 480px) {
          .cake { max-height: 200px; }
        }
        @media (min-width: 768px) {
          .cake { max-height: 220px; }
        }
        @media (min-width: 1024px) {
          .cake { max-height: 240px; }
        }
        .cake img { 
          display: block; 
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        .cake.animate:hover { transform: translateY(-2px) scale(1.02); }

        /* —— Compact name tags với responsive —— */
        .names { 
          display: flex; 
          gap: 6px; 
          flex-wrap: wrap; 
          justify-content: center;
          margin: 8px 0;
          max-height: 60px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${brandColor}40 transparent;
        }
        .names::-webkit-scrollbar { width: 2px; }
        .names::-webkit-scrollbar-thumb { 
          background: ${brandColor}40; 
          border-radius: 1px; 
        }
        .names .ant-tag {
          border-radius: 20px;
          border: none;
          padding: 4px 8px;
          font-size: 12px;
          background: rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        @media (prefers-color-scheme: dark) {
          .names .ant-tag { 
            background: rgba(255, 255, 255, 0.1); 
            color: #e2e8f0; 
          }
        }

        /* —— Wish list với giới hạn chiều cao thông minh —— */
        .wish-list { 
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${brandColor}40 transparent;
          padding-right: 4px;
        }
        .wish-list::-webkit-scrollbar { width: 3px; }
        .wish-list::-webkit-scrollbar-track { background: transparent; }
        .wish-list::-webkit-scrollbar-thumb { 
          background: ${brandColor}40; 
          border-radius: 2px; 
        }
        
        /* Khi có nhiều người, thu gọn wish items */
        .wish-list.many-people .wish-item {
          padding: 6px 8px;
        }
        .wish-list.many-people .wish-item .ant-typography {
          font-size: 12px !important;
        }

        .wish-item {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          padding: 8px 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .wish-item:hover { 
          transform: translateY(-1px); 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); 
          border-color: ${brandColor}60;
        }
        .wish-item .ant-typography {
          font-size: 13px !important;
          line-height: 1.4 !important;
          margin: 0 !important;
        }

        /* —— Rich Effects: Confetti, Hearts, Stars, Balloons —— */
        @keyframes confettiFall { 
          0% { transform: translateY(-30px) rotate(0deg) scale(1); opacity: 1; }
          50% { transform: translateY(50px) rotate(180deg) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(120px) rotate(360deg) scale(0.8); opacity: 0; }
        }
        
        @keyframes heartFloat {
          0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-80px) rotate(15deg) scale(1.2); opacity: 0; }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
        
        @keyframes balloonFloat {
          0% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0) rotate(-5deg); }
        }
        
        @keyframes firework {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(3) rotate(360deg); opacity: 0; }
        }

        .confetti {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confettiFall 3s ease-out infinite;
          will-change: transform, opacity;
        }
        
        .heart {
          position: absolute;
          font-size: 16px;
          color: #ff69b4;
          animation: heartFloat 4s ease-out infinite;
          will-change: transform, opacity;
        }
        
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffd700;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
          will-change: transform, opacity;
        }
        
        .balloon {
          position: absolute;
          font-size: 20px;
          animation: balloonFloat 3s ease-in-out infinite;
          will-change: transform;
        }
        
        .firework {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: firework 2s ease-out infinite;
          will-change: transform, opacity;
        }
        
        .decors { 
          position: absolute; 
          inset: 0; 
          overflow: hidden; 
          pointer-events: none;
          z-index: 1;
        }

        /* —— Compact button —— */
        .cta {
          background: linear-gradient(135deg, ${brandColor}, #ff8fab);
          border: none;
          color: white;
          font-weight: 600;
          font-size: 14px;
          height: 36px;
          padding: 0 20px;
          border-radius: 18px;
          box-shadow: 0 4px 12px ${brandColor}40;
          transition: all 0.2s ease;
        }
        .cta:hover { 
          filter: brightness(1.05); 
          transform: translateY(-1px);
          box-shadow: 0 6px 16px ${brandColor}50;
        }

        /* —— Mobile optimizations cho nhiều người —— */
        @media (max-width: 479px) {
          .birthday-modal {
            width: 90vw !important;
            max-height: 90vh !important;
          }
          .ribbon-title { font-size: 14px !important; }
          .brand-sub { font-size: 10px; }
          .body-wrap { 
            padding: 10px 12px 12px; 
            max-height: calc(90vh - 70px);
            overflow-y: auto;
          }
          .cake { max-height: 140px; }
          .names { max-height: 50px; }
          .wish-list { max-height: 150px; }
          .cta { height: 32px; font-size: 13px; padding: 0 16px; }
        }
        `}
      </style>

      <Modal
        className="birthday-modal"
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        closeIcon={false}
        styles={{ body: { padding: 0 } }}
      >
        {/* Ribbon header */}
        <div className="ribbon">
          <Title level={4} className="ribbon-title">
            <GiftTwoTone twoToneColor={brandColor} /> {title}
          </Title>
          <div className="brand-sub">{companyName}</div>
        </div>

        {/* Rich Birthday Effects */}
        <div className="decors">
          {/* Confetti */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="confetti"
              style={{
                left: `${5 + Math.random() * 90}%`,
                backgroundColor: BALLOON_COLORS[i % BALLOON_COLORS.length],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2.5 + Math.random() * 1.5}s`
              }}
            />
          ))}

          {/* Floating Hearts */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`heart-${i}`}
              className="heart"
              style={{
                left: `${15 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3.5 + Math.random() * 1}s`
              }}
            >
              ❤️
            </div>
          ))}

          {/* Sparkles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 1}s`
              }}
            />
          ))}

          {/* Floating Balloons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`balloon-${i}`}
              className="balloon"
              style={{
                left: `${10 + i * 20}%`,
                top: `${60 + Math.random() * 20}%`,
                animationDelay: `${i * 0.5}s`,
                color: BALLOON_COLORS[i % BALLOON_COLORS.length]
              }}
            >
              🎈
            </div>
          ))}

          {/* Fireworks */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`firework-${i}`}
              className="firework"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 30}%`,
                backgroundColor: BALLOON_COLORS[i % BALLOON_COLORS.length],
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${1.8 + Math.random() * 0.8}s`
              }}
            />
          ))}

          {/* Birthday Cake Icons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`cake-icon-${i}`}
              className="heart"
              style={{
                left: `${25 + i * 25}%`,
                animationDelay: `${1 + i * 0.8}s`,
                fontSize: '14px'
              }}
            >
              🎂
            </div>
          ))}

          {/* Gift Icons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`gift-${i}`}
              className="heart"
              style={{
                left: `${30 + i * 20}%`,
                animationDelay: `${2 + i * 0.6}s`,
                fontSize: '12px'
              }}
            >
              🎁
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="body-wrap">
          {/* ảnh bánh */}
          <div className="cake animate mb-4">
            <Image
              src={randomImage}
              alt="Birthday Cake"
              preview={false}
              className="w-full"
              placeholder
            />
          </div>

          {/* Tên nhân viên (chips với scroll khi nhiều) */}
          {employees.length > 0 && (
            <>
              <div className="names">
                {employees.map((name, idx) => (
                  <Tag key={idx}>
                    <Text strong style={{ fontSize: '12px' }}>
                      {name}
                    </Text>
                  </Tag>
                ))}
                {employees.length > 5 && (
                  <Tag
                    style={{ background: brandColor + '20', color: brandColor }}
                  >
                    <Text strong style={{ fontSize: '11px' }}>
                      +{employees.length - 5} người nữa
                    </Text>
                  </Tag>
                )}
              </div>
              <Divider style={{ margin: '8px 0 10px' }}>
                <StarFilled style={{ color: '#ffd93d', fontSize: '12px' }} />
                {employees.length > 1 && (
                  <Text
                    style={{
                      fontSize: '10px',
                      color: '#666',
                      marginLeft: '4px'
                    }}
                  >
                    ({employees.length} người)
                  </Text>
                )}
              </Divider>
            </>
          )}

          {/* Lời chúc (thông minh với nhiều người) */}
          {employees.length > 0 ? (
            <div className={`wish-list ${isMany ? 'many-people' : ''}`}>
              {displayWishes.map((wish, i) => (
                <div key={i} className="wish-item">
                  <div className="flex items-center gap-2">
                    <HeartOutlined
                      style={{ color: brandColor, fontSize: '12px' }}
                    />
                    <Text
                      style={{
                        fontSize: isMany ? '12px' : '13px',
                        lineHeight: '1.4'
                      }}
                    >
                      {wish}
                    </Text>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div
                  className="wish-item"
                  style={{
                    background: brandColor + '10',
                    borderColor: brandColor + '30'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <HeartOutlined
                      style={{ color: brandColor, fontSize: '12px' }}
                    />
                    <Text
                      style={{
                        fontSize: '12px',
                        fontStyle: 'italic',
                        color: brandColor
                      }}
                    >
                      ...và {wishes.length - maxWishes} lời chúc nữa cho tất cả
                      mọi người! 🎉
                    </Text>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 text-center">
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Hôm nay chưa có sinh nhật nào 🎂
              </Text>
            </div>
          )}

          {/* CTA */}
          <div className="mt-3 flex justify-center">
            <Button
              type="primary"
              size="middle"
              onClick={handleClose}
              className="cta"
              icon={<HeartOutlined style={{ fontSize: '12px' }} />}
            >
              Gửi lời chúc
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BirthdayModal;

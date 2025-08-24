import { HeartOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Image, Modal, Typography } from 'antd';
import React, { useEffect, useMemo } from 'react';

import cake1 from '@assets/images/birthdayCakes/birthdayCake1.jpg';
import cake2 from '@assets/images/birthdayCakes/birthdayCake2.png';
import {
  default as cake3,
  default as cake5
} from '@assets/images/birthdayCakes/birthdayCake3.jpg';

const { Title } = Typography;

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
}

const IMAGES = [cake1, cake2, cake3, cake5];

const BASE_WISHES = [
  'Chúc {name} có một tuổi mới tràn đầy sức khỏe và thành công!',
  'Hy vọng tuổi mới sẽ mang lại nhiều may mắn và niềm vui cho {name}!',
  'Chúc {name} luôn hạnh phúc, thành đạt và ngày càng xinh đẹp!',
  'Chúc {name} luôn vui vẻ, đạt được mọi điều mong muốn trong cuộc sống!',
  'Một tuổi mới đầy niềm vui và năng lượng mới đang chờ đón {name}!',
  'Chúc {name} thành công trong mọi dự định và ước mơ trong năm tới!',
  'Mong rằng {name} sẽ luôn nhận được sự hỗ trợ và đồng hành từ đồng nghiệp trong công việc!',
  'Chúc {name} có nhiều cơ hội để phát triển bản thân và thăng tiến trong sự nghiệp!',
  'Hy vọng mỗi ngày của {name} đều tràn đầy hạnh phúc và niềm vui trong công việc!',
  'Chúc bạn luôn giữ vững tinh thần làm việc và không ngừng phấn đấu {name}!',
  'Mong rằng năm mới sẽ mang đến cho {name} nhiều dự án thành công và đạt được mọi mục tiêu!',
  'Chúc {name} có một ngày sinh nhật thật đáng nhớ bên những người bạn yêu thương!',
  'Mong rằng công ty sẽ luôn là một nơi làm việc vui vẻ và ý nghĩa đối với {name}!',
  'Chúc {name} gặt hái nhiều thành công và niềm vui trong cả công việc lẫn cuộc sống!',
  'Hy vọng {name} sẽ luôn là nguồn cảm hứng cho mọi người xung quanh!',
  'Chúc {name} sẽ có nhiều kỷ niệm đẹp trong năm mới và những mối quan hệ tốt đẹp!'
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
  title = 'Chúc Mừng Sinh Nhật!'
}) => {
  // Random image chosen only once per mount
  const randomImage = useMemo(() => pickRandom(IMAGES), []);

  // Pre-generate one random wish per employee on mount so it doesn't reshuffle on re-render
  const wishes = useMemo(
    () => employees.map((e) => makeWish(e)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;

    const t = setTimeout(() => {
      setTimeout(() => onClose?.(), 300);
    }, autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  const handleClose = () => {
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <>
      <style>
        {`
        @keyframes birthdayGlow {
          0% {
            box-shadow:
              0 0 20px rgba(255, 105, 180, 0.4),
              0 0 40px rgba(255, 215, 0, 0.3),
              0 0 60px rgba(135, 206, 250, 0.2);
          }
          33% {
            box-shadow:
              0 0 25px rgba(255, 215, 0, 0.5),
              0 0 50px rgba(255, 105, 180, 0.4),
              0 0 75px rgba(135, 206, 250, 0.3);
          }
          66% {
            box-shadow:
              0 0 30px rgba(135, 206, 250, 0.6),
              0 0 60px rgba(255, 215, 0, 0.4),
              0 0 90px rgba(255, 105, 180, 0.3);
          }
          100% {
            box-shadow:
              0 0 20px rgba(255, 105, 180, 0.4),
              0 0 40px rgba(255, 215, 0, 0.3),
              0 0 60px rgba(135, 206, 250, 0.2);
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(100px) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes gentleSway {
          0%,
          100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes balloonFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes heartBeat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .birthday-modal .ant-modal-content {
          background: linear-gradient(
            135deg,
            #ffe5f1 0%,
            #ffe5cc 25%,
            #e5f3ff 50%,
            #f0e5ff 75%,
            #e5ffe5 100%
          );
          border-radius: 24px;
          overflow: hidden;
          animation: birthdayGlow 3s ease-in-out infinite;
          border: 3px solid transparent;
          background-clip: padding-box;
        }

        .birthday-modal .ant-modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 24px;
          padding: 3px;
          background: linear-gradient(
            45deg,
            #ff6b9d,
            #ffd93d,
            #6bcf7f,
            #4d79a4,
            #9b59b6
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: exclude;
          z-index: -1;
        }

        .birthday-content {
          animation: floatUp 0.8s ease-out;
        }

        .birthday-content.show {
          animation: floatUp 0.8s ease-out;
        }

        .birthday-title {
          background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gentleSway 2s ease-in-out infinite;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .company-name {
          background: linear-gradient(45deg, #4d79a4, #9b59b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ffd700;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall 3s linear infinite;
        }

        .balloon {
          position: absolute;
          width: 20px;
          height: 25px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          animation: balloonFloat 3s ease-in-out infinite;
        }

        .cake-image {
          transition: all 0.3s ease;
          filter: drop-shadow(0 8px 16px rgba(255, 215, 0, 0.3));
        }

        .cake-image:hover {
          transform: scale(1.05);
          filter: drop-shadow(0 12px 24px rgba(255, 215, 0, 0.5));
        }

        .wish-item {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.7)
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          margin: 8px 0;
          padding: 12px 16px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .wish-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 215, 0, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }

        .wish-item:hover::before {
          left: 100%;
        }

        .wish-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.5);
        }

        .close-button {
          background: linear-gradient(45deg, #ff6b9d, #ffd93d);
          border: none;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
          animation: heartBeat 2s ease-in-out infinite;
        }

        .close-button:hover {
          background: linear-gradient(45deg, #ff8fab, #ffe055);
          transform: scale(1.05);
        }

        .icon-heart {
          color: #ff6b9d;
          animation: heartBeat 1.5s ease-in-out infinite;
        }

        .icon-star {
          color: #ffd93d;
          animation: sparkle 2s ease-in-out infinite;
        }

        .icon-gift {
          color: #6bcf7f;
          animation: gentleSway 2s ease-in-out infinite;
        }
        `}
      </style>
      <Modal
        className="birthday-modal"
        open={open}
        onCancel={handleClose}
        footer={null}
        width={600}
        centered
        closeIcon={false}
        styles={{
          body: { padding: 0 }
        }}
      >
        <div>
          {/* Animated Background Elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Sparkles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}

            {/* Confetti */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: BALLOON_COLORS[i % BALLOON_COLORS.length],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}

            {/* Floating Balloons */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`balloon-${i}`}
                className="balloon"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  backgroundColor: BALLOON_COLORS[i % BALLOON_COLORS.length],
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center select-none">
            {/* Header with Icons */}
            <div className="mb-4 flex items-center justify-center gap-4">
              <Title level={3} className="birthday-title !mb-0">
                {title}
              </Title>
            </div>

            {/* Company Name */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <StarOutlined className="icon-star text-lg" />
              <p className="company-name !mb-0 text-xl font-bold">
                {companyName}
              </p>
              <StarOutlined className="icon-star text-lg" />
            </div>

            {/* Birthday Cake Image */}
            <div className="mb-6 flex justify-center">
              <Image
                src={randomImage}
                alt="Birthday Cake"
                preview={false}
                className="cake-image rounded-2xl"
                width={300}
              />
            </div>

            {/* Birthday Wishes */}
            {employees.length > 0 && (
              <div className="max-h-52 overflow-y-auto">
                {wishes.map((wish, index) => (
                  <div key={index} className="wish-item">
                    <div className="flex items-center gap-2">
                      <HeartOutlined className="flex-shrink-0 text-red-400" />
                      <span className="font-medium text-gray-800">{wish}</span>
                      <StarOutlined className="flex-shrink-0 text-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <div className="mt-8 flex justify-center">
              <Button
                type="primary"
                size="large"
                onClick={handleClose}
                className="close-button h-auto rounded-full px-8 py-2"
                icon={<HeartOutlined />}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BirthdayModal;

import { Alert, Tag } from 'antd';
import { useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa6';

interface MarqueeTextProps {
  messages: string[];
  speed?: number;
}

export default function MarqueeAlert({
  messages,
  speed = 100
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // total distance = content width + container width
    const distance = content.scrollWidth + container.clientWidth;
    const duration = distance / speed; // seconds

    content.style.setProperty('--duration', `${duration}s`);
  }, [messages, speed]);

  return (
    <>
      <Alert
        type="info"
        showIcon
        icon={<FaBell size={20} />}
        message={
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded"
          >
            <div
              ref={contentRef}
              className="inline-block whitespace-nowrap will-change-transform"
              style={{
                animation: 'marquee-rtl var(--duration, 12s) linear infinite'
              }}
            >
              {messages.map((msg, index) => (
                <Tag key={`marquee-${index}`}>
                  <div className="p-1 text-[1rem] font-semibold uppercase">
                    {msg}
                  </div>
                </Tag>
              ))}
            </div>
            {/* Keyframes */}
            <style>
              {`
          @keyframes marquee-rtl {
            from { transform: translateX(100%); }
            to { transform: translateX(-100%); }
          }
        `}
            </style>
          </div>
        }
      />
    </>
  );
}

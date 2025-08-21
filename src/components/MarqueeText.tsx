import { Alert, Tag } from 'antd';
import { FaBell } from 'react-icons/fa6';

interface MarqueeTextProps {
  message: string;
}

export default function MarqueeText({ message }: MarqueeTextProps) {
  return (
    <>
      <Alert
        type="info"
        showIcon
        icon={<FaBell size={20} />}
        message={
          <div className="relative flex h-10 w-full items-center overflow-hidden whitespace-nowrap">
            <h3
              className="absolute m-0 h-full w-full animate-[marquee-rtl_15s_linear_infinite] text-center leading-10"
              style={{
                transform: 'translateX(100%)'
              }}
            >
              <Tag>
                <div className="p-1 text-[1rem] font-semibold uppercase">
                  {message}
                </div>
              </Tag>
            </h3>
            <style>{`
        @keyframes marquee-rtl {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
          </div>
        }
      />
    </>
  );
}

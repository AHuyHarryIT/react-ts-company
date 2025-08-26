import { Alert, Tag } from 'antd';
import Marquee from 'react-fast-marquee';
import { FaBell } from 'react-icons/fa6';
interface MarqueeTextProps {
  messages: string[];
  speed?: number;
}

export default function MarqueeAlert({
  messages,
  speed = 100
}: MarqueeTextProps) {
  return (
    <>
      <Alert
        type="info"
        showIcon
        icon={<FaBell size={20} />}
        message={
          <Marquee speed={speed}>
            {messages.map((msg, index) => (
              <Tag key={`marquee-${index}`}>
                <div className="p-1 text-[1rem] font-semibold uppercase">
                  {msg}
                </div>
              </Tag>
            ))}
          </Marquee>
        }
      />
    </>
  );
}

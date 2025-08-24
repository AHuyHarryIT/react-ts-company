import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { IconDelete } from '@components/icons';
import { Button, Card, Checkbox, Modal, Tag, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { FaBowlFood, FaRestroom } from 'react-icons/fa6';

const { Title, Text } = Typography;

type DutyType = 'eat-room' | 'trash' | 'female-wc' | 'male-wc';

export interface CleaningDuty {
  id: string;
  type: DutyType;
  date: Dayjs;
}

interface CleaningDutyModalProps {
  open: boolean;
  onClose: () => void;
  duties: CleaningDuty[];
  onDontShowAgain?: (checked: boolean) => void;
}

const CleaningDutyModal: React.FC<CleaningDutyModalProps> = ({
  open,
  onClose,
  duties,
  onDontShowAgain
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const getTypeIcon = (type: DutyType) => {
    switch (type) {
      case 'eat-room':
        return <FaBowlFood className="text-lg text-blue-500" />;
      case 'trash':
        return <IconDelete className="text-lg text-green-500" />;
      case 'female-wc':
        return <FaRestroom className="text-lg text-purple-500" />;
      case 'male-wc':
        return <FaRestroom className="text-lg text-cyan-500" />;
      default:
        return <CalendarOutlined className="text-lg text-gray-500" />;
    }
  };

  const getTypeTag = (type: DutyType) => {
    switch (type) {
      case 'eat-room':
        return (
          <Tag
            color="blue"
            className="rounded-full px-2 py-0.5 text-xs font-medium"
          >
            Phòng ăn
          </Tag>
        );
      case 'trash':
        return (
          <Tag
            color="green"
            className="rounded-full px-2 py-0.5 text-xs font-medium"
          >
            Khu vực đổ rác
          </Tag>
        );
      case 'female-wc':
        return (
          <Tag
            color="purple"
            className="rounded-full px-2 py-0.5 text-xs font-medium"
          >
            Nhà vệ sinh nữ
          </Tag>
        );
      case 'male-wc':
        return (
          <Tag
            color="cyan"
            className="rounded-full px-2 py-0.5 text-xs font-medium"
          >
            Nhà vệ sinh nam
          </Tag>
        );
      default:
        return 'default';
    }
  };

  const getDutyMessage = (duty: CleaningDuty) => {
    const dateStr = dayjs(duty.date).format('dd, DD/MM/YYYY');

    switch (duty.type) {
      case 'eat-room':
        return `${dateStr} là ngày trực vệ sinh của bạn tại phòng ăn. Vui lòng hoàn thành nhiệm vụ vệ sinh đúng thời gian quy định.`;
      case 'trash':
        return `${dateStr} là ngày trực vệ sinh của bạn tại khu vực đổ rác. Vui lòng hoàn thành nhiệm vụ vệ sinh đúng thời gian quy định.`;
      case 'female-wc':
        return `${dateStr} là ngày trực vệ sinh của bạn tại nhà vệ sinh nữ. Vui lòng hoàn thành nhiệm vụ vệ sinh đúng thời gian quy định.`;
      case 'male-wc':
        return `${dateStr} là ngày trực vệ sinh của bạn tại nhà vệ sinh nam. Vui lòng hoàn thành nhiệm vụ vệ sinh đúng thời gian quy định.`;
      default:
        return `${dateStr} là ngày trực vệ sinh của bạn. Vui lòng hoàn thành nhiệm vụ vệ sinh đúng thời gian quy định.`;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-center gap-3">
          <CalendarOutlined className="text-lg text-white" />
          <div>
            <Title level={5} className="!mb-0 font-semibold !text-white">
              Thông báo lịch trực
            </Title>
          </div>
        </div>
      }
      closeIcon={null}
      open={open}
      onCancel={onClose}
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="text-gray-600"
            >
              <span className="text-sm">
                <CheckCircleOutlined className="mr-1" />
                Không hiển thị lại thông báo này hết ngày hôm nay
              </span>
            </Checkbox>
          </div>
          <div className="flex justify-center">
            <Button
              type="primary"
              onClick={() => {
                if (onDontShowAgain) {
                  onDontShowAgain(dontShowAgain);
                }
                onClose();
              }}
              size="middle"
              className="h-10 transform rounded-lg px-6 py-1 font-medium shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none'
              }}
            >
              <CheckCircleOutlined className="mr-1" />
              <span className="text-base">Đã hiểu</span>
            </Button>
          </div>
        </div>
      }
      width={500}
      centered
      styles={{
        header: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          padding: '1rem'
        },
        body: {
          padding: '1rem',
          maxHeight: '60vh',
          overflowY: 'auto',
          background: 'linear-gradient(to bottom, #fafbff 0%, #f8fafc 100%)'
        },
        footer: {
          padding: '1rem',
          borderTop: 'none',
          background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)'
        },
        content: {
          padding: 0
        }
      }}
    >
      <div className="space-y">
        {duties.map((item) => (
          <Card key={item.id} styles={{ body: { padding: 0 } }}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      {getTypeTag(item.type)}
                    </div>
                    {dayjs().isSame(item.date, 'day') && (
                      <Tag
                        color="red"
                        className="animate-pulse rounded-full border-red-300 bg-red-100 px-2 py-0.5 text-xs font-bold"
                      >
                        <ClockCircleOutlined className="mr-1" />
                        HÔM NAY
                      </Tag>
                    )}
                  </div>

                  <div className="rounded-md bg-gray-50 p-3">
                    <Text className="text-sm leading-relaxed font-medium text-gray-700">
                      {getDutyMessage(item)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
};

export default CleaningDutyModal;

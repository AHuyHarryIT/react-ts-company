import { Modal, Space, Typography, Button } from 'antd';
import { BellOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface AdminNotificationRequestModalProps {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
  loading?: boolean;
}

export const NotificationRequestModal: React.FC<
  AdminNotificationRequestModalProps
> = ({ open, onAllow, onDeny, loading = false }) => {
  return (
    <Modal
      open={open}
      onCancel={onDeny}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="later" onClick={onDeny}>
          Để sau
        </Button>,
        <Button
          key="allow"
          type="primary"
          icon={<BellOutlined />}
          loading={loading}
          onClick={onAllow}
        >
          Cho phép thông báo
        </Button>
      ]}
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          Bật thông báo hệ thống
        </Space>
      }
      width={480}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <BellOutlined
            style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }}
          />
          <Title level={4} style={{ margin: '0 0 8px 0' }}>
            Nhận thông báo quan trọng
          </Title>
        </div>

        <div
          style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '16px'
          }}
        >
          <Text type="secondary" style={{ fontSize: '13px' }}>
            💡 <strong>Lưu ý:</strong> Bạn có thể tắt thông báo bất kỳ lúc nào
            trong cài đặt trình duyệt
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

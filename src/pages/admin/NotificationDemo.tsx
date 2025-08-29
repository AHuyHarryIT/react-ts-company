import { useState } from 'react';
import { Card, Space, Typography, Button, Alert, Row, Col } from 'antd';
import { BellOutlined, ExperimentOutlined } from '@ant-design/icons';
import ComponentCard from '@components/common/ComponentCard';
import { NotificationRequestModal } from '@components/common/NotificationRequestModal';
import { NotificationStatusIndicator } from '@components/common/NotificationStatusIndicator';
import { useNotificationPermission } from '@hooks/useNotificationPermission';
import { sendNotification } from '@utils/notificationUtil';

const { Title, Paragraph, Text } = Typography;

export default function NotificationDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const { permission, requestPermission, isLoading } =
    useNotificationPermission();

  const handleTestNotification = () => {
    if (permission === 'granted') {
      sendNotification('Thông báo thử nghiệm', {
        body: 'Đây là thông báo thử nghiệm từ admin!',
        data: { type: 'test' }
      });
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    console.log('Permission result:', result);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            <BellOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Demo Hệ Thống Thông Báo Admin
          </Title>
          <Paragraph>
            Trang này demo hệ thống yêu cầu quyền thông báo tự động cho admin
            khi đăng nhập.
          </Paragraph>
        </div>

        {/* Current Status */}
        <ComponentCard title="Trạng Thái Hiện Tại">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Space direction="vertical">
                  <Text strong>Quyền thông báo:</Text>
                  <Text code style={{ fontSize: '16px' }}>
                    {permission}
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Space direction="vertical">
                  <Text strong>Indicator trong Header:</Text>
                  <NotificationStatusIndicator showText />
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Space direction="vertical">
                  <Text strong>Hành động:</Text>
                  <Space>
                    <Button
                      size="small"
                      disabled={permission !== 'granted'}
                      icon={<ExperimentOutlined />}
                      onClick={handleTestNotification}
                    >
                      Test thông báo
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>
        </ComponentCard>

        {/* Manual Test */}
        <ComponentCard title="Test Thủ Công">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="Lưu ý"
              description="Modal yêu cầu quyền thường hiển thị tự động khi admin đăng nhập lần đầu. Bạn có thể test thủ công bằng nút bên dưới."
              type="info"
              showIcon
            />

            <Space wrap>
              <Button
                type="primary"
                icon={<BellOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Mở Modal Yêu Cầu Quyền
              </Button>

              <Button
                icon={<BellOutlined />}
                loading={isLoading}
                onClick={handleRequestPermission}
                disabled={permission === 'granted'}
              >
                Yêu Cầu Quyền Trực Tiếp
              </Button>
            </Space>
          </Space>
        </ComponentCard>

        {/* How it Works */}
        <ComponentCard title="Cách Hoạt Động">
          <Space direction="vertical" size="middle">
            <div>
              <Title level={4}>1. Khi Admin Đăng Nhập</Title>
              <ul>
                <li>
                  Hệ thống kiểm tra vai trò của user (chỉ admin mới được yêu
                  cầu)
                </li>
                <li>Kiểm tra trạng thái quyền thông báo hiện tại</li>
                <li>
                  Nếu chưa có quyền và chưa từng hỏi, hiển thị modal sau 2 giây
                </li>
                <li>
                  Lưu trạng thái để không hỏi lại trong 24h nếu bị từ chối
                </li>
              </ul>
            </div>

            <div>
              <Title level={4}>2. UI Components</Title>
              <ul>
                <li>
                  <strong>Modal:</strong> Hiển thị khi admin đăng nhập lần đầu
                </li>
                <li>
                  <strong>Indicator:</strong> Hiển thị trong header để admin
                  theo dõi trạng thái
                </li>
                <li>
                  <strong>Dropdown:</strong> Thông báo hiển thị như trước
                </li>
              </ul>
            </div>

            <div>
              <Title level={4}>3. Local Storage</Title>
              <ul>
                <li>
                  <code>admin_notification_requested</code>: Đánh dấu đã yêu cầu
                </li>
                <li>
                  <code>admin_notification_request_time</code>: Thời gian yêu
                  cầu cuối
                </li>
              </ul>
            </div>
          </Space>
        </ComponentCard>

        {/* Test Modal */}
        <NotificationRequestModal
          open={modalOpen}
          onAllow={async () => {
            const result = await requestPermission();
            console.log('Modal permission result:', result);
            setModalOpen(false);
          }}
          onDeny={() => setModalOpen(false)}
          loading={isLoading}
        />
      </Space>
    </div>
  );
}

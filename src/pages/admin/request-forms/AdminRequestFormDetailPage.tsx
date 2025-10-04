import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Spin, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RequestFormDetailView } from '@components/RequestForm';
import { AdminActionModal } from '@components/RequestForm/AdminActionModal';
import { adminRequestFormService } from '@services/RequestFormService';
import { useState } from 'react';

export default function AdminRequestFormDetailPage() {
  const { id } = useParams({ from: '/_authenticated/admin/request-forms/$id' });
  const navigate = useNavigate();
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-request-form-detail', id],
    queryFn: () => adminRequestFormService.getDetail(Number(id)),
    enabled: !!id
  });

  const handleBack = () => {
    navigate({ to: '/admin/request-forms' });
  };

  const handleApproval = () => {
    setApprovalModalVisible(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
        <Alert
          message="Lỗi"
          description="Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const requestForm = data?.data;

  if (!requestForm) {
    return (
      <div className="space-y-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
        <Alert
          message="Không tìm thấy"
          description="Không tìm thấy đơn yêu cầu này."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const canApprove = requestForm.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại danh sách
        </Button>
        {canApprove && (
          <Button type="primary" onClick={handleApproval}>
            Duyệt đơn
          </Button>
        )}
      </div>

      {/* Detail Content */}
      <Card>
        <RequestFormDetailView data={requestForm} />
      </Card>

      {/* Approval Modal */}
      <AdminActionModal
        visible={approvalModalVisible}
        record={requestForm}
        mode="approve"
        onCancel={() => setApprovalModalVisible(false)}
        onApprove={() => {
          setApprovalModalVisible(false);
          // Refresh data after approval
        }}
        onReject={() => {
          setApprovalModalVisible(false);
          // Refresh data after rejection
        }}
      />
    </div>
  );
}

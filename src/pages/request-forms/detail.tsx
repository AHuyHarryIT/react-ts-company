import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Spin, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { DetailView, AdminActionModal } from '@components/RequestForm';
import { adminRequestFormService } from '@services/RequestFormService';
import { useAuth } from '@hooks/useAuth';
import { useState } from 'react';

export default function RequestFormDetail() {
  const { id } = useParams({ from: '/_authenticated/request-forms/$id' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-request-form-detail', id],
    queryFn: () => adminRequestFormService.getDetail(Number(id)),
    enabled: !!id,
    // Performance optimizations
    staleTime: 30000, // Data fresh trong 30s
    gcTime: 10 * 60 * 1000, // Cache trong 10 phút
    refetchOnWindowFocus: true, // Refresh khi quay lại tab
    // Select chỉ data cần thiết
    select: (response) => response.data
  });

  const handleBack = () => {
    navigate({ to: '/request-forms' });
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

  const requestForm = data;

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
        <DetailView data={requestForm} />
      </Card>

      {/* Approval Modal */}
      <AdminActionModal
        visible={approvalModalVisible}
        record={requestForm}
        mode="approve"
        currentUser={user}
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

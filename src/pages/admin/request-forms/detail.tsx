import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { DetailView, AdminActionModal } from '@components/RequestForm';
import { adminRequestFormService } from '@services/RequestFormService';
import { useAuth } from '@hooks/useAuth';
import { useState } from 'react';
import AppButton from '@components/common/AppButton';
import ComponentCard from '@components/common/ComponentCard';

export default function RequestFormDetail() {
  const { id } = useParams({ from: '/_authenticated/admin/request-forms/$id' });
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
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <Alert
            message="Lỗi"
            description="Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."
            type="error"
            showIcon
          />
        </div>
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
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <Alert
            message="Không tìm thấy"
            description="Không tìm thấy đơn yêu cầu này."
            type="warning"
            showIcon
          />
        </div>
      </div>
    );
  }

  const canApprove = requestForm.status === 'pending';

  return (
    <ComponentCard title="Chi tiết đơn yêu cầu">
      <div className="space-y-5">
        {/* ── Action Bar ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          <AppButton tone="neutral" onClick={handleBack}>
            <ArrowLeftOutlined />
            Quay lại danh sách
          </AppButton>
          {canApprove && (
            <AppButton tone="primary" onClick={handleApproval}>
              Duyệt đơn
            </AppButton>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Tag
              color={
                requestForm.status === 'pending'
                  ? 'warning'
                  : requestForm.status === 'approved'
                    ? 'success'
                    : requestForm.status === 'rejected'
                      ? 'error'
                      : 'default'
              }
              className="!text-xs !font-bold !uppercase"
            >
              {requestForm.status === 'pending'
                ? 'Chờ duyệt'
                : requestForm.status === 'approved'
                  ? 'Đã duyệt'
                  : requestForm.status === 'rejected'
                    ? 'Đã từ chối'
                    : requestForm.status}
            </Tag>
          </div>
        </div>

        {/* ── Detail Content ───────────────────────────────────── */}
        <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
          <DetailView data={requestForm} />
        </div>
      </div>

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
    </ComponentCard>
  );
}

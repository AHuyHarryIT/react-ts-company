import { useState } from 'react';
import { Modal, Card, Row, Col, Statistic, message } from 'antd';
import {
  BarChartOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ComponentCard from '@components/common/ComponentCard';
import { RequestFormDataTable } from '@components/RequestForm/RequestFormDataTable';
import { RequestFormFilterPanel } from '@components/RequestForm/RequestFormFilterPanel';
import { RequestFormDetailView } from '@components/RequestForm';
import { AdminActionModal } from '@components/RequestForm/AdminActionModal';
import {
  adminRequestFormService,
  requestFormService
} from '@services/RequestFormService';
import {
  RequestForm,
  RequestFormFilters as RequestFormFiltersType
} from '@/types/requestFormType';

export default function AdminRequestFormPage() {
  const [filters, setFilters] = useState<RequestFormFiltersType>({
    per_page: 15,
    page: 1
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RequestForm | null>(
    null
  );
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>(
    'approve'
  );

  const queryClient = useQueryClient();

  // Approve/Reject mutation
  const approveRejectMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: number;
      data: {
        action: 'approve' | 'reject';
        reject_reason?: string;
        digital_signature_supervisor?: File;
        digital_signature_manager?: File;
      };
    }) => {
      if (data.action === 'reject') {
        // For reject, use simple API call
        return await requestFormService.admin.approveOrReject(id, {
          action: 'reject',
          rejection_reason: data.reject_reason
        });
      } else {
        // For approve, use signature API if has signatures
        if (
          data.digital_signature_supervisor ||
          data.digital_signature_manager
        ) {
          return await requestFormService.admin.approveOrRejectWithSignatures(
            id,
            {
              action: 'approve',
              digital_signature_supervisor: data.digital_signature_supervisor,
              digital_signature_manager: data.digital_signature_manager
            }
          );
        } else {
          return await requestFormService.admin.approveOrReject(id, {
            action: 'approve'
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      const action = variables.data.action === 'approve' ? 'duyệt' : 'từ chối';
      message.success(`${action} đơn yêu cầu thành công!`);
      queryClient.invalidateQueries({ queryKey: ['admin-request-forms'] });
      setApprovalModalVisible(false);
      setSelectedRecord(null);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      console.error('Approve/Reject error:', error);
      message.error(
        `Có lỗi xảy ra: ${error.response?.data?.message || error.message}`
      );
    }
  });

  // Fetch request forms
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-request-forms', filters],
    queryFn: () => adminRequestFormService.getList(filters)
  });

  // Get statistics
  const { data: statistics } = useQuery({
    queryKey: ['admin-request-forms-statistics'],
    queryFn: () => adminRequestFormService.getStatistics()
  });

  // Mutation để duyệt trực tiếp đơn Giấy Ủy Quyền
  const { mutate: approveDirectly, isPending: isApprovingDirectly } =
    useMutation({
      mutationFn: (id: number) =>
        adminRequestFormService.approveOrReject(id, {
          action: 'approve'
        }),
      onSuccess: () => {
        message.destroy(); // Ẩn loading message
        message.success('Đơn ủy quyền đã được duyệt thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-request-forms'] });
        queryClient.invalidateQueries({
          queryKey: ['admin-request-forms-statistics']
        });
      },
      onError: (error: { response?: { data?: { message?: string } } }) => {
        message.destroy(); // Ẩn loading message
        message.error(
          error?.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn'
        );
      }
    });

  const handleView = (record: RequestForm) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleApprove = (record: RequestForm) => {
    if (record.type === 'giay_uy_quyen') {
      // Duyệt trực tiếp đơn Giấy Ủy Quyền
      message.loading('Đang duyệt đơn ủy quyền...', 0);
      approveDirectly(record.id);
    } else {
      // Mở modal để ký chữ ký cho các đơn khác
      setSelectedRecord(record);
      setApprovalMode('approve');
      setApprovalModalVisible(true);
    }
  };

  const handleReject = (record: RequestForm) => {
    // Mở modal để từ chối với lý do
    setSelectedRecord(record);
    setApprovalMode('reject');
    setApprovalModalVisible(true);
  };

  const handleFiltersChange = (newFilters: RequestFormFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      per_page: 15,
      page: 1
    });
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      per_page: pageSize || prev.per_page
    }));
  };

  const requestForms = data?.data?.data || [];
  const pagination = data?.data
    ? {
        current: data.data.current_page,
        total: data.data.total,
        pageSize: data.data.per_page,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} của ${total} đơn`,
        onChange: handleTableChange
      }
    : undefined;

  const statsData = statistics?.data;

  if (error) {
    return (
      <ComponentCard title="Quản lý đơn yêu cầu">
        <div className="py-8 text-center text-red-500">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      </ComponentCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Quản lý đơn yêu cầu
        </h2>
      </div>
      {/* Statistics Cards */}
      {statsData && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số đơn"
                value={statsData.total}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ duyệt"
                value={statsData.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã duyệt"
                value={statsData.approved}
                prefix={<CheckOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã từ chối"
                value={statsData.rejected}
                prefix={<CloseOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}
      {/* Filters */}
      <RequestFormFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isAdmin={true}
      />
      {/* Table */}
      <ComponentCard title="Danh sách đơn yêu cầu">
        <RequestFormDataTable
          data={requestForms}
          loading={isLoading || isApprovingDirectly}
          pagination={pagination}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          isAdmin={true}
        />
      </ComponentCard>
      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn yêu cầu"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={null}
        width={960}
        styles={{
          body: {
            maxHeight: '85vh',
            overflowY: 'auto',
            scrollbarWidth: 'none' /* Firefox */,
            msOverflowStyle: 'none' /* IE and Edge */
          }
        }}
        className="[&_.ant-modal-body::-webkit-scrollbar]:hidden"
      >
        {selectedRecord && <RequestFormDetailView data={selectedRecord} />}
      </Modal>{' '}
      {/* Approval Modal */}
      <AdminActionModal
        visible={approvalModalVisible}
        record={selectedRecord}
        mode={approvalMode}
        loading={approveRejectMutation.isPending}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedRecord(null);
        }}
        onApprove={(data) => {
          if (selectedRecord) {
            approveRejectMutation.mutate({
              id: selectedRecord.id,
              data: {
                action: 'approve',
                digital_signature_supervisor: data.digital_signature_supervisor,
                digital_signature_manager: data.digital_signature_manager
              }
            });
          }
        }}
        onReject={(data) => {
          if (selectedRecord) {
            approveRejectMutation.mutate({
              id: selectedRecord.id,
              data: {
                action: 'reject',
                reject_reason: data.reject_reason
              }
            });
          }
        }}
      />
    </div>
  );
}

import { useState } from 'react';
import { Modal, message, Alert, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { DataTable } from '@components/RequestForm/DataTable';
import { FilterPanel } from '@components/RequestForm/FilterPanel';
import {
  RequestFormDetailView,
  DelegationSignModal
} from '@components/RequestForm';
import AdminActionModal from '@components/RequestForm/AdminModals';
import {
  adminRequestFormService,
  requestFormService
} from '@services/RequestFormService';
import {
  RequestForm,
  RequestFormFilters as RequestFormFiltersType
} from '@/types/requestFormType';
import { useAuth } from '@hooks/useAuth';
import { getUserApprovalType } from '@utils/authUtil';
import { SUPERVISOR_IDS } from '@/constants/supervisors';

export default function RequestFormList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Constants
  const DEFAULT_FILTERS: RequestFormFiltersType = {
    per_page: 15,
    page: 1
  };
  const QUERY_KEYS = {
    requestForms: 'admin-request-forms',
    statistics: 'admin-request-forms-statistics'
  } as const;

  // State
  const [filters, setFilters] =
    useState<RequestFormFiltersType>(DEFAULT_FILTERS);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RequestForm | null>(
    null
  );
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>(
    'approve'
  );
  const [delegationSignModalVisible, setDelegationSignModalVisible] =
    useState(false);

  // Xác định loại user để hiển thị signature phù hợp
  const userType = getUserApprovalType(user, [...SUPERVISOR_IDS]);

  // Helper functions
  const invalidateAdminRequestForms = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.requestForms] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.statistics] });
  };

  const closeModals = () => {
    setApprovalModalVisible(false);
    setDelegationSignModalVisible(false);
    setDetailModalVisible(false);
    setSelectedRecord(null);
  };

  // Approval mutation với optimistic updates
  const approveRejectMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: number;
      data: {
        action: 'approve' | 'reject';
        rejection_reason?: string;
        digital_signature_supervisor?: File;
        digital_signature_manager?: File;
      };
    }) => {
      const {
        action,
        digital_signature_supervisor,
        digital_signature_manager,
        rejection_reason
      } = data;

      if (action === 'reject') {
        return await requestFormService.admin.approveOrReject(id, {
          action,
          rejection_reason
        });
      }

      // For approve action
      const hasSignatures =
        digital_signature_supervisor || digital_signature_manager;
      return hasSignatures
        ? await requestFormService.admin.approveOrRejectWithSignatures(id, {
            action,
            digital_signature_supervisor,
            digital_signature_manager
          })
        : await requestFormService.admin.approveOrReject(id, { action });
    },
    // Optimistic update: Cập nhật UI ngay lập tức
    onMutate: async ({ id, data: actionData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.requestForms] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData([
        QUERY_KEYS.requestForms,
        filters
      ]);

      // Optimistically update cache
      queryClient.setQueryData(
        [QUERY_KEYS.requestForms, filters],
        (old: unknown) => {
          if (
            !old ||
            typeof old !== 'object' ||
            !('data' in old) ||
            !Array.isArray(old.data)
          )
            return old;
          return {
            ...old,
            data: old.data.map((form: RequestForm) =>
              form.id === id
                ? {
                    ...form,
                    status:
                      actionData.action === 'reject' ? 'rejected' : form.status
                  }
                : form
            )
          };
        }
      );

      return { previousData };
    },
    onSuccess: (_, { data }) => {
      if (data.action === 'reject') {
        message.success('Từ chối đơn yêu cầu thành công!');
      } else {
        const hasSupervisorSig = !!data.digital_signature_supervisor;
        const hasManagerSig = !!data.digital_signature_manager;

        const successMessages = {
          supervisor:
            'Đã ký chữ ký tổ trưởng thành công! Đơn đang chờ chữ ký quản lý.',
          admin:
            'Đã ký chữ ký quản lý thành công! Đơn đang chờ chữ ký tổ trưởng.',
          default: 'Ký chữ ký thành công!'
        };

        const messageKey =
          userType === 'supervisor' && hasSupervisorSig
            ? 'supervisor'
            : userType === 'admin' && hasManagerSig
              ? 'admin'
              : 'default';

        message.success(successMessages[messageKey]);
      }
      invalidateAdminRequestForms();
      closeModals();
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
      _,
      context
    ) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.requestForms, filters],
          context.previousData
        );
      }
      console.error('Approve/Reject error:', error);
      message.error(
        `Có lỗi xảy ra: ${error.response?.data?.message || error.message}`
      );
    }
  });

  // Fetch request forms với realtime polling và caching
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.requestForms, filters],
    queryFn: () => adminRequestFormService.getList(filters),
    // Realtime optimizations
    staleTime: 0, // Data luôn stale → refetch ngay khi cần
    gcTime: 5 * 60 * 1000, // Cache trong 5 phút (thay cacheTime cũ)
    refetchInterval: 5000, // Poll mỗi 5s → gần như realtime
    refetchIntervalInBackground: false, // Chỉ poll khi tab active
    refetchOnWindowFocus: true, // Refresh khi quay lại tab
    // Giữ data cũ khi chuyển trang để UX mượt hơn
    placeholderData: (previousData) => previousData,
    // Chỉ select data cần thiết để giảm re-render
    select: (response) => {
      const allData = response.data?.data || [];

      // Nếu là supervisor, chỉ lấy đơn được assign cho mình
      const filteredData =
        userType === 'supervisor'
          ? allData.filter(
              (form: RequestForm) =>
                form.supervisor_id?.toString() === user?.id?.toString()
            )
          : allData;

      return {
        data: filteredData,
        total: filteredData.length,
        current_page: response.data?.current_page || 1,
        per_page: response.data?.per_page || 15,
        last_page: Math.ceil(
          filteredData.length / (response.data?.per_page || 15)
        )
      };
    }
  });

  // Mutation để duyệt trực tiếp đơn Giấy Ủy Quyền
  const { mutate: approveDirectly } = useMutation({
    mutationFn: (id: number) =>
      requestFormService.admin.approveOrReject(id, {
        action: 'approve'
      }),
    onSuccess: () => {
      message.destroy(); // Ẩn loading message
      message.success('Đơn ủy quyền đã được duyệt thành công!');
      invalidateAdminRequestForms();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.destroy(); // Ẩn loading message
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn'
      );
    }
  });

  // Delegation sign mutation với optimistic updates
  const { mutate: signDelegation, isPending: isSigning } = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number;
      data: {
        digital_signature_delegator?: File;
        digital_signature_authorized?: File;
      };
    }) => requestFormService.employee.signDelegation(id, data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.requestForms] });
      const previousData = queryClient.getQueryData([
        QUERY_KEYS.requestForms,
        filters
      ]);
      return { previousData };
    },
    onSuccess: () => {
      message.success('Đã ký đơn ủy quyền thành công');
      invalidateAdminRequestForms();
      closeModals();
    },
    onError: (
      error: { response?: { data?: { message?: string } } },
      _,
      context
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.requestForms, filters],
          context.previousData
        );
      }
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi ký đơn'
      );
    }
  });

  const requestForms = data?.data || [];

  // Filter đơn cho supervisor: Không hiển thị đơn Ủy Quyền
  const filteredRequestForms =
    userType === 'supervisor'
      ? requestForms.filter(
          (form: RequestForm) => form.type !== 'giay_uy_quyen'
        )
      : requestForms;

  // Tính toán lại total cho pagination khi có filter
  const getFilteredTotal = () => {
    if (userType !== 'supervisor' || !data) return data?.total || 0;
    const delegationCount = requestForms.filter(
      (form: RequestForm) => form.type === 'giay_uy_quyen'
    ).length;
    return data.total - delegationCount;
  };

  // Event handlers
  const handlers = {
    tableChange: (page: number, pageSize?: number) => {
      setFilters((prev) => ({
        ...prev,
        page,
        per_page: pageSize || prev.per_page
      }));
    },
    view: async (record: RequestForm) => {
      // Fetch full detail từ API để có content đầy đủ
      try {
        const response = await adminRequestFormService.getDetail(record.id);
        const fullData = response.data;
        setSelectedRecord(fullData);
        setDetailModalVisible(true);
      } catch (error) {
        console.error('Error fetching detail:', error);
        message.error('Không thể tải chi tiết đơn');
      }
    },
    approve: (record: RequestForm) => {
      if (record.type === 'giay_uy_quyen') {
        message.loading('Đang duyệt đơn ủy quyền...', 0);
        approveDirectly(record.id);
      } else {
        setSelectedRecord(record);
        setApprovalMode('approve');
        setApprovalModalVisible(true);
      }
    },
    reject: (record: RequestForm) => {
      setSelectedRecord(record);
      setApprovalMode('reject');
      setApprovalModalVisible(true);
    },
    signDelegation: (record: RequestForm) => {
      setSelectedRecord(record);
      setDelegationSignModalVisible(true);
    },
    filtersChange: (newFilters: RequestFormFiltersType) => {
      setFilters(newFilters);
    },
    clearFilters: () => {
      setFilters(DEFAULT_FILTERS);
    }
  };

  const pagination = data
    ? {
        current: data.current_page,
        total: getFilteredTotal(),
        pageSize: data.per_page,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} của ${total} đơn`,
        onChange: handlers.tableChange
      }
    : undefined;

  return (
    <>
      <ComponentCard title="Quản lý đơn yêu cầu">
        <div className="mb-4 flex items-center justify-between">
          <RefreshButton isLoading={isFetching} refresh={refetch} />
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFiltersChange={handlers.filtersChange}
          onClearFilters={handlers.clearFilters}
          isAdmin={true}
        />

        {/* Error Alert */}
        {error && (
          <Alert
            message="Đã có lỗi xảy ra vui lòng thử lại sau"
            type="error"
            className="mb-4"
          />
        )}

        {/* Table wrapped with Spin */}
        <Spin spinning={isLoading}>
          <DataTable
            data={filteredRequestForms}
            loading={isLoading}
            pagination={pagination}
            onView={handlers.view}
            onApprove={handlers.approve}
            onReject={handlers.reject}
            onSignDelegation={handlers.signDelegation}
            isAdmin={true}
            currentUserId={user?.id}
            userType={userType || undefined}
          />
        </Spin>
      </ComponentCard>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn yêu cầu"
        open={detailModalVisible}
        onCancel={closeModals}
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
      </Modal>

      {/* Approval Modal */}
      <AdminActionModal
        visible={approvalModalVisible}
        record={selectedRecord}
        mode={approvalMode}
        loading={approveRejectMutation.isPending}
        currentUser={user}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedRecord(null);
        }}
        onApprove={(data: {
          digital_signature_supervisor?: File;
          digital_signature_manager?: File;
        }) => {
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
        onReject={(data: { action: 'reject'; rejection_reason: string }) => {
          if (selectedRecord) {
            approveRejectMutation.mutate({
              id: selectedRecord.id,
              data: {
                action: 'reject',
                rejection_reason: data.rejection_reason
              }
            });
          }
        }}
      />

      {/* Delegation Sign Modal */}
      <DelegationSignModal
        visible={delegationSignModalVisible}
        record={selectedRecord}
        loading={isSigning}
        currentUserId={user?.id}
        onCancel={() => {
          setDelegationSignModalVisible(false);
          setSelectedRecord(null);
        }}
        onSign={(data) => {
          if (selectedRecord) {
            signDelegation({ id: selectedRecord.id, data });
          }
        }}
      />
    </>
  );
}

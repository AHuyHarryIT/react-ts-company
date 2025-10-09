import { useState, useEffect } from 'react';
import { Button, message, Modal, Alert, Spin, Tabs } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { usePrefetchAuthorizableEmployees } from '@/hooks/useAuthorizedEmployee';
import RefreshButton from '@components/common/RefreshButton';
import {
  DataTable,
  FilterPanel,
  ConfirmDeleteModal,
  DetailView,
  CreateEditModal,
  DelegationSignModal,
  RequestFormDetailView
} from '@components/RequestForm';
import AdminActionModal from '@components/RequestForm/AdminModals';
import {
  employeeRequestFormService,
  adminRequestFormService,
  requestFormService
} from '@services/RequestFormService';
import {
  RequestForm,
  RequestFormFilters as RequestFormFiltersType
} from '@/types/requestFormType';
import { SUPERVISOR_IDS } from '@/constants/supervisors';
import { getUserApprovalType } from '@utils/authUtil';

export default function RequestFormList() {
  const { user } = useAuth();
  const prefetchEmployees = usePrefetchAuthorizableEmployees();

  // Check if user is supervisor
  const isSupervisor =
    user?.id &&
    (SUPERVISOR_IDS as readonly string[]).includes(user.id.toString());
  const userType = getUserApprovalType(user, [...SUPERVISOR_IDS]);

  // Active tab state
  const [activeTab, setActiveTab] = useState('my-requests');

  const [filters, setFilters] = useState<RequestFormFiltersType>({
    per_page: 15,
    page: 1
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<RequestForm | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RequestForm | null>(
    null
  );
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [delegationSignModalVisible, setDelegationSignModalVisible] =
    useState(false);

  // Admin/Supervisor approval states
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>(
    'approve'
  );

  const queryClient = useQueryClient();

  // Prefetch employees list when component mounts for faster detail view loading
  useEffect(() => {
    prefetchEmployees();
  }, [prefetchEmployees]);

  // Helper function để invalidate queries
  const invalidateRequestForms = () => {
    queryClient.invalidateQueries({
      queryKey: ['employee-request-forms']
    });
    // Also invalidate admin queries if supervisor
    if (isSupervisor) {
      queryClient.invalidateQueries({
        queryKey: ['admin-request-forms']
      });
    }
  };

  const closeModals = () => {
    setApprovalModalVisible(false);
    setDelegationSignModalVisible(false);
    setDetailModalVisible(false);
    setSelectedRecord(null);
  };

  // Fetch request forms với filters và optimizations
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['employee-request-forms', filters],
    queryFn: () => employeeRequestFormService.getList(filters),
    // Realtime optimizations
    staleTime: 0, // Data luôn stale → refetch ngay khi cần
    gcTime: 5 * 60 * 1000, // Cache trong 5 phút
    refetchInterval: 5000, // Poll mỗi 5s → gần như realtime
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    // Giữ data cũ khi chuyển trang
    placeholderData: (previousData) => previousData,
    // Select optimization
    select: (response) => ({
      data: response.data?.data || [],
      total: response.data?.total || 0,
      current_page: response.data?.current_page || 1,
      per_page: response.data?.per_page || 15,
      last_page: response.data?.last_page || 1
    })
  });

  // Delete mutation với optimistic updates
  const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => {
      return employeeRequestFormService.delete(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employee-request-forms'] });
      const previousData = queryClient.getQueryData([
        'employee-request-forms',
        filters
      ]);

      // Optimistically remove from list
      queryClient.setQueryData(
        ['employee-request-forms', filters],
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
            data: old.data.filter((form: RequestForm) => form.id !== id),
            total: ('total' in old ? (old.total as number) : 0) - 1
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      message.success('Đã xóa đơn yêu cầu thành công');
      invalidateRequestForms();
      setDeleteModalVisible(false);
      setDeletingRecord(null);
    },
    onError: (
      error: { response?: { data?: { message?: string } } },
      _,
      context
    ) => {
      console.error('❌ Delete error:', error);
      if (context?.previousData) {
        queryClient.setQueryData(
          ['employee-request-forms', filters],
          context.previousData
        );
      }
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn'
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
    }) => employeeRequestFormService.signDelegation(id, data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['employee-request-forms'] });
      const previousData = queryClient.getQueryData([
        'employee-request-forms',
        filters
      ]);
      return { previousData };
    },
    onSuccess: () => {
      message.success('Đã ký đơn ủy quyền thành công');
      invalidateRequestForms();
      closeModals();
    },
    onError: (
      error: { response?: { data?: { message?: string } } },
      _,
      context
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['employee-request-forms', filters],
          context.previousData
        );
      }
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi ký đơn'
      );
    }
  });

  // ============================================
  // ADMIN/SUPERVISOR TAB QUERIES & MUTATIONS
  // ============================================

  // Fetch admin request forms for supervisor tab
  const {
    data: adminData,
    isLoading: adminIsLoading,
    isFetching: adminIsFetching,
    error: adminError,
    refetch: adminRefetch
  } = useQuery({
    queryKey: ['admin-request-forms', filters],
    queryFn: () => adminRequestFormService.getList(filters),
    enabled: !!(isSupervisor && activeTab === 'approval'), // Only fetch when supervisor and on approval tab
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchInterval: activeTab === 'approval' ? 5000 : false, // Only poll when on approval tab
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    select: (response) => {
      const allData = response.data?.data || [];
      // Filter for supervisor: only show requests assigned to them
      const filteredData = allData.filter(
        (form: RequestForm) =>
          form.supervisor_id?.toString() === user?.id?.toString() &&
          form.type !== 'giay_uy_quyen' // Exclude delegation requests
      );

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

  // Approval mutation for admin/supervisor
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
    onMutate: async ({ id, data: actionData }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-request-forms'] });
      const previousData = queryClient.getQueryData([
        'admin-request-forms',
        filters
      ]);

      queryClient.setQueryData(
        ['admin-request-forms', filters],
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
        message.success(
          hasSupervisorSig
            ? 'Đã ký chữ ký tổ trưởng thành công! Đơn đang chờ chữ ký quản lý.'
            : 'Ký chữ ký thành công!'
        );
      }
      invalidateRequestForms();
      closeModals();
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
      _,
      context
    ) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['admin-request-forms', filters],
          context.previousData
        );
      }
      console.error('Approve/Reject error:', error);
      message.error(
        `Có lỗi xảy ra: ${error.response?.data?.message || error.message}`
      );
    }
  });

  // Mutation để duyệt trực tiếp đơn Giấy Ủy Quyền (should not happen in supervisor view)
  const { mutate: approveDirectly } = useMutation({
    mutationFn: (id: number) =>
      requestFormService.admin.approveOrReject(id, { action: 'approve' }),
    onSuccess: () => {
      message.destroy();
      message.success('Đơn ủy quyền đã được duyệt thành công!');
      invalidateRequestForms();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.destroy();
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn'
      );
    }
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleView = async (record: RequestForm) => {
    // Fetch full detail từ API để có content đầy đủ
    try {
      const service =
        activeTab === 'approval'
          ? adminRequestFormService
          : employeeRequestFormService;
      const response = await service.getDetail(record.id);
      const fullData = response.data;
      setSelectedRecord(fullData);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      message.error('Không thể tải chi tiết đơn');
    }
  };

  const handleEdit = (record: RequestForm) => {
    setSelectedRecord(record);
    setEditModalVisible(true);
  };

  const handleDelete = (record: RequestForm) => {
    setDeletingRecord(record);
    setDeleteModalVisible(true);
  };

  const handleSignDelegation = (record: RequestForm) => {
    setSelectedRecord(record);
    setDelegationSignModalVisible(true);
  };

  const handleApprove = (record: RequestForm) => {
    if (record.type === 'giay_uy_quyen') {
      message.loading('Đang duyệt đơn ủy quyền...', 0);
      approveDirectly(record.id);
    } else {
      setSelectedRecord(record);
      setApprovalMode('approve');
      setApprovalModalVisible(true);
    }
  };

  const handleReject = (record: RequestForm) => {
    setSelectedRecord(record);
    setApprovalMode('reject');
    setApprovalModalVisible(true);
  };

  const confirmDelete = () => {
    if (deletingRecord) {
      deleteRequest(deletingRecord.id);
    }
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

  const requestForms = data?.data || [];
  const pagination = data
    ? {
        current: data.current_page,
        total: data.total,
        pageSize: data.per_page,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} của ${total} đơn`,
        onChange: handleTableChange
      }
    : undefined;

  // Admin data and pagination for supervisor approval tab
  const adminRequestForms = adminData?.data || [];
  const adminPagination = adminData
    ? {
        current: adminData.current_page,
        total: adminData.total,
        pageSize: adminData.per_page,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} của ${total} đơn`,
        onChange: handleTableChange
      }
    : undefined;

  // Define tabs
  const tabItems = [
    {
      key: 'my-requests',
      label: 'Đơn của tôi',
      children: (
        <>
          <div className="mb-4 flex flex-wrap gap-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo đơn mới
            </Button>
            <RefreshButton isLoading={isFetching} refresh={refetch} />
          </div>

          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            isAdmin={false}
          />

          {error && (
            <Alert
              message="Đã có lỗi xảy ra vui lòng thử lại sau"
              type="error"
              className="mb-4"
            />
          )}

          <Spin spinning={isLoading}>
            <DataTable
              data={requestForms}
              loading={isLoading}
              pagination={pagination}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSignDelegation={handleSignDelegation}
              isAdmin={false}
              hideSignDelegation={true}
            />
          </Spin>
        </>
      )
    },
    ...(isSupervisor
      ? [
          {
            key: 'approval',
            label: 'Duyệt đơn',
            children: (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <RefreshButton
                    isLoading={adminIsFetching}
                    refresh={adminRefetch}
                  />
                </div>

                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  isAdmin={true}
                />

                {adminError && (
                  <Alert
                    message="Đã có lỗi xảy ra vui lòng thử lại sau"
                    type="error"
                    className="mb-4"
                  />
                )}

                <Spin spinning={adminIsLoading}>
                  <DataTable
                    data={adminRequestForms}
                    loading={adminIsLoading}
                    pagination={adminPagination}
                    onView={handleView}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSignDelegation={handleSignDelegation}
                    isAdmin={true}
                    currentUserId={user?.id}
                    userType={userType || undefined}
                  />
                </Spin>
              </>
            )
          }
        ]
      : [])
  ];

  return (
    <>
      <div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        record={deletingRecord}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingRecord(null);
        }}
      />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn yêu cầu"
        open={detailModalVisible}
        onCancel={closeModals}
        footer={null}
        width="min(960px, 95vw)"
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
        {selectedRecord &&
          (activeTab === 'approval' ? (
            <RequestFormDetailView data={selectedRecord} />
          ) : (
            <DetailView data={selectedRecord} />
          ))}
      </Modal>

      {/* Approval Modal - Only for supervisor */}
      {isSupervisor && (
        <AdminActionModal
          visible={approvalModalVisible}
          record={selectedRecord}
          mode={approvalMode}
          loading={approveRejectMutation.isPending}
          currentUser={user}
          onCancel={closeModals}
          onApprove={(data: {
            digital_signature_supervisor?: File;
            digital_signature_manager?: File;
          }) => {
            if (selectedRecord) {
              approveRejectMutation.mutate({
                id: selectedRecord.id,
                data: {
                  action: 'approve',
                  digital_signature_supervisor:
                    data.digital_signature_supervisor,
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
      )}

      {/* Delegation Sign Modal */}
      <DelegationSignModal
        visible={delegationSignModalVisible}
        record={selectedRecord}
        loading={isSigning}
        currentUserId={user?.id}
        onCancel={closeModals}
        onSign={(data) => {
          if (selectedRecord) {
            signDelegation({ id: selectedRecord.id, data });
          }
        }}
      />

      {/* Create Modal */}
      <Modal
        title={null}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width="min(1000px, 95vw)"
        styles={{
          body: {
            height: 'auto',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            padding: '0',
            margin: '0',
            border: 'none',
            borderRadius: '0',
            scrollbarWidth: 'none' /* Firefox */,
            msOverflowStyle: 'none' /* IE and Edge */
          },
          content: {
            padding: '0',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        }}
        className="seamless-modal [&_.ant-modal-body::-webkit-scrollbar]:hidden"
      >
        <CreateEditModal
          onSuccess={() => {
            setCreateModalVisible(false);
            invalidateRequestForms();
          }}
          onCancel={() => {
            setCreateModalVisible(false);
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={null}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={null}
        width="min(1000px, 95vw)"
        styles={{
          body: {
            height: 'auto',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            padding: '0',
            margin: '0',
            border: 'none',
            borderRadius: '0',
            scrollbarWidth: 'none' /* Firefox */,
            msOverflowStyle: 'none' /* IE and Edge */
          },
          content: {
            padding: '0',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        }}
        className="seamless-modal [&_.ant-modal-body::-webkit-scrollbar]:hidden"
      >
        {selectedRecord && (
          <CreateEditModal
            editData={selectedRecord}
            onSuccess={() => {
              setEditModalVisible(false);
              setSelectedRecord(null);
              invalidateRequestForms();
            }}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedRecord(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

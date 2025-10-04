import { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import ComponentCard from '@components/common/ComponentCard';
import { RequestFormDataTable } from '@components/RequestForm/RequestFormDataTable';
import { RequestFormFilterPanel } from '@components/RequestForm/RequestFormFilterPanel';
import { DeleteConfirmModal } from '@components/RequestForm/DeleteConfirmModal';
import { RequestFormDetailView } from '@components/RequestForm';
import { RequestFormCreateModal } from '@components/RequestForm/RequestFormCreateModal';
import { employeeRequestFormService } from '@services/RequestFormService';
import {
  RequestForm,
  RequestFormFilters as RequestFormFiltersType
} from '@/types/requestFormType';

export default function EmployeeRequestFormPage() {
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

  const queryClient = useQueryClient();

  // Fetch request forms
  const { data, isLoading, error } = useQuery({
    queryKey: ['employee-request-forms', filters],
    queryFn: () => employeeRequestFormService.getList(filters)
  });

  // Delete mutation
  const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => employeeRequestFormService.delete(id),
    onSuccess: () => {
      message.success('Đã xóa đơn yêu cầu thành công');
      queryClient.invalidateQueries({ queryKey: ['employee-request-forms'] });
      setDeleteModalVisible(false);
      setDeletingRecord(null);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn'
      );
    }
  });

  const handleView = (record: RequestForm) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: RequestForm) => {
    setSelectedRecord(record);
    setEditModalVisible(true);
  };

  const handleDelete = (record: RequestForm) => {
    setDeletingRecord(record);
    setDeleteModalVisible(true);
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

  if (error) {
    return (
      <ComponentCard title="Đơn yêu cầu của tôi">
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
          Đơn yêu cầu của tôi
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Tạo đơn mới
        </Button>
      </div>

      {/* Filters */}
      <RequestFormFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isAdmin={false}
      />

      {/* Table */}
      <ComponentCard title="Danh sách đơn yêu cầu của tôi">
        <RequestFormDataTable
          data={requestForms}
          loading={isLoading}
          pagination={pagination}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={false}
        />
      </ComponentCard>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
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
      </Modal>

      {/* Create Modal */}
      <Modal
        title={null}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
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
        <RequestFormCreateModal
          onSuccess={() => {
            setCreateModalVisible(false);
            queryClient.invalidateQueries({
              queryKey: ['employee-request-forms']
            });
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
        width={800}
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
          <RequestFormCreateModal
            editData={selectedRecord}
            onSuccess={() => {
              setEditModalVisible(false);
              setSelectedRecord(null);
              queryClient.invalidateQueries({
                queryKey: ['employee-request-forms']
              });
            }}
          />
        )}
      </Modal>
    </div>
  );
}

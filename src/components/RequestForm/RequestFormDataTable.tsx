import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  RequestForm,
  RequestFormStatus,
  RequestFormType,
  REQUEST_FORM_TYPES,
  REQUEST_FORM_STATUSES
} from '@/types/requestFormType';

interface RequestFormTableProps {
  data?: RequestForm[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize?: number) => void;
  };
  onView?: (record: RequestForm) => void;
  onEdit?: (record: RequestForm) => void;
  onDelete?: (record: RequestForm) => void;
  onApprove?: (record: RequestForm) => void;
  onReject?: (record: RequestForm) => void;
  isAdmin?: boolean;
}

export const RequestFormDataTable: React.FC<RequestFormTableProps> = ({
  data = [],
  loading = false,
  pagination,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isAdmin = false
}) => {
  const getStatusColor = (status: RequestFormStatus): string => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const canEdit = (record: RequestForm): boolean => {
    return !isAdmin && record.status === 'pending';
  };

  const canDelete = (record: RequestForm): boolean => {
    return !isAdmin && record.status === 'pending';
  };

  const canApproveOrReject = (record: RequestForm): boolean => {
    return isAdmin && record.status === 'pending';
  };

  const columns: ColumnsType<RequestForm> = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_, __, index) => (
        <span className="text-gray-500">
          {((pagination?.current || 1) - 1) * (pagination?.pageSize || 15) +
            index +
            1}
        </span>
      )
    },
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: RequestFormType) => (
        <Tag color="blue" className="font-medium">
          {REQUEST_FORM_TYPES[type]}
        </Tag>
      )
    },
    ...(isAdmin
      ? [
          {
            title: 'Nhân viên',
            dataIndex: ['employee', 'name'],
            key: 'employee_name',
            width: 180,
            render: (name: string, record: RequestForm) => (
              <div>
                <div className="text-sm font-medium">{name}</div>
                <div className="text-xs text-gray-500">
                  {record.employee.id}
                </div>
              </div>
            )
          }
        ]
      : []),
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: RequestFormStatus) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {REQUEST_FORM_STATUSES[status]}
        </Tag>
      )
    },
    {
      title: 'Ngày nộp đơn',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <span className="text-gray-600">
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      )
    },
    {
      title: 'Người duyệt',
      key: 'approved_by',
      width: 130,
      render: (record: RequestForm) => {
        if (record.status === 'approved') {
          // Xử lý cả approved_by_employee và approved_by từ API response
          const approver =
            record.approved_by_employee ||
            (
              record as unknown as Record<
                string,
                {
                  name?: string;
                  full_name?: string;
                  id?: string;
                  employee_id?: string;
                }
              >
            ).approved_by;
          if (approver) {
            const approverName =
              (approver as { name?: string; full_name?: string })?.name ||
              (approver as { name?: string; full_name?: string })?.full_name;
            const approverId =
              (approver as { id?: string; employee_id?: string })?.id ||
              (approver as { id?: string; employee_id?: string })?.employee_id;
            return (
              <div>
                <div className="text-sm font-medium">{approverName}</div>
                <div className="text-xs text-gray-500">{approverId}</div>
              </div>
            );
          }
        } else if (record.status === 'rejected') {
          // Xử lý hiển thị người từ chối
          const rejectedBy =
            record.approved_by_employee ||
            (
              record as unknown as Record<
                string,
                {
                  name?: string;
                  full_name?: string;
                  id?: string;
                  employee_id?: string;
                }
              >
            ).approved_by;
          if (rejectedBy) {
            const rejectedByName =
              (rejectedBy as { name?: string; full_name?: string })?.name ||
              (rejectedBy as { name?: string; full_name?: string })?.full_name;
            const rejectedById =
              (rejectedBy as { id?: string; employee_id?: string })?.id ||
              (rejectedBy as { id?: string; employee_id?: string })
                ?.employee_id;
            return (
              <div>
                <div className="text-sm font-medium text-red-600">
                  {rejectedByName}
                </div>
                <div className="text-xs text-red-400">{rejectedById}</div>
              </div>
            );
          }
          return <span className="text-sm text-red-500">Đã từ chối</span>;
        }
        return <span className="text-sm text-gray-400">Chưa duyệt</span>;
      }
    },
    {
      title: 'Ngày duyệt đơn',
      dataIndex: 'approved_at',
      key: 'approved_at',
      width: 120,
      render: (date: string, record: RequestForm) => {
        if (record.status === 'approved' && date) {
          return (
            <span className="text-sm text-green-600">
              {dayjs(date).format('DD/MM/YYYY HH:mm')}
            </span>
          );
        } else if (record.status === 'rejected' && date) {
          return (
            <span className="text-sm text-red-500">
              {dayjs(date).format('DD/MM/YYYY HH:mm')}
            </span>
          );
        } else {
          return <span className="text-sm text-gray-400">-</span>;
        }
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: isAdmin ? 160 : 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
            />
          </Tooltip>

          {canEdit(record) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(record)}
              />
            </Tooltip>
          )}

          {canDelete(record) && (
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete?.(record)}
              />
            </Tooltip>
          )}

          {canApproveOrReject(record) && (
            <>
              <Tooltip title="Duyệt đơn">
                <Button
                  type="text"
                  size="small"
                  style={{ color: '#52c41a' }}
                  icon={<CheckOutlined />}
                  onClick={() => onApprove?.(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => onReject?.(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      scroll={{ x: 1000 }}
      size="middle"
    />
  );
};

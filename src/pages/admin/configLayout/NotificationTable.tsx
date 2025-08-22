import {
  NotificationType,
  NotificationUpdateType
} from '@/types/notificationType';
import { QueryParams } from '@/types/queryParams';
import { customTableProps } from '@components/custom/TableProps.custom';
import { IconDelete, IconEdit } from '@components/icons';
import {
  deleteNotification,
  fetchNotifications,
  updateNotification
} from '@services/NotificationService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Popconfirm,
  Table
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useState } from 'react';

type TableColumns = NotificationType & { key: string };

interface EditableCellProps {
  title: React.ReactNode;
  children: React.ReactNode;
  dataIndex: keyof TableColumns;
  record: TableColumns;
  editing: boolean;
}

export const NotificationTable = () => {
  const [form] = Form.useForm();
  const [params, setParams] = useState<QueryParams>({
    limit: 10,
    page: 1
  });
  const [editingKey, setEditingKey] = useState('');
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => fetchNotifications(params)
  });

  const dataSource: TableColumns[] = (notifications?.data || []).map(
    (item: NotificationType) => ({ ...item, key: String(item.id) })
  );

  const isEditing = (record: TableColumns) => record.key === editingKey;

  const edit = (record: TableColumns) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const queryClient = useQueryClient();

  const { mutate: save } = useMutation({
    mutationKey: ['updateNotification'],
    mutationFn: async ({
      id,
      updatedNotification
    }: {
      id: string;
      updatedNotification: NotificationUpdateType;
    }) => {
      await updateNotification(id, updatedNotification);
    },
    onMutate: () => {
      message.loading({ content: 'Đang cập nhật...', key: 'updating' });
    },
    onSuccess: () => {
      message.success({
        content: 'Cập nhật thông báo thành công!',
        key: 'updating'
      });
      queryClient.invalidateQueries();
      form.resetFields();
      setEditingKey('');
    },
    onError: () => {
      message.error({
        content: 'Cập nhật thông báo thất bại.',
        key: 'updating'
      });
    }
  });

  const { mutate: remove } = useMutation({
    mutationKey: ['deleteNotification'],
    mutationFn: async (id: string) => {
      await deleteNotification(id);
    },
    onMutate: () => {
      message.loading({ content: 'Đang xóa...', key: 'deleting' });
    },
    onSuccess: () => {
      message.success({
        content: 'Xóa thông báo thành công!',
        key: 'deleting'
      });
      queryClient.invalidateQueries();
    },
    onError: () => {
      message.error({
        content: 'Xóa thông báo thất bại.',
        key: 'deleting'
      });
    }
  });

  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing ? (
          dataIndex === 'is_show' ? (
            <Form.Item
              name={dataIndex}
              valuePropName="checked"
              style={{ margin: 0 }}
            >
              <Checkbox />
            </Form.Item>
          ) : (
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[{ required: true, message: `Vui lòng nhập ${title}!` }]}
              initialValue={record[dataIndex]}
            >
              <Input />
            </Form.Item>
          )
        ) : (
          children
        )}
      </td>
    );
  };

  const columns: ColumnsType<TableColumns> = [
    {
      title: 'STT',
      align: 'center' as const,
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Nội dung',
      key: 'message',
      dataIndex: 'message',
      render: (value: string) => value,
      onCell: (record: TableColumns) => ({
        record,
        dataIndex: 'message',
        title: 'Nội dung',
        editing: isEditing(record)
      })
    },
    {
      title: 'Hiển thị',
      key: 'is_show',
      dataIndex: 'is_show',
      render: (value: boolean) => {
        return value ? 'Có' : 'Không';
      },
      onCell: (record: TableColumns) => ({
        record,
        dataIndex: 'is_show',
        title: 'Hiển thị',
        editing: isEditing(record)
      })
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      dataIndex: 'id',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span className="flex justify-center gap-2">
            <Button
              variant="solid"
              color="green"
              onClick={() =>
                save({
                  id: record.id,
                  updatedNotification: form.getFieldsValue()
                })
              }
            >
              Lưu
            </Button>
            <Popconfirm title="Hủy thay đổi?" onConfirm={cancel}>
              <Button variant="solid">Hủy</Button>
            </Popconfirm>
          </span>
        ) : (
          <span className="flex justify-center gap-2">
            <Button
              variant="solid"
              color="blue"
              icon={<IconEdit />}
              onClick={() => edit(record)}
              disabled={editingKey !== ''}
            >
              Chỉnh sửa
            </Button>
            <Popconfirm
              title="Xóa thông báo?"
              onConfirm={() => remove(record.id)}
            >
              <Button
                variant="solid"
                color="red"
                icon={<IconDelete />}
                disabled={editingKey !== ''}
              >
                Xóa
              </Button>
            </Popconfirm>
          </span>
        );
      }
    }
  ];

  const tableProps: TableProps<TableColumns> = {
    ...(customTableProps as unknown as TableProps<TableColumns>),
    dataSource,
    rowKey: 'id',
    loading: isLoading,
    columns,
    components: {
      body: {
        cell: EditableCell
      }
    },
    pagination: {
      ...customTableProps.pagination,
      current: params.page,
      pageSize: params.limit,
      onChange: (page, pageSize) => {
        setParams((prev) => ({ ...prev, page, limit: pageSize }));
      }
    }
  };

  return (
    <Form form={form} component={false}>
      <Table {...tableProps} />
    </Form>
  );
};

import { createFileRoute } from '@tanstack/react-router';
import { Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import { roleService } from '@services/RoleService';
import { roleFields } from '@/configs/roleForm.config';
import { useCrudList } from '@/hooks/useCrudList';
import { roleCreateSchema } from '@/schema/roleSchema.schema';
import { RoleType } from '@/types/roleType';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { CreateModal } from '@components/ui/CRUD/CreateModal';
import { DeleteButton } from '@components/ui/CRUD/ConfirmButton';
import { UpdateModal } from '@components/ui/CRUD/UpdateModal';

export const Route = createFileRoute('/_authenticated/admin/roles/')({
  component: RouteComponent
});

function RouteComponent() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, pagination, queryResult } = useCrudList({
    service: roleService,
    queryKey: 'roles',
    initialFilters: {
      page,
      limit,
      sort: '-id'
    }
  });

  const { isLoading, isFetching, refetch } = queryResult;

  const roles = data || [];
  const total = pagination.total || 0;

  const columns: TableColumnsType<RoleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: 'Tên chức vụ',
      minWidth: 200,
      dataIndex: 'role_name'
    },
    {
      title: 'Mã chức vụ',
      minWidth: 100,
      dataIndex: 'id'
    },
    {
      title: 'Ngày tạo',
      minWidth: 200,
      dataIndex: 'created_at',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
    },
    {
      title: 'Ngày cập nhật',
      minWidth: 200,
      dataIndex: 'updated_at',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
    },
    {
      title: 'Hành động',
      minWidth: 100,
      align: 'center',
      render: (_, record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <UpdateModal
              id={record.id}
              service={roleService}
              schema={roleCreateSchema}
              fields={roleFields}
            />
            <DeleteButton id={record.id} service={roleService} />
          </div>
        );
      }
    }
  ];

  const tableProps: TableProps<RoleType> = {
    rowKey: (record) => ['role', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: roles,
    loading: isLoading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      pageSize: limit,
      total: total,
      showTotal: (total) => `Tổng ${total}`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      }
    }
  };

  const Actions = () => {
    return (
      <>
        <div className="flex flex-wrap gap-4">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <CreateModal
            schema={roleCreateSchema}
            service={roleService}
            fields={roleFields}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách chức vụ">
        <Actions />

        <Table<RoleType> {...tableProps} />
      </ComponentCard>
    </>
  );
}

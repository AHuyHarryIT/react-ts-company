import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddModal } from '@components/workScheduleCategories/AddModal';
import { DeleteModal } from '@components/workScheduleCategories/DeleteModal';
import { UpdateWorkScheduleCategory } from '@components/workScheduleCategories/UpdateModal';

import { WorkScheduleCategoryType } from '@/types/workScheduleCategoryType';
import { fetchWorkScheduleCategories } from '@services/WorkScheduleCategoryService';
import { customTableProps } from '@components/custom/TableProps.custom';

export const Route = createFileRoute(
  '/_authenticated/admin/work-schedule-categories/'
)({
  component: RouteComponent
});

function RouteComponent() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['workScheduleCategories', page, limit],
    queryFn: () => fetchWorkScheduleCategories({ page, limit })
  });

  const { workScheduleCategories, total } = data || {
    workScheduleCategories: [],
    total: 0
  };

  const workScheduleCategoryColumns: TableColumnsType<WorkScheduleCategoryType> =
    [
      {
        title: 'STT',
        rowScope: 'row',
        minWidth: 50,
        align: 'center',
        render: (_value, _record, index) => index + 1 + limit * (page - 1)
      },
      {
        title: 'Tên danh mục',
        minWidth: 200,
        dataIndex: 'name'
      },
      {
        title: 'Mã danh mục',
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
        render: (_value, _record) => {
          return (
            <div className="flex items-center justify-center gap-2">
              <UpdateWorkScheduleCategory
                categoryId={_record.id}
                categoryName={_record.name}
              />
              <DeleteModal id={_record.id} name={_record.name} />
            </div>
          );
        }
      }
    ];

  const tableProps: TableProps<WorkScheduleCategoryType> = {
    ...(customTableProps as unknown as TableProps<WorkScheduleCategoryType>),
    rowKey: (record) => ['workScheduleCategory', record.id].join('-'),
    columns: workScheduleCategoryColumns,
    dataSource: workScheduleCategories,
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: limit,
      total: total,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      },
      current: page
    }
  };

  const Actions = () => {
    return (
      <>
        <div className="flex flex-wrap gap-4">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <AddModal />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh mục lịch làm việc">
        <Actions />

        <Table<WorkScheduleCategoryType> {...tableProps} />
      </ComponentCard>
    </>
  );
}

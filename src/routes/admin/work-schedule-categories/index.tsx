import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { Button, Table, TableColumnsType, TableProps, Tooltip } from 'antd';
import { useState } from 'react';

import ComponentCard from '@components/common/ComponentCard';
import { AddModal } from '@components/workScheduleCategories/AddModal';
import { DeleteModal } from '@components/workScheduleCategories/DeleteModal';
import { UpdateWorkScheduleCategory } from '@components/workScheduleCategories/UpdateModal';

import { IoReload } from 'react-icons/io5';

import { WorkScheduleCategoryType } from '@/types/workScheduleCategoryType';
import { fetchWorkScheduleCategories } from '@services/WorkScheduleCategoryService';
import { uiStore } from '@stores/uiStore';

export const Route = createFileRoute('/admin/work-schedule-categories/')({
  component: RouteComponent
});

function RouteComponent() {
  const { isMobile } = useStore(uiStore);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
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
            <div className="flex gap-2">
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
    rowKey: (record) => ['workScheduleCategory', record.id].join('-'),
    bordered: true,
    columns: workScheduleCategoryColumns,
    dataSource: workScheduleCategories,
    loading: isLoading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      pageSize: limit,
      total: total,
      showTotal: (total) => `Tổng ${total} danh mục`,
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
          <Tooltip title="Làm mới">
            <Button
              color="primary"
              variant="solid"
              icon={<IoReload />}
              size="large"
              onClick={() => refetch()}
            >
              {!isMobile && <>Làm mới</>}
            </Button>
          </Tooltip>
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

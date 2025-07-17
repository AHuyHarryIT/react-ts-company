import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import { WorkScheduleType } from '@/types/workScheduleType';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddWorkSchedule } from '@components/workSchedules/AddModal';
import { DeleteModal } from '@components/workSchedules/DeleteModal';
import { fetchWorkSchedules } from '@services/workScheduleService';

import { GoInfo } from 'react-icons/go';

export const Route = createFileRoute('/_authenticated/admin/work-schedules/')({
  component: RouteComponent
});

function RouteComponent() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['workSchedules', page, limit],
    queryFn: () =>
      fetchWorkSchedules({
        page,
        limit,
        filters: {
          sort: 'date:desc'
        }
      }),
    refetchOnWindowFocus: true
  });

  const columns: TableColumnsType<WorkScheduleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: 'Mã',
      minWidth: 75,
      dataIndex: 'id'
    },
    {
      title: 'Tên lịch làm việc',
      minWidth: 200,
      dataIndex: 'title'
    },

    {
      title: 'Ngày bắt đầu',
      minWidth: 200,
      dataIndex: 'start_date',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
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
            <Link
              to={'/admin/work-schedules/$id'}
              params={{
                id: _record.id
              }}
            >
              <Button color="primary" variant="solid" icon={<GoInfo />}>
                Chi tiết
              </Button>
            </Link>
            <DeleteModal id={_record.id} name={_record.title} />
          </div>
        );
      }
    }
  ];

  const tableProps: TableProps<WorkScheduleType> = {
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: data?.workSchedules,
    loading: isLoading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      pageSize: limit,
      total: data?.total,
      showTotal: (total) => `Tổng ${total} lịch làm việc`,
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
          <AddWorkSchedule />
        </div>
      </>
    );
  };
  return (
    <>
      <ComponentCard title="Danh sách lịch làm việc">
        <Actions />

        <Table<WorkScheduleType> {...tableProps} />
      </ComponentCard>
    </>
  );
}

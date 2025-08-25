import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddWorkSchedule } from '@components/workSchedules/AddModal';
import { DeleteModal } from '@components/workSchedules/DeleteModal';
import { scheduleService } from '@services/workScheduleService';

import { QueryParams } from '@/types/queryParams';
import { ScheduleType } from '@/types/scheduleType';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { GoInfo } from 'react-icons/go';

export const Route = createFileRoute('/_authenticated/work-schedules/')({
  component: RouteComponent
});

function RouteComponent() {
  const [params, setParams] = useState<QueryParams>({ limit: 10, page: 1 });

  const {
    data,
    pagination,
    queryResult: { isLoading, isFetching, refetch }
  } = useCrudList({
    service: scheduleService,
    queryKey: 'workSchedules',
    initialFilters: params
  });

  const columns: TableColumnsType<ScheduleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    // {
    //   title: 'Mã',
    //   dataIndex: 'id'
    // },
    {
      title: 'Tên lịch làm việc',
      dataIndex: 'title'
    },

    {
      title: 'Ngày bắt đầu',
      dataIndex: 'date',
      align: 'center',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_value, _record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Link
              to={'/work-schedules/$id'}
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

  const tableProps: TableProps<ScheduleType> = {
    ...(customTableProps as unknown as TableProps<ScheduleType>),
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    columns: columns,
    dataSource: data,
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: pagination?.pageSize,
      total: pagination?.total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({ ...prev, limit: size }));
      },
      onChange: (page) => {
        setParams((prev) => ({ ...prev, page: page }));
      }
    }
  };

  return (
    <>
      <ComponentCard title="Danh sách lịch làm việc">
        <div className="flex flex-wrap gap-4">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <AddWorkSchedule />
        </div>
        <Table<ScheduleType> {...tableProps} />
      </ComponentCard>
    </>
  );
}

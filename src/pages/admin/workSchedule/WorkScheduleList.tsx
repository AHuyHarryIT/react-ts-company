import { Link } from '@tanstack/react-router';
import { Button, Table, TableColumnsType, TableProps, Tag } from 'antd';
import { useState } from 'react';
import { FaCalendarCheck } from 'react-icons/fa';
import { GoInfo } from 'react-icons/go';

import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddWorkSchedule } from '@components/workSchedules/AddModal';
import { DeleteModal } from '@components/workSchedules/DeleteModal';
import { scheduleService } from '@services/workScheduleService';

import { QueryParams } from '@/types/queryParams';
import { ScheduleType } from '@/types/scheduleType';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';

export default function WorkScheduleList() {
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
      width: 60,
      align: 'center',
      render: (_value, _record, index) => (
        <span className="font-mono text-xs text-gray-500">
          {index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)}
        </span>
      )
    },
    {
      title: 'Tên lịch làm việc',
      dataIndex: 'title',
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || <span className="text-gray-400 italic">Chưa có</span>}
        </span>
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'date',
      align: 'center',
      render: (value) => (
        <Tag color="blue" className="!text-xs">
          {new Date(value).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      align: 'center',
      width: 180,
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
    <ComponentCard title="Danh sách lịch làm việc">
      <div className="space-y-5">
        {/* ── Action Bar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <AddWorkSchedule />
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <FaCalendarCheck className="text-xs text-blue-500" />
            <span className="text-xs text-gray-500">
              Tổng:{' '}
              <strong className="text-blue-600">
                {pagination?.total || 0}
              </strong>{' '}
              lịch
            </span>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <Table<ScheduleType> {...tableProps} />
      </div>
    </ComponentCard>
  );
}

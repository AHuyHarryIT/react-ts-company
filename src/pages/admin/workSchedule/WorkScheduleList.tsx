import { useIsMobile } from '@hooks/useIsMobile';
import { Pagination, Table, TableColumnsType, TableProps, Tag } from 'antd';
import { useState } from 'react';
import { FaCalendarCheck } from 'react-icons/fa';

import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddWorkSchedule } from '@components/workSchedules/AddModal';
import { DeleteModal } from '@components/workSchedules/DeleteModal';
import { scheduleService } from '@services/workScheduleService';
import { ScheduleDetailDrawer } from './Detail';

import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { ActionGroup, ViewButton } from '@components/common/ActionButtons';
import { QueryParams } from '@/types/queryParams';
import { ScheduleType } from '@/types/scheduleType';

export default function WorkScheduleList() {
  const isMobile = useIsMobile();
  const [params, setParams] = useState<QueryParams>({ limit: 10, page: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      render: (_value, record) => {
        return (
          <ActionGroup>
            <ViewButton
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(record.id);
                setDrawerOpen(true);
              }}
            />
            <DeleteModal
              id={record.id}
              name={record.title}
              transparent
              isIconOnly
            />
          </ActionGroup>
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
    },
    onRow: (record) => ({
      onClick: () => {
        setSelectedId(record.id);
        setDrawerOpen(true);
      },
      className: 'cursor-pointer'
    })
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

        {/* ── Content ────────────────────────────────────────────── */}
        {isMobile ? (
          <div className="flex flex-col gap-3">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div
                  className="group -mx-1 flex cursor-pointer items-start justify-between gap-3 rounded-lg p-1 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700/50 dark:active:bg-gray-700"
                  onClick={() => {
                    setSelectedId(item.id);
                    setDrawerOpen(true);
                  }}
                >
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                        {index +
                          1 +
                          (params.limit ?? 10) * ((params.page ?? 1) - 1)}
                      </span>
                      <span className="line-clamp-2 text-[15px] leading-tight font-semibold text-gray-800 dark:text-white/90">
                        {item.title || 'Chưa có tên'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-8 text-[13px] text-gray-500">
                      <FaCalendarCheck className="text-blue-400" />
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <ActionGroup className="mt-1 !justify-end border-t border-gray-100 pt-3 dark:border-gray-700/50">
                  <ViewButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(item.id);
                      setDrawerOpen(true);
                    }}
                  />
                  <DeleteModal
                    id={item.id}
                    name={item.title}
                    transparent
                    isIconOnly
                  />
                </ActionGroup>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <Pagination
                size="small"
                current={pagination?.current}
                pageSize={pagination?.pageSize}
                total={pagination?.total}
                onChange={(page, size) => {
                  setParams((prev) => ({ ...prev, page, limit: size }));
                }}
              />
            </div>
          </div>
        ) : (
          <Table<ScheduleType> {...tableProps} />
        )}
      </div>

      <ScheduleDetailDrawer
        scheduleId={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </ComponentCard>
  );
}

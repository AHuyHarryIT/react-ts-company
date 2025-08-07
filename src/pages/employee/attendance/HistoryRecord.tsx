import { AttendanceType } from '@/types/attendanceType';
import { QueryParams } from '@/types/queryParams';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { Route } from '@routes/_authenticated/employee/attendances/history';
import { fetchEmpAttendancesHistory } from '@services/AttendanceService';
import { useQuery } from '@tanstack/react-query';
import { DatePicker, Table, TableColumnsType } from 'antd';
import { TableProps } from 'antd/lib';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

interface HistoryTableColumns {
  id: AttendanceType['id'];
  employee_code: AttendanceType['employee_code'];
  datetime: AttendanceType['datetime'];
}

export const HistoryRecord = () => {
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    'filter[date_between]':
      dayjs().startOf('month').format('YYYY-MM-DD') +
      ',' +
      dayjs().endOf('month').format('YYYY-MM-DD')
  });
  const { authenticated } = Route.useRouteContext();

  const { user } = authenticated;

  const { data: response, isLoading } = useQuery({
    queryKey: ['attendance', 'calculate', params],
    queryFn: async () => {
      const response = await fetchEmpAttendancesHistory(params);

      return response;
    }
  });

  const columns: TableColumnsType<HistoryTableColumns> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Ngày chấm công',
      dataIndex: 'datetime',
      key: 'date',
      render: (value) => {
        if (!value) return null;
        return new Date(value).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    {
      title: 'Thời gian chấm công',
      dataIndex: 'datetime',
      key: 'time',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    }
  ];

  const tableProps: TableProps<HistoryTableColumns> = {
    // TODO: Fix type casting issue
    ...(customTableProps as unknown as TableProps<HistoryTableColumns>),
    rowKey: (record) =>
      ['attendances', 'history', record.id, record.datetime].join('-'),
    columns: columns,
    dataSource: response?.data || [],
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: response?.current_page || 1,
      pageSize: response?.per_page || 10,
      total: response?.total || 0,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page: page
        }));
      }
    }
  };

  return (
    <>
      <BackButton to="/" />
      <ComponentCard title="Lịch sử chấm công">
        <div className="rounded border border-gray-300 p-4">
          <div>
            <strong>Tên nhân viên: </strong>
            {user?.name}
          </div>
          <div>
            <strong>Mã nhân viên: </strong>
            {user?.id}
          </div>
          <div>
            <strong>Bộ phận: </strong>
            {user?.role.name}
          </div>
        </div>
        <div>
          <label htmlFor="month-picker" className="mb-2 block">
            Chọn tháng
          </label>
          <DatePicker
            id="month-picker"
            placeholder="Chọn tháng"
            value={month}
            picker="month"
            format={'MM-YYYY'}
            onChange={(date) => {
              setMonth(date || dayjs());
              setParams((prev) => ({
                ...prev,
                'filter[date_between]':
                  date?.startOf('month').format('YYYY-MM-DD') +
                  ',' +
                  date?.endOf('month').format('YYYY-MM-DD')
              }));
            }}
          />
        </div>
        <Table {...tableProps} />
      </ComponentCard>
    </>
  );
};

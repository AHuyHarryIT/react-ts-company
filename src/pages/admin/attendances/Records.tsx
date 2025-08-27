import { calculateAttendances } from '@/utils/attendanceUtil';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Button,
  DatePicker,
  Input,
  Select,
  Switch,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';

import { QueryParams } from '@/types/queryParams';
import { EmployeeListModal } from '@components/attendances/EmployeeListModal';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';
import { fetchWorkScheduleCategories } from '@services/WorkScheduleCategoryService';

import { IconHistory } from '@components/icons';
import { fetchAttendances } from '@services/AttendanceService';
import { ExportModal } from './ExportModal';

interface TableColumns {
  employee_id: string;
  name: string;
  date: string;
  time_in: string;
  time_out: string;
  shift: number;
  hnhc: 'N' | 'LN' | 'D' | 'TC' | 'X' | null;
  total_hours: number | null;
  overtime_hours: number | null;
  administrative_hours: number | null;
}

export default function Records() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    sort: 'date'
  });
  const [forgottenDays, setForgottenDays] = useState<boolean>(false);
  const [month, setMonth] = useState<Dayjs>(dayjs());

  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ['workScheduleCategories', { limit: 0 }],
    queryFn: () => fetchWorkScheduleCategories({ limit: 0 })
  });

  const categoryOptions = categories?.workScheduleCategories.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const {
    data: response,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['attendances', params],
    queryFn: async () => {
      const response = await fetchAttendances(params);
      const { data, current_page, total, per_page } = response;

      const attendances = calculateAttendances(data) as TableColumns[];

      return {
        attendances,
        pagination: {
          total: total,
          pageSize: per_page,
          current: current_page
        }
      };
    }
  });

  const { attendances, pagination } = response || {
    attendances: [],
    pagination: { total: 0, pageSize: params.limit, current: params.page }
  };

  const handleSearch = debounce((value: string, type: 'name' | 'code') => {
    setParams((prev) => ({
      ...prev,
      'filter[employee_id]': undefined,
      'filter[employees.name]': undefined
    }));
    if (!value) {
      return;
    }
    if (type == 'name') {
      setParams((prev) => ({
        ...prev,
        'filter[employees.name]': value ? value : undefined
      }));
    } else if (type == 'code') {
      setParams((prev) => ({
        ...prev,
        'filter[employee_id]': value ? value : undefined
      }));
    }
  }, 300);

  const columns: TableColumnsType<TableColumns> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'employee_id',
      align: 'center'
    },
    {
      title: 'Tên nhân viên',
      key: 'name',
      render: (_value, record) => {
        return record.name || 'Chưa có thông tin';
      }
    },
    {
      title: 'Ngày chấm công',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
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
      title: 'Ngày trong tuần',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (value) => {
        if (!value) return null;
        return new Date(value).toLocaleString('vi-VN', {
          weekday: 'long'
        });
      }
    },
    {
      title: 'Giờ vào',
      dataIndex: 'time_in',
      key: 'time_in',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('vi-VN', {
          // year: 'numeric',
          // month: '2-digit',
          // day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    },
    {
      title: 'Giờ ra',
      dataIndex: 'time_out',
      key: 'time_out',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('vi-VN', {
          // year: 'numeric',
          // month: '2-digit',
          // day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      key: 'shift',
      align: 'center',
      render: (value, record) => {
        if (record.hnhc == 'X' && record.shift)
          return <Tag color="yellow">Đổi lịch làm</Tag>;
        if (value === 1) return 'Ca 1';
        if (value === 2) return 'Ca 2';
        return <Tag color="green">Nghỉ</Tag>;
      }
    },
    {
      title: 'Tổng giờ làm việc(h)',
      dataIndex: 'total_hours',
      key: 'total_hours',
      align: 'center',
      render: (value, record) => {
        if (!record.shift) return '-';
        return value ? value : <Tag color="red">Chấm công chưa đủ</Tag>;
      }
    },
    {
      title: 'Giờ hành chính(h)',
      dataIndex: 'administrative_hours',
      key: 'administrative_hours',
      align: 'center',
      render: (value, record) => {
        if (!record.shift) return '-';
        return value ? value : <Tag color="red">Chấm công chưa đủ</Tag>;
      }
    },
    {
      title: 'Giờ tăng ca(h)',
      dataIndex: 'overtime_hours',
      key: 'overtime_hours',
      align: 'center',
      render: (value) => {
        return value ? value : '-';
      }
    }
  ];

  const forgetAttendance = attendances.filter((attendance) => {
    return (
      !attendance.time_in ||
      !attendance.time_out ||
      attendance.time_in === '' ||
      attendance.time_out === ''
    );
  });

  const tableProps: TableProps<TableColumns> = {
    // TODO: Fix type casting issue
    ...(customTableProps as unknown as TableProps<TableColumns>),
    rowKey: (record) =>
      ['attendances', 'sheet', record.employee_id, record.date].join('-'),
    columns: columns,
    dataSource: forgottenDays ? forgetAttendance : attendances,
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: forgottenDays ? forgetAttendance.length : pagination.total,
      pageSizeOptions: forgottenDays
        ? [forgetAttendance.length]
        : ['10', '20', '50', '100', '200', '500'],
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
    <ComponentCard title={`Bảng tính công tháng ${month.format('MM-YYYY')}`}>
      <div className="flex flex-wrap gap-4">
        <RefreshButton
          refresh={() => {
            refetch();
            refetchCategories();
          }}
          isLoading={isFetching}
        />
        <Link to="/admin/attendances/history">
          <Button color="green" variant="solid" icon={<IconHistory />}>
            Lịch sử chấm công
          </Button>
        </Link>
        <EmployeeListModal />
        <ExportModal />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <DatePicker
          picker="month"
          format="YYYY-MM"
          placeholder="Chọn tháng"
          onChange={(value) => {
            setMonth(value ? dayjs(value) : dayjs());
            setParams((prev) => ({
              ...prev,
              'filter[date_between]': value
                ? `${dayjs(value).startOf('month').format('YYYY-MM-DD')},${dayjs(value).endOf('month').format('YYYY-MM-DD')}`
                : undefined
            }));
          }}
        />
        <DatePicker
          placeholder="Chọn ngày"
          onChange={(value) => {
            setParams((prev) => ({
              ...prev,
              'filter[date]': value
                ? dayjs(value).format('YYYY-MM-DD')
                : undefined
            }));
          }}
        />
        <Select
          options={categoryOptions}
          placeholder="Chọn danh mục"
          popupMatchSelectWidth={false}
          allowClear
          onSelect={(value) => {
            setParams((prev) => ({
              ...prev,
              'filter[employees.calendar_category_id]': value
            }));
          }}
          onClear={() => {
            setParams((prev) => ({
              ...prev,
              'filter[employees.calendar_category_id]': undefined
            }));
          }}
        />
        <Input.Search
          placeholder="Tìm kiếm nhân viên"
          allowClear
          onChange={(e) => {
            const inputValue = e.target.value;
            if (/^\d+$/.test(inputValue)) {
              handleSearch(inputValue, 'code');
            } else {
              handleSearch(inputValue, 'name');
            }
          }}
        />
      </div>
      <div>
        <label htmlFor="forgotten-days-switch">
          Hiển thị những ngày quên chấm công
        </label>
        <div>
          <Switch
            id="forgotten-days-switch"
            onChange={(checked) => {
              setForgottenDays(checked);
              if (checked) {
                setParams((prev) => ({
                  ...prev,
                  limit: 0
                }));
              } else {
                setParams((prev) => ({
                  ...prev,
                  limit: 50
                }));
              }
            }}
          />
        </div>
      </div>
      <Table<TableColumns> {...tableProps} />
    </ComponentCard>
  );
}

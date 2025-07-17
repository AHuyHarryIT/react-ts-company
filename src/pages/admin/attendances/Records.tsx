import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Button,
  Collapse,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  TableColumnsType,
  TableProps,
  Tag,
  Tooltip
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import axiosPrivate from '@/api/axiosInstance';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';
import { fetchWorkScheduleCategories } from '@services/WorkScheduleCategoryService';

import { IconFilter, IconHistory } from '@components/icons';

interface TableColumns {
  employee_id: string;
  name: string;
  date: string;
  time_in: string;
  time_out: string;
  shift: number;
  total_hours: number | null;
  overtime_hours: number | null;
  administrative_hours: number | null;
}

interface attendanceResponse {
  employee_id: string;
  name: string;
  date: string;
  calendar_category_id: string;
  hnhc: 'N' | 'LN' | 'D' | 'TC' | 'X' | null;
  dates: {
    datetime: string;
    date: string;
    time: string;
  }[];
}

export const Records = () => {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    sort: 'date'
  });
  const [searchOn, setSearchOn] = useState<'name' | 'code'>('name');

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
      const response = await axiosPrivate.get<
        attendanceResponse,
        PaginatedResponse<attendanceResponse>
      >('api/attendances/', {
        params: {
          ...params
        }
      });
      const { data, current_page, total, per_page } = response;

      const attendances = data.map((attendance) => {
        const { employee_id, name, date, hnhc, dates, calendar_category_id } =
          attendance;

        let shift = 0;
        if (dates.filter((d) => d.date === date).length > 0) {
          if (hnhc === 'N' || hnhc === 'LN') shift = 1;
          else if (hnhc === 'D' || hnhc === 'TC') shift = 2;
          else if (hnhc === 'X') {
            const yesterday = dayjs(date)
              .subtract(1, 'day')
              .format('YYYY-MM-DD');
            const yesterdayEntries = data.filter(
              (item) =>
                item.employee_id === employee_id && item.date === yesterday
            );
            const tomorrow = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
            const tomorrowEntries = data.filter(
              (item) =>
                item.employee_id === employee_id && item.date === tomorrow
            );

            if (yesterdayEntries.length > 0) {
              const yesterdayHnhc = yesterdayEntries[0].hnhc;
              const tomorrowHnhc = tomorrowEntries[0]?.hnhc || null;
              if (
                (yesterdayHnhc === 'N' || yesterdayHnhc === 'LN') &&
                (tomorrowHnhc === 'N' || tomorrowHnhc !== 'LN')
              )
                shift = 1;
              else if (
                (yesterdayHnhc === 'D' || yesterdayHnhc === 'TC') &&
                (tomorrowHnhc === 'D' || tomorrowHnhc === 'TC')
              )
                shift = 2;
            }
          }
        }

        // Find time_in and time_out based on shift
        let time_in = '';
        let time_out = '';
        if (shift === 1) {
          const dateEntries = dates.filter((d) => d.date === date);
          time_in =
            dateEntries.length > 0
              ? dateEntries.reduce(
                  (min, d) => (d.datetime < min ? d.datetime : min),
                  dateEntries[0].datetime
                )
              : '';
          time_out =
            dateEntries.length > 0
              ? dateEntries.reduce(
                  (max, d) => (d.datetime > max ? d.datetime : max),
                  dateEntries[0].datetime
                )
              : '';
        } else if (shift === 2) {
          // Get entries from 18:00 today to 11:30 tomorrow
          const startDateTime = new Date(date);
          startDateTime.setHours(18, 0, 0, 0);
          const endDateTime = new Date(date);
          endDateTime.setDate(endDateTime.getDate() + 1);
          endDateTime.setHours(11, 30, 0, 0);

          const dateEntries = dates.filter((d) => {
            const entryDate = new Date(d.datetime);
            return entryDate >= startDateTime && entryDate <= endDateTime;
          });
          time_in =
            dateEntries.length > 0 && dateEntries[0].date === date
              ? dateEntries.reduce(
                  (min, d) => (d.datetime < min ? d.datetime : min),
                  dateEntries[0].datetime
                )
              : '';
          time_out =
            dateEntries.length > 0 &&
            dateEntries[dateEntries.length - 1].date !== date
              ? dateEntries.reduce(
                  (max, d) => (d.datetime > max ? d.datetime : max),
                  dateEntries[0].datetime
                )
              : '';
        }

        let total_hours = 0;
        let break_time = 0;

        if (time_in && time_out) {
          let start = new Date(time_in);
          const end = new Date(time_out);

          if (shift === 1) {
            start.setHours(7, 30, 0, 0);
            start = start > new Date(time_in) ? start : new Date(time_in);
          } else if (shift === 2) {
            start.setHours(19, 30, 0, 0);
            start = start > new Date(time_in) ? start : new Date(time_in);
          }

          // Calculate break times efficiently
          const startMinutes = start.getHours() * 60 + start.getMinutes();
          const endMinutes =
            (end.getTime() - start.getTime()) / 60000 + startMinutes;

          if (calendar_category_id == '4') {
            // 9:30 - 9:45 break (15 min)
            if (endMinutes > 9 * 60 + 30 && startMinutes < 9 * 60 + 45) {
              break_time += 15;
            }
            // 12:00 - 13:00 lunch break (60 min)
            if (endMinutes > 12 * 60 && startMinutes < 13 * 60) {
              break_time += 60;
            }
            // 14:30 - 14:45 break (15 min)
            if (endMinutes > 14 * 60 + 30 && startMinutes < 14 * 60 + 45) {
              break_time += 15;
            }

            // 17:00 break (10 min)
            if (endMinutes < 17 * 60) {
              break_time += 10;
            }
          } else if (calendar_category_id == '2') {
            // 9:30 - 9:35 break (5 min)
            if (endMinutes > 9 * 60 + 30 && startMinutes < 9 * 60 + 35) {
              break_time += 5;
            }
            // 11:20 - 12:00 break (40 min)
            if (endMinutes > 11 * 60 + 20 && startMinutes < 12 * 60) {
              break_time += 40;
            }
            // 14:30 - 14:35 break (5 min)
            if (endMinutes > 14 * 60 + 30 && startMinutes < 14 * 60 + 35) {
              break_time += 5;
            }
            // 17:00 - 17:10 break (10 min)
            if (endMinutes > 17 * 60 && startMinutes < 17 * 60 + 10) {
              break_time += 10;
            }
          } else if (shift === 1) {
            // 9:30 - 9:40 break (10 min)
            if (endMinutes > 9 * 60 + 30 && startMinutes < 9 * 60 + 40) {
              break_time += 10;
            }
            // 11:20 - 11:50 lunch break (30 min)
            if (endMinutes > 11 * 60 + 20 && startMinutes < 11 * 60 + 50) {
              break_time += 30;
            }
            // 14:30 - 14:40 break (10 min)
            if (endMinutes > 14 * 60 + 30 && startMinutes < 14 * 60 + 40) {
              break_time += 10;
            }
            // 17:00 - 17:10 break (10 min)
            if (endMinutes > 17 * 60 && startMinutes < 17 * 60 + 10) {
              break_time += 10;
            }
          } else if (shift === 2) {
            // 21:30 - 21:40 break (10 min)
            if (endMinutes > 21 * 60 + 30 && startMinutes < 21 * 60 + 40) {
              break_time += 10;
            }
            // 23:30 - 00:00 break (30 min)
            if (endMinutes > 23 * 60 + 30 && startMinutes < 24 * 60) {
              break_time += 30;
            }
            // 02:30 next day - 02:40 next day break (10 min)
            if (endMinutes > 26 * 60 + 30 && startMinutes < 26 * 60 + 40) {
              break_time += 10;
            }
            // 05:00 next day - 05:10 next day break (10 min)
            if (endMinutes > 29 * 60 && startMinutes < 29 * 60 + 10) {
              break_time += 10;
            }
          }
          total_hours =
            (end.getTime() - start.getTime() - break_time * 60000) / 3600000;
          total_hours = total_hours < 0 ? 0 : total_hours;
          total_hours = Math.floor(total_hours * 4) / 4;
        }

        return {
          employee_id,
          name,
          date,
          shift,
          time_in,
          time_out,
          total_hours: total_hours,
          overtime_hours: total_hours > 8 ? total_hours - 8 : 0,
          administrative_hours: total_hours > 0 ? 8 : total_hours
        };
      }) as TableColumns[];

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

  const columns: TableColumnsType<TableColumns> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'employee_id',
      minWidth: 120
    },
    {
      title: 'Tên nhân viên',
      key: 'name',
      minWidth: 200,
      render: (_value, record) => {
        return record.name || 'Chưa có thông tin';
      }
    },
    {
      title: 'Ngày chấm công',
      dataIndex: 'date',
      key: 'date',
      minWidth: 150,
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
      minWidth: 150,
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
      minWidth: 170,
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
      minWidth: 170,
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
      minWidth: 120,
      render: (value) => {
        if (value === 1) return 'Ca 1';
        if (value === 2) return 'Ca 2';
        return <Tag color="green">Nghỉ</Tag>;
      }
    },
    {
      title: 'Tổng giờ làm việc(h)',
      dataIndex: 'total_hours',
      key: 'total_hours',
      minWidth: 150,
      render: (value, record) => {
        if (!record.shift) return '-';
        return value ? value : <Tag color="red">Chấm công chưa đủ</Tag>;
      }
    },
    {
      title: 'Giờ hành chính(h)',
      dataIndex: 'administrative_hours',
      key: 'administrative_hours',
      minWidth: 120,
      render: (value, record) => {
        if (!record.shift) return '-';
        return value ? value : <Tag color="red">Chấm công chưa đủ</Tag>;
      }
    },
    {
      title: 'Giờ tăng ca(h)',
      dataIndex: 'overtime_hours',
      key: 'overtime_hours',
      minWidth: 120,
      render: (value) => {
        return value ? value : '-';
      }
    }
  ];

  const tableProps: TableProps<TableColumns> = {
    // TODO: Fix type casting issue
    ...(customTableProps as unknown as TableProps<TableColumns>),
    rowKey: (record) =>
      ['attendances', 'sheet', record.employee_id, record.date].join('-'),
    columns: columns,
    dataSource: attendances,
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: params.page,
      pageSize: params.limit,
      total: pagination.total,
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
    <ComponentCard title="Bảng tính công">
      <div className="flex flex-wrap gap-4">
        <RefreshButton
          refresh={() => {
            refetch();
            refetchCategories();
          }}
          isLoading={isFetching}
        />
        <Tooltip title="Bảng tính công">
          <Link to="/admin/attendances/history">
            <Button
              color="blue"
              variant="solid"
              icon={<IconHistory />}
              size="large"
            >
              Bảng tính công
            </Button>
          </Link>
        </Tooltip>
      </div>
      <Collapse
        style={{ marginBottom: '1.5rem' }}
        items={[
          {
            key: 'filter',
            label: (
              <div className="flex items-center gap-1">
                <IconFilter /> Bộ lọc
              </div>
            ),
            children: (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <DatePicker
                  picker="month"
                  format="YYYY-MM"
                  placeholder="Chọn tháng"
                  onChange={(_value, dateString) => {
                    setParams((prev) => ({
                      ...prev,
                      'filter[date_between]':
                        typeof dateString === 'string' && dateString
                          ? `${dayjs(dateString, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')},${dayjs(dateString, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')}`
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
                <Space.Compact className="col-span-1 sm:col-span-2">
                  <Select
                    defaultValue={searchOn}
                    options={[
                      { label: 'Tên', value: 'name' },
                      { label: 'Mã', value: 'code' }
                    ]}
                    onChange={(value) => {
                      setSearchOn(value);
                    }}
                  />
                  <Input.Search
                    placeholder="Tìm kiếm nhân viên"
                    allowClear
                    onSearch={(value) => {
                      setParams((prev) => ({
                        ...prev,
                        'filter[employee_id]': undefined,
                        'filter[employees.name]': undefined
                      }));
                      if (searchOn === 'code') {
                        setParams((prev) => ({
                          ...prev,
                          'filter[employee_id]': value ? value : undefined
                        }));
                      } else {
                        setParams((prev) => ({
                          ...prev,
                          'filter[employees.name]': value ? value : undefined
                        }));
                      }
                    }}
                  />
                </Space.Compact>
              </div>
            ),
            showArrow: false
          }
        ]}
      />
      <Table<TableColumns> {...tableProps} />
    </ComponentCard>
  );
};

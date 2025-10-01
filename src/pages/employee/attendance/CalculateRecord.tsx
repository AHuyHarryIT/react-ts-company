import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { Route } from '@routes/_authenticated/employee/attendances/calculate';
import { fetchEmpAttendancesCalculated } from '@services/AttendanceService';
import { uiStore } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import {
  Card,
  DatePicker,
  Spin,
  Switch,
  Table,
  TableColumnsType,
  Tag
} from 'antd';
import { TableProps } from 'antd/lib';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

interface AttendanceTableColumns {
  employee_id: string;
  name: string;
  date: string;
  time_in: string;
  time_out: string;
  shift: number;
  hnhc: 'N' | 'LN' | 'D' | 'TC' | 'X' | null;
  day_type: string;
  is_schedule_change: boolean;
  total_hours: number | null;
  overtime_hours: number | null;
  administrative_hours: number | null;
}

export const CalculateRecord = () => {
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [forgottenDays, setForgottenDays] = useState<boolean>(false);
  const { authenticated } = Route.useRouteContext();

  const { isMobile } = useStore(uiStore);

  const { user } = authenticated;

  const { data: response, isLoading } = useQuery({
    queryKey: ['attendance', 'calculate', month.format('MM-YYYY')],
    queryFn: async () => {
      // Lấy ngày cuối là ngày hiện tại hoặc ngày cuối tháng (tùy theo cái nào nhỏ hơn)
      const today = dayjs();
      const endDate = month.isSame(today, 'month')
        ? today.format('YYYY-MM-DD')
        : month.endOf('month').format('YYYY-MM-DD');

      const response = await fetchEmpAttendancesCalculated({
        limit: 0,
        'filter[date_between]':
          month.startOf('month').format('YYYY-MM-DD') + ',' + endDate
      });

      return response;
    }
  });

  const attendances =
    response?.data || ([] as unknown as AttendanceTableColumns[]);

  const columns: TableColumnsType<AttendanceTableColumns> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) => index + 1
    },
    {
      title: 'Ngày chấm công',
      dataIndex: 'date',
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
      title: 'Ngày trong tuần',
      dataIndex: 'date',
      key: 'date',
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
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('vi-VN', {
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
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    },
    {
      title: 'Loại ngày',
      dataIndex: 'day_type',
      key: 'day_type',
      render: (value, record) => {
        if (record.is_schedule_change) {
          return <Tag color="yellow">{value}</Tag>;
        }
        if (value === 'Ca ngày') return <Tag color="blue">Ca ngày</Tag>;
        if (value === 'Ca đêm') return <Tag color="purple">Ca đêm</Tag>;
        return <Tag color="green">Nghỉ</Tag>;
      }
    },
    {
      title: 'Tổng giờ làm việc(h)',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (value, record) => {
        if (!record.shift) return '-';
        return value ? value : <Tag color="red">Chấm công chưa đủ</Tag>;
      }
    },
    {
      title: 'Giờ hành chính(h)',
      dataIndex: 'administrative_hours',
      key: 'administrative_hours',
      render: (value, record) => {
        if (!record.shift) return '-';
        return value ? value : <Tag color="red">Chấm công chưa đủ</Tag>;
      }
    },
    {
      title: 'Giờ tăng ca(h)',
      dataIndex: 'overtime_hours',
      key: 'overtime_hours',
      render: (value) => {
        return value ? value : '-';
      }
    }
  ];

  const tableProps: TableProps<AttendanceTableColumns> = {
    // TODO: Fix type casting issue
    ...(customTableProps as unknown as TableProps<AttendanceTableColumns>),
    rowKey: (record) =>
      ['table', 'attendances', 'sheet', record.employee_id, record.date].join(
        '-'
      ),
    columns: columns,
    dataSource: forgottenDays
      ? attendances.filter((attendance) => {
          // Only show days that should have attendance but missing time_in or time_out
          // Case 1: Normal work day (shift > 0) with incomplete attendance
          if (
            attendance.shift > 0 &&
            (!attendance.time_in ||
              !attendance.time_out ||
              attendance.time_in === '' ||
              attendance.time_out === '')
          ) {
            return true;
          }
          // Case 2: Schedule change day (is_schedule_change = true) with incomplete attendance
          if (
            attendance.is_schedule_change &&
            attendance.shift > 0 &&
            (!attendance.time_in ||
              !attendance.time_out ||
              attendance.time_in === '' ||
              attendance.time_out === '')
          ) {
            return true;
          }
          return false;
        })
      : attendances,
    loading: isLoading,
    pagination: false
  };

  return (
    <>
      <BackButton to="/" />
      <ComponentCard title={`Bảng tính công ${dayjs(month).format('MM-YYYY')}`}>
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
            onChange={(date) => setMonth(date || dayjs())}
          />
        </div>
        <div>
          <label htmlFor="forgotten-days-switch">
            Hiển thị những ngày quên chấm công
          </label>
          <div>
            <Switch
              id="forgotten-days-switch"
              onChange={(checked) => setForgottenDays(checked)}
            />
          </div>
        </div>

        {isMobile ? (
          <Spin spinning={isLoading}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {attendances.length > 0 &&
                attendances
                  .filter((attendance) => {
                    if (!forgottenDays) return true;
                    // Only show days that should have attendance but missing time_in or time_out
                    // Case 1: Normal work day (shift > 0) with incomplete attendance
                    if (
                      attendance.shift > 0 &&
                      (!attendance.time_in ||
                        !attendance.time_out ||
                        attendance.time_in === '' ||
                        attendance.time_out === '')
                    ) {
                      return true;
                    }
                    // Case 2: Schedule change day (is_schedule_change = true) with incomplete attendance
                    if (
                      attendance.is_schedule_change &&
                      attendance.shift > 0 &&
                      (!attendance.time_in ||
                        !attendance.time_out ||
                        attendance.time_in === '' ||
                        attendance.time_out === '')
                    ) {
                      return true;
                    }
                    return false;
                  })
                  .map((item) => {
                    return (
                      <>
                        <Card
                          key={[
                            'card',
                            'attendances',
                            'sheet',
                            item.employee_id,
                            item.date
                          ].join('-')}
                          title={
                            dayjs(item.date).format('DD/MM/YYYY') +
                            ' - ' +
                            dayjs(item.date).format('dd')
                          }
                          styles={{
                            header: { padding: '0 0.5rem' },
                            body: { border: '1px solid #d1d5dc' }
                          }}
                          style={{ border: '1px solid #d1d5dc' }}
                        >
                          <Card.Grid
                            hoverable={false}
                            style={{
                              width: '50%',
                              padding: '0.5rem',
                              border: 'none'
                            }}
                          >
                            <div>
                              <strong>Giờ vào </strong>
                              <div>
                                {item.time_in
                                  ? new Date(item.time_in).toLocaleString(
                                      'vi-VN',
                                      {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      }
                                    )
                                  : '-'}
                              </div>
                            </div>
                          </Card.Grid>
                          <Card.Grid
                            hoverable={false}
                            style={{ width: '50%', padding: '0.5rem' }}
                          >
                            <div className="text-right">
                              <strong>Giờ ra</strong>
                              <div>
                                {item.time_out
                                  ? new Date(item.time_out).toLocaleString(
                                      'vi-VN',
                                      {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      }
                                    )
                                  : '-'}
                              </div>
                            </div>
                          </Card.Grid>
                          <Card.Grid
                            hoverable={false}
                            style={{ width: '40%', padding: '0.5rem' }}
                          >
                            <div className="text-center">
                              <strong>Tổng giờ làm</strong>
                              <div>
                                {item.total_hours ? item.total_hours : '-'}
                              </div>
                            </div>
                          </Card.Grid>
                          <Card.Grid
                            hoverable={false}
                            style={{ width: '35%', padding: '0.5rem' }}
                          >
                            <div className="text-center">
                              <strong>Hành chính</strong>
                              <div>
                                {item.administrative_hours
                                  ? item.administrative_hours
                                  : '-'}
                              </div>
                            </div>
                          </Card.Grid>
                          <Card.Grid
                            hoverable={false}
                            style={{ width: '25%', padding: '0.5rem' }}
                          >
                            <div className="text-center">
                              <strong>Tăng ca</strong>
                              <div>
                                {item.overtime_hours
                                  ? item.overtime_hours
                                  : '-'}
                              </div>
                            </div>
                          </Card.Grid>
                        </Card>
                      </>
                    );
                  })}
            </div>
          </Spin>
        ) : (
          <Table {...tableProps} />
        )}
      </ComponentCard>
    </>
  );
};

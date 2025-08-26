import React from 'react';
import { Table, TableColumnsType, TableProps } from 'antd';

import { AttendanceTableType } from '@/types/salaryType';

interface AttendanceTableProps {
  data: AttendanceTableType[];
  company: 'vvp' | 'a7a';
  loading?: boolean;
}

interface FlattenedData
  extends Omit<
    AttendanceTableType,
    | 'times'
    | 'salary_official_a7_a_timekeepings'
    | 'salary_official_v_v_p_timekeepings'
  > {
  key: string;
  times: {
    [date: string]: {
      timekeeping_day: number;
      timekeeping_night: number;
      timekeeping_overtime: number;
    };
  };
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  company,
  loading
}) => {
  if (company == 'a7a') {
    data = data.map((item) => {
      return {
        ...item,
        times: item.salary_official_a7_a_timekeepings || []
      };
    });
  } else if (company === 'vvp') {
    data = data.map((item) => {
      return {
        ...item,
        times: item.salary_official_v_v_p_timekeepings || []
      };
    });
  }

  // Transform rawData into a format AntD Table understands
  const transformedData = data.map((entry) => {
    const timeMap: FlattenedData['times'] = {};
    entry.times?.forEach((time) => {
      timeMap[time.timekeeping_date] = {
        timekeeping_day: time.timekeeping_day,
        timekeeping_night: time.timekeeping_night,
        timekeeping_overtime: time.timekeeping_overtime
      };
    });

    return {
      ...entry,
      key: `attendance-${entry.id}`,
      times: timeMap
    };
  });

  // Dynamically create columns based on date
  const dataList = data[0]?.times?.map((time) => time.timekeeping_date) || [];

  const dateColumns: TableColumnsType<FlattenedData> = dataList.map((date) => {
    return {
      title: date,
      dataIndex: 'timekeeping_date',
      children: [
        {
          title: <div className="capitalize">Ngày</div>,
          minWidth: 50,
          dataIndex: ['times', date, 'timekeeping_day'],
          align: 'center',
          className: 'bg-amber-200',
          key: `${date}_day`,
          render: (value) => {
            if (!value) return '-';
            return value.toLocaleString('vi-VN', {
              maximumFractionDigits: 1
            });
          }
        },
        {
          title: <div className="capitalize">Đêm</div>,
          minWidth: 50,
          dataIndex: ['times', date, 'timekeeping_night'],
          align: 'center',
          className: 'bg-gray-200',
          key: `${date}_night`,
          render: (value) => {
            if (!value) return '-';
            return value.toLocaleString('vi-VN', {
              maximumFractionDigits: 1
            });
          }
        },
        {
          title: <div className="capitalize">TC</div>,
          minWidth: 50,
          dataIndex: ['times', date, 'timekeeping_overtime'],
          align: 'center',
          className: 'bg-green-200',
          key: `${date}_overtime`,
          render: (value) => {
            if (!value) return '-';
            return value.toLocaleString('vi-VN', {
              maximumFractionDigits: 1
            });
          }
        }
      ]
    };
  });

  // static columns
  const columns: TableColumnsType<FlattenedData> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1
    },
    {
      title: (
        <div className="capitalize">
          Mã
          <br />
          Nhân viên
        </div>
      ),
      minWidth: 100,
      fixed: 'left',
      dataIndex: 'employee_id',
      align: 'center',
      render: (_value, record) => {
        return record.employee_id || '-';
      }
    },
    {
      title: <div className="capitalize">Họ và tên</div>,
      minWidth: 200,
      dataIndex: 'employee_name',
      fixed: 'left',
      render: (_value, record) => {
        return record.employee?.name || '-';
      }
    },
    {
      title: <div className="capitalize">Bộ phận</div>,
      minWidth: 200,
      fixed: 'left',
      dataIndex: 'role_name',
      render: (_value, record) => {
        return record.employee?.role?.role_name || '-';
      }
    },
    {
      title: <div className="capitalize">Số giờ làm ngày</div>,
      dataIndex: 'total_day_offical',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: <div className="capitalize">Số giờ làm đêm</div>,
      dataIndex: 'total_night_offical',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Số giờ làm thêm</div>,
      dataIndex: 'total_overtime_offical',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Tính lương ngày</div>,
      dataIndex: 'workday_count_trial',
      className: 'bg-yellow-100',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Tính lương đêm</div>,
      dataIndex: 'worknight_count_trial',
      className: 'bg-yellow-100',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Tính lương làm thêm</div>,
      dataIndex: 'overtime_day_count_trial',
      className: 'bg-yellow-100',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp cơm ngày</div>,
      dataIndex: 'allowance_rice_day_timekeeping',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp cơm đêm</div>,
      dataIndex: 'allowance_rice_night_timekeeping',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp tăng ca</div>,
      dataIndex: 'allowance_overtime_timekeeping',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    // data.
    ...dateColumns,
    {
      title: (
        <div className="capitalize">
          Số ngày <br />
          Lễ, tết
        </div>
      ),
      dataIndex: 'holidays_count',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: (
        <div className="capitalize">
          Số ngày
          <br />
          phép năm
        </div>
      ),
      dataIndex: 'paid_holidays_count',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Có phép</div>,
      dataIndex: 'daysleave_allowed_timekeeping',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Không phép</div>,
      dataIndex: 'daysleave_notallowed_timekeeping',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    }
  ];

  const tableProps: TableProps<FlattenedData> = {
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: transformedData,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content' },
    tableLayout: 'auto',
    pagination: false
  };
  return <Table<FlattenedData> {...tableProps} />;
};

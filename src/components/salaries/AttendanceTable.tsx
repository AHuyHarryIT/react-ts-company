import React from 'react';
import { Empty, Spin, Table, TableColumnsType, TableProps, Tag } from 'antd';

import { AttendanceTableType } from '@/types/salaryType';
import { useIsMobile } from '@hooks/useIsMobile';

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

const Field = ({
  label,
  value,
  highlight
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) =>
  value ? (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <span
        className={`text-right text-xs font-medium ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white/80'}`}
      >
        {value}
      </span>
    </div>
  ) : null;

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  company,
  loading
}) => {
  const isMobile = useIsMobile();

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
    scroll: { x: 'max-content', scrollToFirstRowOnChange: false },
    tableLayout: 'auto',
    pagination: false
  };

  if (isMobile) {
    return (
      <Spin spinning={!!loading}>
        {transformedData.length === 0 && !loading ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <div className="flex flex-col gap-3">
            {transformedData.map((record, index) => (
              <div
                key={record.key}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Header */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <span className="text-[15px] font-semibold text-gray-800 dark:text-white/90">
                    {record.employee?.name || '-'}
                  </span>
                  <Tag
                    color="blue"
                    className="!m-0 ml-auto !font-mono !text-xs"
                  >
                    {record.employee_id}
                  </Tag>
                </div>
                <div className="mb-1 text-xs text-gray-400">
                  {record.employee?.role?.role_name || '-'}
                </div>

                {/* Summary totals */}
                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-indigo-500 uppercase">
                    Tổng giờ làm
                  </div>
                  <Field
                    label="Giờ ngày"
                    value={
                      record.total_day_offical?.toLocaleString('vi-VN') || null
                    }
                    highlight
                  />
                  <Field
                    label="Giờ đêm"
                    value={
                      record.total_night_offical?.toLocaleString('vi-VN', {
                        maximumFractionDigits: 1
                      }) || null
                    }
                  />
                  <Field
                    label="Giờ tăng ca"
                    value={
                      record.total_overtime_offical?.toLocaleString('vi-VN', {
                        maximumFractionDigits: 1
                      }) || null
                    }
                    highlight
                  />
                </div>

                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-amber-500 uppercase">
                    Tính lương
                  </div>
                  <Field
                    label="Lương ngày"
                    value={
                      record.workday_count_trial?.toLocaleString('vi-VN', {
                        maximumFractionDigits: 1
                      }) || null
                    }
                  />
                  <Field
                    label="Lương đêm"
                    value={
                      record.worknight_count_trial?.toLocaleString('vi-VN', {
                        maximumFractionDigits: 1
                      }) || null
                    }
                  />
                  <Field
                    label="Lương tăng ca"
                    value={
                      record.overtime_day_count_trial?.toLocaleString('vi-VN', {
                        maximumFractionDigits: 1
                      }) || null
                    }
                  />
                  <Field
                    label="PC cơm ngày"
                    value={
                      record.allowance_rice_day_timekeeping?.toLocaleString(
                        'vi-VN',
                        {
                          maximumFractionDigits: 1
                        }
                      ) || null
                    }
                  />
                  <Field
                    label="PC cơm đêm"
                    value={
                      record.allowance_rice_night_timekeeping?.toLocaleString(
                        'vi-VN',
                        {
                          maximumFractionDigits: 1
                        }
                      ) || null
                    }
                  />
                  <Field
                    label="PC tăng ca"
                    value={
                      record.allowance_overtime_timekeeping?.toLocaleString(
                        'vi-VN',
                        {
                          maximumFractionDigits: 1
                        }
                      ) || null
                    }
                  />
                </div>

                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-emerald-500 uppercase">
                    Ngày nghỉ
                  </div>
                  <Field
                    label="Lễ, tết"
                    value={
                      record.holidays_count?.toLocaleString('vi-VN') || null
                    }
                  />
                  <Field
                    label="Phép năm"
                    value={
                      record.paid_holidays_count?.toLocaleString('vi-VN') ||
                      null
                    }
                  />
                  <Field
                    label="Có phép"
                    value={
                      record.daysleave_allowed_timekeeping?.toLocaleString(
                        'vi-VN'
                      ) || null
                    }
                  />
                  <Field
                    label="Không phép"
                    value={
                      record.daysleave_notallowed_timekeeping?.toLocaleString(
                        'vi-VN'
                      ) || null
                    }
                  />
                </div>

                {/* Daily breakdown - compact grid */}
                {Object.keys(record.times).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      Xem chi tiết {Object.keys(record.times).length} ngày
                    </summary>
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 dark:bg-gray-900/40">
                            <th className="px-2 py-1.5 text-left font-medium">
                              Ngày
                            </th>
                            <th className="px-2 py-1.5 text-center font-medium">
                              N
                            </th>
                            <th className="px-2 py-1.5 text-center font-medium">
                              Đ
                            </th>
                            <th className="px-2 py-1.5 text-center font-medium">
                              TC
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(record.times).map(([date, vals]) => (
                            <tr
                              key={date}
                              className="border-t border-gray-50 dark:border-gray-800"
                            >
                              <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                                {date}
                              </td>
                              <td className="px-2 py-1 text-center text-amber-600">
                                {vals.timekeeping_day || '-'}
                              </td>
                              <td className="px-2 py-1 text-center text-gray-500">
                                {vals.timekeeping_night || '-'}
                              </td>
                              <td className="px-2 py-1 text-center text-emerald-600">
                                {vals.timekeeping_overtime || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </Spin>
    );
  }

  return <Table<FlattenedData> {...tableProps} />;
};

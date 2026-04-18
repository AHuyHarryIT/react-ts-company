import { useMemo } from 'react';
import { Spin, DatePicker } from 'antd';
import { useQuery } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import {
  FaCalendarAlt,
  FaUserClock,
  FaClipboardList,
  FaMedal
} from 'react-icons/fa';
import {
  employeeRequestFormService,
  supervisorRequestFormService
} from '@services/RequestFormService';

interface EmployeeOverviewProps {
  /** 'employee' = tab Đơn của tôi, 'supervisor' = tab Duyệt đơn */
  mode: 'employee' | 'supervisor';
  year: Dayjs;
  onYearChange: (date: Dayjs) => void;
}

export const EmployeeRequestFormOverview: React.FC<EmployeeOverviewProps> = ({
  mode,
  year,
  onYearChange
}) => {
  const fromDate = year.startOf('year').format('YYYY-MM-DD');
  const toDate = year.endOf('year').format('YYYY-MM-DD');

  const { data, isLoading } = useQuery({
    queryKey: [`${mode}-request-forms-overview`, fromDate, toDate],
    queryFn: () => {
      const service =
        mode === 'supervisor'
          ? supervisorRequestFormService
          : employeeRequestFormService;
      return service.getList({
        per_page: 10000,
        from_date: fromDate,
        to_date: toDate
      });
    }
  });

  const requestForms = useMemo(
    () => data?.data?.data || [],
    [data?.data?.data]
  );

  const stats = useMemo(() => {
    let leaveCount = 0;
    let lateEarlyCount = 0;
    let pendingCount = 0;

    const employeeLeaveMap: Record<string, { name: string; count: number }> =
      {};

    requestForms.forEach((form) => {
      if (form.status === 'pending') pendingCount++;

      if (form.type === 'don_xin_nghi_phep') {
        leaveCount++;

        // Calculate most leaves for supervisor mode
        if (mode === 'supervisor') {
          const empId = form.employee?.id;
          const empName = form.employee?.name || 'Unknown';

          if (empId) {
            if (!employeeLeaveMap[empId]) {
              employeeLeaveMap[empId] = { name: empName, count: 0 };
            }
            const days =
              Number(
                (form.form_data as Record<string, unknown>)?.so_ngay_nghi
              ) || 1;
            employeeLeaveMap[empId].count += days;
          }
        }
      } else if (form.type === 'don_xin_di_tre_ve_som') {
        lateEarlyCount++;
      }
    });

    let topEmployee = 'Chưa có dữ liệu';
    if (mode === 'supervisor') {
      let maxLeaves = 0;
      Object.values(employeeLeaveMap).forEach((emp) => {
        if (emp.count > maxLeaves) {
          maxLeaves = emp.count;
          topEmployee = `${emp.name} (${emp.count} ngày)`;
        }
      });
    }

    return { leaveCount, lateEarlyCount, pendingCount, topEmployee };
  }, [requestForms, mode]);

  const cards =
    mode === 'employee'
      ? [
          {
            label: 'Đơn nghỉ phép',
            value: stats.leaveCount,
            icon: <FaCalendarAlt className="text-[15px] md:text-xl" />,
            iconBg:
              'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
          },
          {
            label: 'Đơn đi trễ, về sớm',
            value: stats.lateEarlyCount,
            icon: <FaUserClock className="text-[15px] md:text-xl" />,
            iconBg:
              'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'
          },
          {
            label: 'Đang chờ duyệt',
            value: stats.pendingCount,
            icon: <FaClipboardList className="text-[15px] md:text-xl" />,
            iconBg:
              'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400'
          }
        ]
      : [
          {
            label: 'Tổng đơn nghỉ phép cần duyệt',
            value: stats.leaveCount,
            icon: <FaCalendarAlt className="text-[15px] md:text-xl" />,
            iconBg:
              'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
          },
          {
            label: 'Nghỉ nhiều nhất',
            value: stats.topEmployee,
            icon: <FaMedal className="text-[15px] md:text-xl" />,
            iconBg:
              'bg-purple-50 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400'
          },
          {
            label: 'Đang chờ duyệt',
            value: stats.pendingCount,
            icon: <FaClipboardList className="text-[15px] md:text-xl" />,
            iconBg:
              'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
          }
        ];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:gap-4 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 md:text-xl dark:text-gray-100">
          Tổng quan năm {year.year()}
        </h3>
        <DatePicker
          picker="year"
          value={year}
          onChange={(date) => date && onYearChange(date)}
          allowClear={false}
          className="w-full !rounded-lg sm:w-32"
          placeholder="Chọn năm"
          size="large"
        />
      </div>

      <Spin spinning={isLoading}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {cards.map((card, index) => (
            <div
              key={card.label}
              className={`flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md md:p-5 dark:border-gray-700 dark:bg-gray-800 ${
                index === 2 ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12 ${card.iconBg}`}
              >
                {card.icon}
              </div>
              <div className="mt-3 md:mt-4">
                <div
                  className={`font-bold text-gray-800 dark:text-gray-100 ${
                    typeof card.value === 'string'
                      ? card.value.length > 20
                        ? 'text-sm leading-snug md:text-base'
                        : 'text-lg md:text-xl'
                      : 'text-2xl md:text-3xl'
                  }`}
                  title={
                    typeof card.value === 'string' ? card.value : undefined
                  }
                >
                  {card.value}
                </div>
                <div className="mt-1 flex min-h-[32px] items-start text-xs font-medium text-gray-500 md:min-h-[40px] md:text-sm dark:text-gray-400">
                  <span className="line-clamp-2">{card.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Spin>
    </div>
  );
};

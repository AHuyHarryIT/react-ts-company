import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { Alert, Radio, Tabs, TabsProps, message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  FaListAlt,
  FaClock,
  FaCalculator,
  FaMoneyCheckAlt,
  FaCog,
  FaSave
} from 'react-icons/fa';

import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';

import {
  fetchSalaryWebData,
  calculateSalary,
  updateTimekeepingBulk
} from '@services/SalaryWebService';
import { fetchAttendancesCalculated } from '@services/AttendanceService';
import { buildCalculatePayload } from '@utils/salaryWebCalculatePayload';

import type { CompanyType } from '@/types/salaryWebType';
import type { AttendanceResult } from '@/utils/attendanceUtil';

// Tab Components
import CategoryTab from '@/components/salary-web/CategoryTab';
import TimekeepingTab from '@/components/salary-web/TimekeepingTab';

import CalculationTab from '@/components/salary-web/CalculationTab';
import PayrollTab from '@/components/salary-web/PayrollTab';
import ConfigTab from '@/components/salary-web/ConfigTab';

const routeApi = getRouteApi('/_authenticated/admin/salary-web/$id');

type SyncTimekeepingEntry = {
  date: string;
  day_hours: number;
  night_hours: number;
  overtime_hours: number;
};

const buildDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return dates;
};

export default function SalaryWebDetail() {
  const { id } = routeApi.useParams();
  const queryClient = useQueryClient();
  const salaryManagerId = Number(id);

  const [company, setCompany] = useState<CompanyType>('a7a');
  const [activeTab, setActiveTab] = useState('category');
  const autoCalculatedKeyRef = useRef<string | null>(null);

  // ── Fetch employee data ────────────────────────────────────────────────
  const {
    data: salaryData,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['salaryWebData', salaryManagerId, company],
    queryFn: () => fetchSalaryWebData(salaryManagerId, company),
    enabled: !!salaryManagerId
  });

  const employees = useMemo(
    () => salaryData?.employees || [],
    [salaryData?.employees]
  );
  const salaryManager = salaryData?.salary_manager;

  // ── Calculate & Save mutation ───────────────────────────────────────────
  //  Currently: uses BE calculate (legacy).
  //  When BE implements saveCalculatedData:
  //    → fetch fresh data → computeAll on FE → send calculated_data to BE
  const calculateAllMutation = useMutation({
    mutationFn: () =>
      calculateSalary(
        salaryManagerId,
        buildCalculatePayload({
          company,
          employees,
          employeeIds: null
        })
      ),
    onSuccess: (res) => {
      message.success(res.message || 'Tính lương thành công!');
      queryClient.invalidateQueries({
        queryKey: ['salaryWebData', salaryManagerId, company]
      });
      queryClient.invalidateQueries({
        queryKey: ['payrollSummary', salaryManagerId, company]
      });
      setActiveTab('calculation');
    },
    onError: () => {
      message.error('Có lỗi khi tính lương.');
    }
  });
  const { mutate: triggerCalculateAll, isPending: isCalculatingAll } =
    calculateAllMutation;

  // Auto-save computed results on first load if no payroll data exists yet
  useEffect(() => {
    if (!salaryData || isCalculatingAll) return;

    const cacheKey = `${salaryManagerId}-${company}`;
    if (autoCalculatedKeyRef.current === cacheKey) return;

    const hasEmployees = employees.length > 0;
    const hasAnyCalculated = employees.some(
      (employee) => employee.payroll?.actually_received_payroll != null
    );

    if (hasEmployees && !hasAnyCalculated) {
      autoCalculatedKeyRef.current = cacheKey;
      triggerCalculateAll();
    }
  }, [
    salaryData,
    employees,
    salaryManagerId,
    company,
    isCalculatingAll,
    triggerCalculateAll
  ]);

  // ── Sync mutation ─────────────────────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!salaryManager) {
        throw new Error('Thiếu thông tin kỳ lương');
      }

      const attendanceResponse = await fetchAttendancesCalculated({
        limit: 0,
        'filter[date_between]': `${salaryManager.start_date},${salaryManager.end_date}`,
        'filter[employees.company]': company
      });

      const periodDates = buildDateRange(
        salaryManager.start_date,
        salaryManager.end_date
      );

      const employeesByCode = new Map(
        employees.map((employee) => [
          String(employee.employee_id).trim(),
          employee
        ])
      );

      const syncedByEmployee = new Map<
        number,
        Map<string, SyncTimekeepingEntry>
      >();
      employees.forEach((employee) => {
        const byDate = new Map<string, SyncTimekeepingEntry>();
        periodDates.forEach((date) => {
          byDate.set(date, {
            date,
            day_hours: 0,
            night_hours: 0,
            overtime_hours: 0
          });
        });
        syncedByEmployee.set(employee.id, byDate);
      });

      const attendanceRows = (attendanceResponse?.data ||
        []) as AttendanceResult[];
      attendanceRows.forEach((row) => {
        const employee = employeesByCode.get(String(row.employee_id).trim());
        if (!employee) return;

        const employeeRows = syncedByEmployee.get(employee.id);
        if (!employeeRows) return;

        const date = dayjs(row.date).format('YYYY-MM-DD');
        const current = employeeRows.get(date);
        if (!current) return;

        const administrativeHours = Number(row.administrative_hours || 0);
        if (row.shift === 1) current.day_hours = administrativeHours;
        if (row.shift === 2) current.night_hours = administrativeHours;
        current.overtime_hours = Number(row.overtime_hours || 0);

        employeeRows.set(date, current);
      });

      const payloadData = employees.map((employee) => ({
        employee_id: employee.id,
        timekeeping_data: Array.from(
          syncedByEmployee.get(employee.id)?.values() || []
        ).sort((a, b) => a.date.localeCompare(b.date))
      }));

      const syncResult = await updateTimekeepingBulk(salaryManagerId, {
        company,
        data: payloadData
      });

      await calculateSalary(
        salaryManagerId,
        buildCalculatePayload({
          company,
          employees,
          employeeIds: null,
          mode: 'be-calculate'
        })
      );

      return syncResult;
    },
    onSuccess: (res) => {
      message.success(res.message || 'Đồng bộ chấm công thành công!');
      queryClient.invalidateQueries({
        queryKey: ['salaryWebData', salaryManagerId, company]
      });
      queryClient.invalidateQueries({
        queryKey: ['payrollSummary', salaryManagerId, company]
      });
      setActiveTab('timekeeping');
    },
    onError: () => {
      message.error('Có lỗi khi đồng bộ dữ liệu attendance-calculate.');
    }
  });

  // ── Tab items ──────────────────────────────────────────────────────────
  const tabItems: TabsProps['items'] = [
    {
      key: 'category',
      label: (
        <span className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
          <FaListAlt className="text-gray-400" /> Danh mục
        </span>
      ),
      children: (
        <CategoryTab
          salaryManagerId={salaryManagerId}
          company={company}
          employees={employees}
          loading={isLoading}
          onRefresh={refetch}
        />
      )
    },
    {
      key: 'timekeeping',
      label: (
        <span className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
          <FaClock className="text-gray-400" /> Chấm công
        </span>
      ),
      children: (
        <TimekeepingTab
          salaryManagerId={salaryManagerId}
          company={company}
          employees={employees}
          loading={isLoading}
          salaryManager={salaryManager}
        />
      )
    },

    {
      key: 'calculation',
      label: (
        <span className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
          <FaCalculator className="text-gray-400" /> Bảng tính lương
        </span>
      ),
      children: (
        <CalculationTab salaryManagerId={salaryManagerId} company={company} />
      )
    },
    {
      key: 'payroll',
      label: (
        <span className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
          <FaMoneyCheckAlt className="text-gray-400" /> Bảng thanh toán lương
        </span>
      ),
      children: (
        <PayrollTab salaryManagerId={salaryManagerId} company={company} />
      )
    },
    {
      key: 'config',
      label: (
        <span className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
          <FaCog className="text-gray-400" /> Tham số
        </span>
      ),
      children: <ConfigTab company={company} />
    }
  ];

  return (
    <>
      <BackButton />
      <ComponentCard
        title={
          <span className="flex items-center gap-2">
            <FaCalculator className="text-indigo-500" />
            {salaryManager?.title || 'Chi tiết bảng lương'}
          </span>
        }
        desc={
          salaryManager
            ? `Kỳ lương: ${salaryManager.start_date} → ${salaryManager.end_date}`
            : undefined
        }
      >
        <div className="space-y-5">
          {/* ── Action Bar ─────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-indigo-50/40 to-white p-4 dark:border-gray-700 dark:from-indigo-900/10 dark:to-gray-900/50">
            <RefreshButton isLoading={isFetching} refresh={refetch} />

            {/* Sync Attendance Button */}
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || employees.length === 0}
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <FaClock
                className={
                  syncMutation.isPending
                    ? 'animate-spin text-gray-400'
                    : 'text-blue-500'
                }
              />
              {syncMutation.isPending
                ? 'Đang đồng bộ...'
                : 'Đồng bộ máy chấm công'}
            </button>

            {/* Save Computed Results Button */}
            <button
              onClick={() => triggerCalculateAll()}
              disabled={isCalculatingAll || employees.length === 0}
              className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <FaSave />
              {isCalculatingAll ? 'Đang tính & lưu...' : 'Tính & Lưu kết quả'}
            </button>

            {/* Company Picker */}
            <div className="ml-auto flex items-center gap-2">
              <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Công ty:
              </span>
              <Radio.Group
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: 'A7A', value: 'a7a' },
                  { label: 'VVP', value: 'vvp' }
                ]}
              />
            </div>
          </div>

          {/* ── Error Alert ──────────────────────────────────── */}
          {isError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <Alert
                message="Có lỗi xảy ra"
                description="Không thể tải dữ liệu bảng lương. Vui lòng thử lại."
                type="error"
                showIcon
              />
            </div>
          )}

          {/* ── Tabs (Header Mode) ─────────────────────────────────────────── */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabPosition="top"
            size="small"
            type="line"
            animated={false}
            className="excel-tabs-container mt-4"
          />
        </div>
      </ComponentCard>
    </>
  );
}

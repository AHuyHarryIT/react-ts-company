import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Alert, Empty, Radio, Select, Spin, Tabs, TabsProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaFileInvoiceDollar,
  FaListAlt,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaReceipt,
  FaUser
} from 'react-icons/fa';
import { useIsMobile } from '@hooks/useIsMobile';

import { useCrudList } from '@/hooks/useCrudList';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddSalary } from '@components/salaries/AddModal';
import { AttendanceTable } from '@components/salaries/AttendanceTable';
import CategoryTable from '@components/salaries/CategoryTable';
import { PayslipDetailContent } from '@components/salaries/PayslipDetailContent';
import { SalaryDetailTable } from '@components/salaries/SalaryDetailTable';
import { SalaryTable } from '@components/salaries/SalaryTable';
import { fetchSalary, salariesService } from '@services/SalaryService';

type CompanyType = 'vvp' | 'a7a';

export default function SalaryList() {
  const isMobile = useIsMobile();
  const [company, setCompany] = useState<CompanyType>('vvp');
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);
  const [selectedSalaryDetailId, setSelectedSalaryDetailId] = useState<
    number | null
  >(null);

  const { data, pagination, queryResult } = useCrudList({
    service: salariesService,
    queryKey: 'salaries',
    initialFilters: {
      limit: 0,
      sort: '-end_date'
    }
  });

  const { isLoading, isFetching, refetch } = queryResult;

  const salaries = useMemo(() => data || [], [data]);
  const total = pagination.total || 0;

  const {
    data: selectedSalaryData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    isError: isDetailError
  } = useQuery({
    queryKey: ['adminSalaryPreview', selectedSalaryId, company],
    queryFn: () => fetchSalary({ id: selectedSalaryId!, company }),
    enabled: !!selectedSalaryId,
    placeholderData: keepPreviousData
  });

  const category = selectedSalaryData?.category ?? [];
  const salary = selectedSalaryData?.salary ?? [];
  const attendance = selectedSalaryData?.attendance ?? [];

  const salaryDetail = useMemo(
    () => selectedSalaryData?.salaryDetail ?? [],
    [selectedSalaryData?.salaryDetail]
  );

  const selectedSalary = useMemo(
    () => salaries.find((item) => String(item.id) === selectedSalaryId) || null,
    [salaries, selectedSalaryId]
  );

  const salaryOptions = useMemo(
    () =>
      salaries.map((item) => ({
        value: String(item.id),
        label: item.title,
        startDate: item.start_date,
        endDate: item.end_date
      })),
    [salaries]
  );

  const salaryDetailOptions = useMemo(
    () =>
      salaryDetail.map((item) => ({
        value: item.id,
        label: `${item.employee?.name || 'Chưa có tên'} - NV${item.employee_id}`,
        searchText: [
          item.employee?.name,
          item.employee_id,
          item.employee?.role?.role_name
        ]
          .filter(Boolean)
          .join(' ')
      })),
    [salaryDetail]
  );

  const selectedSalaryDetail = useMemo(
    () =>
      salaryDetail.find((item) => item.id === selectedSalaryDetailId) ||
      salaryDetail[0] ||
      null,
    [salaryDetail, selectedSalaryDetailId]
  );

  useEffect(() => {
    if (selectedSalaryId || !salaries.length) return;
    setSelectedSalaryId(String(salaries[0].id));
  }, [salaries, selectedSalaryId]);

  useEffect(() => {
    setSelectedSalaryDetailId(null);
  }, [selectedSalaryId, company]);

  useEffect(() => {
    if (!salaryDetail.length) {
      setSelectedSalaryDetailId(null);
      return;
    }

    const hasSelected = salaryDetail.some(
      (item) => item.id === selectedSalaryDetailId
    );

    if (!hasSelected) {
      setSelectedSalaryDetailId(salaryDetail[0].id);
    }
  }, [salaryDetail, selectedSalaryDetailId]);

  const salaryTabs: TabsProps['items'] = [
    {
      key: 'category',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaListAlt className="text-blue-500" />
          Danh mục
        </span>
      ),
      children: <CategoryTable data={category} loading={isDetailLoading} />
    },
    {
      key: 'salary',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaMoneyCheckAlt className="text-emerald-500" />
          Bảng lương thanh toán
        </span>
      ),
      children: (
        <SalaryTable
          data={salary}
          company={company}
          loading={isDetailLoading}
        />
      )
    },
    {
      key: 'salaryDetail',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaFileInvoiceDollar className="text-purple-500" />
          Bảng lương chi tiết
        </span>
      ),
      children: (
        <SalaryDetailTable data={salaryDetail} loading={isDetailLoading} />
      )
    },
    {
      key: 'timekeeping',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaClock className="text-orange-500" />
          Bảng lương chấm công
        </span>
      ),
      children: (
        <AttendanceTable
          data={attendance}
          company={company}
          loading={isDetailLoading}
        />
      )
    },
    {
      key: 'payslip',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaReceipt className="text-pink-500" />
          Phiếu lương
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <FaUser className="text-emerald-500" />
              Nhân viên
            </label>
            <Select
              className="w-full sm:max-w-md"
              placeholder="Chọn nhân viên để xem phiếu lương"
              value={selectedSalaryDetail?.id}
              options={salaryDetailOptions}
              showSearch
              optionFilterProp="searchText"
              onChange={setSelectedSalaryDetailId}
              loading={isDetailLoading || isDetailFetching}
            />
          </div>

          {selectedSalaryDetail ? (
            <PayslipDetailContent
              salaryDetails={selectedSalaryDetail}
              isLoading={isDetailLoading}
              error={null}
              showAttendanceComparison={false}
            />
          ) : (
            <Empty description="Không có phiếu lương trong kỳ này" />
          )}
        </div>
      )
    }
  ];

  return (
    <ComponentCard title="Quản lý bảng lương">
      <div className="space-y-5">
        {/* ── Action Bar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <AddSalary />
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <FaMoneyBillWave className="text-xs text-emerald-500" />
            <span className="text-xs text-gray-500">
              Tổng: <strong className="text-blue-600">{total}</strong> bản lương
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <FaReceipt className="text-emerald-500" />
                Phiếu lương đang xem
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedSalary
                  ? `${selectedSalary.title} (${dayjs(selectedSalary.start_date).format('DD/MM/YYYY')} - ${dayjs(selectedSalary.end_date).format('DD/MM/YYYY')})`
                  : 'Chọn kỳ lương để xem thông tin chi tiết'}
              </p>
            </div>

            <div className="grid w-full gap-3 xl:w-auto xl:grid-cols-[360px_220px]">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="text-emerald-500" />
                  Kỳ lương
                </label>
                <Select
                  value={selectedSalaryId ?? undefined}
                  options={salaryOptions}
                  onChange={setSelectedSalaryId}
                  placeholder="Chọn kỳ lương"
                  className="w-full"
                  showSearch
                  optionFilterProp="label"
                  size="large"
                  loading={isLoading}
                  optionRender={(option) => {
                    const optionData = option.data as {
                      label: string;
                      startDate: string;
                      endDate: string;
                    };

                    return (
                      <div className="py-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {optionData.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(optionData.startDate).format('DD/MM/YYYY')} -{' '}
                          {dayjs(optionData.endDate).format('DD/MM/YYYY')}
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Công ty
                </label>
                <Radio.Group
                  className="w-full"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  size="large"
                  options={[
                    { label: 'VVP', value: 'vvp' },
                    { label: 'A7A', value: 'a7a' }
                  ]}
                />
              </div>
            </div>
          </div>

          {isDetailError && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <Alert
                message="Không tải được thông tin bảng lương"
                description="Vui lòng thử lại hoặc chọn kỳ lương khác."
                type="error"
                showIcon
              />
            </div>
          )}

          <Spin spinning={isDetailLoading}>
            {selectedSalaryId ? (
              <Tabs
                items={salaryTabs}
                size={isMobile ? 'small' : 'large'}
                type={isMobile ? 'line' : 'card'}
                animated
                tabBarStyle={isMobile ? { marginBottom: 12 } : undefined}
              />
            ) : (
              <Empty description="Không có dữ liệu bảng lương" />
            )}
          </Spin>
        </div>
      </div>
    </ComponentCard>
  );
}

import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { Alert, Radio, Tabs, TabsProps } from 'antd';
import { useState } from 'react';
import {
  FaListAlt,
  FaMoneyCheckAlt,
  FaFileInvoiceDollar,
  FaClock
} from 'react-icons/fa';

import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AttendanceTable } from '@components/salaries/AttendanceTable';
import CategoryTable from '@components/salaries/CategoryTable';
import { SalaryDetailTable } from '@components/salaries/SalaryDetailTable';
import { SalaryTable } from '@components/salaries/SalaryTable';
import { fetchSalary } from '@services/SalaryService';
import { useIsMobile } from '@hooks/useIsMobile';

type CompanyType = 'vvp' | 'a7a';

const routeApi = getRouteApi('/_authenticated/admin/salaries/$id');

export default function SalaryDetail() {
  const { id } = routeApi.useParams();
  const isMobile = useIsMobile();

  const [company, setCompany] = useState<CompanyType>('vvp');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['fetchSalary', id, company],
    queryFn: () => fetchSalary({ id: id, company: company })
  });

  const { category, salary, salaryDetail, attendance } = data || {
    category: [],
    salary: [],
    salaryDetail: [],
    attendance: []
  };

  const SalaryTabs: TabsProps['items'] = [
    {
      key: 'category',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaListAlt className="text-blue-500" />
          Danh mục
        </span>
      ),
      children: <CategoryTable data={category} loading={isLoading} />
    },
    {
      key: 'salary',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaMoneyCheckAlt className="text-emerald-500" />
          Bảng lương thanh toán
        </span>
      ),
      children: <SalaryTable data={salary} loading={isLoading} />
    },
    {
      key: 'salaryDetail',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaFileInvoiceDollar className="text-purple-500" />
          Bảng lương chi tiết
        </span>
      ),
      children: <SalaryDetailTable data={salaryDetail} loading={isLoading} />
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
          loading={isLoading}
        />
      )
    }
  ];

  return (
    <>
      <BackButton />
      <ComponentCard title="Chi tiết bảng lương">
        <div className="space-y-5">
          {/* ── Action Bar ──────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
            <RefreshButton isLoading={isFetching} refresh={refetch} />
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
                  { label: 'VVP', value: 'vvp' },
                  { label: 'A7A', value: 'a7a' }
                ]}
              />
            </div>
          </div>

          {/* ── Error Alert ─────────────────────────────────────── */}
          {isError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <Alert
                message="Có lỗi xảy ra"
                description="Vui lòng thử lại sau"
                type="error"
                showIcon
              />
            </div>
          )}

          {/* ── Tabs ────────────────────────────────────────────── */}
          <Tabs
            items={SalaryTabs}
            size={isMobile ? 'small' : 'large'}
            type={isMobile ? 'line' : 'card'}
            animated
            tabBarStyle={isMobile ? { marginBottom: 12 } : undefined}
          />
        </div>
      </ComponentCard>
    </>
  );
}

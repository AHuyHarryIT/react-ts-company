import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customPaginationProps } from '@components/custom/PaginationProps.custom';
import { DateRangeCard } from '@components/ui/DateRangeCard';
import { fetchEmpSalaries, fetchSalaryDetail } from '@services/SalaryService';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Drawer,
  Empty,
  Input,
  Pagination,
  PaginationProps,
  Spin,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useState } from 'react';
import { FaSearch, FaMoneyBillWave, FaMoneyCheckAlt } from 'react-icons/fa';
import { SalaryDetailContent } from './SalaryDetailContent';

export default function SalariesList() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 12
  });
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);

  const {
    data: salaries,
    isFetching,
    isLoading,
    refetch,
    isError
  } = useQuery({
    queryKey: ['salariesList', 'employee', params],
    queryFn: async () => await fetchEmpSalaries(params),
    placeholderData: keepPreviousData
  });

  // Fetch detail when a salary is selected
  const {
    data: salaryDetails,
    isLoading: isDetailLoading,
    error: detailError
  } = useQuery({
    queryKey: ['salaryDetail', selectedSalaryId],
    queryFn: async () => {
      const response = await fetchSalaryDetail(selectedSalaryId!);
      return response;
    },
    enabled: !!selectedSalaryId,
    placeholderData: keepPreviousData
  });

  const paginationProps: PaginationProps = {
    ...customPaginationProps,
    pageSizeOptions: ['12', '24', '48', '60', '120', '240'],
    current: salaries?.current_page ?? 1,
    pageSize: salaries?.per_page ?? 12,
    total: salaries?.total ?? 0,
    onChange: (page, pageSize) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        limit: pageSize
      }));
    }
  };

  const handleSearch = debounce((value: string) => {
    setParams((prev) => ({
      ...prev,
      'filter[title]': value ? value : undefined
    }));
  }, 300);

  return (
    <>
      <ComponentCard
        title={
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-emerald-500" />
            <span>Danh sách bảng lương</span>
          </div>
        }
      >
        <div className="space-y-5">
          {/* ── Action Bar ──────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
            <RefreshButton isLoading={isFetching} refresh={refetch} />
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
              <Tag color="blue" className="!m-0 !text-xs">
                📋 Tổng: <strong>{salaries?.total ?? 0}</strong> bảng lương
              </Tag>
            </div>
          </div>

          {/* ── Filter Bar ──────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaSearch className="mr-1 inline-block text-gray-400" />
                Tìm kiếm
              </label>
              <Input.Search
                className="max-w-sm !rounded-lg"
                allowClear
                placeholder="Nhập tiêu đề bảng lương..."
                onChange={(e) => {
                  const inputValue = e.target.value;
                  handleSearch(inputValue);
                }}
              />
            </div>
          </div>

          {/* ── Error ──────────────────────────────────────────── */}
          {isError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <Alert
                message="Đã có lỗi xảy ra vui lòng thử lại sau"
                type="error"
                showIcon
              />
            </div>
          )}

          {/* ── Content ────────────────────────────────────────── */}
          <Spin spinning={isLoading}>
            {salaries && salaries.data.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {salaries.data.map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedSalaryId(String(item.id))}
                  >
                    <DateRangeCard
                      key={`schedule_${item.id}-${item.start_date}-${item.end_date}`}
                      title={item.title}
                      startDate={dayjs(item.start_date)}
                      endDate={dayjs(item.end_date)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
            <div className="mt-4">
              <Pagination {...paginationProps} />
            </div>
          </Spin>
        </div>
      </ComponentCard>

      {/* ── Salary Detail Drawer ──────────────────────────────── */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <FaMoneyCheckAlt className="text-emerald-500" />
            <span className="font-semibold">Chi tiết bảng lương</span>
          </div>
        }
        open={!!selectedSalaryId}
        onClose={() => setSelectedSalaryId(null)}
        width={600}
        placement="right"
        styles={{
          body: { padding: '16px', background: '#f9fafb' }
        }}
      >
        {selectedSalaryId && (
          <SalaryDetailContent
            salaryDetails={salaryDetails}
            isLoading={isDetailLoading}
            error={detailError}
          />
        )}
      </Drawer>
    </>
  );
}

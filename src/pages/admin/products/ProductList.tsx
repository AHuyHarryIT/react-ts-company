import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

import { DatePicker, Input, Select, Tabs, TabsProps } from 'antd';
import { useMemo, useState } from 'react';
import { FaSearch, FaRulerCombined, FaTag } from 'react-icons/fa';
import {
  FaBox as FaBox6,
  FaIndustry,
  FaChartBar,
  FaCheckDouble,
  FaCircleXmark,
  FaTruckFast,
  FaTrashCan,
  FaPlus
} from 'react-icons/fa6';

import axiosPrivate from '@/api/axiosInstance';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { Check200Table } from '@components/products/Check200Table';
import { Error200Table } from '@components/products/Error200Table';
import { ExportTable } from '@components/products/ExportTable';
import { ProduceTable } from '@components/products/ProduceTable';
import { TotalTable } from '@components/products/TotalTable';

import { QueryParams } from '@/types/queryParams';
import { useCrudList } from '@hooks/useCrudList';
import { ProductModelEnumOptions } from '@schemas/product/productModelEnum.enum';
import { ProductModelSizeEnumOptions } from '@schemas/product/productModelSizeEnum.enum';
import { productService } from '@services/ProductService';
import { ExportModal } from './ExportModal';

export default function ProductList() {
  const [month, setMonth] = useState<Dayjs | null>(dayjs().startOf('month'));

  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: [
      'totaldailyquantities',
      'totalmonthquantities',
      'dailyquantities'
    ],
    month: dayjs().format('YYYY-MM')
  });

  const { data: monthList } = useQuery<{ months: string[] }>({
    queryKey: ['months'],
    queryFn: () => {
      return axiosPrivate.get('/api/products/month-list');
    },
    placeholderData: keepPreviousData,
    // Month list ít thay đổi
    staleTime: 5 * 60 * 1000
  });

  const { queryResult } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: params
  });

  const months = useMemo(() => monthList?.months || [], [monthList]);

  const handleSearch = debounce((value: string) => {
    setParams((prev) => ({
      ...prev,
      'filter[search]': value || undefined
    }));
  }, 300);

  const productTabs: TabsProps['items'] = [
    {
      key: 'total',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaChartBar className="text-blue-500" />
          Tổng quan
        </span>
      ),
      children: (
        <TotalTable
          months={months}
          queryResult={queryResult}
          params={params}
          setParams={setParams}
        />
      )
    },
    {
      key: 'produce',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaIndustry className="text-emerald-500" />
          Hàng sản xuất
        </span>
      ),
      children: (
        <ProduceTable
          month={month}
          queryResult={queryResult}
          params={params}
          setParams={setParams}
        />
      )
    },
    {
      key: 'check-200',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaCheckDouble className="text-cyan-500" />
          Hàng kiểm 200%
        </span>
      ),
      children: (
        <Check200Table
          month={month}
          queryResult={queryResult}
          params={params}
          setParams={setParams}
        />
      )
    },
    {
      key: 'error-200',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaCircleXmark className="text-red-500" />
          Hàng lỗi 200%
        </span>
      ),
      children: (
        <Error200Table
          month={month}
          queryResult={queryResult}
          params={params}
          setParams={setParams}
        />
      )
    },
    {
      key: 'export',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaTruckFast className="text-amber-500" />
          Xuất hàng
        </span>
      ),
      children: (
        <ExportTable
          month={month}
          queryResult={queryResult}
          params={params}
          setParams={setParams}
        />
      )
    }
  ];

  return (
    <ComponentCard title="Quản lý sản phẩm">
      <div className="space-y-5">
        {/* ── Action Bar ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <RefreshButton
            isLoading={queryResult.isFetching}
            refresh={queryResult.refetch}
          />

          <Link to="/admin/products/add">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.97] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <FaPlus className="text-[10px] text-gray-500" />
              Thêm SP
            </button>
          </Link>

          <Link to="/admin/products/quantity/add">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.97] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <FaIndustry className="text-[10px] text-gray-500" />
              Thêm SL
            </button>
          </Link>

          <Link to="/admin/products/quantity/update">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.97] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <FaBox6 className="text-[10px] text-gray-500" />
              Cập nhật SL
            </button>
          </Link>

          <Link to="/admin/products/trash">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.97] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <FaTrashCan className="text-[10px] text-gray-500" />
              Thùng rác
            </button>
          </Link>

          <div className="ml-auto">
            <ExportModal />
          </div>
        </div>

        {/* ── Filter Bar ───────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                📅 Tháng
              </label>
              <DatePicker
                value={month}
                picker="month"
                placeholder="Chọn tháng"
                className="!rounded-lg"
                onChange={(date) => {
                  const newMonth = date
                    ? date.startOf('month')
                    : dayjs().startOf('month');
                  setMonth(newMonth);
                  setParams((prev) => ({
                    ...prev,
                    month: newMonth.format('YYYY-MM')
                  }));
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaTag className="mr-1 inline-block text-emerald-500" />
                Mã thùng
              </label>
              <Select
                options={ProductModelEnumOptions}
                placeholder="Chọn mã thùng"
                popupMatchSelectWidth={false}
                allowClear
                className="!rounded-lg"
                onSelect={(value) => {
                  setParams((prev) => ({
                    ...prev,
                    'filter[binCode]': value
                  }));
                }}
                onClear={() => {
                  setParams((prev) => ({
                    ...prev,
                    'filter[binCode]': undefined
                  }));
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaRulerCombined className="mr-1 inline-block text-orange-500" />
                Kích thước khuôn
              </label>
              <Select
                options={ProductModelSizeEnumOptions}
                placeholder="Chọn kích thước"
                popupMatchSelectWidth={false}
                allowClear
                className="!rounded-lg"
                onSelect={(value) => {
                  setParams((prev) => ({
                    ...prev,
                    'filter[moldSize]': value
                  }));
                }}
                onClear={() => {
                  setParams((prev) => ({
                    ...prev,
                    'filter[moldSize]': undefined
                  }));
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaSearch className="mr-1 inline-block text-gray-400" />
                Tìm kiếm
              </label>
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                className="!rounded-lg"
                onChange={(e) => {
                  const inputValue = e.target.value;
                  handleSearch(inputValue);
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <Tabs items={productTabs} type="card" size="large" animated />
      </div>
    </ComponentCard>
  );
}

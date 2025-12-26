import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

import { Button, DatePicker, Flex, Input, Select, Tabs, TabsProps } from 'antd';
import { useMemo, useState } from 'react';

import axiosPrivate from '@/api/axiosInstance';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { Check200Table } from '@components/products/Check200Table';
import { Error200Table } from '@components/products/Error200Table';
import { ExportTable } from '@components/products/ExportTable';
import { ProduceTable } from '@components/products/ProduceTable';
import { TotalTable } from '@components/products/TotalTable';

import { QueryParams } from '@/types/queryParams';
import { IconAdd, IconDelete } from '@components/icons';
import { useCrudList } from '@hooks/useCrudList';
import { ProductModelEnumOptions } from '@schemas/product/productModelEnum.enum';
import { ProductModelSizeEnumOptions } from '@schemas/product/productModelSizeEnum.enum';
import { productService } from '@services/ProductService';
import { FaBox, FaIndustry } from 'react-icons/fa6';
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
    }
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
      label: 'Tổng quan',
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
      label: 'Hàng sản xuất',
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
      label: 'Hàng kiểm 200%',
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
      label: 'Hàng lỗi 200%',
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
      label: 'Xuất hàng',
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
    <>
      <ComponentCard title="Danh sách sản phẩm">
        {/* Actions */}
        {/* TODO: implement actions */}
        <RefreshButton
          isLoading={queryResult.isFetching}
          refresh={queryResult.refetch}
        />
        <div className="flex flex-col flex-wrap gap-2">
          <Flex gap="small" wrap>
            <Link to="/admin/products/add">
              <Button variant="solid" color="green" icon={<IconAdd />}>
                Thêm sản phẩm
              </Button>
            </Link>

            <Link to="/admin/products/quantity/add">
              <Button variant="solid" color="blue" icon={<FaIndustry />}>
                Thêm sản lượng sản xuất
              </Button>
            </Link>
          </Flex>
          <Flex gap="small" wrap>
            <Link to="/admin/products/quantity/update">
              <Button variant="solid" color="blue" icon={<FaBox />}>
                Cập nhật sản lượng
              </Button>
            </Link>
            <Link to="/admin/products/trash">
              <Button variant="solid" color="gold" icon={<IconDelete />}>
                Sản phẩm đã xóa
              </Button>
            </Link>
          </Flex>
          <div>
            <ExportModal />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <DatePicker
            value={month}
            picker="month"
            placeholder="Chọn tháng"
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
          <Select
            options={ProductModelEnumOptions}
            placeholder="Chọn mã thùng"
            popupMatchSelectWidth={false}
            allowClear
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
          <Select
            options={ProductModelSizeEnumOptions}
            placeholder="Chọn kích thước khuôn"
            popupMatchSelectWidth={false}
            allowClear
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
          <Input.Search
            className="col-span-1"
            placeholder="Tìm kiếm sản phẩm"
            allowClear
            onChange={(e) => {
              const inputValue = e.target.value;
              handleSearch(inputValue);
            }}
          />
        </div>
        {/* Tabs */}
        <Tabs items={productTabs} type="card" />
      </ComponentCard>
    </>
  );
}

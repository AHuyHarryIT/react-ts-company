import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  Button,
  Collapse,
  DatePicker,
  Flex,
  Input,
  Select,
  Space,
  Tabs,
  TabsProps
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import axiosPrivate from '@/api/axiosInstance';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { Check200Table } from '@components/products/Check200Table';
import { Error200Table } from '@components/products/Error200Table';
import { ExportTable } from '@components/products/ExportTable';
import { ProduceTable } from '@components/products/ProduceTable';
import { TotalTable } from '@components/products/TotalTable';

import { QueryParams } from '@/types/queryParams';
import { IconAdd, IconDelete, IconFilter } from '@components/icons';
import { useCrudList } from '@hooks/useCrudList';
import { ProductModelEnumOptions } from '@schemas/product/productModelEnum.enum';
import { ProductModelSizeEnumOptions } from '@schemas/product/productModelSizeEnum.enum';
import { productService } from '@services/ProductService';
import { FaBox, FaIndustry } from 'react-icons/fa6';
import { ExportModal } from './ExportModal';

export default function ProductList() {
  const [month, setMonth] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [searchOn, setSearchOn] = useState<'name' | 'code'>('name');

  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: [
      'totaldailyquantities',
      'totalmonthquantities',
      'dailyquantities'
    ],
    month: dayjs(month).format('YYYY-MM')
  });

  const { data: monthList } = useQuery<{ months: string[] }>({
    queryKey: ['months'],
    queryFn: () => {
      return axiosPrivate.get('/api/products/month-list');
    }
  });

  const months = useMemo(() => monthList?.months || [], [monthList]);

  const { queryResult } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: params
  });

  useEffect(() => {
    const total = queryResult.data?.total || 0;
    const limit = params.limit || 50;
    const page = params.page || 1;
    if (total <= limit * (page - 1)) {
      setParams((prev) => ({ ...prev, page: 1 }));
    }
  }, [params.limit, params.page, queryResult.data?.total]);

  const productTabs: TabsProps['items'] = [
    {
      key: 'total',
      label: 'Tổng quan',
      children: (
        <TotalTable
          months={months}
          queryResult={queryResult}
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
              <Button
                size="large"
                variant="solid"
                color="green"
                icon={<IconAdd />}
              >
                Thêm sản phẩm
              </Button>
            </Link>

            <Link to="/admin/products/quantity/add">
              <Button
                size="large"
                variant="solid"
                color="blue"
                icon={<FaIndustry />}
              >
                Thêm sản lượng sản xuất
              </Button>
            </Link>
          </Flex>
          <Flex gap="small" wrap>
            <Link to="/admin/products/quantity/update">
              <Button
                size="large"
                variant="solid"
                color="blue"
                icon={<FaBox />}
              >
                Cập nhật sản lượng
              </Button>
            </Link>
            <Link to="/admin/products/trash">
              <Button
                size="large"
                variant="solid"
                color="gold"
                icon={<IconDelete />}
              >
                Sản phẩm đã xóa
              </Button>
            </Link>
          </Flex>
          <div>
            <ExportModal />
          </div>
        </div>
        <Collapse
          style={{ marginBottom: '1.5rem' }}
          items={[
            {
              key: 'filter',
              label: (
                <div className="flex items-center gap-1">
                  <IconFilter /> Bộ lọc
                </div>
              ),
              children: (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <DatePicker
                    picker="month"
                    placeholder="Chọn tháng"
                    onChange={(date) => {
                      setParams((prev) => ({
                        ...prev,
                        month: date
                          ? date.startOf('month').format('YYYY-MM')
                          : dayjs().startOf('month').format('YYYY-MM')
                      }));
                      setMonth(
                        date ? date.startOf('month') : dayjs().startOf('month')
                      );
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
                  <Space.Compact className="col-span-1 sm:col-span-2">
                    <Select
                      defaultValue={searchOn}
                      options={[
                        { label: 'Tên', value: 'name' },
                        { label: 'Mã', value: 'code' }
                      ]}
                      onChange={(value) => {
                        setSearchOn(value);
                      }}
                    />
                    <Input.Search
                      placeholder="Tìm kiếm sản phẩm"
                      allowClear
                      onSearch={(value) => {
                        setParams((prev) => ({
                          ...prev,
                          'filter[code]': undefined,
                          'filter[name]': undefined
                        }));
                        if (searchOn === 'code') {
                          setParams((prev) => ({
                            ...prev,
                            'filter[code]': value ? value : undefined
                          }));
                        } else {
                          setParams((prev) => ({
                            ...prev,
                            'filter[name]': value ? value : undefined
                          }));
                        }
                      }}
                    />
                  </Space.Compact>
                </div>
              ),
              showArrow: false
            }
          ]}
        />
        {/* Tabs */}
        <Tabs items={productTabs} type="card" />
      </ComponentCard>
    </>
  );
}

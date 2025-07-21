import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { Button, DatePicker, Flex, Tabs, TabsProps } from 'antd';
import { useMemo, useState } from 'react';

import axiosPrivate from '@/api/axiosInstance';
import ComponentCard from '@components/common/ComponentCard';
import { Check200Table } from '@components/products/Check200Table';
import { Error200Table } from '@components/products/Error200Table';
import { ExportTable } from '@components/products/ExportTable';
import { ProduceTable } from '@components/products/ProduceTable';
import { TotalTable } from '@components/products/TotalTable';

import { IconAdd, IconDelete, IconExport, IconFilter } from '@components/icons';
import { FaBox, FaIndustry } from 'react-icons/fa6';

export default function ProductList() {
  const [month, setMonth] = useState<Dayjs | null>(dayjs().startOf('month'));

  const { data: monthList } = useQuery<{ months: string[] }>({
    queryKey: ['months'],
    queryFn: () => {
      return axiosPrivate.get('/api/products/month-list');
    }
  });

  const months = useMemo(() => monthList?.months || [], [monthList]);

  const productTabs: TabsProps['items'] = [
    {
      key: 'total',
      label: 'Tổng quan',
      children: (
        <TotalTable
          month={month ? month.format('YYYY-MM') : ''}
          months={months}
        />
      )
    },
    {
      key: 'produce',
      label: 'Hàng sản xuất',
      children: <ProduceTable month={month} />
    },
    {
      key: 'check-200',
      label: 'Hàng kiểm 200%',
      children: <Check200Table month={month} />
    },
    {
      key: 'error-200',
      label: 'Hàng lỗi 200%',
      children: <Error200Table month={month} />
    },
    {
      key: 'export',
      label: 'Xuất hàng',
      children: <ExportTable month={month} />
    }
  ];

  return (
    <>
      <ComponentCard title="Danh sách sản phẩm">
        {/* Actions */}
        {/* TODO: implement actions */}
        <div className="flex flex-wrap justify-between gap-2">
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
            <Link to="/admin/products/quantity/update">
              <Button
                size="large"
                variant="solid"
                color="blue"
                icon={<FaBox />}
              >
                Cập nhật sản lượng MOQ, tồn đầu kỳ, tồn 200%
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
            <Button
              size="large"
              variant="solid"
              color="green"
              icon={<IconExport />}
              onClick={() => {
                console.log('Xuất excel');
              }}
            >
              Xuất excel
            </Button>
          </Flex>
          <Flex gap="small" wrap>
            <DatePicker
              picker="month"
              placeholder="Chọn tháng"
              onChange={(date) => {
                console.log('Selected month:', date);
                if (date) {
                  setMonth(date);
                }
              }}
              size="large"
            />

            <Button
              size="large"
              variant="solid"
              color="blue"
              icon={<IconFilter />}
              onClick={() => {
                console.log('Tìm kiếm nâng cao');
              }}
            >
              Tìm kiếm nâng cao
            </Button>
          </Flex>
        </div>
        {/* Tabs */}
        <Tabs items={productTabs} type="card" />
      </ComponentCard>
    </>
  );
}

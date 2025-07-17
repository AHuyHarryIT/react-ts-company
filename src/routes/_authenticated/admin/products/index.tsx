import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Flex, Select, Tabs, TabsProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import axiosPrivate from '@/api/axiosInstance';
import ComponentCard from '@components/common/ComponentCard';
import { Check200Table } from '@components/products/Check200Table';
import { Error200Table } from '@components/products/Error200Table';
import { ExportTable } from '@components/products/ExportTable';
import { ProduceTable } from '@components/products/ProduceTable';
import { TotalTable } from '@components/products/TotalTable';

import { IconAdd, IconDelete, IconExport, IconFilter } from '@components/icons';
import { FaBox, FaIndustry } from 'react-icons/fa6';

export const Route = createFileRoute('/_authenticated/admin/products/')({
  component: RouteComponent
});

function RouteComponent() {
  const [month, setMonth] = useState('');

  const { data: monthList } = useQuery<{ months: string[] }>({
    queryKey: ['months'],
    queryFn: () => {
      return axiosPrivate.get('/api/products/month-list');
    }
  });

  const months = useMemo(() => monthList?.months || [], [monthList]);
  const monthOptions =
    months.map((month) => ({
      value: month,
      label: month
    })) || [];

  useEffect(() => {
    setMonth(months[0]);
  }, [months]);

  const productTabs: TabsProps['items'] = [
    {
      key: 'total',
      label: 'Tổng quan',
      children: <TotalTable month={month} months={months} />
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
            {/* Month */}
            <Select
              placeholder={months[0] ? months[0] : 'Chọn thời gian'}
              options={monthOptions}
              onChange={(value) => {
                setMonth(value);
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

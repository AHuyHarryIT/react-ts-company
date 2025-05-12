import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Button, Flex, Select, Tabs, TabsProps, Tooltip } from 'antd';
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
      children: <TotalTable month={month} />
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
            <Tooltip title="Thêm sản phẩm">
              <Button
                size="large"
                variant="solid"
                color="green"
                icon={<IconAdd />}
                onClick={() => {
                  console.log('Thêm sản phẩm');
                }}
              />
            </Tooltip>
            <Tooltip title="Thêm sản lượng MOQ, tồn đầu kỳ, tồn 200%">
              <Button
                size="large"
                variant="solid"
                color="blue"
                icon={<FaBox />}
                onClick={() => {
                  console.log('Thêm sản lượng MOQ, tồn đầu kỳ, tồn 200%');
                }}
              />
            </Tooltip>
            <Tooltip title="Thêm sản lượng sản xuất">
              <Button
                size="large"
                variant="solid"
                color="blue"
                icon={<FaIndustry />}
                onClick={() => {
                  console.log('Thêm sản lượng sản xuất');
                }}
              />
            </Tooltip>
            <Tooltip title="Sản phẩm đã xóa">
              <Button
                size="large"
                variant="solid"
                color="gold"
                icon={<IconDelete />}
                onClick={() => {
                  console.log('Sản phẩm đã xóa');
                }}
              />
            </Tooltip>
            <Tooltip title="Xuất excel">
              <Button
                size="large"
                variant="solid"
                color="green"
                icon={<IconExport />}
                onClick={() => {
                  console.log('Xuất excel');
                }}
                children={'Export'}
              />
            </Tooltip>
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

            <Tooltip title="Tìm kiếm nâng cao">
              <Button
                size="large"
                variant="solid"
                color="blue"
                icon={<IconFilter />}
                onClick={() => {
                  console.log('Tìm kiếm nâng cao');
                }}
              />
            </Tooltip>
          </Flex>
        </div>
        {/* Tabs */}
        <Tabs items={productTabs} type="card" />
      </ComponentCard>
    </>
  );
}

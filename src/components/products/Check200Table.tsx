import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { QueryParams } from '@/types/queryParams';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { RowTableActions } from './RowTableActions';

export type Check200TableType = {
  id: string;
  name: string;
  code: string;
  startStock: number;
  incurred: number;

  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

interface Check200TableProps {
  month: Dayjs | null;
}

export const Check200Table: React.FC<Check200TableProps> = ({ month }) => {
  const [dataSource, setDataSource] = useState<Check200TableType[]>([]);
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: ['totaldailyquantities', 'totalmonthquantities'],
    month: dayjs(month).format('YYYY-MM')
  });

  const {
    data: tableData,
    pagination,
    queryResult
  } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: params
  });

  useEffect(() => {
    if (!tableData.length) return;

    const generateDataSource = () => {
      const newDataSource = tableData.map((product) => {
        const timeMap: Check200TableType['times'] = {};

        const totalMonthQuantities = product.totalmonthquantities || [];

        const startStock = totalMonthQuantities.find(
          (item) => item.status === 5
        )?.totalQuan;
        const incurred = totalMonthQuantities.find(
          (item) => item.status === 2
        )?.totalQuan;

        (product.totaldailyquantities || [])
          .filter((item) => item.status === 2)
          .forEach((time) => {
            const dateKey = dayjs(time.date).format('DD-MM-YYYY');

            if (!timeMap[dateKey]) {
              timeMap[dateKey] = { quantity: 0 };
            }
            timeMap[dateKey].quantity += time.totalQuan;
          });

        return {
          id: product.id,
          name: product.name,
          code: product.code,
          startStock: startStock || 0,
          incurred: incurred || 0,
          times: timeMap
        };
      });

      setDataSource(newDataSource);
    };

    generateDataSource();
  }, [tableData]);

  const dateColumns: TableColumnsType<Check200TableType> = Array.from({
    length: dayjs(month).daysInMonth()
  }).map((_, index) => {
    const date = dayjs(month)
      .date(index + 1)
      .format('DD-MM-YYYY');
    return {
      title: date,
      align: 'center',
      dataIndex: ['times', date, 'quantity'],
      key: `${date}_quantity`,
      minWidth: 100,
      className: index % 2 === 0 ? 'bg-indigo-200' : '',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 0
        });
      }
    };
  });

  const columns: TableColumnsType<Check200TableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      fixed: 'left',
      dataIndex: 'name'
    },
    {
      title: (
        <div>
          Tồn đầu kỳ
          <br />
          Hàng 200%
        </div>
      ),
      align: 'center',
      dataIndex: 'startStock',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: (
        <div>
          Phát sinh
          <br />
          Kiểm hàng 200%
        </div>
      ),
      align: 'center',
      dataIndex: 'incurred',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    ...dateColumns,
    {
      title: <div>Thao tác</div>,
      align: 'center',
      render: (_, record) => {
        return <RowTableActions productId={record.id} />;
      }
    }
  ];

  const tableProps: TableProps<Check200TableType> = {
    ...(customTableProps as unknown as TableProps<Check200TableType>),
    rowKey: (record) => ['check', record.id].join('-'),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: params.limit,
      current: params.page,
      total: pagination.total,
      showTotal: (total) => `Tổng ${total}`,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({ ...prev, page: page }));
      }
    }
  };

  return <Table {...tableProps} />;
};

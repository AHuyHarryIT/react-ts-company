import { UseQueryResult } from '@tanstack/react-query';
import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { customTableProps } from '@components/custom/TableProps.custom';
import { RowTableActions } from './RowTableActions';

export type Error200TableType = {
  id: string;
  name: string;
  code: string;
  total: number;
  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

interface Error200TableProps {
  month: Dayjs | null;
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const Error200Table: React.FC<Error200TableProps> = ({
  month,
  queryResult,
  setParams
}) => {
  const [dataSource, setDataSource] = useState<Error200TableType[]>([]);

  const { data: response } = queryResult;
  const { tableData, pagination } = useMemo(() => {
    return {
      tableData: response?.data || [],
      pagination: {
        current: response?.current_page,
        total: response?.total,
        pageSize: response?.per_page
      }
    };
  }, [response]);

  useEffect(() => {
    if (!tableData.length) return;

    const newDataSource = tableData.map((product) => {
      const timeMap: Error200TableType['times'] = {};

      const totalMonthQuantities = product.totalmonthquantities || [];

      const total = totalMonthQuantities.find(
        (item) => item.status === 6
      )?.totalQuan;

      (product.totaldailyquantities || [])
        .filter((item) => item.status === 6)
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
        total: total || 0,
        times: timeMap
      };
    });

    setDataSource(newDataSource);
  }, [tableData]);

  const dateColumns: TableColumnsType<Error200TableType> = Array.from({
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

  const columns: TableColumnsType<Error200TableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) =>
        index +
        1 +
        (pagination.pageSize ?? 50) * ((pagination.current ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      minWidth: 100,
      fixed: 'left',
      dataIndex: 'name'
    },
    {
      title: <div>Tổng cộng</div>,
      minWidth: 100,
      align: 'center',
      dataIndex: 'total',
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

  const tableProps: TableProps<Error200TableType> = {
    ...(customTableProps as unknown as TableProps<Error200TableType>),

    rowKey: (record) => ['error', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: pagination.pageSize,
      current: pagination.current,
      total: pagination.total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({ ...prev, limit: size }));
      },
      onChange: (page) => {
        setParams((prev) => ({ ...prev, page }));
      }
    }
  };

  return <Table {...tableProps} />;
};

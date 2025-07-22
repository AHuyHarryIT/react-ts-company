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
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const Check200Table: React.FC<Check200TableProps> = ({
  month,
  queryResult,
  setParams
}) => {
  const [dataSource, setDataSource] = useState<Check200TableType[]>([]);

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
      title: (
        <div>
          Tồn đầu kỳ
          <br />
          Hàng 200%
        </div>
      ),
      minWidth: 100,
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
      minWidth: 100,
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
      pageSize: pagination.pageSize,
      current: pagination.current,
      total: pagination.total,
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

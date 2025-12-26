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
import { calculateCheck200Product } from '@utils/calculateCheck200Product';
import { Link } from '@tanstack/react-router';

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
  params: QueryParams;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const Check200Table: React.FC<Check200TableProps> = ({
  month,
  queryResult,
  params,
  setParams
}) => {
  const [dataSource, setDataSource] = useState<Check200TableType[]>([]);

  const { data: response } = queryResult;
  const tableData = useMemo(() => response?.data || [], [response?.data]);
  const total = response?.total || 0;

  useEffect(() => {
    if (!tableData.length) return;

    const newDataSource = calculateCheck200Product(
      tableData
    ) as Check200TableType[];

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
        return value.toLocaleString({
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
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      minWidth: 100,
      fixed: 'left',
      dataIndex: 'name',
      render: (value, record) => {
        return (
          <Link to={'/admin/products/$id'} params={{ id: record.id }}>
            {value}
          </Link>
        );
      }
    },
    {
      title: <div>Mã sản phẩm</div>,
      minWidth: 100,
      dataIndex: 'code'
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
      fixed: 'left',
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
      fixed: 'left',
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
    scroll: {
      x: 'max-content',
      scrollToFirstRowOnChange: false
    },
    pagination: {
      ...customTableProps.pagination,
      pageSize: params.limit,
      current: params.page,
      total: total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page: page
        }));
      }
    }
  };

  return <Table {...tableProps} />;
};

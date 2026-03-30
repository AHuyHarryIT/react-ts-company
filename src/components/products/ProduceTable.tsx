import { UseQueryResult } from '@tanstack/react-query';
import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { customTableProps } from '@components/custom/TableProps.custom';
import { calculateProduceProduct } from '@utils/calculateProduceProduct';
import { RowTableActions } from './RowTableActions';
import { Link } from '@tanstack/react-router';

export type ProduceTableType = {
  id: string;
  name: string;
  code: string;
  total: number;
  times: {
    [date: string]: {
      shift1: number;
      shift2: number;
    };
  };
};

interface ProduceTableProps {
  month: Dayjs | null;
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  params: QueryParams;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const ProduceTable: React.FC<ProduceTableProps> = ({
  month,
  queryResult,
  params,
  setParams
}) => {
  const [dataSource, setDataSource] = useState<ProduceTableType[]>([]);

  const { data: response } = queryResult;
  const tableData = useMemo(() => response?.data || [], [response?.data]);
  const total = response?.total || 0;

  useEffect(() => {
    if (!tableData.length) return;

    const newDataSource = calculateProduceProduct(
      tableData
    ) as ProduceTableType[];

    setDataSource(newDataSource);
  }, [tableData]);

  const dateColumns: TableColumnsType<ProduceTableType> = Array.from({
    length: dayjs(month).daysInMonth()
  }).map((_, index) => {
    const date = dayjs(month)
      .date(index + 1)
      .format('DD-MM-YYYY');
    return {
      title: (
        <span className="text-xs">
          {dayjs(month)
            .date(index + 1)
            .format('DD/MM')}
        </span>
      ),
      align: 'center',
      width: 90,
      children: [
        {
          title: 'Ca 1',
          key: `${date}_shift1`,
          dataIndex: ['times', date, 'shift1'],
          align: 'center',
          className: index % 2 === 0 ? 'bg-indigo-200' : '',
          minWidth: 45,
          render: (value) => {
            if (!value) return '0';
            return value.toLocaleString({
              maximumFractionDigits: 0
            });
          }
        },
        {
          title: 'Ca 2',
          key: `${date}_shift2`,
          dataIndex: ['times', date, 'shift2'],
          align: 'center',
          className: index % 2 === 0 ? 'bg-indigo-200' : '',
          minWidth: 45,
          render: (value) => {
            if (!value) return '0';
            return value.toLocaleString({
              maximumFractionDigits: 0
            });
          }
        }
      ]
    };
  });

  const columns: TableColumnsType<ProduceTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      width: 50,
      align: 'center',
      responsive: ['md'],
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      key: 'name',
      dataIndex: 'name',
      width: 120,
      fixed: 'left',
      ellipsis: true,
      render: (value, record) => {
        return (
          <Link to={'/admin/products/$id'} params={{ id: record.id }}>
            {value}
          </Link>
        );
      }
    },
    {
      title: <div>Mã SP</div>,
      width: 90,
      dataIndex: 'code',
      responsive: ['lg']
    },
    {
      title: <div className="text-xs">Tổng</div>,
      key: 'total',
      dataIndex: 'total',
      width: 70,
      align: 'center',
      render: (value) => {
        if (!value) return 0;
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

  const tableProps: TableProps<ProduceTableType> = {
    ...(customTableProps as unknown as TableProps<ProduceTableType>),
    rowKey: (record) => ['produce', record.id].join('-'),
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

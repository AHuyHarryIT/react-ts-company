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
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const ProduceTable: React.FC<ProduceTableProps> = ({
  month,
  queryResult,
  setParams
}) => {
  const [dataSource, setDataSource] = useState<ProduceTableType[]>([]);

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
      title: date,
      align: 'center',
      minWidth: 100,
      children: [
        {
          title: 'Ca 1',
          key: `${date}_shift1`,
          dataIndex: ['times', date, 'shift1'],
          align: 'center',
          className: index % 2 === 0 ? 'bg-indigo-200' : '',
          minWidth: 50,
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
          minWidth: 50,
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
      key: 'name',
      dataIndex: 'name',
      minWidth: 100,
      fixed: 'left',
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
      title: <div>Tổng cộng</div>,
      key: 'total',
      dataIndex: 'total',
      minWidth: 100,
      fixed: 'left',
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

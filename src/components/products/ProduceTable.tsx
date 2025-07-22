import { UseQueryResult } from '@tanstack/react-query';
import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { customTableProps } from '@components/custom/TableProps.custom';
import { productStatus } from '@constants/productStatus.enum';
import { dateTimeToShift } from '@utils/dateTimeToShift';
import { RowTableActions } from './RowTableActions';

export type ProduceTableType = {
  id: string;
  name: string;
  code: string;
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

    const newDataSource = tableData.map((product) => {
      const timeMap: ProduceTableType['times'] = {};

      const totalMonthQuantities = product.totalmonthquantities || [];

      const total = totalMonthQuantities.find(
        (item) => item.status == productStatus.enum.PRODUCE
      )?.totalQuan;

      (product.dailyquantities || [])
        .filter((item) => item.status == productStatus.enum.PRODUCE)
        .forEach((time) => {
          const dateKey = dayjs(time.date).format('DD-MM-YYYY');
          const shift = dateTimeToShift(dateKey, time.created_at);

          if (!timeMap[dateKey]) {
            timeMap[dateKey] = { shift1: 0, shift2: 0 };
          }

          if (shift === 1) {
            timeMap[dateKey].shift1 += time.quantity;
          } else if (shift === 2) {
            timeMap[dateKey].shift2 += time.quantity;
          }
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
            return value.toLocaleString('vi-VN', {
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
            return value.toLocaleString('vi-VN', {
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
      fixed: 'left'
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

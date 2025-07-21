import { Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { RowTableActions } from './RowTableActions';
import { dateTimeToShift } from '@utils/dateTimeToShift';
import { productStatus } from '@constants/productStatus.enum';
import { customTableProps } from '@components/custom/TableProps.custom';
import { QueryParams } from '@/types/queryParams';

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
  month: Dayjs | null; // MM-YYYY
}

export const ProduceTable: React.FC<ProduceTableProps> = ({ month }) => {
  const [dataSource, setDataSource] = useState<ProduceTableType[]>([]);
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: ['dailyquantities', 'totalmonthquantities'],
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
    };

    generateDataSource();
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
        index + 1 + (params.limit || 50) * ((params.page || 1) - 1)
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

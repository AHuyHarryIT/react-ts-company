import { Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { customTableProps } from '@components/custom/TableProps.custom';
import { ErrorTableType } from '@/types/poTableType';
import { errorDataSource } from '@utils/poDataUtil';

interface ErrorTableProps {
  month: Dayjs;
}

export const ErrorTable: React.FC<ErrorTableProps> = ({ month }) => {
  const [dataSource, setDataSource] = useState<ErrorTableType[]>([]);
  const [dayList, setDayList] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const {
    data: tableData,
    pagination,
    queryResult
  } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: {
      page: page,
      limit: limit,
      include: ['dailyquantities', 'totalmonthquantities'],
      month: month.format('YYYY-MM'),
      status: 6
    }
  });

  useEffect(() => {
    if (!pagination.total) return;
    setTotal(pagination.total || 0);
  }, [pagination.total]);

  useEffect(() => {
    if (month) {
      const day = dayjs(month, 'MM-YYYY');
      const daysInMonth = day.daysInMonth();

      const dayList = Array.from({ length: daysInMonth }, (_, i) =>
        day.date(i + 1).format('DD-MM-YYYY')
      );

      setDayList(dayList);
    }
  }, [month]);

  useEffect(() => {
    if (!tableData.length) return;
    const data = errorDataSource(tableData);
    setDataSource(data);
  }, [tableData]);

  const dateColumns: TableColumnsType<ErrorTableType> = dayList.map(
    (date, index) => {
      return {
        title: date,
        align: 'center',
        dataIndex: ['times', date, 'quantity'],
        className: index % 2 === 0 ? 'bg-indigo-200' : '',
        key: `${date}_quantity`,
        render: (value) => {
          if (!value) return '0';
          return value.toLocaleString('vi-VN', {
            maximumFractionDigits: 0
          });
        }
      };
    }
  );

  const columns: TableColumnsType<ErrorTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      fixed: 'left',
      dataIndex: 'name'
    },
    {
      title: <div>Tổng cộng</div>,
      align: 'center',
      dataIndex: 'total',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    ...dateColumns
  ];

  const tableProps: TableProps<ErrorTableType> = {
    ...(customTableProps as unknown as TableProps<ErrorTableType>),
    rowKey: (record) => ['error', record.id].join('-'),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: limit,
      current: page,
      total: total,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      }
    }
  };

  return <Table {...tableProps} />;
};

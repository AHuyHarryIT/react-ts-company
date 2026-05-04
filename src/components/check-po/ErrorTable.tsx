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
  search?: string;
}

export const ErrorTable: React.FC<ErrorTableProps> = ({ month, search }) => {
  const [dataSource, setDataSource] = useState<ErrorTableType[]>([]);
  const [dayList, setDayList] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  const {
    data: tableData,
    pagination,
    queryResult
  } = useCrudList({
    service: productService,
    queryKey: 'products-error',
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

    let data = errorDataSource(tableData);

    if (search) {
      const keyword = search.toLowerCase().trim();
      data = data.filter((item) => item.name?.toLowerCase().includes(keyword));
    }

    setDataSource(data);
  }, [tableData, search]);

  const nameColumnWidth = Math.min(
    240,
    Math.max(
      120,
      ...dataSource.map((item) => (item.name?.length || 0) * 6.2 + 28)
    )
  );

  const dateColumns: TableColumnsType<ErrorTableType> = dayList.map(
    (date, index) => {
      const dateObj = dayjs(date, 'DD-MM-YYYY');
      const isToday = dateObj.isSame(dayjs(), 'day');
      const dayColumnClass = isToday
        ? 'product-day-current'
        : index % 2 === 0
          ? 'product-day-alt'
          : '';

      return {
        title: (
          <div className={`product-day-pill ${isToday ? 'is-today' : ''}`}>
            {dateObj.format('DD/MM')}
          </div>
        ),
        width: 88,
        align: 'center',
        dataIndex: ['times', date, 'quantity'],
        className: dayColumnClass,
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
      width: 64,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      width: nameColumnWidth,
      fixed: 'left',
      dataIndex: 'name'
    },
    {
      title: <div>Tổng cộng</div>,
      align: 'center',
      width: 120,
      dataIndex: 'total',
      fixed: 'left',
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
    className: 'product-sticky-table',
    rowKey: (record) => ['error', record.id].join('-'),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    sticky: {
      offsetHeader: 0
    },
    scroll: {
      x: 'max-content',
      scrollToFirstRowOnChange: false
    },
    pagination: {
      ...customTableProps.pagination,
      position: ['bottomRight'],
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

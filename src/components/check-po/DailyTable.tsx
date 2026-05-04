import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { ProduceTableType } from '@/types/poTableType';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { produceDataSource } from '@utils/poDataUtil';

interface DailyTableProps {
  month: Dayjs;
  search?: string;
}

export const DailyTable: React.FC<DailyTableProps> = ({ month, search }) => {
  const [dataSource, setDataSource] = useState<ProduceTableType[]>([]);
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
    queryKey: 'products-daily',
    initialFilters: {
      page: page,
      limit: limit,
      include: ['dailyquantities', 'totalmonthquantities'],
      month: month.format('YYYY-MM'),
      status: 1
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

    let data = produceDataSource(tableData);

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

  const dateColumns: TableColumnsType<ProduceTableType> = dayList.map(
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
        width: 120,
        align: 'center',
        children: [
          {
            title: <span className="product-shift-label">Ca 1</span>,
            dataIndex: ['times', date, 'shift1'],
            align: 'center',
            className: dayColumnClass,
            width: 60,
            key: `${date}_shift1`,
            render: (value) => {
              if (!value) return '0';
              return value.toLocaleString({
                maximumFractionDigits: 0
              });
            }
          },
          {
            title: <span className="product-shift-label">Ca 2</span>,
            dataIndex: ['times', date, 'shift2'],
            align: 'center',
            className: dayColumnClass,
            width: 60,
            key: `${date}_shift2`,
            render: (value) => {
              if (!value) return '0';
              return value.toLocaleString({
                maximumFractionDigits: 0
              });
            }
          }
        ]
      };
    }
  );

  const columns: TableColumnsType<ProduceTableType> = [
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
      dataIndex: 'totalQuantity',
      fixed: 'left',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    ...dateColumns
  ];

  const tableProps: TableProps<ProduceTableType> = {
    ...(customTableProps as unknown as TableProps<ProduceTableType>),
    className: 'product-sticky-table',
    rowKey: (record) => ['produce', record.id].join('-'),
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

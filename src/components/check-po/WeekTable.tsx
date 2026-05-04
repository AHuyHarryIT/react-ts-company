import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { WeekTableType } from '@/types/poTableType';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { weeklyDataSource } from '@utils/poDataUtil';

interface WeekTableProps {
  month: Dayjs;
  startDate: Dayjs;
  endDate: Dayjs;
  search?: string;
}

export const WeekTable: React.FC<WeekTableProps> = ({
  month,
  startDate,
  endDate,
  search
}) => {
  const [dataSource, setDataSource] = useState<WeekTableType[]>([]);
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
    queryKey: 'products-weekly',
    initialFilters: {
      page: page,
      limit: limit,
      include: [
        'totaldailyquantities',
        'totalmonthquantities',
        'totaldailyquantitiespo'
      ],
      month: month.format('YYYY-MM')
    }
  });

  useEffect(() => {
    if (!pagination.total) return;
    setTotal(pagination.total || 0);
  }, [pagination.total]);

  useEffect(() => {
    // set day list from startDate to endDate
    if (startDate && endDate) {
      const daysInRange = endDate.diff(startDate, 'day') + 1;

      const dayList = Array.from({ length: daysInRange }, (_, i) =>
        startDate.add(i, 'day').format('DD-MM-YYYY')
      );

      setDayList(dayList);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (!tableData.length) return;

    let data = weeklyDataSource(tableData, startDate, endDate);

    // Client-side search filter
    if (search) {
      const keyword = search.toLowerCase().trim();
      data = data.filter((item) => item.name?.toLowerCase().includes(keyword));
    }

    setDataSource(data);
  }, [endDate, startDate, tableData, search]);

  const nameColumnWidth = Math.min(
    210,
    Math.max(
      110,
      ...dataSource.map((item) => (item.name?.length || 0) * 5.6 + 22)
    )
  );

  const dateColumns: TableColumnsType<WeekTableType> = dayList.map(
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
        dataIndex: ['times', date, 'exportQuantity'],
        className: dayColumnClass,
        key: `${date}_quantity`,
        render: (value) => {
          if (!value) return 0;
          return value.toLocaleString({
            maximumFractionDigits: 0
          });
        }
      };
    }
  );

  const columns: TableColumnsType<WeekTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      width: 64,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      width: nameColumnWidth,
      fixed: 'left',
      dataIndex: 'name'
    },
    {
      title: (
        <div>
          Tổng số lượng tồn
          <br />
          Hiện tại
        </div>
      ),
      align: 'center',
      width: 150,
      dataIndex: 'totalQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: <div>Còn lại trong tuần</div>,
      align: 'center',
      width: 140,
      dataIndex: 'totalReamingOfWeek',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: <div>Đã xuất trong tuần</div>,
      align: 'center',
      width: 120,
      dataIndex: 'exportQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: <div>Tồn đầu tuần</div>,
      align: 'center',
      width: 130,
      dataIndex: 'beginOfWeek',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    ...dateColumns
  ];

  const tableProps: TableProps<WeekTableType> = {
    ...(customTableProps as unknown as TableProps<WeekTableType>),
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

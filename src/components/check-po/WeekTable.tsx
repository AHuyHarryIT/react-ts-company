import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
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
}

export const WeekTable: React.FC<WeekTableProps> = ({
  month,
  startDate,
  endDate
}) => {
  const [dataSource, setDataSource] = useState<WeekTableType[]>([]);
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

    const data = weeklyDataSource(tableData, startDate, endDate);

    setDataSource(data);
  }, [endDate, startDate, tableData]);

  const dateColumns: TableColumnsType<WeekTableType> = dayList.map(
    (date, index) => {
      return {
        title: date,
        align: 'center',
        dataIndex: ['times', date, 'exportQuantity'],
        className: index % 2 === 0 ? 'bg-indigo-200' : '',
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
      title: (
        <div>
          Tổng số lượng tồn
          <br />
          Hiện tại
        </div>
      ),
      align: 'center',
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

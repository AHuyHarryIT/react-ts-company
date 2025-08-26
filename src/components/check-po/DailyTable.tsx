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
}

export const DailyTable: React.FC<DailyTableProps> = ({ month }) => {
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
    queryKey: 'products',
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

    const data = produceDataSource(tableData);
    setDataSource(data);
  }, [tableData]);

  const dateColumns: TableColumnsType<ProduceTableType> = dayList.map(
    (date, index) => {
      return {
        title: date,
        align: 'center',
        children: [
          {
            title: 'Ca 1',
            dataIndex: ['times', date, 'shift1'],
            align: 'center',
            className: index % 2 === 0 ? 'bg-indigo-200' : '',
            key: `${date}_shift1`,
            render: (value) => {
              if (!value) return '0';
              return value.toLocaleString({
                maximumFractionDigits: 0
              });
            }
          },
          {
            title: 'Ca 2',
            dataIndex: ['times', date, 'shift2'],
            align: 'center',
            className: index % 2 === 0 ? 'bg-indigo-200' : '',
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
      minWidth: 50,
      align: 'center',
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
      minWidth: 100,
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
    rowKey: (record) => ['produce', record.id].join('-'),
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

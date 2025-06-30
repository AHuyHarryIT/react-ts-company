import { Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { dateTimeToShift } from '@utils/dateTimeToShift';

export type ProduceTableType = {
  id: string;
  name: string;
  code: string;
  totalQuantity: number;
  times: {
    [date: string]: {
      shift1: number;
      shift2: number;
    };
  };
};

interface DailyTableProps {
  month: string; // MM-YYYY
}

export const DailyTable: React.FC<DailyTableProps> = ({ month }) => {
  const [dataSource, setDataSource] = useState<ProduceTableType[]>([]);
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
      month: month,
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

    const generateDataSource = () => {
      const newDataSource = tableData.map((product) => {
        const timeMap: ProduceTableType['times'] = {};
        const totalQuantity = (product.totalmonthquantities || [])
          .filter((item) => item.status === 1)
          .reduce((acc, item) => acc + item.totalQuan, 0);

        (product.dailyquantities || [])
          .filter((item) => item.status === 1)
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
          totalQuantity: totalQuantity,
          times: timeMap
        };
      });

      setDataSource(newDataSource);
    };

    generateDataSource();
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
      minWidth: 100,
      dataIndex: 'totalQuantity',
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
    rowKey: (record) => ['produce', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    size: 'small',
    scroll: { x: 'max-content' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      pageSize: limit,
      current: page,
      total: total,
      showTotal: (total) => `Tổng ${total}`,
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

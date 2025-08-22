import { Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { customTableProps } from '@components/custom/TableProps.custom';

export type WeekTableType = {
  id: string;
  name: string;
  code: string;
  totalQuantity: number;
  totalReamingOfWeek: number;
  exportQuantity: number;
  beginOfWeek: number;
  times: {
    [date: string]: {
      exportQuantity: number;
    };
  };
};

interface WeekTableProps {
  month: Dayjs;
  startDate: string;
  endDate: string;
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
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const daysInRange = end.diff(start, 'day') + 1;

      const dayList = Array.from({ length: daysInRange }, (_, i) =>
        start.add(i, 'day').format('DD-MM-YYYY')
      );

      setDayList(dayList);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (!tableData.length) return;

    const generateDataSource = () => {
      const newDataSource = tableData.map((product) => {
        const timeMap: WeekTableType['times'] = {};

        const totalMonthQuantities = product.totalmonthquantities || [];
        const totalDailyQuantities = product.totaldailyquantities || [];

        const totalDailyQuantitiesPO = product.totaldailyquantitiespo || [];

        const prevQuantity100 = totalDailyQuantities
          .filter(
            (item) =>
              item.status === 1 &&
              dayjs(item.date).isAfter(
                dayjs(startDate).startOf('month').subtract(1, 'day')
              ) &&
              dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
          )
          .reduce((acc, item) => acc + item.totalQuan, 0);

        const prevExportQuantity = totalDailyQuantitiesPO
          .filter(
            (item) =>
              item.status === 8 &&
              dayjs(item.date).isAfter(
                dayjs(startDate).startOf('month').subtract(1, 'day')
              ) &&
              dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
          )
          .reduce((acc, item) => acc + item.totalQuan, 0);

        const quantity100 = totalDailyQuantities
          .filter(
            (item) =>
              item.status === 1 &&
              dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
              dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
          )
          .reduce((acc, item) => acc + item.totalQuan, 0);

        const exportQuantity = totalDailyQuantitiesPO
          .filter(
            (item) =>
              item.status === 8 &&
              dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
              dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
          )
          .reduce((acc, item) => acc + item.totalQuan, 0);

        const errorQuantity =
          totalMonthQuantities.find((item) => item.status === 6)?.totalQuan ||
          0;

        // calculate begin of week
        let beginOfWeek = 0;

        beginOfWeek =
          totalMonthQuantities.find((item) => item.status === 4)?.totalQuan ||
          0;

        const reamingOfWeek =
          prevQuantity100 - prevExportQuantity + beginOfWeek;

        beginOfWeek =
          prevQuantity100 -
          quantity100 -
          (prevExportQuantity - exportQuantity) +
          beginOfWeek;

        const totalQuantity = quantity100 + beginOfWeek;
        const totalReamingOfWeek = reamingOfWeek - errorQuantity;

        totalDailyQuantitiesPO
          .filter(
            (item) =>
              item.status === 8 &&
              dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')) &&
              dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day'))
          )
          .map((item) => {
            const dateKey = dayjs(item.date).format('DD-MM-YYYY');
            if (!timeMap[dateKey]) {
              timeMap[dateKey] = { exportQuantity: 0 };
            }
            timeMap[dateKey].exportQuantity += item.totalQuan;
          });

        return {
          id: product.id,
          name: product.name,
          code: product.code,
          totalQuantity: totalQuantity || 0,
          totalReamingOfWeek: totalReamingOfWeek || 0,
          exportQuantity: exportQuantity || 0,
          beginOfWeek: beginOfWeek || 0,
          times: timeMap
        };
      });

      setDataSource(newDataSource);
    };

    generateDataSource();
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

import { Button, Flex, Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { IconDelete, IconEdit } from '@components/icons';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';

export type Error200TableType = {
  id: string;
  name: string;
  code: string;
  total: number;
  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

interface Error200TableProps {
  month: string; // MM-YYYY
}

export const Error200Table: React.FC<Error200TableProps> = ({ month }) => {
  const [dataSource, setDataSource] = useState<Error200TableType[]>([]);
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
      include: ['totaldailyquantities', 'totalmonthquantities'],
      month: month
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
        const timeMap: Error200TableType['times'] = {};

        const totalMonthQuantities = product.totalmonthquantities || [];

        const total = totalMonthQuantities.find(
          (item) => item.status === 6
        )?.totalQuan;

        (product.totaldailyquantities || [])
          .filter((item) => item.status === 6)
          .forEach((time) => {
            const dateKey = dayjs(time.date).format('DD-MM-YYYY');

            if (!timeMap[dateKey]) {
              timeMap[dateKey] = { quantity: 0 };
            }
            timeMap[dateKey].quantity += time.totalQuan;
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

  const dateColumns: TableColumnsType<Error200TableType> = dayList.map(
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

  const columns: TableColumnsType<Error200TableType> = [
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
    ...dateColumns,
    {
      title: <div>Thao tác</div>,
      align: 'center',
      render: (_, record) => {
        return (
          <Flex gap="small" justify="center">
            {/* TODO: Implement action */}
            <Button
              variant="solid"
              color="blue"
              icon={<IconEdit />}
              onClick={() => {
                console.log('Cập nhật sản phẩm', record.id);
              }}
            >
              Cập nhật
            </Button>
            <Button
              variant="solid"
              color="red"
              icon={<IconDelete />}
              onClick={() => {
                console.log('Xóa sản phẩm', record.id);
              }}
            >
              Xóa
            </Button>
          </Flex>
        );
      }
    }
  ];

  const tableProps: TableProps<Error200TableType> = {
    rowKey: (record) => ['error', record.id].join('-'),
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

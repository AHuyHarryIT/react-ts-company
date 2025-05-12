import { Button, Flex, Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { IconDelete, IconEdit } from '@components/icons';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';

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
  month: string; // MM-YYYY
}

// TODO: confirm shift time
const dateTimeToShift = (time: string) => {
  const date = dayjs(time).format('HH:mm');

  if (date >= '07:30' && date < '21:30') {
    return 1; // Shift 1
  }
  // end at 09:00 next day or 7:30 next day
  else if (date >= '21:30' && date < '09:00') {
    return 2; // Shift 2
  }
};

export const ProduceTable: React.FC<ProduceTableProps> = ({ month }) => {
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
      include: ['totaldailyquantities'],
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
        const timeMap: ProduceTableType['times'] = {};

        (product.totaldailyquantities || [])
          .filter((item) => item.status === 1)
          .forEach((time) => {
            const dateKey = dayjs(time.date).format('DD-MM-YYYY');
            const shift = dateTimeToShift(time.created_at);

            if (!timeMap[dateKey]) {
              timeMap[dateKey] = { shift1: 0, shift2: 0 };
            }

            if (shift === 1) {
              timeMap[dateKey].shift1 += time.totalQuan;
            } else if (shift === 2) {
              timeMap[dateKey].shift2 += time.totalQuan;
            }
          });

        return {
          id: product.id,
          name: product.name,
          code: product.code,
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
              return value.toLocaleString('vi-VN', {
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
              return value.toLocaleString('vi-VN', {
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
    ...dateColumns,
    {
      title: <div>Thao tác</div>,
      align: 'center',
      render: (_, record) => {
        return (
          <Flex gap="small" justify="center">
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

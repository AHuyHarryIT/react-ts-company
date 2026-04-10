import {
  Empty,
  Pagination,
  Spin,
  Table,
  TableColumnsType,
  TableProps
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { ProduceTableType } from '@/types/poTableType';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { useIsMobile } from '@hooks/useIsMobile';
import { productService } from '@services/ProductService';
import { produceDataSource } from '@utils/poDataUtil';

interface DailyTableProps {
  month: Dayjs;
  search?: string;
}

export const DailyTable: React.FC<DailyTableProps> = ({ month, search }) => {
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <Spin spinning={queryResult.isLoading}>
        {dataSource.length === 0 && !queryResult.isLoading ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <div className="flex flex-col gap-3">
            {dataSource.map((record, index) => {
              const activeDates = Object.entries(record.times ?? {}).filter(
                ([, vals]: [string, { shift1?: number; shift2?: number }]) =>
                  vals.shift1 || vals.shift2
              );
              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {index + 1 + limit * (page - 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-800 dark:text-white/90">
                        {record.name}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      Tổng cộng
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {record.totalQuantity?.toLocaleString() || '0'}
                    </span>
                  </div>

                  {activeDates.length > 0 && (
                    <details className="group mt-2">
                      <summary className="cursor-pointer rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-900/40 dark:text-gray-400 dark:hover:bg-gray-900/60">
                        Chi tiết {activeDates.length} ngày có dữ liệu
                      </summary>
                      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 dark:bg-gray-900/40">
                              <th className="px-2 py-1.5 text-left font-medium">
                                Ngày
                              </th>
                              <th className="px-2 py-1.5 text-center font-medium">
                                Ca 1
                              </th>
                              <th className="px-2 py-1.5 text-center font-medium">
                                Ca 2
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeDates.map(
                              ([date, vals]: [
                                string,
                                { shift1?: number; shift2?: number }
                              ]) => (
                                <tr
                                  key={date}
                                  className="border-t border-gray-50 dark:border-gray-800"
                                >
                                  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                                    {date}
                                  </td>
                                  <td className="px-2 py-1 text-center text-amber-600">
                                    {vals.shift1?.toLocaleString() || '-'}
                                  </td>
                                  <td className="px-2 py-1 text-center text-emerald-600">
                                    {vals.shift2?.toLocaleString() || '-'}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                </div>
              );
            })}

            {/* Pagination manually implemented for card view */}
            <div className="mt-4 flex justify-center">
              <Pagination
                size="small"
                current={page}
                total={total}
                pageSize={limit}
                onChange={(p, s) => {
                  setPage(p);
                  setLimit(s);
                }}
              />
            </div>
          </div>
        )}
      </Spin>
    );
  }

  return <Table {...tableProps} />;
};

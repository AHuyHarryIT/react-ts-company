import {
  Empty,
  Pagination,
  Spin,
  Table,
  TableColumnsType,
  TableProps
} from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';

import { WeekTableType } from '@/types/poTableType';
import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { useIsMobile } from '@hooks/useIsMobile';
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
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <Spin spinning={queryResult.isLoading}>
        {dataSource.length === 0 && !queryResult.isLoading ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <div className="flex flex-col gap-3">
            {dataSource.map((record, index) => {
              const activeDates = Object.entries(record.times ?? {}).filter(
                ([, vals]: [
                  string,
                  { exportQuantity?: number; [key: string]: unknown }
                ]) => Number(vals.exportQuantity) > 0
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

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900/40">
                      <div className="text-[10px] text-gray-500">
                        Tổng tồn hiện tại
                      </div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        {record.totalQuantity?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                      <div className="text-[10px] text-blue-500">
                        Đã xuất (tuần)
                      </div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {record.exportQuantity?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
                      <div className="text-[10px] text-orange-500">
                        Tồn đầu tuần
                      </div>
                      <div className="font-bold text-orange-600 dark:text-orange-400">
                        {record.beginOfWeek?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                      <div className="text-[10px] text-emerald-500">
                        Còn lại (tuần)
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {record.totalReamingOfWeek?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>

                  {activeDates.length > 0 && (
                    <details className="group mt-2">
                      <summary className="cursor-pointer rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-900/40 dark:text-gray-400 dark:hover:bg-gray-900/60">
                        Chi tiết {activeDates.length} ngày xuất hàng
                      </summary>
                      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 dark:bg-gray-900/40">
                              <th className="px-2 py-1.5 text-left font-medium">
                                Ngày
                              </th>
                              <th className="px-2 py-1.5 text-right font-medium">
                                Xuất
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeDates.map(
                              ([date, vals]: [
                                string,
                                {
                                  exportQuantity?: number;
                                  [key: string]: unknown;
                                }
                              ]) => (
                                <tr
                                  key={date}
                                  className="border-t border-gray-50 dark:border-gray-800"
                                >
                                  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                                    {date}
                                  </td>
                                  <td className="px-2 py-1 text-right font-medium text-indigo-600">
                                    {vals.exportQuantity?.toLocaleString() ||
                                      '-'}
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

import {
  Empty,
  Pagination,
  Spin,
  Table,
  TableColumnsType,
  TableProps
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

import { useCrudList } from '@hooks/useCrudList';
import { useIsMobile } from '@hooks/useIsMobile';
import { productService } from '@services/ProductService';
import { customTableProps } from '@components/custom/TableProps.custom';
import { ErrorTableType } from '@/types/poTableType';
import { errorDataSource } from '@utils/poDataUtil';

interface ErrorTableProps {
  month: Dayjs;
  search?: string;
}

export const ErrorTable: React.FC<ErrorTableProps> = ({ month, search }) => {
  const isMobile = useIsMobile();
  const [dataSource, setDataSource] = useState<ErrorTableType[]>([]);
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
    queryKey: 'products-error',
    initialFilters: {
      page: page,
      limit: limit,
      include: ['dailyquantities', 'totalmonthquantities'],
      month: month.format('YYYY-MM'),
      status: 6
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

    let data = errorDataSource(tableData);

    if (search) {
      const keyword = search.toLowerCase().trim();
      data = data.filter((item) => item.name?.toLowerCase().includes(keyword));
    }

    setDataSource(data);
  }, [tableData, search]);

  const dateColumns: TableColumnsType<ErrorTableType> = dayList.map(
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

  const columns: TableColumnsType<ErrorTableType> = [
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
      dataIndex: 'total',
      fixed: 'left',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    ...dateColumns
  ];

  const tableProps: TableProps<ErrorTableType> = {
    ...(customTableProps as unknown as TableProps<ErrorTableType>),
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
                  { quantity?: number | string; [key: string]: unknown }
                ]) => Number(vals.quantity) > 0
              );
              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-red-100 bg-white p-4 shadow-sm dark:border-red-900/40 dark:bg-gray-800"
                >
                  <div className="flex items-start gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600 dark:bg-red-900/50 dark:text-red-400">
                      {index + 1 + limit * (page - 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-800 dark:text-white/90">
                        {record.name}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">
                      Tổng lỗi
                    </span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {record.total?.toLocaleString() || '0'}
                    </span>
                  </div>

                  {activeDates.length > 0 && (
                    <details className="group mt-2">
                      <summary className="cursor-pointer rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-900/40 dark:text-gray-400 dark:hover:bg-gray-900/60">
                        Chi tiết {activeDates.length} ngày phát sinh lỗi
                      </summary>
                      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 dark:bg-gray-900/40">
                              <th className="px-2 py-1.5 text-left font-medium">
                                Ngày
                              </th>
                              <th className="px-2 py-1.5 text-right font-medium">
                                SL Lỗi
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeDates.map(
                              ([date, vals]: [
                                string,
                                { quantity?: number; [key: string]: unknown }
                              ]) => (
                                <tr
                                  key={date}
                                  className="border-t border-gray-50 dark:border-gray-800"
                                >
                                  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                                    {date}
                                  </td>
                                  <td className="px-2 py-1 text-right font-medium text-red-600">
                                    {vals.quantity?.toLocaleString() || '-'}
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

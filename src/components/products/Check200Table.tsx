import { UseQueryResult } from '@tanstack/react-query';
import {
  Table,
  TableColumnsType,
  TableProps,
  Tooltip,
  Pagination,
  Spin,
  Empty,
  Tag
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { customPaginationProps } from '@components/custom/PaginationProps.custom';
import { customTableProps } from '@components/custom/TableProps.custom';
import { RowTableActions } from './RowTableActions';
import { calculateCheck200Product } from '@utils/calculateCheck200Product';
import { useProductDrawer } from '@/contexts/ProductDrawerContext';
import { useIsMobile } from '@hooks/useIsMobile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

export type Check200TableType = {
  id: string;
  name: string;
  code: string;
  startStock: number;
  incurred: number;

  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

interface Check200TableProps {
  month: Dayjs | null;
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  params: QueryParams;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

/* ── Mobile Card ─────────────────────────────────────────────── */
const Check200MobileCard: React.FC<{
  record: Check200TableType;
  month: Dayjs | null;
  index: number;
}> = ({ record, month, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { openProduct } = useProductDrawer();

  const daysInMonth = dayjs(month).daysInMonth();
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    dayjs(month).date(i + 1)
  );

  const datesWithData = dates.filter((d) => {
    const key = d.format('DD-MM-YYYY');
    const entry = record.times[key];
    return entry && entry.quantity > 0;
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* ── Header ── */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-xs font-bold text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => openProduct(record.id)}
            className="text-left text-sm leading-tight font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {record.name}
          </button>
          <div className="mt-1 flex items-center gap-2">
            <Tag color="default" className="!m-0 !text-[10px]">
              {record.code}
            </Tag>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 px-3 py-2 dark:border-gray-700">
        <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center dark:bg-gray-700/40">
          <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">
            {record.startStock ? record.startStock.toLocaleString() : '0'}
          </div>
          <div className="text-[10px] text-gray-400">Tồn ĐK 200%</div>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center dark:bg-gray-700/40">
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {record.incurred ? record.incurred.toLocaleString() : '0'}
          </div>
          <div className="text-[10px] text-gray-400">Phát sinh KH</div>
        </div>
      </div>

      {/* ── Expand toggle ── */}
      {datesWithData.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 py-2 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600 dark:border-gray-700 dark:text-gray-500"
          >
            {expanded ? (
              <>
                Thu gọn <FaChevronUp className="text-[8px]" />
              </>
            ) : (
              <>
                Chi tiết ({datesWithData.length} ngày){' '}
                <FaChevronDown className="text-[8px]" />
              </>
            )}
          </button>

          {expanded && (
            <div className="border-t border-gray-100 px-3 pt-2 pb-3 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                <div>Ngày</div>
                <div className="text-right">Số lượng</div>
              </div>
              <div className="mt-1 max-h-60 space-y-0.5 overflow-y-auto">
                {datesWithData.map((d) => {
                  const key = d.format('DD-MM-YYYY');
                  const entry = record.times[key];
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-1.5 rounded-md px-1 py-1.5 text-xs odd:bg-gray-50 dark:odd:bg-gray-700/30"
                    >
                      <div className="font-medium text-gray-600 dark:text-gray-300">
                        {d.format('DD/MM')}
                      </div>
                      <div className="text-right font-semibold text-cyan-600 dark:text-cyan-400">
                        {entry?.quantity?.toLocaleString() || '0'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────── */
export const Check200Table: React.FC<Check200TableProps> = ({
  month,
  queryResult,
  params,
  setParams
}) => {
  const isMobile = useIsMobile();
  const { openProduct } = useProductDrawer();
  const [dataSource, setDataSource] = useState<Check200TableType[]>([]);

  const { data: response } = queryResult;
  const tableData = useMemo(() => response?.data || [], [response?.data]);
  const total = response?.total || 0;

  useEffect(() => {
    if (!tableData.length) return;

    const newDataSource = calculateCheck200Product(
      tableData
    ) as Check200TableType[];

    setDataSource(newDataSource);
  }, [tableData]);

  /* ── Mobile view ── */
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{total} sản phẩm</span>
        </div>

        {queryResult.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <>
            <div className="space-y-2">
              {dataSource.map((record, index) => (
                <Check200MobileCard
                  key={record.id}
                  record={record}
                  month={month}
                  index={
                    index + (params.limit ?? 50) * ((params.page ?? 1) - 1)
                  }
                />
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <Pagination
                {...customPaginationProps}
                size="small"
                current={params.page}
                pageSize={params.limit}
                total={total}
                showSizeChanger={false}
                onChange={(page) => {
                  setParams((prev) => ({ ...prev, page }));
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Desktop table (unchanged) ── */
  const dateColumns: TableColumnsType<Check200TableType> = Array.from({
    length: dayjs(month).daysInMonth()
  }).map((_, index) => {
    const dateObj = dayjs(month).date(index + 1);
    const date = dateObj.format('DD-MM-YYYY');
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
      align: 'center',
      dataIndex: ['times', date, 'quantity'],
      key: `${date}_quantity`,
      width: 88,
      className: dayColumnClass,
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    };
  });

  const columns: TableColumnsType<Check200TableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      width: 50,
      align: 'center',
      responsive: ['md'],
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      width: 100,
      fixed: 'left',
      dataIndex: 'name',
      ellipsis: true,
      render: (value, record) => {
        return (
          <Tooltip title={value} placement="topLeft">
            <button
              onClick={() => openProduct(record.id)}
              className="text-left font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {value}
            </button>
          </Tooltip>
        );
      }
    },
    {
      title: <div>Mã SP</div>,
      width: 90,
      dataIndex: 'code',
      responsive: ['lg']
    },
    {
      title: (
        <div className="text-sm leading-tight font-semibold">
          Tồn ĐK
          <br />
          200%
        </div>
      ),
      width: 88,
      fixed: 'left',
      align: 'center',
      dataIndex: 'startStock',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: (
        <div className="text-sm leading-tight font-semibold">
          Phát sinh
          <br />
          KH 200%
        </div>
      ),
      width: 88,
      fixed: 'left',
      align: 'center',
      dataIndex: 'incurred',
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
      width: 100,
      align: 'center',
      render: (_, record) => {
        return <RowTableActions productId={record.id} />;
      }
    }
  ];

  const tableProps: TableProps<Check200TableType> = {
    ...(customTableProps as unknown as TableProps<Check200TableType>),
    tableLayout: 'fixed',
    className: 'product-sticky-table admin-page-sticky-table',
    rowKey: (record) => ['check', record.id].join('-'),
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
      pageSize: params.limit,
      current: params.page,
      total: total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page: page
        }));
      }
    }
  };

  return <Table {...tableProps} />;
};

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
import { calculateProduceProduct } from '@utils/calculateProduceProduct';
import { RowTableActions } from './RowTableActions';
import { useProductDrawer } from '@/contexts/ProductDrawerContext';
import { useIsMobile } from '@hooks/useIsMobile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

export type ProduceTableType = {
  id: string;
  name: string;
  code: string;
  total: number;
  times: {
    [date: string]: {
      shift1: number;
      shift2: number;
    };
  };
};

interface ProduceTableProps {
  month: Dayjs | null;
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  params: QueryParams;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

/* ── Mobile Card ─────────────────────────────────────────────── */
const ProduceMobileCard: React.FC<{
  record: ProduceTableType;
  month: Dayjs | null;
  index: number;
}> = ({ record, month, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { openProduct } = useProductDrawer();

  const daysInMonth = dayjs(month).daysInMonth();
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    dayjs(month).date(i + 1)
  );

  // Only show dates with data
  const datesWithData = dates.filter((d) => {
    const key = d.format('DD-MM-YYYY');
    const entry = record.times[key];
    return entry && (entry.shift1 > 0 || entry.shift2 > 0);
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* ── Header ── */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
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
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {record.total ? record.total.toLocaleString() : '0'}
          </div>
          <div className="text-[10px] text-gray-400">Tổng SL</div>
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

          {/* ── Daily details ── */}
          {expanded && (
            <div className="border-t border-gray-100 px-3 pt-2 pb-3 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                <div>Ngày</div>
                <div className="text-center">Ca 1</div>
                <div className="text-center">Ca 2</div>
              </div>
              <div className="mt-1 max-h-60 space-y-0.5 overflow-y-auto">
                {datesWithData.map((d) => {
                  const key = d.format('DD-MM-YYYY');
                  const entry = record.times[key];
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-3 gap-1.5 rounded-md px-1 py-1.5 text-xs odd:bg-gray-50 dark:odd:bg-gray-700/30"
                    >
                      <div className="font-medium text-gray-600 dark:text-gray-300">
                        {d.format('DD/MM')}
                      </div>
                      <div className="text-center font-semibold text-blue-600 dark:text-blue-400">
                        {entry?.shift1 ? entry.shift1.toLocaleString() : 0}
                      </div>
                      <div className="text-center font-semibold text-indigo-600 dark:text-indigo-400">
                        {entry?.shift2 ? entry.shift2.toLocaleString() : 0}
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
export const ProduceTable: React.FC<ProduceTableProps> = ({
  month,
  queryResult,
  params,
  setParams
}) => {
  const isMobile = useIsMobile();
  const { openProduct } = useProductDrawer();
  const [dataSource, setDataSource] = useState<ProduceTableType[]>([]);

  const { data: response } = queryResult;
  const tableData = useMemo(() => response?.data || [], [response?.data]);
  const total = response?.total || 0;

  useEffect(() => {
    if (!tableData.length) return;

    const newDataSource = calculateProduceProduct(
      tableData
    ) as ProduceTableType[];

    setDataSource(newDataSource);
  }, [tableData]);

  /* ── Mobile view ── */
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{total} sản phẩm</span>
        </div>

        {/* Loading */}
        {queryResult.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <>
            {/* Cards */}
            <div className="space-y-2">
              {dataSource.map((record, index) => (
                <ProduceMobileCard
                  key={record.id}
                  record={record}
                  month={month}
                  index={
                    index + (params.limit ?? 50) * ((params.page ?? 1) - 1)
                  }
                />
              ))}
            </div>

            {/* Pagination */}
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
  const dateColumns: TableColumnsType<ProduceTableType> = Array.from({
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
      width: 120,
      children: [
        {
          title: <span className="product-shift-label">Ca 1</span>,
          key: `${date}_shift1`,
          dataIndex: ['times', date, 'shift1'],
          align: 'center',
          className: dayColumnClass,
          width: 60,
          render: (value) => {
            if (!value) return '0';
            return value.toLocaleString({
              maximumFractionDigits: 0
            });
          }
        },
        {
          title: <span className="product-shift-label">Ca 2</span>,
          key: `${date}_shift2`,
          dataIndex: ['times', date, 'shift2'],
          align: 'center',
          className: dayColumnClass,
          width: 60,
          render: (value) => {
            if (!value) return '0';
            return value.toLocaleString({
              maximumFractionDigits: 0
            });
          }
        }
      ]
    };
  });

  const columns: TableColumnsType<ProduceTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      width: 50,
      align: 'center',
      responsive: ['md'],
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      key: 'name',
      dataIndex: 'name',
      width: 100,
      fixed: 'left',
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
      title: <div className="text-sm font-semibold">Tổng</div>,
      key: 'total',
      dataIndex: 'total',
      width: 88,
      fixed: 'left',
      align: 'center',
      render: (value) => {
        if (!value) return 0;
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

  const tableProps: TableProps<ProduceTableType> = {
    ...(customTableProps as unknown as TableProps<ProduceTableType>),
    tableLayout: 'fixed',
    className: 'product-sticky-table admin-page-sticky-table',
    rowKey: (record) => ['produce', record.id].join('-'),
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

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
import { customTableProps } from '@components/custom/TableProps.custom';
import { RowTableActions } from './RowTableActions';
import { calculateExportProduct } from '@utils/calculateExportProduct';
import { Link } from '@tanstack/react-router';
import { useIsMobile } from '@hooks/useIsMobile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

export type ExportTableType = {
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

interface ExportTableProps {
  month: Dayjs | null;
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  params: QueryParams;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

/* ── Mobile Card ─────────────────────────────────────────────── */
const ExportMobileCard: React.FC<{
  record: ExportTableType;
  month: Dayjs | null;
  index: number;
}> = ({ record, month, index }) => {
  const [expanded, setExpanded] = useState(false);

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
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={'/admin/products/$id'}
            params={{ id: record.id }}
            className="text-sm leading-tight font-semibold text-gray-900 dark:text-white"
          >
            {record.name}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <Tag color="default" className="!m-0 !text-[10px]">
              {record.code}
            </Tag>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {record.total ? record.total.toLocaleString() : '0'}
          </div>
          <div className="text-[10px] text-gray-400">Tổng xuất</div>
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
                      <div className="text-right font-semibold text-amber-600 dark:text-amber-400">
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
export const ExportTable: React.FC<ExportTableProps> = ({
  month,
  queryResult,
  params,
  setParams
}) => {
  const isMobile = useIsMobile();
  const [dataSource, setDataSource] = useState<ExportTableType[]>([]);

  const { data: response } = queryResult;
  const tableData = useMemo(() => response?.data || [], [response?.data]);
  const total = response?.total || 0;

  useEffect(() => {
    if (!tableData.length) return;

    const newDataSource = calculateExportProduct(
      tableData
    ) as ExportTableType[];

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
                <ExportMobileCard
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
  const dateColumns: TableColumnsType<ExportTableType> = Array.from({
    length: dayjs(month).daysInMonth()
  }).map((_, index) => {
    const date = dayjs(month)
      .date(index + 1)
      .format('DD-MM-YYYY');
    return {
      title: (
        <span className="text-xs">
          {dayjs(month)
            .date(index + 1)
            .format('DD/MM')}
        </span>
      ),
      align: 'center',
      dataIndex: ['times', date, 'quantity'],
      key: `${date}_quantity`,
      width: 75,
      className: index % 2 === 0 ? 'bg-indigo-200' : '',
      render: (value) => {
        if (!value) return '0';
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    };
  });

  const columns: TableColumnsType<ExportTableType> = [
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
            <Link to={'/admin/products/$id'} params={{ id: record.id }}>
              {value}
            </Link>
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
      title: <div className="text-xs">Tổng</div>,
      width: 70,
      fixed: 'left',
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
        return <RowTableActions productId={record.id} />;
      }
    }
  ];

  const tableProps: TableProps<ExportTableType> = {
    ...(customTableProps as unknown as TableProps<ExportTableType>),
    rowKey: (record) => ['error', record.id].join('-'),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
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

import { useQuery, UseQueryResult } from '@tanstack/react-query';
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
import React, { useState } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { customTableProps } from '@components/custom/TableProps.custom';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { calculateTotalProduct } from '@utils/calculateTotalProduct';
import { RowTableActions } from './RowTableActions';
import { useProductDrawer } from '@/contexts/ProductDrawerContext';
import { useIsMobile } from '@hooks/useIsMobile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

export type TotalTableType = {
  id: string;
  name: string;
  code: string;
  stockMOQ: number;
  catonQuantity: number;
  planTime: number;
  realTime: number;
  FAPV: boolean;
  FASV: boolean;
  FAVV: boolean;
  stockStartQuantity: number;
  realityQuantity: number;
  exportQuantity: number;
  checked200: number;
  notCheck200: number;
  stockEndQuantity: number;
  storageTime: number;
  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

interface TotalTableProps {
  months?: string[];
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  params: QueryParams;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
  displayMode: string;
}

/* ── Mobile Stat Item ────────────────────────────────────────── */
const StatItem: React.FC<{
  label: string;
  value: string | number;
  color?: string;
}> = ({ label, value, color = 'text-gray-900 dark:text-white' }) => (
  <div className="rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-700/40">
    <div className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
      {label}
    </div>
    <div className={`text-sm font-bold ${color}`}>{value}</div>
  </div>
);

/* ── Mobile Card ─────────────────────────────────────────────── */
const TotalMobileCard: React.FC<{
  record: TotalTableType;
  months?: string[];
  index: number;
  displayMode: string;
}> = ({ record, months, index, displayMode }) => {
  const [expanded, setExpanded] = useState(false);
  const { openProduct } = useProductDrawer();

  const fmt = (v: number) => (v ? v.toLocaleString() : '0');
  const fmtDec = (v: number) =>
    v ? v.toLocaleString('en-US', { maximumFractionDigits: 1 }) : '0';

  // Month export data (only months with data)
  const monthsWithData = (months ?? []).filter((m) => {
    if (displayMode !== 'hide' && !m.endsWith(`-${displayMode}`)) return false;
    const entry = record.times[m];
    return entry && entry.quantity > 0;
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* ── Header ── */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => openProduct(record.id)}
            className="text-left text-sm leading-tight font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {record.name}
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag color="default" className="!m-0 !text-[10px]">
              {record.code}
            </Tag>
            {Boolean(record.FAPV) && (
              <Tag color="green" className="!m-0 !text-[10px]">
                FAPV
              </Tag>
            )}
            {Boolean(record.FASV) && (
              <Tag color="blue" className="!m-0 !text-[10px]">
                FASV
              </Tag>
            )}
            {Boolean(record.FAVV) && (
              <Tag color="purple" className="!m-0 !text-[10px]">
                FAVV
              </Tag>
            )}
          </div>
        </div>
      </div>

      {/* ── Key stats - always visible ── */}
      <div className="grid grid-cols-3 gap-1.5 border-t border-gray-100 px-3 py-2 dark:border-gray-700">
        <StatItem
          label="Tồn ĐK"
          value={fmt(record.stockStartQuantity)}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatItem
          label="Thực tế SX"
          value={fmt(record.realityQuantity)}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatItem
          label="Đã xuất"
          value={fmt(record.exportQuantity)}
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-3 pb-2 dark:border-gray-700">
        <StatItem
          label="Đã kiểm 200%"
          value={fmt(record.checked200)}
          color="text-cyan-600 dark:text-cyan-400"
        />
        <StatItem
          label="Chưa kiểm 200%"
          value={fmt(record.notCheck200)}
          color="text-red-600 dark:text-red-400"
        />
        <StatItem
          label="Tồn CK"
          value={fmt(record.stockEndQuantity)}
          color="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* ── Expand toggle ── */}
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
            Thêm chi tiết <FaChevronDown className="text-[8px]" />
          </>
        )}
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="space-y-2 border-t border-gray-100 px-3 pt-2 pb-3 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-1.5">
            <StatItem label="SL MOQ" value={fmt(record.stockMOQ)} />
            <StatItem
              label="Thùng CATON/tháng"
              value={fmt(record.catonQuantity)}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <StatItem
              label="TG dự định (ngày)"
              value={fmtDec(record.planTime)}
            />
            <StatItem
              label="TG thực tế (ngày)"
              value={fmtDec(record.realTime)}
            />
            <StatItem label="Ngày tồn kho" value={fmtDec(record.storageTime)} />
          </div>

          {displayMode !== 'hide' && monthsWithData.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                Xuất theo từng tháng
              </div>
              <div className="mt-1 space-y-0.5">
                {monthsWithData.map((m) => (
                  <div
                    key={m}
                    className="grid grid-cols-2 gap-1.5 rounded-md px-1 py-1.5 text-xs odd:bg-gray-50 dark:odd:bg-gray-700/30"
                  >
                    <div className="font-medium text-gray-600 dark:text-gray-300">
                      Tháng {m}
                    </div>
                    <div className="text-right font-semibold text-blue-600 dark:text-blue-400">
                      {record.times[m]?.quantity?.toLocaleString() || '0'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────── */
export const TotalTable: React.FC<TotalTableProps> = ({
  months,
  queryResult,
  params,
  setParams,
  displayMode
}) => {
  const isMobile = useIsMobile();
  const { openProduct } = useProductDrawer();

  const { data: response } = queryResult;
  const tableData = response?.data || [];
  const total = response?.total || 0;

  const { data: monthlyQuantities } = useQuery({
    queryKey: ['month-quantities'],
    queryFn: () => {
      return getMonthlyQuantities({ limit: 0, status: 3 });
    }
  });

  const dataSource = calculateTotalProduct(
    tableData,
    monthlyQuantities ?? []
  ) as TotalTableType[];

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
                <TotalMobileCard
                  key={record.id}
                  record={record}
                  months={months}
                  index={
                    index + (params.limit ?? 50) * ((params.page ?? 1) - 1)
                  }
                  displayMode={displayMode}
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
  const dateColumns: TableColumnsType<TotalTableType> = (months ?? []).map(
    (month) => {
      return {
        key: `${month}_quantity`,
        title: (
          <div>
            Số lượng
            <br />
            Đã xuất tháng {month}
          </div>
        ),
        minWidth: 100,
        align: 'center',
        className: 'bg-indigo-300',
        dataIndex: ['times', month, 'quantity'],
        render: (value) => {
          if (!value) return 0;
          return value.toLocaleString();
        }
      };
    }
  );

  const monthlyCols = dateColumns
    .filter(
      (col) =>
        typeof col.key === 'string' &&
        col.key.includes(`-${displayMode}_quantity`)
    )
    .reverse();
  const exportCols = displayMode !== 'hide' ? monthlyCols : [];

  const columns: TableColumnsType<TotalTableType> = [
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
        <div>
          Sản Lượng
          <br />
          (MOQ)
        </div>
      ),
      minWidth: 100,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'stockMOQ',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Thùng CATON/tháng
          <br />
          (MOQ)
        </div>
      ),
      minWidth: 120,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'catonQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Dự định
          <br />
          Thời gian hoạt động thiết bị
          <br />
          (ngày/tháng)
        </div>
      ),
      minWidth: 200,
      align: 'center',
      dataIndex: 'planTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: (
        <div>
          Thực tế
          <br />
          Thời gian hoạt động thiết bị
          <br />
          (ngày/tháng)
        </div>
      ),
      minWidth: 200,
      align: 'center',
      dataIndex: 'realTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div>FAPV出荷</div>,
      className: 'bg-indigo-300',
      minWidth: 50,
      align: 'center',
      dataIndex: 'FAPV',
      render: (value) => {
        if (!value) return '';
        return value ? '〇' : '';
      }
    },
    {
      title: <div>FASV出荷</div>,
      className: 'bg-indigo-300',
      minWidth: 50,
      align: 'center',
      dataIndex: 'FASV',
      render: (value) => {
        if (!value) return '';
        return value ? '〇' : '';
      }
    },
    {
      title: <div>FAVV出荷</div>,
      className: 'bg-indigo-300',
      minWidth: 50,
      align: 'center',
      dataIndex: 'FAVV',
      render: (value) => {
        if (!value) return '';
        return value ? '〇' : '';
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn đầu kỳ
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'stockStartQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Thực tế
          <br />
          sản xuất
          <br />
          (cái/tháng)
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'realityQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số Lượng
          <br />
          đã xuất
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'exportQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đã kiểm 200%
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'checked200',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          chưa kiểm 200%
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'notCheck200',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn cuối kỳ
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'stockEndQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số ngày
          <br />
          tồn kho
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'storageTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 1
        });
      }
    },
    ...exportCols,
    {
      title: <div>Thao tác</div>,
      minWidth: 100,
      align: 'center',
      render: (_, record) => {
        return <RowTableActions productId={record.id} />;
      }
    }
  ];

  const tableProps: TableProps<TotalTableType> = {
    ...(customTableProps as unknown as TableProps<TotalTableType>),
    className: 'product-sticky-table',
    rowKey: (record) => ['product', record.id].join('-'),
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

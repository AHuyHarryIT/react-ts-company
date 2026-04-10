import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Typography, message, Spin, Input, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { StockTransactionService } from '@/services/StockTransactionService';
import {
  ApiErrorResponse,
  TransactionListResponse
} from '@/types/stockTransaction.types';

const { Text } = Typography;
const { Search } = Input;

// Match the new BE response format from GET /current-stock
interface CurrentStockApiResponse {
  summary: {
    total_products: number;
    total_bins: number;
    total_quantity: number;
  };
  stocks: CurrentStockRow[];
}

interface CurrentStockRow {
  product_id: number;
  product_code: string;
  product_name: string;
  material: string;
  color: string;
  lot: string;
  bins: string; // "1,2,3,4,5"
  bin_count: number;
  current_quantity: number;
}

// Interface for table display
interface GroupedStockItem {
  key: string;
  product_id: number;
  product_code: string;
  product_name: string;
  lot: string;
  lotDate: string; // yyyy-mm-dd for sorting
  lotDateDisplay: string; // dd/mm/yyyy for display
  shift: string;
  bins: number[];
  total_quantity: number;
  bin_count: number;
  exported_quantity: number;
  exported_bins: number[];
  total_bins_init: number;
}

// Parse lot code "A-ddmmyyyy-shift" → { date, shift, sortableDate }
const parseLotInfo = (lot: string) => {
  const parts = lot?.split('-') || [];
  if (parts.length >= 3) {
    const dateStr = parts[1]; // ddmmyyyy
    if (dateStr?.length === 8) {
      const dd = dateStr.substring(0, 2);
      const mm = dateStr.substring(2, 4);
      const yyyy = dateStr.substring(4, 8);
      return {
        sortableDate: `${yyyy}-${mm}-${dd}`,
        displayDate: `${dd}/${mm}/${yyyy}`,
        shift: parts[2]
      };
    }
  }
  return { sortableDate: '', displayDate: '', shift: '' };
};

const CurrentStockDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({
    current: 1,
    pageSize: 50
  });
  const [stockData, setStockData] = useState<CurrentStockApiResponse | null>(
    null
  );
  const [filters, setFilters] = useState<{
    productId?: number;
    lot?: string;
    showEmpty?: boolean;
  }>({ showEmpty: false });
  const [exportData, setExportData] = useState<
    Map<string, { qty: number; bins: number[] }>
  >(new Map());

  // Build product options for filter dropdown
  const productOptions = useMemo(() => {
    if (!stockData?.stocks) return [];
    const seen = new Map<number, string>();
    stockData.stocks.forEach((item) => {
      if (!seen.has(item.product_id)) {
        seen.set(
          item.product_id,
          `${item.product_name} (${item.product_code})`
        );
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({
      value: id,
      label
    }));
  }, [stockData]);

  const loadCurrentStock = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await StockTransactionService.getCurrentStock(
        filters.productId
      )) as {
        success?: boolean;
        message?: string;
        data?: CurrentStockApiResponse;
      };

      if (
        result &&
        typeof result === 'object' &&
        'success' in result &&
        result.success === false
      ) {
        message.error(
          (result as unknown as ApiErrorResponse).message ||
            'Có lỗi xảy ra khi tải dữ liệu'
        );
        setStockData(null);
        return;
      }

      // Extract the actual data from the response
      const data = result?.data as CurrentStockApiResponse;
      if (data) {
        setStockData(data);
      } else {
        setStockData(null);
      }
    } catch (error: unknown) {
      console.error('Load current stock error:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu tồn kho');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.productId]);

  useEffect(() => {
    loadCurrentStock();
  }, [loadCurrentStock]);

  useEffect(() => {
    // Setup polling - refresh every 60 seconds
    const interval = setInterval(() => {
      loadCurrentStock();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadCurrentStock]);

  // Load export (out) transactions to show exported qty/bins per lot
  const loadExportData = useCallback(async () => {
    try {
      const result = await StockTransactionService.getTransactions({
        type: 'out',
        per_page: 10000
      });
      if (
        result &&
        !('success' in result && (result as ApiErrorResponse).success === false)
      ) {
        const txData = (result as TransactionListResponse).data || [];
        const map = new Map<string, { qty: number; bins: number[] }>();
        txData.forEach((tx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const flat = tx as any;
          const pId = flat.product_id || tx.storage_product?.product_id;
          const lot = flat.lot || tx.storage_product?.lot;
          const bin = flat.bin ?? tx.storage_product?.bin;
          const qty = Number(tx.quantity || 0);
          if (pId && lot) {
            const key = `${pId}_${lot}`;
            const existing = map.get(key) || { qty: 0, bins: [] };
            existing.qty += qty;
            if (bin != null && !existing.bins.includes(Number(bin))) {
              existing.bins.push(Number(bin));
            }
            map.set(key, existing);
          }
        });
        setExportData(map);
      }
    } catch (error) {
      console.error('Load export data error:', error);
    }
  }, []);

  useEffect(() => {
    loadExportData();
  }, [loadExportData]);

  // Transform API response to table data (lot-by-lot, memoized for stable pagination)
  const groupedStockItems = useMemo((): GroupedStockItem[] => {
    if (!stockData?.stocks) return [];

    let items = stockData.stocks;

    // Client-side product filter
    if (filters.productId) {
      items = items.filter((item) => item.product_id === filters.productId);
    }

    // Client-side text search
    if (filters.lot) {
      const search = filters.lot.toLowerCase();
      items = items.filter(
        (item: CurrentStockRow) =>
          item.lot?.toLowerCase().includes(search) ||
          item.product_name?.toLowerCase().includes(search) ||
          item.product_code?.toLowerCase().includes(search)
      );
    }

    // Filter empty bins
    if (!filters.showEmpty) {
      items = items.filter(
        (item: CurrentStockRow) => item.current_quantity > 0
      );
    }

    return (
      items
        .map((item: CurrentStockRow) => {
          const lotInfo = parseLotInfo(item.lot);
          const expInfo = exportData.get(`${item.product_id}_${item.lot}`);
          return {
            key: `${item.product_id}_${item.lot}`,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            lot: item.lot,
            lotDate: lotInfo.sortableDate,
            lotDateDisplay: lotInfo.displayDate,
            shift: lotInfo.shift,
            bins: item.bins
              ? item.bins
                  .split(',')
                  .map((b) => parseInt(b.trim()))
                  .filter((n) => !isNaN(n))
              : [],
            total_quantity: item.current_quantity,
            bin_count: item.bin_count,
            exported_quantity: expInfo?.qty || 0,
            exported_bins: expInfo?.bins || [],
            total_bins_init: item.bin_count + (expInfo?.bins?.length || 0)
          };
        })
        // Default sort: product name → newest date first
        .sort((a, b) => {
          const nameCompare = a.product_name.localeCompare(
            b.product_name,
            'vi'
          );
          if (nameCompare !== 0) return nameCompare;
          return b.lotDate.localeCompare(a.lotDate); // newest first
        })
    );
  }, [stockData, filters, exportData]);

  const handleRefresh = () => {
    loadCurrentStock();
    loadExportData();
  };

  const handleLotSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, lot: value || undefined }));
  };

  const stockColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 180,
      sorter: (a: GroupedStockItem, b: GroupedStockItem) =>
        a.product_name.localeCompare(b.product_name, 'vi'),
      render: (record: GroupedStockItem) => (
        <div>
          <div>
            <Text strong>{record.product_name}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.product_code}
          </Text>
        </div>
      )
    },
    {
      title: 'Ngày',
      key: 'lotDate',
      width: 100,
      align: 'center' as const,
      sorter: (a: GroupedStockItem, b: GroupedStockItem) =>
        a.lotDate.localeCompare(b.lotDate),
      render: (record: GroupedStockItem) => (
        <div>
          <div>
            <Text>{record.lotDateDisplay}</Text>
          </div>
          {record.shift && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Ca {record.shift}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Lot',
      dataIndex: 'lot',
      key: 'lot',
      width: 120,
      align: 'center' as const,
      render: (lot: string) => <Text code>{lot}</Text>
    },
    {
      title: 'Tồn kho',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 100,
      align: 'center' as const,
      render: (quantity: number) => (
        <Text strong style={{ color: quantity > 0 ? '#52c41a' : '#f5222d' }}>
          {Number(quantity || 0).toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Tổng số thùng',
      dataIndex: 'total_bins_init',
      key: 'total_bins_init',
      width: 120,
      align: 'center' as const,
      sorter: (a: GroupedStockItem, b: GroupedStockItem) =>
        a.total_bins_init - b.total_bins_init,
      render: (count: number) => <Text strong>{count} thùng</Text>
    },
    {
      title: 'SL đã xuất',
      dataIndex: 'exported_quantity',
      key: 'exported_quantity',
      width: 100,
      align: 'center' as const,
      sorter: (a: GroupedStockItem, b: GroupedStockItem) =>
        a.exported_quantity - b.exported_quantity,
      render: (quantity: number) => (
        <Text
          style={{
            color: quantity > 0 ? '#fa8c16' : '#d9d9d9',
            fontWeight: quantity > 0 ? 600 : 400
          }}
        >
          {Number(quantity || 0).toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Thùng đã xuất',
      dataIndex: 'exported_bins',
      key: 'exported_bins',
      width: 180,
      align: 'center' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (bins: any[]) => (
        <div className="flex flex-col items-center gap-1.5 py-1">
          <Text
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: bins?.length > 0 ? '#fa541c' : '#d9d9d9'
            }}
          >
            {bins?.length > 0 ? `${bins.length} thùng` : '—'}
          </Text>
          {bins && bins.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {[...bins]
                .sort((a: number, b: number) => a - b)
                .map((b) => (
                  <div
                    key={b}
                    className="min-w-[24px] rounded border border-orange-200 bg-orange-50 px-1 py-px text-center text-[10px] font-semibold text-orange-600 shadow-sm"
                  >
                    {b}
                  </div>
                ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thùng còn lại',
      key: 'bins_info',
      width: 250,
      align: 'center' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: unknown, record: any) => (
        <div className="flex flex-col items-center gap-1.5 py-1">
          <Text strong style={{ color: '#1890ff' }}>
            {record.bin_count} thùng
          </Text>
          {record.bins && record.bins.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {[...record.bins]
                .sort((a: number, b: number) => a - b)
                .map((b) => (
                  <div
                    key={b}
                    className="min-w-[24px] rounded border border-gray-300 bg-gray-50 px-1 py-px text-center text-[11px] font-semibold text-gray-700 shadow-sm"
                  >
                    {b}
                  </div>
                ))}
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading && !stockData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large">
          <div className="text-center">
            <div className="mt-4">
              <Text type="secondary">Đang tải dữ liệu tồn kho...</Text>
            </div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Summary + Controls */}
      <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
        {/* Row 1: Summary stats */}
        {loading ? (
          <div className="flex items-center gap-2">
            <Spin size="small" />
            <Text type="secondary" className="text-xs">
              Đang tải...
            </Text>
          </div>
        ) : stockData ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="text-xs font-medium text-gray-500">
              Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </span>
            <div className="hidden h-4 w-px bg-gray-200 sm:block" />
            <div>
              <span className="text-xs text-gray-400">Thùng</span>
              <span className="ml-1.5 text-base font-bold text-blue-600">
                {Number(stockData.summary?.total_bins || 0).toLocaleString(
                  'vi-VN'
                )}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Sản phẩm</span>
              <span className="ml-1.5 text-base font-bold text-purple-600">
                {Number(stockData.summary?.total_products || 0).toLocaleString(
                  'vi-VN'
                )}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Tổng SL</span>
              <span className="ml-1.5 text-base font-bold text-green-600">
                {Number(stockData.summary?.total_quantity || 0).toLocaleString(
                  'vi-VN'
                )}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Lots</span>
              <span className="ml-1.5 text-base font-bold text-orange-500">
                {Number(
                  stockData.stocks
                    ? new Set(
                        stockData.stocks.map(
                          (item) => `${item.product_id}_${item.lot}`
                        )
                      ).size
                    : 0
                ).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        ) : (
          <Text type="secondary">Không có dữ liệu</Text>
        )}

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            placeholder="Lọc sản phẩm"
            allowClear
            size="small"
            className="!w-full sm:!w-[200px]"
            options={productOptions}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, productId: value || undefined }))
            }
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Search
            placeholder="Tìm lot..."
            allowClear
            size="small"
            className="!w-full sm:!w-[160px]"
            onChange={(e) => handleLotSearch(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            size="small"
          >
            Tải lại
          </Button>
        </div>
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block">
        <Table
          columns={stockColumns}
          dataSource={groupedStockItems}
          rowKey="key"
          loading={loading}
          pagination={{
            current: tablePagination.current,
            pageSize: tablePagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
            size: 'small',
            onChange: (page, pageSize) =>
              setTablePagination({ current: page, pageSize })
          }}
          size="small"
          scroll={{ x: 1100 }}
        />
      </div>

      {/* Mobile: Card list */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="py-8 text-center text-gray-400">Đang tải...</div>
        ) : groupedStockItems.length === 0 ? (
          <div className="py-8 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <>
            <div className="space-y-2">
              {groupedStockItems
                .slice(
                  (tablePagination.current - 1) * tablePagination.pageSize,
                  tablePagination.current * tablePagination.pageSize
                )
                .map((item) => (
                  <div
                    key={item.key}
                    className="rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                  >
                    {/* Row 1: Product name + quantity */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Text strong className="text-sm">
                          {item.product_name}
                        </Text>
                        <div className="text-[10px] text-gray-400">
                          {item.product_code}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <Text
                          strong
                          style={{
                            color:
                              item.total_quantity > 0 ? '#52c41a' : '#f5222d',
                            fontSize: '15px'
                          }}
                        >
                          {Number(item.total_quantity || 0).toLocaleString(
                            'vi-VN'
                          )}
                        </Text>
                        <div className="text-[10px] text-gray-400">tồn kho</div>
                      </div>
                    </div>

                    {/* Row 2: Lot + Date + Shift */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>
                        Lot:{' '}
                        <Text code className="!text-[13px] !font-semibold">
                          {item.lot}
                        </Text>
                      </span>
                      {item.lotDateDisplay && (
                        <span>
                          {item.lotDateDisplay}
                          {item.shift ? ` · Ca ${item.shift}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Row 3: Bins info */}
                    <div className="mt-1.5 flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Tổng thùng:</span>
                        <Text strong>{item.total_bins_init} thùng</Text>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">Còn lại:</span>
                        <Text strong style={{ color: '#1890ff' }}>
                          {item.bin_count} thùng
                        </Text>
                      </div>
                      {item.bins?.length > 0 && (
                        <div className="flex w-full flex-wrap gap-1 border-t border-dashed border-gray-100 pt-1">
                          <span className="mt-0.5 mr-1 block text-gray-500">
                            Danh sách:
                          </span>
                          {[...item.bins]
                            .sort((a, b) => a - b)
                            .map((b) => (
                              <span
                                key={b}
                                className="rounded border border-gray-300 bg-gray-50 px-1 text-[10px] font-semibold text-gray-700"
                              >
                                {b}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Row 4: Export info */}
                    {(item.exported_quantity > 0 ||
                      item.exported_bins.length > 0) && (
                      <div className="mt-1.5 flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Đã xuất:</span>
                          <Text style={{ color: '#fa8c16' }}>
                            {Number(item.exported_quantity || 0).toLocaleString(
                              'vi-VN'
                            )}{' '}
                            SP
                          </Text>
                          {item.exported_bins.length > 0 && (
                            <>
                              <span className="text-gray-300">|</span>
                              <Text
                                style={{
                                  color: '#fa541c',
                                  fontSize: '11px',
                                  fontWeight: 600
                                }}
                              >
                                {item.exported_bins.length} thùng
                              </Text>
                            </>
                          )}
                        </div>
                        {item.exported_bins.length > 0 && (
                          <div className="flex w-full flex-wrap items-center gap-1 border-t border-dashed border-orange-100/50 pt-1">
                            <span className="mt-0.5 mr-1 block text-[10px] text-gray-400">
                              Đã xuất:
                            </span>
                            {[...item.exported_bins]
                              .sort((a, b) => a - b)
                              .map((b) => (
                                <span
                                  key={b}
                                  className="rounded border border-orange-200 bg-orange-50 px-1 text-[10px] font-semibold text-orange-600"
                                >
                                  {b}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Mobile pagination */}
            {groupedStockItems.length > tablePagination.pageSize && (
              <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                <span>
                  {(tablePagination.current - 1) * tablePagination.pageSize + 1}
                  -
                  {Math.min(
                    tablePagination.current * tablePagination.pageSize,
                    groupedStockItems.length
                  )}{' '}
                  / {groupedStockItems.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="small"
                    disabled={tablePagination.current <= 1}
                    onClick={() =>
                      setTablePagination((p) => ({
                        ...p,
                        current: p.current - 1
                      }))
                    }
                  >
                    ‹
                  </Button>
                  <span className="px-1.5 text-xs font-medium text-gray-600">
                    {tablePagination.current} /{' '}
                    {Math.ceil(
                      groupedStockItems.length / tablePagination.pageSize
                    )}
                  </span>
                  <Button
                    size="small"
                    disabled={
                      tablePagination.current * tablePagination.pageSize >=
                      groupedStockItems.length
                    }
                    onClick={() =>
                      setTablePagination((p) => ({
                        ...p,
                        current: p.current + 1
                      }))
                    }
                  >
                    ›
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentStockDashboard;

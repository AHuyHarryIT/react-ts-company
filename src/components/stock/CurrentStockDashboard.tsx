import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Typography,
  message,
  Spin,
  Input,
  Select,
  Drawer
} from 'antd';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import RefreshButton from '@/components/common/RefreshButton';

import { StockTransactionService } from '@/services/StockTransactionService';
import {
  ApiErrorResponse,
  TransactionListResponse
} from '@/types/stockTransaction.types';

const { Text } = Typography;

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
  has_exported: boolean;
}

interface ProductStockGroup {
  key: string;
  product_id: number;
  product_code: string;
  product_name: string;
  lots: GroupedStockItem[];
  lot_count: number;
  total_quantity: number;
  total_bins_init: number;
  remaining_bins: number;
  exported_quantity: number;
  exported_bins_count: number;
  exported_lot_count: number;
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
  const [detailRecord, setDetailRecord] = useState<ProductStockGroup | null>(
    null
  );
  const [exportedDetailRecord, setExportedDetailRecord] =
    useState<ProductStockGroup | null>(null);

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
          const currentQuantity = Number(item.current_quantity || 0);
          const binCount = Number(item.bin_count || 0);
          const exportedQty = expInfo?.qty || 0;
          const exportedBins = expInfo?.bins || [];
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
            total_quantity: currentQuantity,
            bin_count: binCount,
            exported_quantity: exportedQty,
            exported_bins: exportedBins,
            total_bins_init: binCount + exportedBins.length,
            has_exported: exportedQty > 0
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

  const productStockGroups = useMemo((): ProductStockGroup[] => {
    const map = new Map<number, ProductStockGroup>();

    groupedStockItems.forEach((item) => {
      const existing = map.get(item.product_id);
      if (existing) {
        existing.lots.push(item);
        existing.lot_count += 1;
        existing.total_quantity += item.total_quantity;
        existing.total_bins_init += item.total_bins_init;
        existing.remaining_bins += item.bin_count;
        existing.exported_quantity += item.exported_quantity;
        existing.exported_bins_count += item.exported_bins.length;
        if (item.has_exported) {
          existing.exported_lot_count += 1;
        }
      } else {
        map.set(item.product_id, {
          key: String(item.product_id),
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          lots: [item],
          lot_count: 1,
          total_quantity: item.total_quantity,
          total_bins_init: item.total_bins_init,
          remaining_bins: item.bin_count,
          exported_quantity: item.exported_quantity,
          exported_bins_count: item.exported_bins.length,
          exported_lot_count: item.has_exported ? 1 : 0
        });
      }
    });

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        lots: [...group.lots].sort((a, b) => {
          const dateCompare = b.lotDate.localeCompare(a.lotDate);
          if (dateCompare !== 0) return dateCompare;
          return a.lot.localeCompare(b.lot);
        })
      }))
      .sort((a, b) => a.product_id - b.product_id);
  }, [groupedStockItems]);

  const handleRefresh = () => {
    loadCurrentStock();
    loadExportData();
  };

  const handleLotSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, lot: value || undefined }));
  };

  const productColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 220,
      sorter: (a: ProductStockGroup, b: ProductStockGroup) =>
        a.product_id - b.product_id,
      defaultSortOrder: 'ascend' as const,
      render: (record: ProductStockGroup) => (
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
      title: 'Lots',
      dataIndex: 'lot_count',
      key: 'lot_count',
      width: 90,
      align: 'center' as const,
      sorter: (a: ProductStockGroup, b: ProductStockGroup) =>
        a.lot_count - b.lot_count,
      render: (_: number, record: ProductStockGroup) => (
        <span
          onClick={() => setDetailRecord(record)}
          className="cursor-pointer text-blue-500 hover:text-blue-700"
          style={{ borderBottom: '1px dashed currentColor' }}
        >
          {record.lot_count} lots{' '}
          <InfoCircleOutlined style={{ fontSize: 10 }} />
        </span>
      )
    },
    {
      title: 'Tồn kho',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 110,
      align: 'center' as const,
      sorter: (a: ProductStockGroup, b: ProductStockGroup) =>
        a.total_quantity - b.total_quantity,
      render: (quantity: number) => (
        <Text
          strong
          className="whitespace-nowrap"
          style={{ color: quantity > 0 ? '#52c41a' : '#f5222d' }}
        >
          {Number(quantity || 0).toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Tổng thùng',
      dataIndex: 'total_bins_init',
      key: 'total_bins_init',
      width: 120,
      align: 'center' as const,
      sorter: (a: ProductStockGroup, b: ProductStockGroup) =>
        a.total_bins_init - b.total_bins_init,
      render: (count: number) => <Text strong>{count} thùng</Text>
    },
    {
      title: 'Thùng còn',
      dataIndex: 'remaining_bins',
      key: 'remaining_bins',
      width: 110,
      align: 'center' as const,
      sorter: (a: ProductStockGroup, b: ProductStockGroup) =>
        a.remaining_bins - b.remaining_bins,
      render: (_: number, record: ProductStockGroup) => (
        <span
          onClick={() => setDetailRecord(record)}
          className="cursor-pointer font-semibold text-blue-500 hover:text-blue-700"
          style={{ borderBottom: '1px dashed currentColor' }}
        >
          {record.remaining_bins} thùng{' '}
          <InfoCircleOutlined style={{ fontSize: 10 }} />
        </span>
      )
    },
    {
      title: 'Đã xuất',
      key: 'exported',
      width: 140,
      align: 'center' as const,
      render: (_: unknown, record: ProductStockGroup) => {
        if (record.exported_lot_count > 0) {
          const label = `${record.exported_lot_count} lots`;
          return (
            <span
              onClick={() => {
                const exportedLots = record.lots.filter(
                  (lot) => lot.has_exported
                );
                const exportedRecord: ProductStockGroup = {
                  ...record,
                  lots: exportedLots,
                  lot_count: exportedLots.length,
                  total_quantity: exportedLots.reduce(
                    (sum, lot) => sum + lot.exported_quantity,
                    0
                  ),
                  total_bins_init: exportedLots.reduce(
                    (sum, lot) => sum + lot.exported_bins.length,
                    0
                  ),
                  remaining_bins: exportedLots.reduce(
                    (sum, lot) => sum + lot.bin_count,
                    0
                  ),
                  exported_quantity: exportedLots.reduce(
                    (sum, lot) => sum + lot.exported_quantity,
                    0
                  ),
                  exported_bins_count: exportedLots.reduce(
                    (sum, lot) => sum + lot.exported_bins.length,
                    0
                  ),
                  exported_lot_count: exportedLots.length
                };
                setExportedDetailRecord(exportedRecord);
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap text-orange-500 hover:text-orange-700"
              style={{
                borderBottom: '1px dashed currentColor'
              }}
            >
              <span>{label}</span>
              <InfoCircleOutlined
                className="shrink-0"
                style={{ fontSize: 10 }}
              />
            </span>
          );
        }
        return <Text style={{ color: '#d9d9d9' }}>Chưa có lot đã xuất</Text>;
      }
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
        <div className="stock-filter-row flex flex-wrap items-center gap-2">
          <Select
            placeholder="Lọc sản phẩm"
            allowClear
            size="small"
            className="stock-filter-control !w-full sm:!w-[200px]"
            options={productOptions}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, productId: value || undefined }))
            }
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Input
            placeholder="Tìm lot..."
            allowClear={false}
            suffix={<SearchOutlined />}
            size="small"
            className="stock-search-input !w-full sm:!w-[160px]"
            onChange={(e) => handleLotSearch(e.target.value)}
          />
          <RefreshButton
            refresh={handleRefresh}
            isLoading={loading}
            size="small"
            className="stock-filter-control"
          />
        </div>
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block">
        <Table
          columns={productColumns}
          dataSource={productStockGroups}
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
          scroll={{ x: 900 }}
        />
      </div>

      {/* Mobile: Card list */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="py-8 text-center text-gray-400">Đang tải...</div>
        ) : productStockGroups.length === 0 ? (
          <div className="py-8 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <>
            <div className="space-y-2">
              {productStockGroups
                .slice(
                  (tablePagination.current - 1) * tablePagination.pageSize,
                  tablePagination.current * tablePagination.pageSize
                )
                .map((product) => (
                  <div
                    key={product.key}
                    className="rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Text strong className="text-sm">
                          {product.product_name}
                        </Text>
                        <div className="text-[10px] text-gray-400">
                          {product.product_code}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <Text
                          strong
                          style={{
                            color:
                              product.total_quantity > 0
                                ? '#52c41a'
                                : '#f5222d',
                            fontSize: '15px'
                          }}
                        >
                          {Number(product.total_quantity || 0).toLocaleString(
                            'vi-VN'
                          )}
                        </Text>
                        <div className="text-[10px] text-gray-400">tồn kho</div>
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>{product.lot_count} lots</span>
                      <span>{product.total_bins_init} thùng tổng</span>
                      <span className="font-semibold text-blue-600">
                        {product.remaining_bins} thùng còn
                      </span>
                      {product.exported_bins_count > 0 && (
                        <span className="text-xs font-medium text-orange-600">
                          {product.exported_bins_count} thùng xuất
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-2">
                      {product.lots.map((lot) => (
                        <div
                          key={lot.key}
                          className="rounded border border-gray-100 bg-gray-50 px-2 py-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <Text code className="!text-[12px] !font-bold">
                                {lot.lot}
                              </Text>
                              {lot.lotDateDisplay && (
                                <div className="text-[10px] text-gray-400">
                                  {lot.lotDateDisplay}
                                  {lot.shift ? ` · Ca ${lot.shift}` : ''}
                                </div>
                              )}
                            </div>
                            <Text strong style={{ color: '#16a34a' }}>
                              {Number(lot.total_quantity || 0).toLocaleString(
                                'vi-VN'
                              )}
                            </Text>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-gray-500">
                              Còn: {lot.bin_count} thùng
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">
                              Tổng: {lot.total_bins_init} thùng
                            </span>
                            {lot.exported_quantity > 0 && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span className="text-orange-600">
                                  Xuất:{' '}
                                  {Number(
                                    lot.exported_quantity || 0
                                  ).toLocaleString('vi-VN')}
                                </span>
                              </>
                            )}
                          </div>

                          {lot.bins.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 border-t border-dashed border-gray-200 pt-1">
                              <span className="mr-1 text-[10px] text-gray-500">
                                Thùng còn:
                              </span>
                              {lot.bins.map((bin) => (
                                <span
                                  key={`${lot.key}-bin-${bin}`}
                                  className="rounded border border-gray-300 bg-white px-1 text-[10px] font-semibold text-gray-700"
                                >
                                  {bin}
                                </span>
                              ))}
                            </div>
                          )}

                          {lot.exported_bins.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 border-t border-dashed border-orange-100 pt-1">
                              <span className="mr-1 text-[10px] text-orange-500">
                                Thùng xuất:
                              </span>
                              {lot.exported_bins.map((bin) => (
                                <span
                                  key={`${lot.key}-export-bin-${bin}`}
                                  className="rounded border border-orange-200 bg-orange-50 px-1 text-[10px] font-semibold text-orange-600"
                                >
                                  {bin}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Mobile pagination */}
            {productStockGroups.length > tablePagination.pageSize && (
              <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                <span>
                  {(tablePagination.current - 1) * tablePagination.pageSize + 1}
                  -
                  {Math.min(
                    tablePagination.current * tablePagination.pageSize,
                    productStockGroups.length
                  )}{' '}
                  / {productStockGroups.length}
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
                      productStockGroups.length / tablePagination.pageSize
                    )}
                  </span>
                  <Button
                    size="small"
                    disabled={
                      tablePagination.current * tablePagination.pageSize >=
                      productStockGroups.length
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

      <Drawer
        title={
          <span className="text-base font-semibold text-gray-800">
            Lots / thùng của sản phẩm: {detailRecord?.product_name}
          </span>
        }
        placement="right"
        onClose={() => setDetailRecord(null)}
        open={!!detailRecord}
        width={480}
        styles={{
          body: { padding: '12px' },
          header: { borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }
        }}
      >
        {detailRecord && (
          <div className="flex flex-col gap-3">
            {detailRecord.lots.map((lot) => (
              <div
                key={lot.key}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <Text code className="text-sm font-bold text-gray-800">
                      {lot.lot}
                    </Text>
                    {lot.lotDateDisplay && (
                      <div className="mt-0.5 text-xs text-gray-400">
                        {lot.lotDateDisplay}
                        {lot.shift ? ` · Ca ${lot.shift}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      {Number(lot.total_quantity || 0).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-[10px] text-gray-400">còn tồn</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <span>Tổng: {lot.total_bins_init} thùng · </span>
                  <span className="font-semibold text-blue-600">
                    Còn: {lot.bin_count} thùng
                  </span>
                </div>

                {lot.bins.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-gray-100 pt-2">
                    {lot.bins
                      .sort((a, b) => a - b)
                      .map((bin) => (
                        <span
                          key={bin}
                          className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-700"
                        >
                          {bin}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <div className="text-gray-400">Lots</div>
                  <div className="text-lg font-bold text-blue-600">
                    {detailRecord.lot_count}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Tồn kho</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {Number(detailRecord.total_quantity || 0).toLocaleString(
                      'vi-VN'
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Thùng còn</div>
                  <div className="text-lg font-bold text-blue-600">
                    {detailRecord.remaining_bins}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        title={
          <span className="text-base font-semibold text-gray-800">
            Lots / thùng đã xuất: {exportedDetailRecord?.product_name}
          </span>
        }
        placement="right"
        onClose={() => setExportedDetailRecord(null)}
        open={!!exportedDetailRecord}
        width={480}
        styles={{
          body: { padding: '12px' },
          header: { borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }
        }}
      >
        {exportedDetailRecord && (
          <div className="flex flex-col gap-3">
            {exportedDetailRecord.lots.map((lot) => (
              <div
                key={lot.key}
                className="rounded-lg border border-orange-200 bg-white p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <Text code className="text-sm font-bold text-gray-800">
                      {lot.lot}
                    </Text>
                    {lot.lotDateDisplay && (
                      <div className="mt-0.5 text-xs text-gray-400">
                        {lot.lotDateDisplay}
                        {lot.shift ? ` · Ca ${lot.shift}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      {Number(lot.exported_quantity || 0).toLocaleString(
                        'vi-VN'
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">đã xuất</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <span>Tổng xuất: {lot.exported_bins.length} thùng</span>
                </div>

                {lot.exported_bins.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-orange-100 pt-2">
                    {lot.exported_bins
                      .sort((a, b) => a - b)
                      .map((bin) => (
                        <span
                          key={bin}
                          className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-600"
                        >
                          {bin}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2.5">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <div className="text-gray-400">Lots đã xuất</div>
                  <div className="text-lg font-bold text-orange-600">
                    {exportedDetailRecord.lot_count}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Tổng SL xuất</div>
                  <div className="text-lg font-bold text-orange-600">
                    {Number(
                      exportedDetailRecord.exported_quantity || 0
                    ).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Thùng đã xuất</div>
                  <div className="text-lg font-bold text-orange-600">
                    {exportedDetailRecord.exported_bins_count}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CurrentStockDashboard;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Typography, message, Spin, Input, Select, Drawer } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import RefreshButton from '@/components/common/RefreshButton';

import { StockTransactionService } from '@/services/StockTransactionService';
import { productService } from '@/services/ProductService';
import {
  ApiErrorResponse,
  TransactionListResponse
} from '@/types/stockTransaction.types';

const { Text } = Typography;
const { Search } = Input;

interface CurrentStockApiResponse {
  summary: {
    total_products: number;
    total_bins: number;
    total_quantity: number;
  };
  stocks: {
    product_id: number;
    product_code: string;
    product_name: string;
    material: string;
    color: string;
    lot: string;
    bins: string;
    bin_count: number;
    current_quantity: number;
  }[];
}

interface LotDetail {
  lot: string;
  quantity: number;
  bins: string;
  bin_count: number;
}

interface ProductSummaryRow {
  key: number;
  product_id: number;
  product_code: string;
  product_name: string;
  lot_count: number;
  total_quantity: number;
  total_bins: number;
  exported_quantity: number;
  exported_bins: number;
  lots: LotDetail[];
}

const ProductStockSummary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<CurrentStockApiResponse | null>(
    null
  );
  const [allProducts, setAllProducts] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [exportData, setExportData] = useState<
    Map<number, { qty: number; bins: number }>
  >(new Map());
  const [searchText, setSearchText] = useState('');
  const [filterProductId, setFilterProductId] = useState<number | undefined>();
  const [tablePagination, setTablePagination] = useState({
    current: 1,
    pageSize: 50
  });
  const [detailRecord, setDetailRecord] = useState<ProductSummaryRow | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all products, current stock, and export transactions in parallel
      const [stockResult, productsResult, exportResult] = await Promise.all([
        StockTransactionService.getCurrentStock() as Promise<{
          success?: boolean;
          data?: CurrentStockApiResponse;
        }>,
        productService.list({ limit: 0 }),
        StockTransactionService.getTransactions({
          type: 'out',
          per_page: 10000
        })
      ]);

      // Handle stock data
      if (stockResult?.success === false) {
        message.error(
          (stockResult as unknown as ApiErrorResponse).message ||
            'Có lỗi xảy ra'
        );
        setStockData(null);
      } else {
        const data = stockResult?.data as CurrentStockApiResponse;
        setStockData(data || null);
      }

      // Handle products data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawProducts = (productsResult as any)?.data || productsResult || [];
      const productList = (Array.isArray(rawProducts) ? rawProducts : []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => ({
          id: Number(p.id),
          code: String(p.code || ''),
          name: String(p.name || '')
        })
      );
      setAllProducts(productList);

      // Handle export data - aggregate by product_id
      if (
        exportResult &&
        !(
          'success' in exportResult &&
          (exportResult as unknown as ApiErrorResponse).success === false
        )
      ) {
        const txData = (exportResult as TransactionListResponse).data || [];
        const expMap = new Map<number, { qty: number; bins: Set<string> }>();
        txData.forEach((tx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const flat = tx as any;
          const pId = Number(flat.product_id || tx.storage_product?.product_id);
          const bin = flat.bin ?? tx.storage_product?.bin;
          const qty = Number(tx.quantity || 0);
          if (pId) {
            const existing = expMap.get(pId) || {
              qty: 0,
              bins: new Set<string>()
            };
            existing.qty += qty;
            if (bin != null) existing.bins.add(String(bin));
            expMap.set(pId, existing);
          }
        });
        const resultMap = new Map<number, { qty: number; bins: number }>();
        expMap.forEach((v, k) =>
          resultMap.set(k, { qty: v.qty, bins: v.bins.size })
        );
        setExportData(resultMap);
      }
    } catch {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build product options for filter (from all products)
  const productOptions = useMemo(() => {
    if (allProducts.length > 0) {
      return allProducts.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.code})`
      }));
    }
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
  }, [stockData, allProducts]);

  // Aggregate: group all lots by product → 1 row per product, include ALL products
  const summaryData = useMemo((): ProductSummaryRow[] => {
    // Build stock map from current stock data
    const stockItems =
      stockData?.stocks?.filter((s) => s.current_quantity > 0) || [];

    const map = new Map<
      number,
      {
        code: string;
        name: string;
        qty: number;
        bins: number;
        lots: Set<string>;
        lotDetails: LotDetail[];
      }
    >();

    stockItems.forEach((item) => {
      const existing = map.get(item.product_id);
      const lotDetail: LotDetail = {
        lot: item.lot,
        quantity: Number(item.current_quantity || 0),
        bins: item.bins || '',
        bin_count: Number(item.bin_count || 0)
      };
      if (existing) {
        existing.qty += Number(item.current_quantity || 0);
        existing.bins += Number(item.bin_count || 0);
        existing.lots.add(item.lot);
        existing.lotDetails.push(lotDetail);
      } else {
        map.set(item.product_id, {
          code: item.product_code,
          name: item.product_name,
          qty: Number(item.current_quantity || 0),
          bins: Number(item.bin_count || 0),
          lots: new Set([item.lot]),
          lotDetails: [lotDetail]
        });
      }
    });

    // Merge all products - products without stock get 0 values
    let rows: ProductSummaryRow[];
    if (allProducts.length > 0) {
      rows = allProducts.map((product) => {
        const stockInfo = map.get(product.id);
        const expInfo = exportData.get(product.id);
        return {
          key: product.id,
          product_id: product.id,
          product_code: stockInfo?.code || product.code,
          product_name: stockInfo?.name || product.name,
          lot_count: stockInfo?.lots.size || 0,
          total_quantity: stockInfo?.qty || 0,
          total_bins: stockInfo?.bins || 0,
          exported_quantity: expInfo?.qty || 0,
          exported_bins: expInfo?.bins || 0,
          lots: stockInfo?.lotDetails || []
        };
      });
    } else {
      rows = Array.from(map.entries()).map(([id, data]) => {
        const expInfo = exportData.get(id);
        return {
          key: id,
          product_id: id,
          product_code: data.code,
          product_name: data.name,
          lot_count: data.lots.size,
          total_quantity: data.qty,
          total_bins: data.bins,
          exported_quantity: expInfo?.qty || 0,
          exported_bins: expInfo?.bins || 0,
          lots: data.lotDetails
        };
      });
    }

    // Apply filters
    if (filterProductId) {
      rows = rows.filter((r) => r.product_id === filterProductId);
    }
    if (searchText) {
      const s = searchText.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.product_name.toLowerCase().includes(s) ||
          r.product_code.toLowerCase().includes(s)
      );
    }

    // Sort by product ID
    return rows.sort((a, b) => a.product_id - b.product_id);
  }, [stockData, filterProductId, searchText, allProducts, exportData]);

  // Total row
  const totals = useMemo(() => {
    return summaryData.reduce(
      (acc, r) => ({
        qty: acc.qty + r.total_quantity,
        bins: acc.bins + r.total_bins,
        lots: acc.lots + r.lot_count,
        expQty: acc.expQty + r.exported_quantity,
        expBins: acc.expBins + r.exported_bins
      }),
      { qty: 0, bins: 0, lots: 0, expQty: 0, expBins: 0 }
    );
  }, [summaryData]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 45,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 160,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.product_id - b.product_id,
      defaultSortOrder: 'ascend' as const,
      render: (record: ProductSummaryRow) => (
        <div>
          <Text strong>{record.product_name}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.product_code}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Chi tiết Lots / Thùng',
      key: 'lot_count',
      width: 150,
      align: 'center' as const,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.lot_count - b.lot_count,
      render: (_: number, record: ProductSummaryRow) =>
        record.lot_count > 0 || record.total_bins > 0 ? (
          <span
            onClick={() => setDetailRecord(record)}
            className="cursor-pointer text-blue-500 hover:text-blue-700"
            style={{ borderBottom: '1px dashed currentColor' }}
          >
            {record.lot_count} lots · {record.total_bins} thùng{' '}
            <InfoCircleOutlined style={{ fontSize: 10 }} />
          </span>
        ) : (
          <Text style={{ color: '#d9d9d9' }}>0 lots · 0 thùng</Text>
        )
    },
    {
      title: 'Tổng tồn kho',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 130,
      align: 'center' as const,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.total_quantity - b.total_quantity,
      render: (v: number) => (
        <Text
          strong
          style={{ color: v > 0 ? '#52c41a' : '#d9d9d9', fontSize: '14px' }}
        >
          {Number(v || 0).toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'SL xuất',
      dataIndex: 'exported_quantity',
      key: 'exported_quantity',
      width: 100,
      align: 'center' as const,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.exported_quantity - b.exported_quantity,
      render: (v: number) => (
        <Text
          strong
          style={{ color: v > 0 ? '#fa8c16' : '#d9d9d9', fontSize: '14px' }}
        >
          {Number(v || 0).toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Thùng xuất',
      dataIndex: 'exported_bins',
      key: 'exported_bins',
      width: 90,
      align: 'center' as const,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.exported_bins - b.exported_bins,
      render: (v: number) => (
        <Text strong style={{ color: v > 0 ? '#fa541c' : '#d9d9d9' }}>
          {v}
        </Text>
      )
    }
  ];

  if (loading && !stockData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large">
          <div className="text-center">
            <div className="mt-4">
              <Text type="secondary">Đang tải dữ liệu...</Text>
            </div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary + Filters */}
      <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="text-xs font-medium text-gray-500">
            Tổng hợp theo sản phẩm
          </span>
          <div className="hidden h-4 w-px bg-gray-200 sm:block" />
          <div>
            <span className="text-xs text-gray-400">Sản phẩm</span>
            <span className="ml-1.5 text-base font-bold text-purple-600">
              {summaryData.length.toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Tổng SL</span>
            <span className="ml-1.5 text-base font-bold text-green-600">
              {totals.qty.toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Tổng thùng</span>
            <span className="ml-1.5 text-base font-bold text-blue-600">
              {totals.bins.toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Tổng lots</span>
            <span className="ml-1.5 text-base font-bold text-orange-500">
              {totals.lots.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            placeholder="Lọc sản phẩm"
            allowClear
            size="small"
            className="!w-full sm:!w-[200px]"
            options={productOptions}
            onChange={(value) => setFilterProductId(value || undefined)}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Search
            placeholder="Tìm..."
            allowClear
            size="small"
            className="!w-full sm:!w-[160px]"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <RefreshButton refresh={loadData} isLoading={loading} size="small" />
        </div>
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block">
        <Table
          columns={columns}
          dataSource={summaryData}
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
          scroll={{ x: 800 }}
        />
      </div>

      {/* Mobile: Card list */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="py-8 text-center text-gray-400">Đang tải...</div>
        ) : summaryData.length === 0 ? (
          <div className="py-8 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <>
            <div className="space-y-2">
              {summaryData.map((item, index) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                >
                  {/* Row 1: Index + Product name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-[10px] font-medium text-gray-400">
                          #{index + 1}
                        </span>
                        <Text strong className="text-sm">
                          {item.product_name}
                        </Text>
                      </div>
                      <div className="ml-5 text-[10px] text-gray-400">
                        {item.product_code}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Text
                        strong
                        style={{
                          color:
                            item.total_quantity > 0 ? '#52c41a' : '#d9d9d9',
                          fontSize: '16px'
                        }}
                      >
                        {Number(item.total_quantity || 0).toLocaleString(
                          'vi-VN'
                        )}
                      </Text>
                      <div className="text-[10px] text-gray-400">tồn kho</div>
                    </div>
                  </div>

                  {/* Row 2: Export info */}
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="text-gray-400">Đã xuất:</span>
                    <Text
                      style={{
                        color:
                          item.exported_quantity > 0 ? '#fa8c16' : '#d9d9d9'
                      }}
                    >
                      {Number(item.exported_quantity || 0).toLocaleString(
                        'vi-VN'
                      )}{' '}
                      SP
                    </Text>
                    <Text
                      style={{
                        color: item.exported_bins > 0 ? '#fa541c' : '#d9d9d9'
                      }}
                    >
                      {item.exported_bins} thùng
                    </Text>
                  </div>

                  {/* Row 2: Lots + Bins (clickable for details) */}
                  <div className="mt-1.5 flex items-center gap-4 text-xs">
                    {item.lot_count > 0 || item.total_bins > 0 ? (
                      <span
                        onClick={() => setDetailRecord(item)}
                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                        style={{ borderBottom: '1px dashed currentColor' }}
                      >
                        {item.lot_count} lots · {item.total_bins} thùng{' '}
                        <InfoCircleOutlined style={{ fontSize: 10 }} />
                      </span>
                    ) : (
                      <span className="text-gray-300">0 lots · 0 thùng</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <InfoCircleOutlined />
            </div>
            <span className="text-gray-800">
              Các Lot của sản phẩm: {detailRecord?.product_name}
            </span>
          </div>
        }
        placement="right"
        onClose={() => setDetailRecord(null)}
        open={!!detailRecord}
        width={450}
        styles={{
          body: { backgroundColor: '#f8fafc', padding: '16px' },
          header: { borderBottom: '2px solid #e2e8f0' }
        }}
      >
        {detailRecord && (
          <div className="flex flex-col gap-4">
            {detailRecord.lots.map((lot, index) => (
              <div
                key={lot.lot}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Header Card */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">
                      {index + 1}
                    </span>
                    <Text className="font-semibold text-gray-700">Mã Lot:</Text>
                    <Text
                      code
                      className="border border-green-200 bg-green-50 text-sm font-bold text-green-700"
                    >
                      {lot.lot}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="block text-sm text-emerald-600">
                      {Number(lot.quantity || 0).toLocaleString('vi-VN')} SP
                    </Text>
                  </div>
                </div>

                {/* Body Card */}
                <div className="px-4 py-3">
                  <div className="mb-2 flex items-center justify-between space-x-2">
                    <Text
                      type="secondary"
                      className="text-xs font-bold text-gray-500 uppercase"
                    >
                      Danh sách Thùng
                    </Text>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                      {lot.bin_count} thùng
                    </span>
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-2.5">
                    {lot.bins ? (
                      <div className="flex flex-wrap gap-1.5">
                        {lot.bins.split(',').map((bin, i) => (
                          <div
                            key={`${bin}-${i}`}
                            className="min-w-[28px] rounded border border-gray-300 bg-white px-1.5 py-0.5 text-center text-[12px] font-semibold text-gray-800 shadow-sm"
                          >
                            {bin.trim()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Text className="text-[13px] text-gray-400 italic">
                        Không có dữ liệu thùng
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Footer Summary */}
            <div className="mt-2 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm">
              <Text strong className="text-[13px] text-blue-800 uppercase">
                Tổng cộng:
              </Text>
              <div className="text-right">
                <Text
                  strong
                  className="mb-1 block text-base leading-none text-green-600"
                >
                  {Number(detailRecord.total_quantity || 0).toLocaleString(
                    'vi-VN'
                  )}{' '}
                  SP
                </Text>
                <Text
                  strong
                  className="block text-[13px] leading-none text-blue-600"
                >
                  {detailRecord.total_bins} thùng
                </Text>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductStockSummary;

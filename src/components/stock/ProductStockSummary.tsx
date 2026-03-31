import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Typography, message, Spin, Input, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { StockTransactionService } from '@/services/StockTransactionService';
import { ApiErrorResponse } from '@/types/stockTransaction.types';

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

interface ProductSummaryRow {
  key: number;
  product_id: number;
  product_code: string;
  product_name: string;
  lot_count: number;
  total_quantity: number;
  total_bins: number;
}

const ProductStockSummary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<CurrentStockApiResponse | null>(
    null
  );
  const [searchText, setSearchText] = useState('');
  const [filterProductId, setFilterProductId] = useState<number | undefined>();
  const [tablePagination, setTablePagination] = useState({
    current: 1,
    pageSize: 50
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await StockTransactionService.getCurrentStock()) as {
        success?: boolean;
        data?: CurrentStockApiResponse;
      };

      if (result?.success === false) {
        message.error(
          (result as unknown as ApiErrorResponse).message || 'Có lỗi xảy ra'
        );
        setStockData(null);
        return;
      }

      const data = result?.data as CurrentStockApiResponse;
      setStockData(data || null);
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

  // Build product options for filter
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

  // Aggregate: group all lots by product → 1 row per product
  const summaryData = useMemo((): ProductSummaryRow[] => {
    if (!stockData?.stocks) return [];

    // Only count items with quantity > 0
    const items = stockData.stocks.filter((s) => s.current_quantity > 0);

    const map = new Map<
      number,
      {
        code: string;
        name: string;
        qty: number;
        bins: number;
        lots: Set<string>;
      }
    >();

    items.forEach((item) => {
      const existing = map.get(item.product_id);
      if (existing) {
        existing.qty += Number(item.current_quantity || 0);
        existing.bins += Number(item.bin_count || 0);
        existing.lots.add(item.lot);
      } else {
        map.set(item.product_id, {
          code: item.product_code,
          name: item.product_name,
          qty: Number(item.current_quantity || 0),
          bins: Number(item.bin_count || 0),
          lots: new Set([item.lot])
        });
      }
    });

    let rows = Array.from(map.entries()).map(([id, data]) => ({
      key: id,
      product_id: id,
      product_code: data.code,
      product_name: data.name,
      lot_count: data.lots.size,
      total_quantity: data.qty,
      total_bins: data.bins
    }));

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

    // Sort by product name
    return rows.sort((a, b) =>
      a.product_name.localeCompare(b.product_name, 'vi')
    );
  }, [stockData, filterProductId, searchText]);

  // Total row
  const totals = useMemo(() => {
    return summaryData.reduce(
      (acc, r) => ({
        qty: acc.qty + r.total_quantity,
        bins: acc.bins + r.total_bins,
        lots: acc.lots + r.lot_count
      }),
      { qty: 0, bins: 0, lots: 0 }
    );
  }, [summaryData]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.product_name.localeCompare(b.product_name, 'vi'),
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
      title: 'Số lots',
      dataIndex: 'lot_count',
      key: 'lot_count',
      width: 80,
      align: 'center' as const,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.lot_count - b.lot_count,
      render: (v: number) => <Text style={{ color: '#8c8c8c' }}>{v}</Text>
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
          style={{ color: v > 0 ? '#52c41a' : '#f5222d', fontSize: '14px' }}
        >
          {Number(v || 0).toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Tổng thùng',
      dataIndex: 'total_bins',
      key: 'total_bins',
      width: 100,
      align: 'center' as const,
      sorter: (a: ProductSummaryRow, b: ProductSummaryRow) =>
        a.total_bins - b.total_bins,
      render: (v: number) => (
        <Text strong style={{ color: '#1890ff' }}>
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
              {summaryData.length}
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
              {totals.bins}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Tổng lots</span>
            <span className="ml-1.5 text-base font-bold text-orange-500">
              {totals.lots}
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
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
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
          scroll={{ x: 500 }}
          summary={() =>
            summaryData.length > 1 ? (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-gray-50 font-semibold">
                  <Table.Summary.Cell index={0} colSpan={2} align="right">
                    <Text strong>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <Text strong style={{ color: '#8c8c8c' }}>
                      {totals.lots}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                      {totals.qty.toLocaleString('vi-VN')}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="center">
                    <Text strong style={{ color: '#1890ff' }}>
                      {totals.bins}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            ) : null
          }
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
                            item.total_quantity > 0 ? '#52c41a' : '#f5222d',
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

                  {/* Row 2: Lots + Bins */}
                  <div className="mt-1.5 flex items-center gap-4 text-xs">
                    <span className="text-gray-500">{item.lot_count} lots</span>
                    <Text strong style={{ color: '#1890ff' }}>
                      {item.total_bins} thùng
                    </Text>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile totals footer */}
            {summaryData.length > 1 && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
                <Text strong>Tổng cộng</Text>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{totals.lots} lots</span>
                  <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>
                    {totals.qty.toLocaleString('vi-VN')}
                  </Text>
                  <Text strong style={{ color: '#1890ff' }}>
                    {totals.bins} thùng
                  </Text>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductStockSummary;

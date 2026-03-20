import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Typography, message, Spin, Input, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { StockTransactionService } from '@/services/StockTransactionService';
import { ApiErrorResponse } from '@/types/stockTransaction.types';

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
  const [stockData, setStockData] = useState<CurrentStockApiResponse | null>(
    null
  );
  const [filters, setFilters] = useState<{
    productId?: number;
    lot?: string;
    showEmpty?: boolean;
  }>({ showEmpty: false });

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

  // Transform API response to table data (with client-side filtering)
  const getGroupedStockItems = (): GroupedStockItem[] => {
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
            bin_count: item.bin_count
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
  };

  const handleRefresh = () => {
    loadCurrentStock();
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
      defaultSortOrder: 'descend' as const,
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
      title: 'Tổng thùng còn lại',
      dataIndex: 'bin_count',
      key: 'bin_count',
      width: 120,
      align: 'center' as const,
      render: (count: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {count} thùng
        </Text>
      )
    },
    {
      title: 'Danh sách thùng còn lại',
      dataIndex: 'bins',
      key: 'bins',
      width: 180,
      align: 'center' as const,
      render: (bins: number[]) => (
        <Text style={{ fontSize: '12px', color: '#722ed1' }}>
          {bins?.length > 0
            ? bins.sort((a, b) => a - b).join(', ')
            : 'Không có'}
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
                {stockData.summary?.total_bins || 0}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Sản phẩm</span>
              <span className="ml-1.5 text-base font-bold text-purple-600">
                {stockData.summary?.total_products || 0}
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
                {stockData.stocks
                  ? new Set(
                      stockData.stocks.map(
                        (item) => `${item.product_id}_${item.lot}`
                      )
                    ).size
                  : 0}
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
            style={{ width: 200 }}
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
            style={{ width: 160 }}
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

      {/* Stock Table */}
      <Table
        columns={stockColumns}
        dataSource={getGroupedStockItems()}
        rowKey="key"
        loading={loading}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} groups`,
          size: 'small'
        }}
        size="small"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default CurrentStockDashboard;

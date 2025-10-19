import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Typography,
  message,
  Spin,
  Input,
  Switch
} from 'antd';
import {
  ReloadOutlined,
  InboxOutlined,
  NumberOutlined
} from '@ant-design/icons';

import { StockTransactionService } from '@/services/stockTransaction.service';
import {
  CurrentStockResponse,
  CurrentStockItem,
  ApiErrorResponse,
  StockTransaction,
  TransactionListResponse
} from '@/types/stockTransaction.types';

const { Text } = Typography;
const { Search } = Input;

// Interface cho grouped stock (theo product + lot)
interface GroupedStockItem {
  key: string;
  product_id: number;
  product_code: string;
  product_name: string;
  lot: string;
  bins: number[];
  total_quantity: number;
  bin_count: number;
  material: string;
  color: string;
}

// Extended CurrentStockItem with additional properties
interface ExtendedCurrentStockItem extends CurrentStockItem {
  product?: CurrentStockItem['product'] & {
    remaining_bins?: number[];
    remaining_bin_count?: number;
    bins_detail?: Map<number, number>;
  };
}

const CurrentStockDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState<CurrentStockResponse | null>(
    null
  );
  const [filters, setFilters] = useState<{
    productId?: number;
    lot?: string;
    showEmpty?: boolean;
    fromDate?: string;
    toDate?: string;
  }>({ showEmpty: false });

  const loadCurrentStock = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading current stock with filters:', filters);

      // Use transactions API with type='in' filter for current stock
      console.log('Loading transactions with type=in for current stock...');
      const transactionsResponse =
        await StockTransactionService.getTransactions({
          page: 1,
          per_page: 1000, // Get large number to calculate stock
          type: 'in', // Only 'in' transactions for current stock
          from_date: filters.fromDate,
          to_date: filters.toDate
        });
      console.log('Transactions (in) response:', transactionsResponse);

      if (
        'success' in transactionsResponse &&
        transactionsResponse.success === false
      ) {
        message.error(
          (transactionsResponse as ApiErrorResponse).message ||
            'Có lỗi xảy ra khi tải dữ liệu'
        );
        setCurrentStock(null);
        return;
      }

      // Get raw transactions data (type='in' only)
      const inTransactions =
        (transactionsResponse as TransactionListResponse).data || [];
      console.log('In transactions count:', inTransactions.length);

      // Group by product_id + lot and track bins with remaining stock
      const stockGroups = new Map<
        string,
        {
          product_id: number;
          product_code: string;
          product_name: string;
          lot: string;
          total_quantity: number;
          bins_with_stock: Map<number, number>; // bin_id -> remaining_quantity
          latest_date: string;
          product: CurrentStockItem['product'];
          barcode: string;
        }
      >();

      inTransactions.forEach((transaction: StockTransaction) => {
        if (!transaction.storage_product?.product) return;

        const product = transaction.storage_product.product;
        const lot = transaction.storage_product.lot;
        const bin = transaction.storage_product.bin;
        const key = `${product.id}_${lot}`;

        if (stockGroups.has(key)) {
          const existing = stockGroups.get(key)!;
          existing.total_quantity += transaction.quantity;

          // Track quantity per bin
          const currentBinQty = existing.bins_with_stock.get(bin) || 0;
          existing.bins_with_stock.set(
            bin,
            currentBinQty + transaction.quantity
          );

          if (transaction.created_at > existing.latest_date) {
            existing.latest_date = transaction.created_at;
          }
        } else {
          const binsMap = new Map<number, number>();
          binsMap.set(bin, transaction.quantity);

          stockGroups.set(key, {
            product_id: product.id,
            product_code: product.code || `P${product.id}`,
            product_name: product.name,
            lot: lot,
            total_quantity: transaction.quantity,
            bins_with_stock: binsMap,
            latest_date: transaction.created_at,
            product: product,
            barcode: transaction.storage_product.barcode || ''
          });
        }
      });

      // Convert to array and create proper CurrentStockItem format
      const stockGroupsWithBins = Array.from(stockGroups.entries()).map(
        ([, group], index) => {
          // Filter bins that have stock > 0
          const binsWithStock = Array.from(group.bins_with_stock.entries())
            .filter(([, qty]) => qty > 0)
            .map(([binId]) => binId);

          console.log(`Group ${group.product_code}-${group.lot}:`, {
            total_quantity: group.total_quantity,
            bins_with_stock: binsWithStock,
            bins_detail: Array.from(group.bins_with_stock.entries())
          });

          return {
            id: index,
            product_id: group.product_id,
            product_name: group.product_name,
            lot: group.lot,
            bin: 0, // Not used for grouped view
            current_quantity: group.total_quantity,
            total_quantity: group.total_quantity,
            barcode: group.barcode,
            created_at: group.latest_date,
            product: group.product
              ? {
                  id: group.product.id,
                  code: group.product.code || '',
                  name: group.product.name,
                  material: group.product.material || '',
                  color: group.product.color || '',
                  quanEntityBin: group.product.quanEntityBin || 0,
                  remaining_bins: binsWithStock, // List of bins with stock
                  remaining_bin_count: binsWithStock.length, // Count of bins with stock
                  bins_detail: group.bins_with_stock // Full detail for reference
                }
              : undefined
          };
        }
      );

      // Filter out items with zero quantity if showEmpty is false
      const filteredItems = filters.showEmpty
        ? stockGroupsWithBins
        : stockGroupsWithBins.filter(
            (item) => (item.current_quantity || 0) > 0
          );

      // Calculate summary from filtered current stock items
      const uniqueProducts = new Set(
        filteredItems.map((item) => item.product_id)
      );
      const totalQuantity = filteredItems.reduce(
        (sum: number, item) => sum + (item.current_quantity || 0),
        0
      );

      const transformedResponse: CurrentStockResponse = {
        success: true,
        message: 'Success (via statistics API)',
        data: {
          summary: {
            total_bins: filteredItems.length,
            total_products: uniqueProducts.size,
            total_quantity: totalQuantity
          },
          top_products: filteredItems
        }
      };

      console.log('Transformed response from statistics:', transformedResponse);
      setCurrentStock(transformedResponse);
    } catch (error: unknown) {
      console.error('Load current stock error:', error);
      console.error(
        'Error details:',
        (error as { response?: { data?: unknown } }).response?.data
      );
      message.error('Có lỗi xảy ra khi tải dữ liệu tồn kho');
      setCurrentStock(null);
    } finally {
      setLoading(false);
    }
  }, [filters]); // useCallback dependency

  useEffect(() => {
    loadCurrentStock();
  }, [loadCurrentStock]); // Reload when loadCurrentStock changes

  useEffect(() => {
    // Setup polling - refresh every 30 seconds
    const interval = setInterval(() => {
      loadCurrentStock();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadCurrentStock]); // Added loadCurrentStock dependency

  // Group stock by product + lot (data already grouped in loadCurrentStock)
  const getGroupedStockItems = (): GroupedStockItem[] => {
    if (!currentStock?.data?.top_products) return [];

    return currentStock.data.top_products
      .map((item: CurrentStockItem) => ({
        key: `${item.product_id}_${item.lot}`,
        product_id: item.product_id,
        product_code: item.product?.code || `P${item.product_id}`,
        product_name: item.product_name,
        lot: item.lot,
        bins:
          (item.product as ExtendedCurrentStockItem['product'])
            ?.remaining_bins || [],
        total_quantity: item.current_quantity,
        bin_count:
          (item.product as ExtendedCurrentStockItem['product'])
            ?.remaining_bin_count || 0,
        material: item.product?.material || 'N/A',
        color: item.product?.color || 'N/A'
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity);
  };

  const handleRefresh = () => {
    loadCurrentStock();
  };

  const handleShowEmptyChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, showEmpty: checked }));
  };

  const handleLotSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, lot: value || undefined }));
  };

  const stockColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 200,
      render: (record: GroupedStockItem) => (
        <div>
          <div>
            <Text strong>{record.product_name}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Code: {record.product_code}
          </Text>
        </div>
      )
    },
    {
      title: 'Lot',
      dataIndex: 'lot',
      key: 'lot',
      width: 120,
      render: (lot: string) => <Text code>{lot}</Text>
    },
    {
      title: 'Tồn kho',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 100,
      align: 'right' as const,
      render: (quantity: number) => (
        <Text strong style={{ color: quantity > 0 ? '#52c41a' : '#f5222d' }}>
          {(quantity || 0).toLocaleString()}
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
      render: (bins: number[]) => (
        <Text style={{ fontSize: '12px', color: '#722ed1' }}>
          {bins?.length > 0
            ? bins.sort((a, b) => a - b).join(', ')
            : 'Không có'}
        </Text>
      )
    },
    {
      title: 'Material',
      dataIndex: 'material',
      key: 'material',
      width: 100
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 100
    }
  ];

  if (loading && !currentStock) {
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
      {/* Header & Controls */}
      <Card size="small">
        <div className="flex items-center justify-between">
          <div>
            <Text strong>Tồn kho Hiện tại</Text>
            {currentStock && (
              <Text type="secondary" className="ml-2">
                ({currentStock.data.summary.total_bins} bins •{' '}
                {currentStock.data.summary.total_products} sản phẩm)
              </Text>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Switch
              checkedChildren="Bins trống"
              unCheckedChildren="Có hàng"
              checked={filters.showEmpty}
              onChange={handleShowEmptyChange}
              size="small"
            />
            <Search
              placeholder="Tìm theo lot..."
              allowClear
              size="small"
              style={{ width: 150 }}
              onSearch={handleLotSearch}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              size="small"
            >
              Làm mới
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      {loading ? (
        <Card>
          <div className="py-8 text-center">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">Đang tải dữ liệu tồn kho...</Text>
            </div>
          </div>
        </Card>
      ) : currentStock && currentStock.data ? (
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng bins"
                value={currentStock.data.summary?.total_bins || 0}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<InboxOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Sản phẩm"
                value={currentStock.data.summary?.total_products || 0}
                precision={0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng số lượng"
                value={currentStock.data.summary?.total_quantity || 0}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<NumberOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Lots"
                value={
                  currentStock.data.top_products
                    ? new Set(
                        currentStock.data.top_products.map(
                          (item) => `${item.product_id}_${item.lot}`
                        )
                      ).size
                    : 0
                }
                precision={0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Card>
          <div className="py-8 text-center">
            <Text type="secondary">Không có dữ liệu tồn kho</Text>
            <div className="mt-4">
              <Button
                type="primary"
                onClick={handleRefresh}
                icon={<ReloadOutlined />}
              >
                Thử lại
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stock Table */}
      <Card>
        <Table
          columns={stockColumns}
          dataSource={getGroupedStockItems()}
          rowKey="key"
          loading={loading}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} groups`,
            size: 'small'
          }}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default CurrentStockDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Typography,
  message,
  Tag
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';

import { StockTransactionService } from '@/services/stockTransaction.service';
import {
  StockTransaction,
  TransactionListParams,
  TransactionListResponse,
  ApiErrorResponse
} from '@/types/stockTransaction.types';

const { Option } = Select;
const { Text } = Typography;

interface TransactionFilters {
  type?: 'in' | 'out';
  search?: string;
  employeeId?: string;
  storageProductId?: number;
}

const RawTransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const [filters, setFilters] = useState<TransactionFilters>({});

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: TransactionListParams = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...filters
      };

      const response = await StockTransactionService.getTransactions(params);

      if ('success' in response && response.success === false) {
        message.error(
          (response as ApiErrorResponse).message ||
            'Có lỗi xảy ra khi tải dữ liệu'
        );
        return;
      }

      const transactionResponse = response as TransactionListResponse;
      setTransactions(transactionResponse.data || []);

      setPagination((prev) => ({
        ...prev,
        total: transactionResponse.data?.length || 0
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleTableChange = (paginationParams: TablePaginationConfig) => {
    setPagination({
      current: paginationParams.current || 1,
      pageSize: paginationParams.pageSize || 20,
      total: pagination.total
    });
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTypeChange = (value: 'in' | 'out' | undefined) => {
    setFilters((prev) => ({ ...prev, type: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_: number, __: StockTransaction, index: number) => (
        <Text>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </Text>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 60,
      render: (type: string) => (
        <Tag color={type === 'in' ? 'green' : 'red'}>
          {type === 'in' ? 'Nhập' : 'Xuất'}
        </Tag>
      )
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 200,
      render: (record: StockTransaction) => (
        <div>
          <div>
            <Text strong>{record.storage_product?.product?.name || 'N/A'}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Code: {record.storage_product?.product?.code}
          </Text>
        </div>
      )
    },
    {
      title: 'Lot/Bin',
      key: 'lot_bin',
      width: 120,
      align: 'center' as const,
      render: (record: StockTransaction) => (
        <div>
          <div>
            <Text>Lot: {record.storage_product?.lot || 'N/A'}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Bin: {record.storage_product?.bin || 'N/A'}
          </Text>
        </div>
      )
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
      render: (quantity: number) => <Text strong>{quantity}</Text>
    },
    {
      title: 'Nhân viên',
      key: 'employee',
      width: 120,
      render: (record: StockTransaction) => (
        <Text>{record.employee?.name || record.employee_id || 'N/A'}</Text>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      align: 'center' as const,
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(date).toLocaleTimeString('vi-VN')}
          </Text>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card size="small">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <Text strong>Lịch sử Hoạt động</Text>
            <Text type="secondary" className="ml-2">
              ({pagination.total} hoạt động)
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              placeholder="Tìm kiếm..."
              allowClear
              style={{ width: 150 }}
              suffix={<SearchOutlined />}
              onPressEnter={(e) =>
                handleSearch((e.target as HTMLInputElement).value)
              }
              size="small"
            />
            <Select
              placeholder="Loại"
              allowClear
              style={{ width: 80 }}
              value={filters.type}
              onChange={handleTypeChange}
              size="small"
            >
              <Option value="in">Nhập</Option>
              <Option value="out">Xuất</Option>
            </Select>
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

      {/* Transaction Table */}
      <Card size="small">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} hoạt động`,
            size: 'small'
          }}
          onChange={handleTableChange}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default RawTransactionHistory;

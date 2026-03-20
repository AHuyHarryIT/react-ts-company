import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Typography,
  message,
  DatePicker
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { StockTransactionService } from '@/services/StockTransactionService';
import {
  TransactionListParams,
  TransactionListResponse,
  ApiErrorResponse
} from '@/types/stockTransaction.types';

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

// Flat API response row
interface TransactionRow {
  id: number;
  type: 'in' | 'out';
  quantity: number;
  created_at: string;
  lot: string;
  bin: number;
  barcode: string;
  product_id: number;
  product_code: string;
  product_name: string;
  employee_id: string;
  employee_name: string;
}

// Grouped summary row
interface GroupedRow {
  key: string;
  product_name: string;
  product_code: string;
  lot: string;
  in_qty: number;
  out_qty: number;
  balance: number;
  count: number;
  last_time: string;
  employees: string[];
  in_bins: number[];
  out_bins: number[];
}

interface ApiFilters {
  type?: 'in' | 'out';
  from_date?: string;
  to_date?: string;
}

const RawTransactionHistory: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiFilters, setApiFilters] = useState<ApiFilters>({
    from_date: dayjs().startOf('month').format('YYYY-MM-DD'),
    to_date: dayjs().format('YYYY-MM-DD')
  });
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs()
  ]);
  const [searchText, setSearchText] = useState('');
  const [filterProductId, setFilterProductId] = useState<number | undefined>(
    undefined
  );

  // Build product options from loaded data
  const productOptions = useMemo(() => {
    const seen = new Map<number, string>();
    allTransactions.forEach((tx) => {
      if (!seen.has(tx.product_id)) {
        seen.set(tx.product_id, `${tx.product_name} (${tx.product_code})`);
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({
      value: id,
      label
    }));
  }, [allTransactions]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: TransactionListParams = {
        page: 1,
        per_page: 200,
        ...apiFilters
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
      setAllTransactions(
        (transactionResponse.data || []) as unknown as TransactionRow[]
      );
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Group by product + lot
  const grouped = useMemo(() => {
    const map = new Map<string, GroupedRow>();

    allTransactions.forEach((tx) => {
      const key = `${tx.product_id}_${tx.lot}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          product_name: tx.product_name || 'N/A',
          product_code: tx.product_code || 'N/A',
          lot: tx.lot || 'N/A',
          in_qty: 0,
          out_qty: 0,
          balance: 0,
          count: 0,
          last_time: tx.created_at,
          employees: [],
          in_bins: [],
          out_bins: []
        });
      }

      const g = map.get(key)!;
      g.count += 1;

      if (tx.type === 'in') {
        g.in_qty += tx.quantity;
        g.balance += tx.quantity;
        if (tx.bin != null && !g.in_bins.includes(tx.bin)) {
          g.in_bins.push(tx.bin);
        }
      } else {
        g.out_qty += tx.quantity;
        g.balance -= tx.quantity;
        if (tx.bin != null && !g.out_bins.includes(tx.bin)) {
          g.out_bins.push(tx.bin);
        }
      }

      if (new Date(tx.created_at) > new Date(g.last_time)) {
        g.last_time = tx.created_at;
      }

      if (tx.employee_name && !g.employees.includes(tx.employee_name)) {
        g.employees.push(tx.employee_name);
      }
    });

    // Apply client-side search filter
    let result = Array.from(map.values());
    if (searchText) {
      const s = searchText.toLowerCase();
      result = result.filter(
        (g) =>
          g.product_name.toLowerCase().includes(s) ||
          g.product_code.toLowerCase().includes(s) ||
          g.lot.toLowerCase().includes(s)
      );
    }

    // Apply client-side product filter
    if (filterProductId) {
      result = result.filter((g) => g.key.startsWith(`${filterProductId}_`));
    }

    return result.sort(
      (a, b) =>
        new Date(b.last_time).getTime() - new Date(a.last_time).getTime()
    );
  }, [allTransactions, searchText, filterProductId]);

  const handleTypeChange = (value: 'in' | 'out' | undefined) => {
    setApiFilters((prev) => ({ ...prev, type: value }));
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
      setApiFilters((prev) => ({
        ...prev,
        from_date: dates[0]!.format('YYYY-MM-DD'),
        to_date: dates[1]!.format('YYYY-MM-DD')
      }));
    } else {
      setDateRange([dayjs().startOf('month'), dayjs()]);
      setApiFilters((prev) => ({
        ...prev,
        from_date: dayjs().startOf('month').format('YYYY-MM-DD'),
        to_date: dayjs().format('YYYY-MM-DD')
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 180,
      sorter: (a: GroupedRow, b: GroupedRow) =>
        a.product_name.localeCompare(b.product_name, 'vi'),
      render: (_: unknown, r: GroupedRow) => (
        <div>
          <Text strong>{r.product_name}</Text>
          <div className="text-xs text-gray-400">{r.product_code}</div>
        </div>
      )
    },
    {
      title: 'Lot',
      dataIndex: 'lot',
      key: 'lot',
      width: 140,
      align: 'center' as const,
      render: (lot: string) => (
        <Text code className="text-xs">
          {lot}
        </Text>
      )
    },
    {
      title: 'Nhập',
      dataIndex: 'in_qty',
      key: 'in_qty',
      width: 80,
      align: 'center' as const,
      render: (v: number) => (
        <Text style={{ color: '#52c41a', fontWeight: 600 }}>
          {v > 0 ? `+${v.toLocaleString()}` : '-'}
        </Text>
      ),
      sorter: (a: GroupedRow, b: GroupedRow) => a.in_qty - b.in_qty
    },
    {
      title: 'Xuất',
      dataIndex: 'out_qty',
      key: 'out_qty',
      width: 80,
      align: 'center' as const,
      render: (v: number) => (
        <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>
          {v > 0 ? `-${v.toLocaleString()}` : '-'}
        </Text>
      ),
      sorter: (a: GroupedRow, b: GroupedRow) => a.out_qty - b.out_qty
    },
    {
      title: 'Tồn',
      dataIndex: 'balance',
      key: 'balance',
      width: 80,
      align: 'center' as const,
      render: (v: number) => (
        <Text
          strong
          style={{ color: v > 0 ? '#1890ff' : v < 0 ? '#ff4d4f' : '#999' }}
        >
          {v.toLocaleString()}
        </Text>
      )
    },
    {
      title: 'Thùng nhập',
      key: 'in_bins',
      width: 90,
      align: 'center' as const,
      render: (_: unknown, r: GroupedRow) => (
        <span className="text-xs text-green-600">
          {r.in_bins.length > 0
            ? r.in_bins.sort((a, b) => a - b).join(', ')
            : '-'}
        </span>
      )
    },
    {
      title: 'Thùng xuất',
      key: 'out_bins',
      width: 90,
      align: 'center' as const,
      render: (_: unknown, r: GroupedRow) => (
        <span className="text-xs text-red-500">
          {r.out_bins.length > 0
            ? r.out_bins.sort((a, b) => a - b).join(', ')
            : '-'}
        </span>
      )
    },

    {
      title: 'Nhân viên',
      key: 'employees',
      width: 130,
      align: 'center' as const,
      ellipsis: true,
      render: (_: unknown, r: GroupedRow) => (
        <Text className="text-xs">{r.employees.join(', ') || 'N/A'}</Text>
      )
    },
    {
      title: 'Cập nhật',
      dataIndex: 'last_time',
      key: 'last_time',
      width: 100,
      align: 'center' as const,
      render: (date: string) => {
        const d = new Date(date);
        return (
          <div>
            <div className="text-xs">{d.toLocaleDateString('vi-VN')}</div>
            <div className="text-xs text-gray-400">
              {d.toLocaleTimeString('vi-VN')}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Summary + Filters */}
      <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
        {/* Row 1: Summary */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="text-xs font-medium text-gray-500">
            {dateRange[0].format('DD/MM')} - {dateRange[1].format('DD/MM/YYYY')}
          </span>
          <div className="hidden h-4 w-px bg-gray-200 sm:block" />
          <div>
            <span className="text-xs text-gray-400">Tổng nhập</span>
            <span className="ml-1.5 text-base font-bold text-green-600">
              +{grouped.reduce((s, g) => s + g.in_qty, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Tổng xuất</span>
            <span className="ml-1.5 text-base font-bold text-red-500">
              -{grouped.reduce((s, g) => s + g.out_qty, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            placeholder="Lọc sản phẩm"
            allowClear
            size="small"
            style={{ width: 200 }}
            options={productOptions}
            value={filterProductId}
            onChange={(value) => setFilterProductId(value || undefined)}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <RangePicker
            size="small"
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            value={dateRange}
            onChange={handleDateChange}
            presets={[
              { label: 'Hôm nay', value: [dayjs(), dayjs()] },
              {
                label: 'Tháng này',
                value: [dayjs().startOf('month'), dayjs()]
              },
              {
                label: 'Tháng trước',
                value: [
                  dayjs().subtract(1, 'month').startOf('month'),
                  dayjs().subtract(1, 'month').endOf('month')
                ]
              },
              {
                label: '30 ngày',
                value: [dayjs().subtract(30, 'day'), dayjs()]
              }
            ]}
          />
          <Select
            placeholder="Loại"
            allowClear
            style={{ width: 80 }}
            value={apiFilters.type}
            onChange={handleTypeChange}
            size="small"
          >
            <Option value="in">Nhập</Option>
            <Option value="out">Xuất</Option>
          </Select>
          <Input
            placeholder="Tìm lot..."
            allowClear
            style={{ width: 130 }}
            suffix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadTransactions()}
            loading={loading}
            size="small"
          >
            Tải lại
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={grouped}
        rowKey="key"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
          size: 'small'
        }}
        size="small"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default RawTransactionHistory;

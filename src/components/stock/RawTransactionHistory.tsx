import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Typography,
  message,
  DatePicker,
  Popconfirm,
  Tag
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';

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

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await StockTransactionService.deleteTransaction(id);
        if ('success' in res && res.success) {
          message.success(res.message || 'Đã xoá giao dịch');
          loadTransactions();
        } else {
          message.error(
            (res as { message?: string }).message || 'Xoá thất bại'
          );
        }
      } catch {
        message.error('Có lỗi xảy ra khi xoá');
      }
    },
    [loadTransactions]
  );

  const filtered = useMemo(() => {
    let result = [...allTransactions];
    if (searchText) {
      const s = searchText.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.product_name?.toLowerCase().includes(s) ||
          tx.product_code?.toLowerCase().includes(s) ||
          tx.lot?.toLowerCase().includes(s) ||
          tx.barcode?.toLowerCase().includes(s)
      );
    }
    if (filterProductId) {
      result = result.filter((tx) => tx.product_id === filterProductId);
    }
    return result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allTransactions, searchText, filterProductId]);

  const summary = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    filtered.forEach((tx) => {
      if (tx.type === 'in') totalIn += tx.quantity;
      else totalOut += tx.quantity;
    });
    return { totalIn, totalOut };
  }, [filtered]);

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

  const formatTime = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Desktop table columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    {
      title: 'Sản phẩm',
      key: 'product',
      ellipsis: true,
      render: (_: unknown, r: TransactionRow) => (
        <div className="min-w-0">
          <Text strong className="text-sm">
            {r.product_name}
          </Text>
          <div className="text-[10px] text-gray-400">{r.product_code}</div>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 65,
      align: 'center' as const,
      render: (type: string) => (
        <Tag color={type === 'in' ? 'green' : 'red'} className="!m-0">
          {type === 'in' ? 'Nhập' : 'Xuất'}
        </Tag>
      )
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      align: 'center' as const,
      sorter: (a: TransactionRow, b: TransactionRow) => a.quantity - b.quantity,
      render: (v: number, r: TransactionRow) => (
        <Text
          style={{
            color: r.type === 'in' ? '#52c41a' : '#ff4d4f',
            fontWeight: 600
          }}
        >
          {r.type === 'in' ? `+${v}` : `-${v}`}
        </Text>
      )
    },
    {
      title: 'Lot',
      dataIndex: 'lot',
      key: 'lot',
      width: 160,
      align: 'center' as const,
      render: (lot: string) => (
        <Text code className="!text-sm !font-medium whitespace-nowrap">
          {lot}
        </Text>
      )
    },
    {
      title: 'Thùng',
      dataIndex: 'bin',
      key: 'bin',
      width: 60,
      align: 'center' as const,
      render: (v: number) => (
        <Text className="text-xs">{v != null ? v : '-'}</Text>
      )
    },
    {
      title: 'NV',
      dataIndex: 'employee_name',
      key: 'employee_name',
      width: 100,
      align: 'center' as const,
      ellipsis: true,
      render: (v: string) => <Text className="text-xs">{v || 'N/A'}</Text>
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      align: 'center' as const,
      sorter: (a: TransactionRow, b: TransactionRow) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => {
        const d = new Date(date);
        return (
          <div className="text-[11px] leading-tight">
            <div>{d.toLocaleDateString('vi-VN')}</div>
            <div className="text-gray-400">
              {d.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      align: 'center' as const,
      render: (_: unknown, r: TransactionRow) => (
        <Popconfirm
          title={`Xoá ${r.type === 'in' ? 'nhập' : 'xuất'} kho`}
          description={`${r.product_name} — Lot: ${r.lot}, SL: ${r.quantity}, Thùng: ${r.bin ?? 'N/A'}`}
          onConfirm={() => handleDelete(r.id)}
          okText="Xoá"
          cancelText="Huỷ"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined style={{ fontSize: 12 }} />}
            className="!h-6 !w-6 !min-w-0"
          />
        </Popconfirm>
      )
    }
  ];

  // Mobile card for each transaction
  const MobileCard = ({ tx }: { tx: TransactionRow }) => (
    <div className="flex items-start gap-2 border-b border-gray-100 px-1 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Text strong className="text-sm">
            {tx.product_name}
          </Text>
          <Tag
            color={tx.type === 'in' ? 'green' : 'red'}
            className="!m-0 !text-[10px]"
          >
            {tx.type === 'in' ? 'Nhập' : 'Xuất'}
          </Tag>
          <Text
            className="ml-auto text-sm font-bold"
            style={{ color: tx.type === 'in' ? '#52c41a' : '#ff4d4f' }}
          >
            {tx.type === 'in' ? '+' : '-'}
            {tx.quantity}
          </Text>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span>
            Lot:{' '}
            <Text code className="!text-xs !font-medium">
              {tx.lot}
            </Text>
          </span>
          {tx.bin != null && <span>Thùng: {tx.bin}</span>}
          {tx.employee_name && <span>{tx.employee_name}</span>}
          <span className="text-gray-400">{formatTime(tx.created_at)}</span>
        </div>
      </div>
      <Popconfirm
        title={`Xoá ${tx.type === 'in' ? 'nhập' : 'xuất'} kho`}
        description={`${tx.product_name} — Lot: ${tx.lot}, SL: ${tx.quantity}`}
        onConfirm={() => handleDelete(tx.id)}
        okText="Xoá"
        cancelText="Huỷ"
        okButtonProps={{ danger: true }}
      >
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined style={{ fontSize: 12 }} />}
          className="!h-7 !w-7 !min-w-0 shrink-0"
        />
      </Popconfirm>
    </div>
  );

  // Pagination for mobile
  const [mobilePage, setMobilePage] = useState(1);
  const mobilePageSize = 20;
  const mobileData = filtered.slice(
    (mobilePage - 1) * mobilePageSize,
    mobilePage * mobilePageSize
  );

  return (
    <div className="space-y-3">
      {/* Summary + Filters */}
      <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
        {/* Summary */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-xs font-medium text-gray-500">
            {dateRange[0].format('DD/MM')} – {dateRange[1].format('DD/MM/YYYY')}
          </span>
          <div className="hidden h-4 w-px bg-gray-200 sm:block" />
          <div>
            <span className="text-xs text-gray-400">Nhập</span>
            <span className="ml-1 text-sm font-bold text-green-600">
              +{summary.totalIn.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Xuất</span>
            <span className="ml-1 text-sm font-bold text-red-500">
              -{summary.totalOut.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">GD</span>
            <span className="ml-1 text-xs font-semibold text-gray-700">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Select
            placeholder="Sản phẩm"
            allowClear
            size="small"
            className="!w-full sm:!w-[180px]"
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
            className="!w-full sm:!w-auto"
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
          <div className="flex items-center gap-1.5">
            <Select
              placeholder="Loại"
              allowClear
              style={{ width: 75 }}
              value={apiFilters.type}
              onChange={handleTypeChange}
              size="small"
            >
              <Option value="in">Nhập</Option>
              <Option value="out">Xuất</Option>
            </Select>
            <Input
              placeholder="Tìm..."
              allowClear
              style={{ width: 100 }}
              suffix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              size="small"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadTransactions()}
              loading={loading}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Desktop: Table (hidden on mobile) */}
      <div className="hidden sm:block">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small'
          }}
          size="small"
          scroll={{ x: 700 }}
        />
      </div>

      {/* Mobile: Card list (hidden on desktop) */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="py-8 text-center text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <>
            <div className="rounded-lg border border-gray-100 bg-white">
              {mobileData.map((tx) => (
                <MobileCard key={tx.id} tx={tx} />
              ))}
            </div>
            {filtered.length > mobilePageSize && (
              <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                <span>
                  {(mobilePage - 1) * mobilePageSize + 1}-
                  {Math.min(mobilePage * mobilePageSize, filtered.length)} /{' '}
                  {filtered.length}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="small"
                    disabled={mobilePage <= 1}
                    onClick={() => setMobilePage((p) => p - 1)}
                  >
                    ‹
                  </Button>
                  <Button
                    size="small"
                    disabled={mobilePage * mobilePageSize >= filtered.length}
                    onClick={() => setMobilePage((p) => p + 1)}
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

export default RawTransactionHistory;

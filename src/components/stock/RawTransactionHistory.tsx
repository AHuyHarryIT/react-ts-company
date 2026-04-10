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
  Tag,
  Tooltip
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
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  const [allTransactions, setAllTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Server-side pagination meta from API ──
  const [paginationMeta, setPaginationMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0
  });

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

  const loadTransactions = useCallback(
    async (page = 1, pageSize = paginationMeta.per_page) => {
      setLoading(true);
      try {
        const params: TransactionListParams = {
          page,
          per_page: pageSize,
          ...apiFilters,
          ...(searchText ? { search: searchText } : {})
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

        // Store pagination meta from API
        setPaginationMeta({
          current_page: transactionResponse.current_page ?? 1,
          last_page: transactionResponse.last_page ?? 1,
          per_page: transactionResponse.per_page ?? pageSize,
          total: transactionResponse.total ?? 0,
          from: transactionResponse.from ?? 0,
          to: transactionResponse.to ?? 0
        });
      } catch (error) {
        console.error('Error loading transactions:', error);
        message.error('Không thể tải danh sách hoạt động');
      } finally {
        setLoading(false);
      }
    },
    [apiFilters, searchText, paginationMeta.per_page]
  );

  const [globalStats, setGlobalStats] = useState({ totalIn: 0, totalOut: 0 });

  const loadStatistics = useCallback(async () => {
    try {
      const res = await StockTransactionService.getStatistics(
        apiFilters.from_date,
        apiFilters.to_date
      );
      if (res && 'success' in res && res.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (res as any).data?.summary;
        if (stats) {
          setGlobalStats({
            totalIn: Number(stats.total_in) || 0,
            totalOut: Number(stats.total_out) || 0
          });
        }
      }
    } catch (e) {
      console.error('Error loading statistics', e);
    }
  }, [apiFilters.from_date, apiFilters.to_date]);

  useEffect(() => {
    loadTransactions(1);
    loadStatistics();
  }, [loadTransactions, loadStatistics]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await StockTransactionService.deleteTransaction(id);
        if ('success' in res && res.success) {
          message.success(res.message || 'Đã xoá giao dịch');
          loadTransactions(paginationMeta.current_page);
        } else {
          message.error(
            (res as { message?: string }).message || 'Xoá thất bại'
          );
        }
      } catch {
        message.error('Có lỗi xảy ra khi xoá');
      }
    },
    [loadTransactions, paginationMeta.current_page]
  );

  // Client-side product filter (API doesn't support product_id filter)
  const filtered = useMemo(() => {
    if (!filterProductId) return allTransactions;
    return allTransactions.filter((tx) => tx.product_id === filterProductId);
  }, [allTransactions, filterProductId]);

  const summary = useMemo(() => {
    let currentIn = 0;
    let currentOut = 0;
    filtered.forEach((tx) => {
      const qty = Number(tx.quantity) || 0;
      if (tx.type === 'in') currentIn += qty;
      else currentOut += qty;
    });

    if (filterProductId || searchText || apiFilters.type) {
      return { totalIn: currentIn, totalOut: currentOut };
    }

    return { totalIn: globalStats.totalIn, totalOut: globalStats.totalOut };
  }, [filtered, filterProductId, searchText, apiFilters.type, globalStats]);

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

  const formatQty = (val: number | string) => {
    return Number(val).toLocaleString('vi-VN', {
      maximumFractionDigits: 5, // Prevent rounding
      minimumFractionDigits: 0
    });
  };

  // ── Dynamic column widths based on actual data ──
  const colWidths = useMemo(() => {
    const CHAR_PX = 8;
    const PADDING = 24;

    const measure = (values: string[], minW: number, headerLen: number) => {
      const maxLen = values.reduce(
        (max, v) => Math.max(max, (v || '').length),
        headerLen
      );
      return Math.max(minW, maxLen * CHAR_PX + PADDING);
    };

    const data = filtered.length > 0 ? filtered : allTransactions;

    const productW = measure(
      data.flatMap((tx) => [tx.product_name || '', tx.product_code || '']),
      80,
      6
    );

    const qtyW = measure(
      data.map((tx) => `+${tx.quantity}`),
      50,
      2
    );

    const lotW = measure(
      data.map((tx) => tx.lot || ''),
      80,
      3
    );

    const binW = measure(
      data.map((tx) => (tx.bin != null ? String(tx.bin) : '-')),
      50,
      4
    );

    const empW = measure(
      data.map((tx) => tx.employee_name || 'N/A'),
      60,
      2
    );

    const timeW = Math.max(90, 10 * CHAR_PX + PADDING);

    return { productW, qtyW, lotW, binW, empW, timeW };
  }, [filtered, allTransactions]);

  // Desktop table columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
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
      width: colWidths.productW,
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
      width: colWidths.qtyW,
      align: 'center' as const,
      sorter: (a: TransactionRow, b: TransactionRow) => a.quantity - b.quantity,
      render: (v: number, r: TransactionRow) => (
        <Text
          style={{
            color: r.type === 'in' ? '#52c41a' : '#ff4d4f',
            fontWeight: 600
          }}
        >
          {r.type === 'in' ? '+' : '-'}
          {formatQty(v)}
        </Text>
      )
    },
    {
      title: 'Lot',
      dataIndex: 'lot',
      key: 'lot',
      width: colWidths.lotW,
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
      width: colWidths.binW,
      align: 'center' as const,
      render: (v: number) => (
        <Text className="text-xs">{v != null ? v : '-'}</Text>
      )
    },
    {
      title: 'NV',
      dataIndex: 'employee_name',
      key: 'employee_name',
      width: colWidths.empW,
      align: 'center' as const,
      render: (v: string) => <Text className="text-xs">{v || 'N/A'}</Text>
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: colWidths.timeW,
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
          description={`${r.product_name} — Lot: ${r.lot}, SL: ${formatQty(r.quantity)}, Thùng: ${r.bin ?? 'N/A'}`}
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

  const totalScrollX = useMemo(() => {
    const { productW, qtyW, lotW, binW, empW, timeW } = colWidths;
    return productW + 50 + 65 + qtyW + lotW + binW + empW + timeW + 40;
  }, [colWidths]);

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
            {formatQty(tx.quantity)}
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
        description={`${tx.product_name} — Lot: ${tx.lot}, SL: ${formatQty(tx.quantity)}`}
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
              +{formatQty(summary.totalIn)}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Xuất</span>
            <span className="ml-1 text-sm font-bold text-red-500">
              -{formatQty(summary.totalOut)}
            </span>
          </div>
          <Tooltip title="Chênh lệch (Nhập - Xuất) trong khoảng thời gian lọc. Tồn thực tế sẽ cộng thêm số dư đầu kỳ.">
            <div>
              <span className="text-xs text-gray-400">Biến động</span>
              <span className="ml-1 text-sm font-bold text-blue-600">
                {summary.totalIn - summary.totalOut >= 0 ? '+' : ''}
                {formatQty(summary.totalIn - summary.totalOut)}
              </span>
            </div>
          </Tooltip>
          <div>
            <span className="text-xs text-gray-400">GD</span>
            <span className="ml-1 text-xs font-semibold text-gray-700">
              {paginationMeta.total.toLocaleString('vi-VN')}
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
          <div className="w-full sm:w-auto">
            {isMobile ? (
              <div className="flex w-full gap-2">
                <DatePicker
                  size="small"
                  format="DD/MM/YYYY"
                  placeholder="Từ ngày"
                  value={dateRange[0]}
                  onChange={(date) => handleDateChange([date, dateRange[1]])}
                  className="w-1/2"
                  allowClear={false}
                />
                <DatePicker
                  size="small"
                  format="DD/MM/YYYY"
                  placeholder="Đến ngày"
                  value={dateRange[1]}
                  onChange={(date) => handleDateChange([dateRange[0], date])}
                  className="w-1/2"
                  allowClear={false}
                />
              </div>
            ) : (
              <RangePicker
                size="small"
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={handleDateChange}
                className="!w-auto"
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
            )}
          </div>

          {/* Quick Date Buttons */}
          <div className="flex items-center gap-1">
            <Button
              size="small"
              type="dashed"
              onClick={() => handleDateChange([dayjs(), dayjs()])}
              className="text-xs"
            >
              Hôm nay
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() =>
                handleDateChange([
                  dayjs().subtract(1, 'day'),
                  dayjs().subtract(1, 'day')
                ])
              }
              className="text-xs"
            >
              Hôm qua
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-end gap-1.5 sm:justify-start">
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
              onClick={() => loadTransactions(paginationMeta.current_page)}
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
            current: paginationMeta.current_page,
            pageSize: paginationMeta.per_page,
            total: paginationMeta.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: 'small',
            onChange: (page, pageSize) => loadTransactions(page, pageSize)
          }}
          size="small"
          scroll={{ x: totalScrollX }}
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
              {filtered.map((tx) => (
                <MobileCard key={tx.id} tx={tx} />
              ))}
            </div>
            {paginationMeta.last_page > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                <span>
                  {paginationMeta.from}-{paginationMeta.to} /{' '}
                  {paginationMeta.total}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="small"
                    disabled={paginationMeta.current_page <= 1}
                    onClick={() =>
                      loadTransactions(paginationMeta.current_page - 1)
                    }
                  >
                    ‹
                  </Button>
                  <span className="px-1.5 text-xs font-medium text-gray-600">
                    {paginationMeta.current_page} / {paginationMeta.last_page}
                  </span>
                  <Button
                    size="small"
                    disabled={
                      paginationMeta.current_page >= paginationMeta.last_page
                    }
                    onClick={() =>
                      loadTransactions(paginationMeta.current_page + 1)
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

export default RawTransactionHistory;

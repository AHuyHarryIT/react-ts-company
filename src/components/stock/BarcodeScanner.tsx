import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { Input, Radio, notification, Alert } from 'antd';
import type { InputRef } from 'antd';
import { ScanOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/ProductService';
import ResearchStockPanel from '@/components/stock/ResearchStockPanel';
import { StockTransactionService } from '@/services/StockTransactionService';
import { isBarcode } from '@/utils/barcodeUtil';

type ProductMap = { id: string; name: string; code: string };

interface ScanLog {
  id: number;
  timestamp: Date;
  barcode: string;
  productName: string;
  operation: 'in' | 'out';
  duration?: number;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

interface CurrentStockLookupItem {
  product_id: number;
  product_code: string;
  product_name: string;
  lot: string;
  bins: string;
  current_quantity: number;
}

interface CurrentStockLookupResponse {
  stocks?: CurrentStockLookupItem[];
}

interface ScanQueueItem {
  barcode: string;
  endpoint: 'scan-in' | 'scan-out';
  operation: 'in' | 'out';
  cacheKey: string;
  logId: number;
}

interface ScanApiProduct {
  id?: number | string;
  code?: string;
  name?: string;
  quanEntityBin?: number;
}

interface ScanApiStorageProduct {
  id?: number;
  product_id?: number | string;
  lot?: string;
  bin?: number;
  quantity?: number;
  barcode?: string;
  product?: ScanApiProduct;
}

interface ScanApiEmployee {
  id?: string;
  name?: string;
}

interface ScanApiTransaction {
  id?: number;
  type?: 'in' | 'out';
  quantity?: number;
  storage_product?: ScanApiStorageProduct;
  storageProduct?: ScanApiStorageProduct;
  employee?: ScanApiEmployee;
}

const compareLotsNewestFirst = (a: string, b: string) => {
  const lotPattern = /^[A-Z]-(\d{2})(\d{2})(\d{4})-([12])$/;
  const matchA = a.match(lotPattern);
  const matchB = b.match(lotPattern);

  if (matchA && matchB) {
    const dateA = Number(`${matchA[3]}${matchA[2]}${matchA[1]}`);
    const dateB = Number(`${matchB[3]}${matchB[2]}${matchB[1]}`);
    if (dateA !== dateB) return dateB - dateA;

    const shiftA = Number(matchA[4]);
    const shiftB = Number(matchB[4]);
    if (shiftA !== shiftB) return shiftB - shiftA;
  }

  return b.localeCompare(a, 'vi');
};

// Pre-validate barcode format before hitting API
const quickValidateBarcode = (
  barcode: string
): { valid: boolean; error?: string } => {
  if (barcode.length < 10)
    return { valid: false, error: 'Barcode quá ngắn (min 10 ký tự)' };
  if (barcode.length > 30)
    return { valid: false, error: 'Barcode quá dài (max 30 ký tự)' };
  if (/^\d+$/.test(barcode))
    return { valid: false, error: 'Barcode thiếu separator' };
  return { valid: true };
};

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [operation, setOperation] = useState<'in' | 'out'>('in');
  const [scanCount, setScanCount] = useState(0);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  // Xuất kho 2-step state
  const [lastQrScanned, setLastQrScanned] = useState<ProductMap | null>(null);
  const [researchProductId, setResearchProductId] = useState<number>();
  const [researchLot, setResearchLot] = useState<string>();
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<{
    productName: string;
    productCode: string;
    lot: string;
    quantity: number;
    bins: number[];
  } | null>(null);

  const barcodeInputRef = useRef<InputRef>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBarcodeRef = useRef<string>('');
  const operationRef = useRef<'in' | 'out'>('in');
  const scanQueueRef = useRef<ScanQueueItem[]>([]);
  const queueRunningRef = useRef<boolean>(false);
  const pendingBarcodesRef = useRef<Set<string>>(new Set());
  const recentBarcodesRef = useRef<Set<string>>(new Set());

  // Load products for QR matching (xuất kho flow)
  const { data: products = [] } = useQuery({
    queryKey: ['products-scan'],
    queryFn: async () => {
      const response = await productService.list({ limit: 0 });
      return response.data.map((p) => ({
        id: String(p.id),
        name: p.name,
        code: p.code
      })) as ProductMap[];
    }
  });

  const { data: researchStocks = [], isFetching: isLoadingResearchLots } =
    useQuery({
      queryKey: ['stock-research-lots', researchProductId],
      enabled: Boolean(researchProductId),
      queryFn: async () => {
        const result = (await StockTransactionService.getCurrentStock(
          researchProductId,
          undefined,
          false,
          1000
        )) as {
          success?: boolean;
          data?: CurrentStockLookupResponse;
        };
        if (result?.success === false) return [];
        return result?.data?.stocks || [];
      }
    });

  const researchLotOptions = useMemo(() => {
    const uniqueLots = Array.from(
      new Set(
        researchStocks
          .map((item) => item.lot)
          .filter((lot): lot is string => Boolean(lot))
      )
    );

    return uniqueLots.sort(compareLotsNewestFirst).map((lot) => ({
      value: lot,
      label: lot.replace(/^[A-Z]-/, '')
    }));
  }, [researchStocks]);

  // Keep operationRef in sync & reset QR state when switching modes
  useEffect(() => {
    operationRef.current = operation;
    setLastQrScanned(null);
  }, [operation]);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleResearchStock = async () => {
    if (!researchProductId) {
      notification.warning({
        message: 'Thiếu mã sản phẩm',
        description: 'Vui lòng chọn mã sản phẩm cần tìm kiếm.',
        duration: 2
      });
      return;
    }

    if (!researchLot) {
      notification.warning({
        message: 'Thiếu lot',
        description: 'Vui lòng chọn lot trong danh sách.',
        duration: 2
      });
      return;
    }

    setIsResearching(true);
    try {
      const result = (await StockTransactionService.getCurrentStock(
        researchProductId,
        researchLot,
        false,
        1000
      )) as {
        success?: boolean;
        message?: string;
        data?: CurrentStockLookupResponse;
      };

      if (result?.success === false) {
        notification.error({
          message: 'Tìm kiếm thất bại',
          description: result.message || 'Không thể tải số liệu kho',
          duration: 2
        });
        return;
      }

      const matched = (result?.data?.stocks || []).find(
        (item) =>
          Number(item.product_id) === Number(researchProductId) &&
          item.lot === researchLot
      );

      const product = products.find(
        (item) => Number(item.id) === Number(researchProductId)
      );

      const bins =
        matched?.bins
          ?.split(',')
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isFinite(value))
          .sort((a, b) => a - b) || [];

      setResearchResult({
        productName:
          matched?.product_name || product?.name || `SP #${researchProductId}`,
        productCode: matched?.product_code || product?.code || '',
        lot: researchLot,
        quantity: Number(matched?.current_quantity || 0),
        bins
      });

      notification.success({
        message: 'Tìm kiếm thành công',
        description: `Đã cập nhật số liệu kho cho lot ${researchLot}`,
        duration: 1.5
      });
    } catch {
      notification.error({
        message: 'Lỗi hệ thống',
        description: 'Không thể tìm kiếm số liệu kho',
        duration: 2
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleChangeResearchProduct = (value: number) => {
    setResearchProductId(value);
    setResearchLot(undefined);
    setResearchResult(null);
  };

  const formatDuration = (duration?: number): string => {
    if (typeof duration !== 'number') return '--';
    if (duration >= 1000) return `${(duration / 1000).toFixed(1)}s`;
    return `${duration}ms`;
  };

  const resetForm = useCallback(() => {
    setBarcode('');
    latestBarcodeRef.current = '';
    requestAnimationFrame(() => {
      barcodeInputRef.current?.focus();
    });
  }, []);

  const clearDebounce = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  // Resolve product name from barcode using loaded products list
  const getProductName = useCallback(
    (barcodeValue: string): string => {
      const separatorMatch = barcodeValue.match(/[^0-9]/);
      if (!separatorMatch?.index) return barcodeValue;
      const productId = barcodeValue.substring(0, separatorMatch.index);
      const product = products.find((p) => p.id === productId);
      return product ? `${product.name} (${product.code})` : barcodeValue;
    },
    [products]
  );

  const appendLog = useCallback((log: Omit<ScanLog, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setScanLogs((prev) => [{ ...log, id }, ...prev.slice(0, 9)]);
    return id;
  }, []);

  const updateLog = useCallback((id: number, patch: Partial<ScanLog>) => {
    setScanLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...patch } : log))
    );
  }, []);

  // Extract product from QR string
  const extractProductFromString = useCallback(
    (input: string): ProductMap | null => {
      return products.find((p) => input.includes(p.code)) || null;
    },
    [products]
  );

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);
    latestBarcodeRef.current = value;
    clearDebounce();

    // Use longer debounce to wait for scanner to finish sending all characters
    if (value.length >= 5 && value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        if (latestBarcodeRef.current === value) {
          processScanInput(value);
        }
      }, 400);
    }
  };

  // Main scan handler — routes to nhập or xuất flow
  const processScanInput = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;

    const currentOp = operationRef.current;

    if (currentOp === 'in') {
      // Nhập kho: 1 step — just scan barcode
      enqueueScanApi(trimmed, 'scan-in');
    } else {
      // Xuất kho: 2 steps — QR first, then Barcode
      handleExportScan(trimmed);
    }
  };

  // Xuất kho 2-step logic (from /scan page)
  const handleExportScan = (rawInput: string) => {
    const barcodeInput = isBarcode(rawInput);
    const qrMatch = !barcodeInput ? extractProductFromString(rawInput) : null;

    if (!barcodeInput && !qrMatch) {
      notification.warning({
        message: 'Không nhận dạng được',
        description: 'Mã quét không phải QR sản phẩm hay Barcode thùng hợp lệ.',
        duration: 2
      });
      setTimeout(() => resetForm(), 500);
      return;
    }

    // Step 1: QR scan → identify product
    if (!barcodeInput && qrMatch) {
      setLastQrScanned(qrMatch);
      notification.success({
        message: `Sản phẩm: ${qrMatch.name}`,
        description: 'Tiếp theo: quét Barcode thùng để xuất.',
        duration: 2
      });
      setTimeout(() => resetForm(), 500);
      return;
    }

    // Step 2: Barcode scan → validate & export
    if (barcodeInput) {
      if (!lastQrScanned) {
        notification.warning({
          message: 'Chưa quét QR sản phẩm',
          description:
            'Vui lòng quét mã QR sản phẩm trước khi quét Barcode thùng.',
          duration: 2
        });
        setTimeout(() => resetForm(), 500);
        return;
      }

      // Validate product match
      const productIdFromBarcode = rawInput.split('a')[0];
      if (productIdFromBarcode !== lastQrScanned.id) {
        const barcodeName =
          products.find((p) => p.id === productIdFromBarcode)?.name ||
          `ID ${productIdFromBarcode}`;
        notification.error({
          message: 'Sản phẩm không khớp',
          description: `QR: ${lastQrScanned.name} — Barcode: ${barcodeName}. Kiểm tra lại!`,
          duration: 3
        });
        setTimeout(() => resetForm(), 500);
        return;
      }

      // Match OK → call scan-out
      setLastQrScanned(null);
      enqueueScanApi(rawInput, 'scan-out');
    }
  };

  const executeQueuedScan = useCallback(
    async (item: ScanQueueItem) => {
      const baseUrl = (import.meta.env.VITE_BASE_API_URL || '').replace(
        /\/+$/,
        ''
      );
      const token = localStorage.getItem('token');
      const startTime = performance.now();

      try {
        const response = await fetch(
          `${baseUrl}/api/stock-transactions/${item.endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ barcode: item.barcode })
          }
        );

        const duration = Math.round(performance.now() - startTime);
        let body: Record<string, unknown> | null = null;
        try {
          body = await response.json();
        } catch {
          // Response is not JSON — treat as error
        }

        if (response.ok || response.status === 409) {
          recentBarcodesRef.current.add(item.cacheKey);
          setTimeout(
            () => recentBarcodesRef.current.delete(item.cacheKey),
            5000
          );
        }

        if (response.ok && body?.success !== false) {
          setScanCount((prev) => prev + 1);

          const root = (body || {}) as Record<string, unknown>;
          const data = ((root.data as Record<string, unknown>) ||
            root) as Record<string, unknown>;
          const transaction = (data.transaction || root.transaction) as
            | ScanApiTransaction
            | undefined;
          const storageProduct =
            transaction?.storage_product ||
            transaction?.storageProduct ||
            (data.storage_product as ScanApiStorageProduct | undefined);
          const product = storageProduct?.product;
          const employee = transaction?.employee;

          const msg =
            (root.message as string) ||
            (item.operation === 'in'
              ? 'Nhập kho thành công'
              : 'Xuất kho thành công');

          const resolvedProductName = product?.name
            ? `${product.name}${product.code ? ` (${product.code})` : ''}`
            : getProductName(item.barcode);

          const operatorSuffix = employee?.name ? ` • ${employee.name}` : '';

          updateLog(item.logId, {
            status: 'success',
            duration,
            message: `${msg}${operatorSuffix}`,
            productName: resolvedProductName
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('stock:scan-success', {
                detail: {
                  transaction: {
                    id: transaction?.id,
                    type: transaction?.type || item.operation,
                    quantity: transaction?.quantity
                  },
                  storage_product: storageProduct
                    ? {
                        id: storageProduct.id,
                        product_id: storageProduct.product_id,
                        lot: storageProduct.lot,
                        bin: storageProduct.bin,
                        quantity: storageProduct.quantity,
                        barcode: storageProduct.barcode || item.barcode
                      }
                    : undefined,
                  product: product
                    ? {
                        id: product.id,
                        code: product.code,
                        name: product.name,
                        quanEntityBin: product.quanEntityBin
                      }
                    : undefined,
                  employee: employee
                    ? {
                        id: employee.id,
                        name: employee.name
                      }
                    : undefined
                }
              })
            );
          }

          notification.success({
            message: msg,
            description: resolvedProductName,
            duration: 1
          });
        } else {
          const errorMsg =
            item.operation === 'in' ? 'Lỗi nhập kho' : 'Lỗi xuất kho';
          let serverMessage: string;
          if (response.status === 404) {
            serverMessage =
              item.operation === 'out'
                ? `Thùng chưa được nhập kho hoặc đã xuất hết (barcode: ${item.barcode})`
                : `Không tìm thấy sản phẩm cho barcode: ${item.barcode}`;
          } else if (response.status === 409) {
            serverMessage =
              item.operation === 'in'
                ? 'Thùng này đã được nhập kho trước đó, không thể nhập trùng'
                : 'Thùng này đã được xuất kho trước đó';
          } else if (response.status === 422) {
            serverMessage =
              ((body?.error as Record<string, unknown>)?.message as string) ||
              'Format barcode không đúng';
          } else {
            serverMessage =
              (body?.message as string) ||
              ((body?.error as Record<string, unknown>)?.message as string) ||
              errorMsg;
          }

          updateLog(item.logId, {
            status: 'failed',
            duration,
            message: serverMessage
          });
          notification.error({
            message: errorMsg,
            description: serverMessage,
            duration: 3
          });
        }
      } catch {
        const duration = Math.round(performance.now() - startTime);
        updateLog(item.logId, {
          status: 'failed',
          duration,
          message: 'Lỗi hệ thống'
        });
        notification.error({
          message: 'Lỗi hệ thống',
          description: 'Không thể kết nối server',
          duration: 2
        });
      } finally {
        pendingBarcodesRef.current.delete(item.cacheKey);
      }
    },
    [getProductName, updateLog]
  );

  const processQueue = useCallback(async () => {
    if (queueRunningRef.current) return;
    queueRunningRef.current = true;
    try {
      while (scanQueueRef.current.length > 0) {
        const nextItem = scanQueueRef.current.shift();
        if (!nextItem) break;
        await executeQueuedScan(nextItem);
      }
    } finally {
      queueRunningRef.current = false;
    }
  }, [executeQueuedScan]);

  // Queue API call for both nhập (scan-in) and xuất (scan-out)
  const enqueueScanApi = (
    barcodeValue: string,
    endpoint: 'scan-in' | 'scan-out'
  ) => {
    const trimmedBarcode = barcodeValue.trim();
    if (!trimmedBarcode) return;

    const currentOp = endpoint === 'scan-in' ? 'in' : 'out';
    const cacheKey = `${currentOp}:${trimmedBarcode}`;

    if (pendingBarcodesRef.current.has(cacheKey)) {
      notification.info({
        message: 'Barcode đang xử lý',
        description: 'Vui lòng chờ kết quả barcode này',
        duration: 1
      });
      resetForm();
      return;
    }

    if (recentBarcodesRef.current.has(cacheKey)) {
      notification.info({
        message: 'Barcode đã quét',
        description: 'Thùng này vừa được quét xong',
        duration: 1
      });
      resetForm();
      return;
    }

    if (endpoint === 'scan-in') {
      const validation = quickValidateBarcode(trimmedBarcode);
      if (!validation.valid) {
        notification.warning({
          message: 'Barcode không hợp lệ',
          description: validation.error,
          duration: 2
        });
        resetForm();
        return;
      }
    }

    clearDebounce();
    resetForm();

    const logId = appendLog({
      timestamp: new Date(),
      barcode: trimmedBarcode,
      productName: getProductName(trimmedBarcode),
      operation: currentOp,
      status: 'pending',
      message: 'Đang xử lý...'
    });

    pendingBarcodesRef.current.add(cacheKey);
    scanQueueRef.current.push({
      barcode: trimmedBarcode,
      endpoint,
      operation: currentOp,
      cacheKey,
      logId
    });
    void processQueue();
  };

  // Manual scan
  const handleManualScan = () => {
    clearDebounce();
    const currentBarcode = latestBarcodeRef.current || barcode;
    processScanInput(currentBarcode);
  };

  return (
    <div className="space-y-5">
      {/* Scanner Controls */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Operation Toggle */}
          <Radio.Group
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            buttonStyle="solid"
            size="middle"
            className="grid w-full grid-cols-2 sm:block sm:w-auto"
          >
            <Radio.Button
              value="in"
              className="!w-full !text-center !font-semibold sm:!w-auto"
            >
              Nhập kho
            </Radio.Button>
            <Radio.Button
              value="out"
              className="!w-full !text-center !font-semibold sm:!w-auto"
            >
              Xuất kho
            </Radio.Button>
          </Radio.Group>

          {/* Barcode Input */}
          <div className="flex-1">
            <Input
              ref={barcodeInputRef}
              placeholder={
                operation === 'in'
                  ? 'Quét barcode thùng để nhập...'
                  : lastQrScanned
                    ? `${lastQrScanned.name} — Quét barcode thùng...`
                    : 'Quét QR sản phẩm trước...'
              }
              value={barcode}
              onChange={handleBarcodeChange}
              onPressEnter={handleManualScan}
              suffix={<SearchOutlined />}
              size="large"
              allowClear
              className="stock-search-input"
            />
          </div>

          {/* Scan Counter Badge */}
          <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 sm:w-auto">
            <ScanOutlined />
            <span>{scanCount}</span>
          </div>
        </div>

        {/* Xuất kho: QR status indicator */}
        {operation === 'out' && (
          <div className="mt-3">
            {lastQrScanned ? (
              <Alert
                type="info"
                showIcon
                message={
                  <span className="text-sm">
                    Sản phẩm: <strong>{lastQrScanned.name}</strong> (
                    {lastQrScanned.code}){' — '}Quét Barcode thùng để xuất
                  </span>
                }
              />
            ) : (
              <Alert
                type="warning"
                showIcon
                message={
                  <span className="text-sm">
                    Bước 1: Quét mã <strong>QR sản phẩm</strong> trước
                  </span>
                }
              />
            )}

            <div className="mt-3">
              <ResearchStockPanel
                productOptions={products.map((item) => ({
                  value: Number(item.id),
                  label: `${item.code} - ${item.name}`
                }))}
                lotOptions={researchLotOptions}
                productId={researchProductId}
                lotValue={researchLot}
                loading={isResearching}
                lotLoading={isLoadingResearchLots}
                result={researchResult}
                onProductChange={handleChangeResearchProduct}
                onLotChange={setResearchLot}
                onSubmit={() => void handleResearchStock()}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scan Logs */}
      {scanLogs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Log quét gần đây
            </span>
            <span className="text-xs text-gray-400">
              {scanLogs.length} bản ghi
            </span>
          </div>
          <div
            className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100"
            style={{ maxHeight: 220, overflowY: 'auto' }}
          >
            {scanLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-3 py-2 transition-colors"
                style={{
                  backgroundColor:
                    log.status === 'success'
                      ? '#fafff5'
                      : log.status === 'failed'
                        ? '#fff8f7'
                        : '#f5f8ff'
                }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor:
                      log.status === 'success'
                        ? '#52c41a'
                        : log.status === 'failed'
                          ? '#ff4d4f'
                          : '#1677ff'
                  }}
                >
                  {log.status === 'pending'
                    ? '~'
                    : log.operation === 'in'
                      ? '↓'
                      : '↑'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          log.status === 'success'
                            ? '#389e0d'
                            : log.status === 'failed'
                              ? '#cf1322'
                              : '#1d4ed8'
                      }}
                    >
                      {log.operation === 'in' ? 'NHẬP' : 'XUẤT'}
                    </span>
                    <span className="truncate text-xs font-medium text-gray-700">
                      {log.productName}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {log.message}
                  </div>
                </div>
                <div className="shrink-0 text-right leading-tight">
                  <div
                    className="text-xs font-bold"
                    style={{
                      color:
                        log.status === 'pending'
                          ? '#9ca3af'
                          : (log.duration || 0) < 1000
                            ? '#52c41a'
                            : '#fa8c16'
                    }}
                  >
                    {formatDuration(log.duration)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.timestamp.toLocaleTimeString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;

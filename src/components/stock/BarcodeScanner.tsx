import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Radio, notification, Alert } from 'antd';
import type { InputRef } from 'antd';
import { ScanOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/ProductService';
import { isBarcode } from '@/utils/barcodeUtil';

type ProductMap = { id: string; name: string; code: string };

interface ScanLog {
  id: number;
  timestamp: Date;
  barcode: string;
  productName: string;
  operation: 'in' | 'out';
  duration: number;
  success: boolean;
  message: string;
}

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

  const barcodeInputRef = useRef<InputRef>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBarcodeRef = useRef<string>('');
  const operationRef = useRef<'in' | 'out'>('in');
  const processingRef = useRef<boolean>(false);
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

  const formatDuration = (duration: number): string => {
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
    setScanLogs((prev) => [{ ...log, id: Date.now() }, ...prev.slice(0, 9)]);
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
    if (!trimmed || processingRef.current) return;

    const currentOp = operationRef.current;

    if (currentOp === 'in') {
      // Nhập kho: 1 step — just scan barcode
      executeScanApi(trimmed, 'scan-in');
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
      executeScanApi(rawInput, 'scan-out');
    }
  };

  // API call for both nhập (scan-in) and xuất (scan-out)
  const executeScanApi = async (
    barcodeValue: string,
    endpoint: 'scan-in' | 'scan-out'
  ) => {
    const trimmedBarcode = barcodeValue.trim();
    if (!trimmedBarcode || processingRef.current) return;

    const currentOp = endpoint === 'scan-in' ? 'in' : 'out';

    // Skip duplicate in 5s
    const cacheKey = `${currentOp}:${trimmedBarcode}`;
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
    processingRef.current = true;

    // Delay clearing input so user can see what was scanned
    setTimeout(() => resetForm(), 500);

    const baseUrl = (import.meta.env.VITE_BASE_API_URL || '').replace(
      /\/+$/,
      ''
    );
    const token = localStorage.getItem('token');
    const startTime = performance.now();

    try {
      const response = await fetch(
        `${baseUrl}/api/stock-transactions/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ barcode: trimmedBarcode })
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
        recentBarcodesRef.current.add(cacheKey);
        setTimeout(() => recentBarcodesRef.current.delete(cacheKey), 5000);
      }

      // Check both HTTP status and body.success
      if (response.ok && body?.success !== false) {
        setScanCount((prev) => prev + 1);
        const msg =
          currentOp === 'in' ? 'Nhập kho thành công' : 'Xuất kho thành công';
        const pName = getProductName(trimmedBarcode);
        appendLog({
          timestamp: new Date(),
          barcode: trimmedBarcode,
          productName: pName,
          operation: currentOp,
          duration,
          success: true,
          message: msg
        });
        notification.success({ message: msg, description: pName, duration: 1 });
      } else {
        const errorMsg = currentOp === 'in' ? 'Lỗi nhập kho' : 'Lỗi xuất kho';
        // Map common HTTP status codes to clear Vietnamese messages
        let serverMessage: string;
        if (response.status === 404) {
          serverMessage =
            currentOp === 'out'
              ? `Thùng chưa được nhập kho hoặc đã xuất hết (barcode: ${trimmedBarcode})`
              : `Không tìm thấy sản phẩm cho barcode: ${trimmedBarcode}`;
        } else if (response.status === 409) {
          serverMessage =
            currentOp === 'in'
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
        const pName = getProductName(trimmedBarcode);
        appendLog({
          timestamp: new Date(),
          barcode: trimmedBarcode,
          productName: pName,
          operation: currentOp,
          duration,
          success: false,
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
      appendLog({
        timestamp: new Date(),
        barcode: trimmedBarcode,
        productName: getProductName(trimmedBarcode),
        operation: currentOp,
        duration,
        success: false,
        message: 'Lỗi hệ thống'
      });
      notification.error({
        message: 'Lỗi hệ thống',
        description: 'Không thể kết nối server',
        duration: 2
      });
    } finally {
      processingRef.current = false;
    }
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
                style={{ backgroundColor: log.success ? '#fafff5' : '#fff8f7' }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: log.success ? '#52c41a' : '#ff4d4f'
                  }}
                >
                  {log.operation === 'in' ? '↓' : '↑'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span
                      className="text-xs font-bold"
                      style={{ color: log.success ? '#389e0d' : '#cf1322' }}
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
                      color: log.duration < 1000 ? '#52c41a' : '#fa8c16'
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

// import { echo } from '@/utils/lib/echo';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { productService } from '@services/ProductService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Alert, Button, Input, InputRef } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isBarcode } from '@utils/barcodeUtil';
import { FaBox } from 'react-icons/fa6';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { checkBarcode } from '@services/ScanService';
import { AxiosError } from 'axios';

type ProductMap = { id: string; name: string; code: string };

export default function ScanProduct() {
  const [products, setProducts] = useState<ProductMap[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [lastQrScanned, setLastQrScanned] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'info' | 'warning' | 'danger';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });
  // Track processing time for mutation
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const processingStartRef = useRef<number | null>(null);
  const alertTimeout = useRef<NodeJS.Timeout | null>(null);
  // Remove manual timeout, use debounce instead
  const inputRef = useRef<InputRef>(null);
  // Track input focus/blur times for QR and Barcode
  const [qrInputProcessedTime, setQrInputProcessedTime] = useState<
    number | null
  >(null);
  const [barcodeInputProcessedTime, setBarcodeInputProcessedTime] = useState<
    number | null
  >(null);
  // Generic input start time
  const [genericInputStartTime, setGenericInputStartTime] =
    useState<Dayjs | null>(null);

  const { data: productData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productService.list({ limit: 0 });
      const productMap: ProductMap[] = response.data.map((product) => {
        return { id: product.id, name: product.name, code: product.code };
      });

      return productMap;
    }
  });

  const { mutate: barcodeCheck } = useMutation({
    mutationKey: ['checkBarcode'],
    mutationFn: async (barcode: string) => await checkBarcode(barcode),
    onSuccess: () => {
      if (processingStartRef.current) {
        const processTime = Date.now() - processingStartRef.current - 500;
        setProcessingTime(processTime < 0 ? 0 : processTime);
        processingStartRef.current = null;
      }
      showAlert(
        'success',
        `Đã xuất thành công sản phẩm <strong>${lastQrScanned ? lastQrScanned.name : ''}</strong>`
      );
    },
    onError: (error: AxiosError) => {
      if (processingStartRef.current) {
        const processTime = Date.now() - processingStartRef.current - 500;
        setProcessingTime(processTime < 0 ? 0 : processTime);
        processingStartRef.current = null;
      }
      console.error('Barcode check error:', error);
      if (error.status != 409) {
        showAlert(
          'danger',
          `Đã xảy ra lỗi khi xuất sản phẩm: ${error.message}`
        );
      } else if (error.status == 409) {
        showAlert('warning', `LOT đã tồn tại, không thể lưu trùng.`);
      }
    },
    onMutate: () => {
      processingStartRef.current = Date.now();
      setProcessingTime(null);
      showAlert('info', 'Đang kiểm tra mã vạch...');
    }
  });

  // Focus management
  const keepFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    keepFocus();
    window.addEventListener('load', keepFocus);
    return () => {
      window.removeEventListener('load', keepFocus);
    };
  }, [keepFocus]);

  // Fetch products on mount
  useEffect(() => {
    setProducts(productData || []);
  }, [productData]);

  // Show alert helper
  const showAlert = useCallback(
    (type: 'success' | 'info' | 'warning' | 'danger', message: string) => {
      if (alertTimeout.current) clearTimeout(alertTimeout.current);
      setAlert({ type, message, visible: true });
      const delay = 5000;
      alertTimeout.current = setTimeout(
        () => setAlert((a) => ({ ...a, visible: false })),
        delay
      );
    },
    []
  );

  // Extract product from string
  const extractProductFromString = useCallback(
    (input: string) => {
      const product = products.find((product) => input.includes(product.code));
      return product || null;
    },
    [products]
  );

  // Debounced scan logic (300ms after user stops typing)
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  const processScan = useCallback(
    (rawInput: string) => {
      if (!rawInput) return;
      const now = dayjs();
      setInputValue('');

      const barcode = isBarcode(rawInput);
      const qrMatch = !barcode ? extractProductFromString(rawInput) : null;

      if (!barcode) {
        const start = genericInputStartTime || now;
        setQrInputProcessedTime(now.diff(start, 'millisecond'));
        setBarcodeInputProcessedTime(null);
      } else {
        const start = genericInputStartTime || now;
        setBarcodeInputProcessedTime(now.diff(start, 'millisecond'));
      }
      setGenericInputStartTime(null);

      if (!barcode && !qrMatch) {
        showAlert('warning', 'Không xác định được mã QR hợp lệ.');
        return;
      }

      if (barcode && !lastQrScanned) {
        setQrInputProcessedTime(null);
        setBarcodeInputProcessedTime(null);
        showAlert('warning', 'Vui lòng quét mã QR trước khi quét Barcode.');
        return;
      }

      if (barcode && lastQrScanned) {
        const productIdFromBarcode = rawInput.split('a')[0];
        if (productIdFromBarcode != lastQrScanned.id) {
          const barcodeName =
            products.find((p) => p.id == productIdFromBarcode)?.name ||
            `ID ${productIdFromBarcode}`;
          showAlert(
            'danger',
            `Mã QR là <strong>${lastQrScanned.name}</strong>, nhưng barcode là <strong>${barcodeName}</strong>. Kiểm tra lại!`
          );
          return;
        }
      }

      if (!barcode && qrMatch) {
        setLastQrScanned({ id: qrMatch.id, name: qrMatch.name });
        showAlert(
          'success',
          `Đã quét sản phẩm: <strong>${qrMatch.name}.</strong> Vui lòng quét mã <strong>Barcode</strong> tiếp theo.`
        );
      } else if (barcode && lastQrScanned) {
        barcodeCheck(rawInput);
        setLastQrScanned(null);
      }
    },
    [
      extractProductFromString,
      lastQrScanned,
      showAlert,
      genericInputStartTime,
      products,
      barcodeCheck
    ]
  );

  // Handle scan input: only process after 300ms of no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    // If this is the first letter typed, record the generic start time
    if (inputValue.length === 0 && rawInput.length === 1) {
      setGenericInputStartTime(dayjs());
      if (isBarcode(rawInput)) {
        setBarcodeInputProcessedTime(null);
      }
    }
    setInputValue(rawInput);
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(() => {
      processScan(rawInput.trim());
    }, 100);
  };

  return (
    <>
      <BackButton to="/" />
      <ComponentCard title="Quét sản phẩm">
        <Link to="/scan/storage">
          <Button type="primary" icon={<FaBox />}>
            Sản phẩm đã quét
          </Button>
        </Link>
        <div className="space-y-6 text-center">
          <h1 className="text-xl font-semibold">
            Vui lòng dùng máy quét để quét sản phẩm
          </h1>
          <div>
            <Input
              ref={inputRef}
              placeholder="Quét mã tại đây..."
              autoFocus
              style={{ textAlign: 'center' }}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={() => {
                setTimeout(keepFocus, 100);
              }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <div>
              Thời gian nhập QR:{' '}
              <b>
                {qrInputProcessedTime !== null
                  ? (qrInputProcessedTime / 1000).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) + ' s'
                  : '--'}
              </b>
            </div>
            <div>
              Thời gian nhập Barcode:{' '}
              <b>
                {barcodeInputProcessedTime !== null
                  ? (barcodeInputProcessedTime / 1000).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    ) + ' s'
                  : '--'}
              </b>
            </div>
            <div>
              Thời gian xử lý:{' '}
              <b>
                {processingTime !== null
                  ? (processingTime / 1000).toLocaleString() + ' s'
                  : '--'}
              </b>
            </div>
            <div>
              Tổng thời gian quét:{' '}
              <b>
                {qrInputProcessedTime !== null &&
                barcodeInputProcessedTime !== null &&
                processingTime !== null
                  ? (
                      (qrInputProcessedTime +
                        barcodeInputProcessedTime +
                        processingTime) /
                      1000
                    ).toLocaleString() + ' s'
                  : '--'}
              </b>
            </div>
          </div>
          {alert.visible && (
            <Alert
              className="text-center"
              type={alert.type === 'danger' ? 'error' : alert.type}
              message={
                <span dangerouslySetInnerHTML={{ __html: alert.message }} />
              }
              showIcon
            />
          )}
        </div>
      </ComponentCard>
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  Radio,
  Card,
  Row,
  Col,
  Typography,
  notification
} from 'antd';
import type { InputRef } from 'antd';
import { ScanOutlined } from '@ant-design/icons';

import { StockTransactionService } from '@/services/stockTransaction.service';
import type {
  BarcodeInfo,
  ApiErrorResponse,
  ScanRequest
} from '@/types/stockTransaction.types';

const { Text } = Typography;

interface ScanLog {
  id: number;
  timestamp: Date;
  barcode: string;
  operation: 'in' | 'out';
  duration: number;
  success: boolean;
  message: string;
}

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [operation, setOperation] = useState<'in' | 'out'>('in');
  const [barcodeInfo, setBarcodeInfo] = useState<BarcodeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [currentScanStart, setCurrentScanStart] = useState<Date | null>(null);

  const barcodeInputRef = useRef<InputRef>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const formatDuration = (duration: number): string => {
    if (duration >= 1000) {
      return `${(duration / 1000).toFixed(1)}s`;
    }
    return `${duration}ms`;
  };

  const resetForm = () => {
    setBarcode('');
    setBarcodeInfo(null);
    // Focus ngay lập tức để tăng tốc
    barcodeInputRef.current?.focus();
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);

    // Auto submit khi barcode đủ dài và không đang loading
    if (value.length >= 10 && !isLoading && value.trim()) {
      setTimeout(() => {
        handleScan();
      }, 100);
    }
  };

  const handleScan = async () => {
    if (!barcode.trim() || isLoading) return;

    const startTime = new Date();
    setCurrentScanStart(startTime);

    try {
      setIsLoading(true);
      const request: ScanRequest = { barcode: barcode.trim() };

      if (operation === 'in') {
        const result = await StockTransactionService.scanIn(request);

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        if (result.success) {
          notification.success({
            message: 'Nhập kho thành công',
            duration: 1.5
          });
          setScanCount((prev) => prev + 1);

          // Add successful scan log
          setScanLogs((prev) => [
            {
              id: Date.now(),
              timestamp: endTime,
              barcode: barcode.trim(),
              operation: 'in',
              duration,
              success: true,
              message: 'Nhập kho thành công'
            },
            ...prev.slice(0, 9)
          ]); // Keep only last 10 logs

          resetForm();
        } else {
          const errorResult = result as ApiErrorResponse;
          notification.error({
            message: 'Lỗi nhập kho',
            description: errorResult.message,
            duration: 3
          });

          // Add failed scan log
          setScanLogs((prev) => [
            {
              id: Date.now(),
              timestamp: endTime,
              barcode: barcode.trim(),
              operation: 'in',
              duration,
              success: false,
              message: errorResult.message || 'Lỗi nhập kho'
            },
            ...prev.slice(0, 9)
          ]);
        }
      } else {
        const result = await StockTransactionService.scanOut(request);
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        if (result.success) {
          notification.success({
            message: 'Xuất kho thành công',
            duration: 1.5
          });
          setScanCount((prev) => prev + 1);

          // Add successful scan log
          setScanLogs((prev) => [
            {
              id: Date.now(),
              timestamp: endTime,
              barcode: barcode.trim(),
              operation: 'out',
              duration,
              success: true,
              message: 'Xuất kho thành công'
            },
            ...prev.slice(0, 9)
          ]);

          resetForm();
        } else {
          const errorResult = result as ApiErrorResponse;
          notification.error({
            message: 'Lỗi xuất kho',
            description: errorResult.message,
            duration: 3
          });

          // Add failed scan log
          setScanLogs((prev) => [
            {
              id: Date.now(),
              timestamp: endTime,
              barcode: barcode.trim(),
              operation: 'out',
              duration,
              success: false,
              message: errorResult.message || 'Lỗi xuất kho'
            },
            ...prev.slice(0, 9)
          ]);
        }
      }
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.error('Scan error:', error);
      notification.error({
        message: 'Lỗi hệ thống',
        description: 'Không thể thực hiện hoạt động',
        duration: 3
      });

      // Add system error log
      setScanLogs((prev) => [
        {
          id: Date.now(),
          timestamp: endTime,
          barcode: barcode.trim(),
          operation,
          duration,
          success: false,
          message: 'Lỗi hệ thống'
        },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Scanner Interface */}
      <Card size="small">
        <Row gutter={12} align="middle">
          <Col span={6}>
            <Text>Thao tác:</Text>
            <Radio.Group
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              size="small"
              style={{ marginLeft: 8 }}
            >
              <Radio.Button value="in">Nhập</Radio.Button>
              <Radio.Button value="out">Xuất</Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={14}>
            <Input.Search
              ref={barcodeInputRef}
              placeholder="Quét barcode..."
              value={barcode}
              onChange={handleBarcodeChange}
              onSearch={handleScan}
              onPressEnter={handleScan}
              enterButton={
                <Button
                  type="primary"
                  loading={isLoading}
                  icon={<ScanOutlined />}
                  size="small"
                >
                  Quét
                </Button>
              }
              size="small"
            />
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Scan: {scanCount}
              </Text>
            </div>
            {isLoading && currentScanStart && (
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: '10px', color: '#1890ff' }}
                >
                  Đang xử lý...
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Scan Logs */}
      <Card
        size="small"
        title="Log Quét"
        style={{ maxHeight: '300px', overflow: 'auto' }}
      >
        {scanLogs.length === 0 ? (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Chưa có hoạt động quét nào
          </Text>
        ) : (
          <div className="space-y-2">
            {scanLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  backgroundColor: log.success ? '#f6ffed' : '#fff2f0'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '11px',
                        color: log.success ? '#52c41a' : '#ff4d4f',
                        fontWeight: 'bold'
                      }}
                    >
                      {log.operation === 'in' ? 'NHẬP' : 'XUẤT'}
                    </Text>
                    <Text code style={{ fontSize: '11px' }}>
                      {log.barcode.length > 12
                        ? `${log.barcode.slice(0, 12)}...`
                        : log.barcode}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      {formatDuration(log.duration)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      {log.timestamp.toLocaleTimeString('vi-VN')}
                    </Text>
                  </div>
                </div>
                <div style={{ marginTop: '2px' }}>
                  <Text
                    style={{
                      fontSize: '11px',
                      color: log.success ? '#52c41a' : '#ff4d4f'
                    }}
                  >
                    {log.message}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Barcode Info */}
      {barcodeInfo && (
        <Card size="small" title="Thông tin Barcode">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Product ID:</Text> {barcodeInfo.product_id}
            </Col>
            <Col span={8}>
              <Text strong>Lot:</Text> {barcodeInfo.lot_code}
            </Col>
            <Col span={8}>
              <Text strong>Bin:</Text> {barcodeInfo.bin_number}
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;

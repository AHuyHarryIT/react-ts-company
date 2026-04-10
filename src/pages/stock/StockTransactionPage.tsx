import React, { lazy, Suspense } from 'react';
import { Tabs, Spin } from 'antd';
import {
  ScanOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  PieChartOutlined
} from '@ant-design/icons';

import ComponentCard from '@components/common/ComponentCard';
import BarcodeScanner from '@/components/stock/BarcodeScanner';
import { useAuth } from '@hooks/useAuth';
import { isAdmin } from '@utils/authUtil';
import { StockTransactionService } from '@/services/StockTransactionService';
import { InfoCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import StockCalculatorModal from '@/components/stock/StockCalculatorModal';

// Lazy load heavy components to prevent background API calls
// from competing with scan operations
const RawTransactionHistory = lazy(
  () => import('@/components/stock/RawTransactionHistory')
);
const CurrentStockDashboard = lazy(
  () => import('@/components/stock/CurrentStockDashboard')
);
const ProductStockSummary = lazy(
  () => import('@/components/stock/ProductStockSummary')
);

const StockTransactionPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminUser = isAdmin(user?.role?.name || '');

  const tabItems = [
    // Only show scanner tab for non-admin users
    ...(!isAdminUser
      ? [
          {
            key: 'scanner',
            label: (
              <span className="flex items-center gap-1.5">
                <ScanOutlined />
                <span>Quét mã</span>
              </span>
            ),
            children: <BarcodeScanner />
          }
        ]
      : []),
    {
      key: 'history',
      label: (
        <span className="flex items-center gap-1.5">
          <HistoryOutlined />
          <span className="hidden sm:inline">Lịch sử xuất nhập</span>
          <span className="inline sm:hidden">Lịch sử</span>
        </span>
      ),
      children: (
        <Suspense
          fallback={
            <div className="py-10 text-center">
              <Spin size="large" />
            </div>
          }
        >
          <RawTransactionHistory />
        </Suspense>
      )
    },
    {
      key: 'stock',
      label: (
        <span className="flex items-center gap-1.5">
          <DatabaseOutlined />
          <span className="hidden sm:inline">Tồn kho hiện tại</span>
          <span className="inline sm:hidden">Tồn kho</span>
        </span>
      ),
      children: (
        <Suspense
          fallback={
            <div className="py-10 text-center">
              <Spin size="large" />
            </div>
          }
        >
          <CurrentStockDashboard />
        </Suspense>
      )
    },
    {
      key: 'summary',
      label: (
        <span className="flex items-center gap-1.5">
          <PieChartOutlined />
          <span className="hidden sm:inline">Tổng hợp SP</span>
          <span className="inline sm:hidden">Tổng hợp</span>
        </span>
      ),
      children: (
        <Suspense
          fallback={
            <div className="py-10 text-center">
              <Spin size="large" />
            </div>
          }
        >
          <ProductStockSummary />
        </Suspense>
      )
    }
  ];

  // Fetch Global Overview (All-Time) to clarify stock issues
  const [globalOverview, setGlobalOverview] = React.useState<{
    totalIn: number;
    totalOut: number;
    currentStock: number;
  } | null>(null);
  const [showCalculator, setShowCalculator] = React.useState(false);

  React.useEffect(() => {
    if (!isAdminUser) return;
    const fetchGlobal = async () => {
      try {
        const fromDate = dayjs().startOf('month').format('YYYY-MM-DD');
        const toDate = dayjs().format('YYYY-MM-DD');

        const [statsRes, stockRes] = await Promise.all([
          StockTransactionService.getStatistics(fromDate, toDate),
          StockTransactionService.getCurrentStock()
        ]);

        let inQty = 0;
        let outQty = 0;
        let curStock = 0;

        if (statsRes && 'success' in statsRes && statsRes.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sum = (statsRes as any).data?.summary;
          if (sum) {
            inQty = Number(sum.total_in || 0);
            outQty = Number(sum.total_out || 0);
          }
        }

        if (
          stockRes &&
          typeof stockRes === 'object' &&
          'success' in stockRes &&
          stockRes.success
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = (stockRes as any).data;
          if (data && data.summary) {
            curStock = Number(data.summary.total_quantity || 0);
          }
        }

        setGlobalOverview({
          totalIn: inQty,
          totalOut: outQty,
          currentStock: curStock
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchGlobal();
  }, [isAdminUser]);

  return (
    <ComponentCard title="Quản lý Kho">
      {/* Compact Global Overview Badge */}
      {isAdminUser && globalOverview && (
        <div className="mb-4 rounded border border-orange-200 bg-orange-50 px-3 py-2 text-[13px] text-orange-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 font-semibold">
              <InfoCircleOutlined />
              <span>
                Đối soát (Từ {dayjs().startOf('month').format('DD/MM/YYYY')} đến{' '}
                {dayjs().format('DD/MM/YYYY')}):
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Đã Nhập:{' '}
                <strong className="text-green-700">
                  +{globalOverview.totalIn.toLocaleString('vi-VN')}
                </strong>
              </span>
              <span className="hidden h-3 w-px bg-orange-300 sm:block"></span>
              <span>
                Đã Xuất:{' '}
                <strong className="text-red-600">
                  -{globalOverview.totalOut.toLocaleString('vi-VN')}
                </strong>
              </span>
              <span className="hidden h-3 w-px bg-orange-300 sm:block"></span>
              <span>
                Lệch so với Tồn kho thực:{' '}
                <strong className="font-bold text-orange-600">
                  {(
                    globalOverview.totalIn -
                    globalOverview.totalOut -
                    globalOverview.currentStock
                  ).toLocaleString('vi-VN')}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setShowCalculator(true)}
              className="mt-2 ml-auto flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-orange-700 shadow-sm transition-colors hover:bg-orange-200 sm:mt-0"
            >
              <CalculatorOutlined />
              <span className="font-semibold">Bộ tính Đối soát</span>
            </button>
          </div>
        </div>
      )}

      {/* Stock Calculator Integration */}
      {isAdminUser && globalOverview && (
        <StockCalculatorModal
          open={showCalculator}
          onClose={() => setShowCalculator(false)}
          systemCurrent={globalOverview.currentStock}
        />
      )}

      <Tabs
        defaultActiveKey={isAdminUser ? 'history' : 'scanner'}
        items={tabItems}
        type="card"
        destroyOnHidden
        size="small"
      />
    </ComponentCard>
  );
};

export default StockTransactionPage;

import React, { lazy, Suspense } from 'react';
import { Tabs, Spin } from 'antd';
import {
  ScanOutlined,
  HistoryOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

import ComponentCard from '@components/common/ComponentCard';
import BarcodeScanner from '@/components/stock/BarcodeScanner';
import { useAuth } from '@hooks/useAuth';
import { isAdmin } from '@utils/authUtil';

// Lazy load heavy components to prevent background API calls
// from competing with scan operations
const RawTransactionHistory = lazy(
  () => import('@/components/stock/RawTransactionHistory')
);
const CurrentStockDashboard = lazy(
  () => import('@/components/stock/CurrentStockDashboard')
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
                Quét mã
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
          Lịch sử xuất nhập
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
          Tồn kho hiện tại
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
    }
  ];

  return (
    <ComponentCard title="Quản lý Kho">
      <Tabs
        defaultActiveKey={isAdminUser ? 'history' : 'scanner'}
        items={tabItems}
        type="card"
        destroyOnHidden
      />
    </ComponentCard>
  );
};

export default StockTransactionPage;

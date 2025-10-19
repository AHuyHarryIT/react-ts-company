import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  ScanOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import ComponentCard from '@components/common/ComponentCard';

import BarcodeScanner from '@/components/stock/BarcodeScanner';
import TransactionList from '@/components/stock/TransactionList';
import CurrentStockDashboard from '@/components/stock/CurrentStockDashboard';
import RawTransactionHistory from '@/components/stock/RawTransactionHistory';

const StockTransactionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scanner');

  const tabItems = [
    {
      key: 'scanner',
      label: (
        <span>
          <ScanOutlined /> Quét
        </span>
      ),
      children: <BarcodeScanner />
    },
    {
      key: 'raw-transactions',
      label: (
        <span>
          <UnorderedListOutlined /> Hoạt động
        </span>
      ),
      children: <RawTransactionHistory />
    },
    {
      key: 'grouped-transactions',
      label: (
        <span>
          <BarChartOutlined /> Tổng hợp
        </span>
      ),
      children: <TransactionList />
    },
    {
      key: 'current-stock',
      label: (
        <span>
          <DatabaseOutlined /> Tồn kho
        </span>
      ),
      children: <CurrentStockDashboard />
    }
  ];

  return (
    <div className="h-full">
      <ComponentCard title="Quản lý Kho">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
          tabBarStyle={{
            marginBottom: '12px'
          }}
        />
      </ComponentCard>
    </div>
  );
};

export default StockTransactionPage;

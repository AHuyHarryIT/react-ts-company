import { Outlet } from '@tanstack/react-router';
import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import { useEffect } from 'react';

import MarqueeText from '@components/MarqueeText';
import AppFooter from '@partials/Footer';
import Header from '@partials/Header';
import Sidebar from '@partials/Sidebar';
import { updateScreenSize } from '@stores/uiStore';

const { Content } = Layout;

function AppLayout() {
  useEffect(() => {
    window.addEventListener('resize', updateScreenSize);
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = antTheme.useToken();

  return (
    <>
      <ConfigProvider>
        <Layout
          style={{
            minHeight: '100vh',
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
          hasSider
        >
          <Sidebar />
          <Layout>
            <Header />
            <Content
              style={{ overflow: 'initial' }}
              className="p-4 dark:bg-gray-900"
            >
              <div className="mb-4">
                <MarqueeText message="🚀 Chữ chạy vô hạn từ phải sang trái" />
              </div>
              <Outlet />
            </Content>
            <AppFooter />
          </Layout>
        </Layout>
      </ConfigProvider>
    </>
  );
}

export default AppLayout;

import { Outlet } from '@tanstack/react-router';
import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import { useEffect } from 'react';

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
    token: { colorBgContainer, borderRadiusLG },
  } = antTheme.useToken();

  return (
    <>
      <ConfigProvider>
        <Layout
          style={{
            minHeight: '100vh',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="relative"
        >
          <Sidebar />
          <Layout>
            <Header />
            <Content className="p-6 dark:bg-gray-900">
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

import { Outlet } from '@tanstack/react-router';
import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import { useEffect } from 'react';

import MarqueeAlert from '@components/MarqueeText';
import AppFooter from '@partials/Footer';
import Header from '@partials/Header';
import Sidebar from '@partials/Sidebar';
import { fetchNotifications } from '@services/NotificationService';
import { updateScreenSize } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';

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

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => {
      return fetchNotifications({ 'filter[is_show]': 1 });
    }
  });

  const messages =
    notifications?.data.map((notification) => notification.message) || [];

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
              {messages.length > 0 && (
                <div className="mb-4">
                  <MarqueeAlert messages={messages} />
                </div>
              )}
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

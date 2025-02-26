import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Header from '@partials/Header';
import Sidebar from '@partials/Sidebar';
import { AppDispatch, RootState } from '@stores/index';
import { updateScreenSize } from '@stores/sidebarSlice';
import AppFooter from '@partials/Footer';

const { Content } = Layout;

function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();

  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        dispatch(updateScreenSize());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, isMobile]);

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

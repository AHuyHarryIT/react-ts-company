import {
  Breadcrumb,
  Button,
  ConfigProvider,
  Layout,
  theme as antTheme,
} from 'antd';
import { Link, Outlet } from 'react-router-dom';

import Sidebar from '@partials/Sidebar';
import { AppDispatch, RootState } from '@stores/index';
import { updateScreenSize } from '@stores/sidebarSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@partials/Header';
import axiosPrivate from '@/api/axiosInstance';

const { Content, Footer } = Layout;

const handleFetchData = async () => {
  const response = await axiosPrivate.get('/api/dashboard');
  console.log('response', response.data);
};

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
        <Layout style={{ minHeight: '100vh' }} className="relative">
          <Header />
          <Layout>
            <Sidebar />
            <Layout>
              <Content style={{ margin: '0 16px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                  <Breadcrumb.Item>User</Breadcrumb.Item>
                  <Breadcrumb.Item>Bill</Breadcrumb.Item>
                </Breadcrumb>
                <div
                  style={{
                    padding: 24,
                    minHeight: 360,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                  }}
                >
                  Bill is a cat.
                  <Button onClick={handleFetchData}>Fetch Data</Button>
                  <Link to="/login">
                    <Button>Login</Button>
                  </Link>
                  <Outlet />
                </div>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
              </Footer>
            </Layout>
          </Layout>
        </Layout>
      </ConfigProvider>
    </>
  );
}

export default AppLayout;

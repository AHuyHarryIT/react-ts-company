import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootState } from './stores';

import AuthRedirect from '@components/AuthRedirect';
import ProtectedRoute from '@components/ProtectedRoute';
import RoleProtectedRoute from '@components/RoleProtectedRoute';
import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';
import { PageLayout } from '@layouts/PageLayout';
import Login from '@pages/auth/Login';
import Blank from '@pages/Blank';
import Dashboard from '@pages/Dashboard';
import Employees from '@pages/Employees';
import { AddEmployee } from '@pages/Employees/Add';
import NotFound from '@pages/NotFound';
import { Roles } from '@pages/roles';

function App() {
  const { themeMode } = useSelector((state: RootState) => state.theme);

  useMemo(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route element={<AuthRedirect />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
          </Route>

          {/* private routes */}
          <Route path="/" element={<AppLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="about" element={<>About</>} />
            </Route>
            <Route
              path="admin"
              element={<RoleProtectedRoute allowedRoles={['admin']} />}
            >
              <Route
                path="employees"
                element={<PageLayout title="Nhân viên" metaTitle="Nhân viên" />}
              >
                <Route index element={<Employees />} />
                <Route path="add" element={<AddEmployee />} />
                <Route path="view/:id" element={<>View emp</>} />
                <Route path="edit/:id" element={<>Edit emp</>} />
              </Route>

              <Route
                path="roles"
                element={<PageLayout title="Chức vụ" metaTitle="Chức vụ" />}
              >
                <Route index element={<Roles />} />
              </Route>
            </Route>

            <Route path="blank" element={<Blank />} />
            <Route
              path="unauthorized"
              element={
                <>
                  <h1>Unauthorized</h1>
                </>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

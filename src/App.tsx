import AuthRedirect from '@components/AuthRedirect';
import ProtectedRoute from '@components/ProtectedRoute';
import RoleProtectedRoute from '@components/RoleProtectedRoute';
import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';
import Login from '@pages/auth/Login';
import Blank from '@pages/Blank';
import Dashboard from '@pages/Dashboard';
import Employee from '@pages/Employees';
import NotFound from '@pages/NotFound';
import { useSelector } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootState } from './stores';
import { useMemo } from 'react';

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
              path="admin/"
              element={<RoleProtectedRoute allowedRoles={['admin']} />}
            >
              <Route path="employees" element={<Employee />} />
              <Route path="employees/edit/:id" element={<>Edit emp</>} />
              <Route path="roles" element={<> Role</>} />
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

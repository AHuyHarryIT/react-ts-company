import AuthRedirect from '@components/AuthRedirect';
import ProtectedRoute from '@components/ProtectedRoute';
import RoleProtectedRoute from '@components/RoleProtectedRoute';
import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';
import Login from '@pages/auth/Login';
import Blank from '@pages/Blank';
import Dashboard from '@pages/Dashboard';
import NotFound from '@pages/NotFound';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
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
              <Route path="dashboard" element={<>Dashboard</>} />
              <Route index element={<Dashboard />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route path="projects" element={<> Projects</>} />
              <Route path="about" element={<>About</>} />
              <Route path="logout" element={<>LOGOUT</>} />
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

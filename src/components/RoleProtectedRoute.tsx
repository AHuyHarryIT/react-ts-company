import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@stores/index';
import { isTokenExpired } from '../utils/auth';
import { logout } from '@stores/authSlice';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const dispatch = useDispatch();
  const { accessToken, user, tokenExpiresAt } = useSelector(
    (state: RootState) => state.auth
  );

  if (!accessToken || isTokenExpired(tokenExpiresAt)) {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role?.name || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;

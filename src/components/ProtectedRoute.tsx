import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@stores/index';
import { isTokenExpired } from '@utils/auth';
import { logout } from '@stores/authSlice';

const ProtectedRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, tokenExpiresAt } = useSelector(
    (state: RootState) => state.auth
  );

  if (!accessToken || isTokenExpired(tokenExpiresAt)) {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

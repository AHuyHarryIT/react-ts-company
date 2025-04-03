import { Navigate, Outlet } from '@tanstack/react-router';
import { useSelector } from 'react-redux';
import { RootState } from '@stores/index';
import { isTokenExpired } from '@utils/auth';

const AuthRedirect = () => {
  const { accessToken, tokenExpiresAt } = useSelector(
    (state: RootState) => state.auth
  );

  if (accessToken && !isTokenExpired(tokenExpiresAt)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthRedirect;

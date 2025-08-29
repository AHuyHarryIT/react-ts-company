import { createFileRoute, redirect } from '@tanstack/react-router';

import AuthLayout from '@layouts/AuthLayout';

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async ({ context }) => {
    const { isLogged, user } = context.authenticated;

    // Kiểm tra localStorage trực tiếp để tránh race condition
    const token = localStorage.getItem('token');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const localUser = localStorage.getItem('user');

    // Chỉ redirect nếu có đầy đủ thông tin xác thực hợp lệ
    if (token && isAuthenticated && localUser && localUser !== 'null' && user) {
      const isLoggedResult = await isLogged();
      if (isLoggedResult) {
        // Redirect to admin if already authenticated
        throw redirect({ to: '/', replace: true });
      }
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <AuthLayout />
    </>
  );
}

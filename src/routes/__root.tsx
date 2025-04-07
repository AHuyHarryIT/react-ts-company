import { User } from '@/types/authType';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  Outlet,
  redirect
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { isAuthenticated } from '@utils/auth';

type RouterContext = {
  user: User | null;
  authenticated: boolean;
};

const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    const isAuth = await isAuthenticated();

    if (location.pathname !== '/' && !isAuth) {
      throw redirect({ to: '/', replace: true });
    }
  },
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
});

import { User } from '@/types/authType';
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

type RouterContext = {
  user: User | null;
  authenticated: boolean;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ context }) => {
    if (location.pathname !== '/' && !context.authenticated) {
      throw redirect({ to: '/', replace: true });
    }
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

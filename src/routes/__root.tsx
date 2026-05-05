import { AuthContext } from '@/hooks/useAuth';
import { User } from '@/types/authType';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  Link,
  Outlet
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { queryClient } from '@/lib/queryClient';

const showDevtools =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEVTOOLS === 'true';

type RouterContext = {
  user: User | null;
  authenticated: AuthContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        {showDevtools && (
          <>
            <TanStackRouterDevtools />
            <ReactQueryDevtools initialIsOpen={false} />
          </>
        )}
      </QueryClientProvider>
    </>
  ),
  errorComponent: ({ error }) => (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            Không thể hiển thị trang
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Vui lòng quay lại trang chủ hoặc thử tải lại trang.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 text-left text-xs text-gray-500">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          )}
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Về trang chủ
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Tải lại
            </button>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
});

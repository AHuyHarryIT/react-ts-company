import { createRouter, RouterProvider } from '@tanstack/react-router';

// Import the generated route tree
import NotFound from '@pages/NotFound';
import { routeTree } from './routeTree.gen';
import { useAuth } from '@/hooks/useAuth';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    user: null,
    authenticated: undefined!
  },
  defaultNotFoundComponent: () => {
    return <NotFound />;
  }
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const authenticated = useAuth();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <>
      <RouterProvider router={router} context={{ user, authenticated }} />
    </>
  );
}

export default App;

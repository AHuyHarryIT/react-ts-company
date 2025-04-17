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

  return (
    <>
      <RouterProvider router={router} context={{ authenticated }} />
    </>
  );
}

export default App;

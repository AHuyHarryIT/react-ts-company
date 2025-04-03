import Dashboard from '@pages/Dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  component: Index,
});

function Index() {
  return (
    <>
      <Dashboard />
    </>
  );
}

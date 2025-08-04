import Forbidden from '@pages/Forbidden';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/forbidden')({
  component: Forbidden
});

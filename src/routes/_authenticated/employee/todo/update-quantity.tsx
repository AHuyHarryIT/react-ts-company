import { UpdateQuantity } from '@pages/employee/todo/UpdateQuantity';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/todo/update-quantity'
)({
  component: UpdateQuantity
});

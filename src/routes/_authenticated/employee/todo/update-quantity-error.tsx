import { UpdateQuantityError } from '@pages/employee/todo/UpdateQuantityError';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/todo/update-quantity-error'
)({
  component: UpdateQuantityError
});

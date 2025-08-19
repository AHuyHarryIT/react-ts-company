import { ChooseProduct } from '@pages/employee/todo/ChooseProduct';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/employee/todo/add-product'
)({
  component: ChooseProduct
});

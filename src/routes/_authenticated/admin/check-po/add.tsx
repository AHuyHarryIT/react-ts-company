import { AddQuantity } from '@pages/check-po/AddQuantity';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/check-po/add')({
  component: AddQuantity
});

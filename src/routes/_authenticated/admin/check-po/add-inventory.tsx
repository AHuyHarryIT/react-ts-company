import { InventoryQuantity } from '@pages/check-po/InventoryQuantity';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/admin/check-po/add-inventory'
)({
  component: InventoryQuantity
});

import { AddExportQuantity } from '@pages/check-po/AddExportQuantity';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/admin/check-po/add-export'
)({
  component: AddExportQuantity
});

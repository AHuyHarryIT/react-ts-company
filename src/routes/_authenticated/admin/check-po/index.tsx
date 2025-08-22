import { createFileRoute } from '@tanstack/react-router';

import { PoList } from '@pages/check-po/PoList';

export const Route = createFileRoute('/_authenticated/admin/check-po/')({
  component: PoList
});

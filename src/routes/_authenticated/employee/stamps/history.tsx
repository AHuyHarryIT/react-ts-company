import { PrintStampList } from '@pages/employee/stamp/PrintStampList';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/stamps/history')(
  {
    component: PrintStampList
  }
);

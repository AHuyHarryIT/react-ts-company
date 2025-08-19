import { Storage } from '@pages/employee/scan/Storage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/scan/storage')({
  component: Storage
});

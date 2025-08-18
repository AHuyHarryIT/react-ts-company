import ScanProduct from '@pages/employee/scan/ScanProduct';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/scan/')({
  component: ScanProduct
});

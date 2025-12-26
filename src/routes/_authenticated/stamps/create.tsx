import StampForm from '@pages/stamps/StampForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/stamps/create')({
  component: StampForm
});

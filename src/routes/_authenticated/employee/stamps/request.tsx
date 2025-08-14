import { RequestStamp } from '@pages/employee/stamp/RequestStamp';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/stamps/request')(
  {
    component: RequestStamp
  }
);

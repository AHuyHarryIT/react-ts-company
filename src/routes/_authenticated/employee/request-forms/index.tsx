import EmployeeRequestFormPage from '@pages/employee/request-forms/EmployeeRequestFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/request-forms/')(
  {
    component: EmployeeRequestFormPage
  }
);

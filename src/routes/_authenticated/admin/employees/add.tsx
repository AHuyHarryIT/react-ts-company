import { createFileRoute } from '@tanstack/react-router';

import { useEmployeeFields } from '@/configs/employeeForm.config';
import { employeeCreateSchema } from '@/schema/employeeSchema.schema';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { CreateForm } from '@components/ui/CRUD/CreateForm';
import { employeeService } from '@services/EmployeeService';

export const Route = createFileRoute('/_authenticated/admin/employees/add')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <BackButton />
      <ComponentCard title="Thêm nhân sự">
        <CreateForm
          fields={useEmployeeFields()}
          schema={employeeCreateSchema}
          service={employeeService}
          config={{
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }}
        />
      </ComponentCard>
    </>
  );
}

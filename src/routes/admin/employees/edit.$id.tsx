import { useEmployeeFields } from '@/configs/employeeForm.config';
import { employeeCreateSchema } from '@/schema/employeeSchema.schema';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { UpdateForm } from '@components/ui/CRUD/UpdateForm';
import { employeeService } from '@services/EmployeeService';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/employees/edit/$id')({
  component: RouteComponent,
  parseParams: (params) => ({ id: params.id })
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <>
      <BackButton />
      <ComponentCard title="Cập nhật nhân sự">
        <UpdateForm
          id={id}
          fields={useEmployeeFields()}
          schema={employeeCreateSchema}
          service={employeeService}
        />
      </ComponentCard>
    </>
  );
}

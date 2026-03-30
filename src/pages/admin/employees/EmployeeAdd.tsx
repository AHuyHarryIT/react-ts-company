import { useEmployeeFields } from '@/configs/employeeForm.config';
import { employeeCreateSchema } from '@/schema/employeeSchema.schema';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { CreateForm } from '@components/ui/CRUD/CreateForm';
import { employeeService } from '@services/EmployeeService';

export default function EmployeeAdd() {
  return (
    <>
      <BackButton />
      <ComponentCard title="Thêm nhân sự">
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

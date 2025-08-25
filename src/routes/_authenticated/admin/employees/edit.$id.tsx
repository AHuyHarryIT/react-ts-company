import { useEmployeeFields } from '@/configs/employeeForm.config';
import { employeeUpdateSchema } from '@/schema/employeeSchema.schema';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { UpdateForm } from '@components/ui/CRUD/UpdateForm';
import { employeeService } from '@services/EmployeeService';
import { resetPassword } from '@services/ProfileService';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Button, message } from 'antd';

export const Route = createFileRoute(
  '/_authenticated/admin/employees/edit/$id'
)({
  component: RouteComponent,
  parseParams: (params) => ({ id: params.id })
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { mutate, isPending } = useMutation({
    mutationKey: ['updateEmployee', id],
    mutationFn: () => resetPassword(id),
    onMutate: () => {
      message.loading({
        content: 'Đang đặt lại mật khẩu...',
        key: 'resetPassword'
      });
    },
    onSuccess: () => {
      message.success({
        content: 'Đặt lại mật khẩu thành công',
        key: 'resetPassword'
      });
    },
    onError: () => {
      message.error({
        content: 'Đặt lại mật khẩu thất bại',
        key: 'resetPassword'
      });
    }
  });

  return (
    <>
      <BackButton to="/admin/employees" />
      <ComponentCard title="Cập nhật nhân sự">
        <div className="text-end">
          <Button
            color="danger"
            variant="outlined"
            onClick={() => mutate()}
            loading={isPending}
          >
            Đặt lại mật khẩu
          </Button>
        </div>
        <UpdateForm
          id={id}
          fields={useEmployeeFields()}
          schema={employeeUpdateSchema}
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

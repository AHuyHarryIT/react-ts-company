import AppButton from '@components/common/AppButton';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { changesPassword } from '@services/ProfileService';
import { handleApiError } from '@utils/handleApiError';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, message } from 'antd';
import { FormProps } from 'antd/lib';
import { FaLock } from 'react-icons/fa';

interface FormField {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePassword = () => {
  const [form] = Form.useForm<FormField>();

  const { mutate, isPending } = useMutation({
    mutationKey: ['changePassword'],
    mutationFn: (values: FormField) =>
      changesPassword({
        password: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      }),
    onMutate: () => {
      message.loading({ content: 'Đang cập nhật...', key: 'changePassword' });
    },
    onSuccess: () => {
      message.success({
        content: 'Thay đổi mật khẩu thành công',
        key: 'changePassword',
        duration: 2
      });
      form.resetFields();
    },
    onError: (error: unknown) => {
      const errorMessage = handleApiError(error);
      message.error({
        content: errorMessage,
        key: 'changePassword'
      });
    }
  });

  const formProps: FormProps<FormField> = {
    ...customFormProps,
    form,
    onFinish: (values) => {
      mutate(values);
    }
  };
  return (
    <ComponentCard
      title={
        <div className="flex items-center gap-3">
          <FaLock className="text-amber-500" />
          <span>Đổi mật khẩu</span>
        </div>
      }
    >
      <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
        <Form<FormField> {...formProps}>
          <Form.Item<FormField>
            label="Mật khẩu cũ"
            name={'currentPassword'}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item<FormField>
            label="Mật khẩu mới"
            name={'newPassword'}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item<FormField>
            label="Xác nhận mật khẩu mới"
            name={'confirmPassword'}
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập xác nhận mật khẩu mới'
              },
              { min: 6, message: 'Xác nhận mật khẩu tối thiểu 6 ký tự' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Xác nhận mật khẩu không khớp')
                  );
                }
              })
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <AppButton
              tone="primary"
              htmlType="submit"
              disabled={isPending}
              className="px-6"
            >
              {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </AppButton>
          </Form.Item>
        </Form>
      </div>
    </ComponentCard>
  );
};

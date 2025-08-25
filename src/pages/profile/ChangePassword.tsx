import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { changesPassword } from '@services/ProfileService';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, message } from 'antd';
import { FormProps } from 'antd/lib';

interface FormField {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePassword = () => {
  const [form] = Form.useForm<FormField>();

  const { mutate } = useMutation({
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
        content: 'Cập nhật mật khẩu thành công',
        key: 'changePassword',
        duration: 2
      });
      form.resetFields();
    },
    onError: () => {
      message.error({
        content: 'Cập nhật mật khẩu thất bại',
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
    <div>
      <ComponentCard title="Đổi mật khẩu">
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
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item<FormField>
            label="Xác nhận mật khẩu mới"
            name={'confirmPassword'}
            rules={[
              { required: true, message: 'Vui lòng nhập xác nhận mật khẩu mới' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" variant="solid" color="blue">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </ComponentCard>
    </div>
  );
};

import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FormProps } from 'antd';
import { Button, Form, Input, message } from 'antd';

import { authLogin } from '@services/AuthService';

import { FaRegUser } from 'react-icons/fa';
import { IoLockClosedOutline } from 'react-icons/io5';

type FieldType = {
  username: string;
  password: string;
  remember: boolean;
};

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  head: () => ({
    title: 'Đăng nhập',
    meta: [
      {
        name: 'description',
        content: 'Trang đăng nhập của ứng dụng'
      }
    ]
  })
});

function RouteComponent() {
  const [form] = Form.useForm();

  const { mutate: loginMutation, isPending } = useMutation({
    mutationKey: ['authLogin'],
    mutationFn: ({ username, password, remember }: FieldType) =>
      authLogin(username, password, remember),
    onSuccess: () => {
      message.success('Đăng nhập thành công!');

      // Đợi một chút để đảm bảo auth state đã được update
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    },
    onError: (error: unknown) => {
      // Reset password field
      form.resetFields(['password']);

      // Xử lý các loại lỗi
      let errorMessage = 'Đăng nhập thất bại! Vui lòng thử lại.';

      const axiosError = error as {
        response?: { status: number; data?: { message?: string } };
      };

      if (axiosError?.response?.status === 401) {
        errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác!';
      } else if (axiosError?.response?.status === 422) {
        errorMessage = 'Thông tin đăng nhập không hợp lệ!';
      } else if (axiosError?.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (error instanceof Error && error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }

      message.error(errorMessage);
    }
  });

  const handleLogin = (values: FieldType) => {
    if (isPending) return;

    loginMutation({
      username: values.username,
      password: values.password,
      remember: values.remember || false
    });
  };

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    handleLogin(values);
  };

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800 sm:text-4xl dark:text-white/90">
          Đăng Nhập
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Vui lòng nhập thông tin tài khoản để tiếp tục
        </p>
      </div>
      <div>
        <Form
          form={form}
          name="auth-login"
          initialValues={{ remember: false }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item<FieldType>
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
            ]}
          >
            <Input
              placeholder="Số điện thoại hoặc tên đăng nhập"
              prefix={<FaRegUser />}
              disabled={isPending}
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              placeholder="Mật khẩu"
              prefix={<IoLockClosedOutline />}
              disabled={isPending}
            />
          </Form.Item>

          <Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isPending}
              disabled={isPending}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

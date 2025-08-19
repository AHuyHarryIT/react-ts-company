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
    title: 'Login',
    meta: [
      {
        name: 'description',
        content: 'Login page for the application'
      }
    ]
  })
});

function RouteComponent() {
  const { mutate, isPending } = useMutation({
    mutationKey: ['authLogin'],
    mutationFn: ({ username, password, remember }: FieldType) =>
      authLogin(username, password, remember),

    onSuccess: () => {
      message.success('Login success!');
      window.location.reload();
    },
    onError: (error) => {
      message.error(String(error));
      console.error('Login error:', error);
    }
  });

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    mutate({
      username: values.username,
      password: values.password,
      remember: values.remember
    });
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
          name="auth-login"
          initialValues={{ remember: false }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item<FieldType>
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Phone" prefix={<FaRegUser />} />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              prefix={<IoLockClosedOutline />}
            />
          </Form.Item>

          {/* <Form.Item<FieldType> name="remember" valuePropName="checked">
            <Checkbox checked={false}>
              <span className="text-gray-800 dark:text-white/90">
                Remember me
              </span>
            </Checkbox>
          </Form.Item> */}

          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={isPending}>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

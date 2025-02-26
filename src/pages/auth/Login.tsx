import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { authLogin } from '@services/AuthService';
import type { AuthState } from '@stores/authSlice';
import { login } from '@stores/authSlice';
import { AppDispatch } from '@stores/index';
import { headTitle } from '@utils/headMeta';

import { FaRegUser } from 'react-icons/fa';
import { IoLockClosedOutline } from 'react-icons/io5';

const BASE_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8000';

type FieldType = {
  username: string;
  password: string;
  remember: boolean;
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

function Login() {
  headTitle('Login');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const response = await authLogin(
        values.username!,
        values.password!,
        values.remember!
      );

      const userData: AuthState = {
        accessToken: response.data.token,
        user: {
          name: response.data.name,
          role: {
            id: response.data.role_id,
            name: response.data.role_name,
          },
        },
        tokenExpiresAt: new Date(response.data.expires_at).getTime(),
      };
      if (
        response?.data?.image &&
        response?.data?.role_id == 15 &&
        userData.user
      ) {
        userData.user.image_url = [
          BASE_URL,
          'storage',
          'admin',
          response.data.image,
        ].join('/');
      } else if (response?.data?.image && userData.user) {
        userData.user.image_url = [
          BASE_URL,
          'storage',
          'employee',
          response.data.image,
        ].join('/');
      }

      dispatch(login(userData));

      message.success('Login success!');

      navigate('/');
    } catch (error) {
      message.error(String(error));
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800 sm:text-4xl dark:text-white/90">
          Sign In
        </h1>
      </div>
      <div>
        <Form
          name="basic"
          initialValues={{ remember: false }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          <Form.Item<FieldType>
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Phone" prefix={<FaRegUser />} size="large" />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              prefix={<IoLockClosedOutline />}
              size="large"
            />
          </Form.Item>

          <Form.Item<FieldType> name="remember" valuePropName="checked">
            <Checkbox checked={false}>
              <span className="text-gray-800 dark:text-white/90">
                Remember me
              </span>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" size="large">
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;

import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { authLogin } from '@services/AuthService';
import type { AuthState } from '@stores/authSlice';
import { login } from '@stores/authSlice';
import { AppDispatch } from '@stores/index';

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
      <h1>Login</h1>
      <div>username: ctyvinhvinhphat2</div>
      <div>password: 123456</div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: false }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        // autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          name="remember"
          valuePropName="checked"
          label={null}
        >
          <Checkbox checked={false}>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;

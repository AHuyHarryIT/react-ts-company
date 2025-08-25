import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { Button, Form, Input } from 'antd';
import { FormProps } from 'antd/lib';
import React from 'react';

interface FormField {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePassword = () => {
  const [form] = Form.useForm<FormField>();

  const formProps: FormProps<FormField> = {
    ...customFormProps,
    form,
    onFinish: (values) => {
      console.log('Form values:', values);
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

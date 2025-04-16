import ComponentCard from '@components/common/ComponentCard';
import { Button, Form, Input, Select } from 'antd';
import type { FormProps } from 'antd';

type FormField = {
  name: string;
  phone: string;
  code: string; // Employee code
  email: string;
  birthdate: string;
  address: string;
  home_town: string;
  CCCD: string;
  role_id: number;
  company: string;
  calender_id: number;
  gender: string;
  marital_status: string;
  date_joining: string;
  password: string;
  photo: File;
  card_photo: File;
};

const onFinish: FormProps<FormField>['onFinish'] = (values) => {
  console.log(values);
};

export const AddEmployee = () => {
  return (
    <ComponentCard title="Danh sách nhân viên">
      <Form layout="vertical" name="add-employee" onFinish={onFinish}>
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Form.Item<FormField>
            label="Họ và tên"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhân viên!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Mã nhân viên"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField> label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="CCCD"
            name="CCCD"
            rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Ngày sinh"
            name="birthdate"
            rules={[
              { required: true, message: 'Vui lòng nhập ngày sinh!' },
              { type: 'date', message: 'Ngày sinh không hợp lệ!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Quê quán"
            name="home_town"
            rules={[{ required: true, message: 'Vui lòng nhập quê quán!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Chức vụ"
            name="role_id"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select />
          </Form.Item>
          <Form.Item<FormField>
            label="Công ty"
            name="company"
            rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}
          >
            <Select />
          </Form.Item>
          <Form.Item<FormField>
            label="Lịch làm việc"
            name="calender_id"
            rules={[
              { required: true, message: 'Vui lòng chọn lịch làm việc!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Tình trạng hôn nhân"
            name="marital_status"
            rules={[
              { required: true, message: 'Vui lòng chọn tình trạng hôn nhân!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Ngày vào công ty"
            name="date_joining"
            rules={[
              { required: true, message: 'Vui lòng nhập ngày vào công ty!' },
              { type: 'date', message: 'Ngày vào công ty không hợp lệ!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField> label="Mật khẩu" name="password">
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Ảnh"
            name="photo"
            rules={[{ required: true, message: 'Vui lòng thêm ảnh!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            label="Ảnh thẻ"
            name="card_photo"
            rules={[{ required: true, message: 'Vui lòng thêm ảnh thẻ!' }]}
          >
            <Input />
          </Form.Item>
        </div>
        <Button color="green" variant="solid" htmlType="submit" size="large">
          Thêm mới
        </Button>
      </Form>
    </ComponentCard>
  );
};

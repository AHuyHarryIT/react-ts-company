import { Button, DatePicker, Form, Image, Input, Select, Upload } from 'antd';
import type { FormProps, UploadFile } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Dayjs } from 'dayjs';

import ComponentCard from '@components/common/ComponentCard';
import { AppDispatch, RootState } from '@stores/index';
import { fetchRoles } from '@stores/roleSlice';
import ImgCrop from 'antd-img-crop';
import { FileType, getBase64 } from '@utils/fileType';

type CreateEmployeeField = {
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
  photo: UploadFile;
  card_photo: UploadFile;
};

export const AddEmployee = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles } = useSelector((state: RootState) => state.roles);

  const [form] = Form.useForm();
  const [birthdate, setBirthdate] = useState<Dayjs | null>(null);
  const [dateJoining, setDateJoining] = useState<Dayjs | null>(null);
  const [photo, setPhoto] = useState<UploadFile[]>([]);
  // const [cardPhoto, setCardPhoto] = useState<UploadFile[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setIsPreviewOpen(true);
  };

  const handlePhoto = (file: UploadFile) => {
    return file;
  };

  useEffect(() => {
    dispatch(fetchRoles({ params: { limit: 9999 } }));
  }, [dispatch]);

  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  const companyOptions = [
    { label: 'Vinh Vinh Phát', value: 'Vinh Vinh Phát' },
    { label: 'A7A', value: 'A7A' },
  ];

  const calenderOptions = [
    { label: 'Ca 1', value: 'Ca 1' },
    { label: 'Ca 2', value: 'Ca 2' },
    { label: 'Ca 3', value: 'Ca 3' },
  ];

  const genderOptions = [
    { label: 'Nam', value: 'Nam' },
    { label: 'Nữ', value: 'Nữ' },
  ];

  const maritalOptions = [
    { label: 'Độc thân', value: 'Độc thân' },
    { label: 'Đã kết hôn', value: 'Đã kết hôn' },
    { label: 'Ly hôn', value: 'Ly hôn' },
    { label: 'Góa', value: 'Góa' },
  ];

  const onFinish: FormProps<CreateEmployeeField>['onFinish'] = (values) => {
    values.birthdate = birthdate?.format('YYYY-MM-DD') || '';
    values.date_joining = dateJoining?.format('YYYY-MM-DD') || '';
    console.log(values);
  };

  return (
    <ComponentCard title="Danh sách nhân viên">
      <Form
        layout="vertical"
        name="add-employee"
        form={form}
        onFinish={onFinish}
      >
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Form.Item<CreateEmployeeField>
            label="Họ và tên"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhân viên!' },
            ]}
          >
            <Input placeholder="Nhập tên nhân viên" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Mã nhân viên"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
          >
            <Input placeholder="Nhập mã nhân viên" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email" size="large" type="email" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="CCCD"
            name="CCCD"
            rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}
          >
            <Input placeholder="Nhập số CCCD" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Ngày sinh"
            name={'birthdate'}
            rules={[
              { required: true, message: 'Vui lòng nhập ngày sinh!' },
              { type: 'date', message: 'Ngày sinh không hợp lệ!' },
            ]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              onChange={(date) => setBirthdate(date)}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Nhập địa chỉ" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Quê quán"
            name="home_town"
            rules={[{ required: true, message: 'Vui lòng nhập quê quán!' }]}
          >
            <Input placeholder="Nhập quê quán" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Chức vụ"
            name="role_id"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select
              placeholder="Chọn chức vụ"
              size="large"
              options={roleOptions}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Công ty"
            name="company"
            rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}
          >
            <Select
              placeholder="Chọn công ty"
              size="large"
              options={companyOptions}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Lịch làm việc"
            name="calender_id"
            rules={[
              { required: true, message: 'Vui lòng chọn lịch làm việc!' },
            ]}
          >
            <Select
              placeholder="Chọn lich làm việc"
              size="large"
              options={calenderOptions}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select
              placeholder="Chọn giới tính"
              size="large"
              options={genderOptions}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Tình trạng hôn nhân"
            name="marital_status"
            rules={[
              { required: true, message: 'Vui lòng chọn tình trạng hôn nhân!' },
            ]}
          >
            <Select
              placeholder="Chọn tình trạng hôn nhân"
              size="large"
              options={maritalOptions}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Ngày vào công ty"
            name="date_joining"
            rules={[
              { required: true, message: 'Vui lòng nhập ngày vào công ty!' },
              { type: 'date', message: 'Ngày vào công ty không hợp lệ!' },
            ]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              onChange={(date) => setDateJoining(date)}
            />
          </Form.Item>
          <Form.Item<CreateEmployeeField> label="Mật khẩu" name="password">
            <Input placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Ảnh"
            name="photo"
            rules={[{ required: true, message: 'Vui lòng thêm ảnh!' }]}
            getValueFromEvent={handlePhoto}
          >
            <>
              <ImgCrop>
                <Upload
                  action={''}
                  listType="picture-card"
                  fileList={photo}
                  onChange={({ fileList }) => {
                    setPhoto(fileList);
                    // form.setFieldsValue({ photo: fileList });
                  }}
                  onPreview={handlePreview}
                  maxCount={1}
                >
                  {photo.length < 1 && '+'}
                </Upload>
              </ImgCrop>
            </>
          </Form.Item>
          <Form.Item<CreateEmployeeField>
            label="Ảnh thẻ"
            name="card_photo"
            rules={[{ required: true, message: 'Vui lòng thêm ảnh thẻ!' }]}
          >
            <Input type="file" />
          </Form.Item>
        </div>
        <Button color="green" variant="solid" htmlType="submit" size="large">
          Thêm mới
        </Button>
      </Form>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: isPreviewOpen,
            onVisibleChange: (visible) => setIsPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </ComponentCard>
  );
};

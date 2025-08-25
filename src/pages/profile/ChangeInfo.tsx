import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { UploadImage } from '@components/ui/upload/UploadImage';
import { GenderEnumOptions } from '@schemas/genderEnum.schema';
import {
  MaritalStatus,
  MaritalStatusEnumOptions
} from '@schemas/maritalStatusEnum.schema';
import { fetchProfile } from '@services/ProfileService';
import { useQuery } from '@tanstack/react-query';
import { convertImageName2Url } from '@utils/convertImageName2Url';
import { FileType } from '@utils/fileType';
import { Button, DatePicker, Form, FormProps, Input, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

interface FormField {
  name: string;
  phone: string;
  email?: string;
  birthday: string;
  address: string;
  hometown: string;
  CCCD: string;
  gender: Dayjs;
  maritalStatus: MaritalStatus;
  avatar: File;
  photoCard: File;
}

export const ChangeInfo = () => {
  const [form] = Form.useForm<FormField>();
  const [avatar] = useState<string>();
  const [photoCard] = useState<string>();

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile
  });

  const formProps: FormProps = {
    ...customFormProps,
    initialValues: profileData,
    form,
    onFinish: (values) => {
      console.log('Form values:', values);
    }
  };

  return (
    <>
      <ComponentCard title="Hồ sơ cá nhân">
        <Form<FormField> {...formProps}>
          <Form.Item<FormField>
            label="Họ và tên"
            name={'name'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập họ và tên'
              }
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item<FormField>
            label="Số điện thoại"
            name={'phone'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập số điện thoại'
              },
              {
                pattern: /^(0|\+84)[0-9]{9}$/,
                message: 'Vui lòng nhập số điện thoại hợp lệ'
              }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item<FormField>
            label="Email"
            name={'email'}
            rules={[
              {
                type: 'email',
                message: 'Vui lòng nhập email hợp lệ. VD: example@gmail.com'
              }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item<FormField>
            label="Ngày sinh"
            name={'birthday'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập ngày sinh'
              },
              {
                validator: (_, value) =>
                  value && dayjs().diff(value, 'year') < 18
                    ? Promise.reject(new Error('Tuổi phải từ 18 trở lên'))
                    : Promise.resolve()
              }
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<FormField>
            label="CCCD"
            name={'CCCD'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập CCCD'
              },
              {
                pattern: /^\d{12}$/,
                message: 'Vui lòng nhập số CCCD hợp lệ (12 chữ số)'
              }
            ]}
          >
            <Input placeholder="Nhập CCCD" />
          </Form.Item>
          <Form.Item<FormField>
            label="Địa chỉ"
            name={'address'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập địa chỉ'
              }
            ]}
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item<FormField>
            label="Quê quán"
            name={'hometown'}
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập quê quán'
              }
            ]}
          >
            <Input placeholder="Nhập quê quán" />
          </Form.Item>
          <Form.Item<FormField>
            label="Giới tính"
            name="gender"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn giới tính'
              }
            ]}
          >
            <Select options={GenderEnumOptions} placeholder="Chọn giới tính" />
          </Form.Item>
          <Form.Item<FormField>
            label="Tình trạng hôn nhân"
            name="maritalStatus"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn tình trạng hôn nhân'
              }
            ]}
          >
            <Select
              options={MaritalStatusEnumOptions}
              placeholder="Chọn tình trạng hôn nhân"
            />
          </Form.Item>
          <Form.Item<FormField>
            label="Ảnh đại diện"
            name="avatar"
            rules={[
              {
                required: true,
                message: 'Vui lòng tải lên ảnh đại diện'
              }
            ]}
          >
            <UploadImage
              maxCount={1}
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
              onChange={async ({ fileList }) => {
                if (fileList.length > 0) {
                  form.setFieldsValue({
                    avatar: fileList[0].originFileObj as FileType
                  });
                }
              }}
              imageList={() => {
                if (photoCard) {
                  return [
                    {
                      uid: '-1',
                      name: 'photo.jpg',
                      status: 'done',
                      url: convertImageName2Url(photoCard)
                    }
                  ];
                } else return [];
              }}
            />
          </Form.Item>
          <Form.Item<FormField>
            label="Ảnh thẻ"
            name="photoCard"
            rules={[
              {
                required: true,
                message: 'Vui lòng tải lên ảnh thẻ'
              }
            ]}
          >
            <UploadImage
              maxCount={1}
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
              onChange={async ({ fileList }) => {
                if (fileList.length > 0) {
                  // convert file to File
                  form.setFieldsValue({
                    photoCard: fileList[0].originFileObj as FileType
                  });
                }
              }}
              imageList={() => {
                if (avatar) {
                  return [
                    {
                      uid: '-1',
                      name: 'photo.jpg',
                      status: 'done',
                      url: convertImageName2Url(avatar)
                    }
                  ];
                } else return [];
              }}
            />
          </Form.Item>
          <Form.Item>
            <div className="space-x-2">
              <Button htmlType="submit" variant="solid" color="blue">
                Lưu thay đổi
              </Button>
              <Button htmlType="reset" variant="solid">
                Dặt lại
              </Button>
            </div>
          </Form.Item>
        </Form>
      </ComponentCard>
    </>
  );
};

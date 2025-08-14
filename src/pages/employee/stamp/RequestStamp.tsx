import { Shift } from '@/types/shift';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { IconAdd, IconHistory } from '@components/icons';
import { UserInfo } from '@components/UserInfo';
import { productService } from '@services/ProductService';
import { empStampRequest } from '@services/StampService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormProps,
  InputNumber,
  message,
  Select
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { IoCloseOutline } from 'react-icons/io5';

interface StampType {
  productId: string;
  date: Dayjs;
  shift: Shift;
  binCount: number;
  binStart: string;
  type: 'box' | 'bag' | string;
}

interface FormFields {
  stamps: StampType[];
}

export const RequestStamp = () => {
  const [form] = Form.useForm<FormFields>();

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.list({ limit: 0 })
  });

  const { mutate } = useMutation({
    mutationKey: ['request-stamp'],
    mutationFn: (data: FormFields) => {
      const formattedData = data.stamps.map((stamp) => ({
        productId: stamp.productId,
        date: stamp.date.format('YYYY-MM-DD'),
        shift: stamp.shift,
        binCount: stamp.binCount,
        binStart: stamp.binStart,
        type: stamp.type
      }));
      return empStampRequest({ stamps: formattedData });
    },
    onSuccess: () => {
      form.resetFields();
      message.success('Yêu cầu in tem đã được gửi');
    },
    onError: () => {
      message.error('Đã xảy ra lỗi khi gửi yêu cầu in tem');
    },
    onMutate: () => {
      message.loading('Đang gửi yêu cầu in tem...');
    }
  });

  const productOptions =
    productsData?.data?.map((product) => ({
      label: product.name,
      value: product.id
    })) || [];

  const shiftOptions = [
    { label: 'Ca 1', value: 1 },
    { label: 'Ca 2', value: 2 }
  ];

  const stampTypeOptions = [
    { label: 'Tem thùng', value: 'box' },
    { label: 'Tem bịch', value: 'bag' }
  ];

  const formProps: FormProps<FormFields> = {
    ...customFormProps,
    form,
    initialValues: { stamps: [{}] },
    onFinish: (values) => {
      console.log(values);
      mutate({ stamps: values.stamps });
    }
  };

  return (
    <>
      <BackButton to="/" />
      <ComponentCard title="Gửi yêu cầu in tem">
        <div>
          <Link to="/employee/stamps/history">
            <Button icon={<IconHistory />} variant="solid" color="gold">
              KIỂM TRA YÊU CẦU IN TEM
            </Button>
          </Link>
        </div>
        <UserInfo />
        <p className="text-center text-xl font-bold text-gray-500">Tạo tem</p>

        <Form {...formProps}>
          <Form.List name="stamps">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-4">
                {fields.map((field) => (
                  <Card
                    key={field.key}
                    title={`Tem ${field.name + 1}`}
                    extra={
                      <IoCloseOutline onClick={() => remove(field.name)} />
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Form.Item
                        label="Sản phẩm"
                        name={[field.name, 'productId']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng chọn sản phẩm'
                          }
                        ]}
                      >
                        <Select
                          options={productOptions}
                          placeholder="Chọn sản phẩm"
                          showSearch
                          allowClear
                        />
                      </Form.Item>
                      <Form.Item
                        label="Ngày"
                        name={[field.name, 'date']}
                        rules={[
                          { required: true, message: 'Vui lòng chọn ngày' }
                        ]}
                        initialValue={dayjs()}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        label="Ca"
                        name={[field.name, 'shift']}
                        rules={[
                          { required: true, message: 'Vui lòng chọn ca' }
                        ]}
                      >
                        <Select options={shiftOptions} placeholder="Chọn ca" />
                      </Form.Item>

                      <Form.Item
                        label="Loại"
                        name={[field.name, 'type']}
                        rules={[
                          { required: true, message: 'Vui lòng chọn loại' }
                        ]}
                      >
                        <Select
                          options={stampTypeOptions}
                          placeholder="Chọn loại tem"
                        />
                      </Form.Item>
                      <Form.Item
                        label="Số lượng tem"
                        name={[field.name, 'binCount']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập số lượng'
                          }
                        ]}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: '100%' }}
                          placeholder="Nhập số lượng tem"
                        />
                      </Form.Item>
                      <Form.Item
                        label="Bắt đầu từ tem số"
                        name={[field.name, 'binStart']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập '
                          }
                        ]}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: '100%' }}
                          placeholder="Nhập tem bắt đầu"
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  <IconAdd /> Thêm tem
                </Button>
              </div>
            )}
          </Form.List>
          <Form.Item style={{ marginTop: '16px', marginBottom: '0' }}>
            <Button
              variant="solid"
              color="green"
              // loading={isPending}
              htmlType="submit"
            >
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </ComponentCard>
    </>
  );
};

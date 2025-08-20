import { AddPoRequest } from '@/types/purchaseOrdersType';
import { Shift } from '@/types/shift';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import {
  productStatus,
  productStatusOptions
} from '@constants/productStatus.enum';
import { ShiftEnumOptions } from '@constants/shift.enum';
import { productService } from '@services/ProductService';
import { AddPurchaseOrdersQuantities } from '@services/PurchaseOrdersService';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  FormProps,
  InputNumber,
  message,
  Select,
  Spin
} from 'antd';
import type { Dayjs } from 'dayjs';

interface FormFields {
  date: Dayjs;
  productType: number;
  shift?: Shift;
  [key: `product_${number | string}`]: number;
}

export const AddQuantity = () => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useMutation({
    mutationKey: ['add', 'productQuantities'],
    mutationFn: async (values: AddPoRequest) => {
      const response = await AddPurchaseOrdersQuantities(values);
      return response;
    },
    onMutate: () => {
      message.loading({ content: 'Đang cập nhật...', key: 'update' });
    },
    onSuccess: () => {
      form.resetFields();
      message.success({ content: 'Cập nhật thành công!', key: 'update' });
    },
    onError: () => {
      message.error({ content: 'Cập nhật thất bại!', key: 'update' });
    }
  });
  const handleFinish: FormProps['onFinish'] = async (values) => {
    const productQuantities = Object.entries(values)
      .filter(([key, val]) => key.startsWith('product_') && val)
      .map(([key, val]) => ({
        productId: key.split('_')[1],
        quantity: val as number
      }));

    if (productQuantities.length === 0) {
      message.error('Vui lòng nhập ít nhất một sản phẩm');
      return;
    }

    mutate({
      date: values.date.format('YYYY-MM-DD'),
      status: values.productType,
      shift: values.shift,
      products: productQuantities
    });
  };

  const formProps: FormProps = {
    ...customFormProps,
    form: form,
    onFinish: handleFinish
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.list({ limit: 0 })
  });
  const productList = productsData?.data ?? [];

  return (
    <>
      <BackButton to="/admin/check-po" />
      <ComponentCard title="Thêm sản lượng">
        <Spin spinning={isPending}>
          <Form<FormFields> {...formProps}>
            <div className="flex flex-wrap gap-2">
              <Form.Item<FormFields>
                label="Ngày cập nhật"
                name={'date'}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ngày cập nhật'
                  }
                ]}
              >
                <DatePicker placeholder="Chọn ngày" />
              </Form.Item>
              <Form.Item<FormFields>
                label="Loại sản lượng"
                name="productType"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại sản lượng' }
                ]}
              >
                <Select
                  options={[
                    {
                      label: productStatusOptions.find(
                        (option) => option.value === productStatus.enum.PRODUCE
                      )?.label,
                      value: productStatus.enum.PRODUCE
                    },
                    {
                      label: productStatusOptions.find(
                        (option) => option.value === productStatus.enum.ERROR
                      )?.label,
                      value: productStatus.enum.ERROR
                    }
                  ]}
                  placeholder="Chọn loại sản lượng"
                />
              </Form.Item>
              {form.getFieldsValue().productType ==
                productStatus.enum.PRODUCE && (
                <Form.Item<FormFields>
                  label="Ca làm việc"
                  name={'shift'}
                  rules={[
                    { required: true, message: 'Vui lòng chọn ca làm việc' }
                  ]}
                >
                  <Select
                    options={ShiftEnumOptions}
                    placeholder="Chọn ca làm việc"
                  />
                </Form.Item>
              )}
            </div>

            <h3 className="mb-2 text-2xl font-medium text-gray-800 dark:text-white/90">
              Sản phẩm
            </h3>
            <hr className="my-2" />
            <Spin spinning={isLoading}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {productList.map((product) => (
                  <Form.Item<FormFields>
                    key={`product_${product.id}`}
                    label={product.name}
                    name={`product_${product.id}`}
                    rules={[
                      {
                        type: 'number',
                        min: 0,
                        message: 'Số lượng phải lớn hơn hoặc bằng 0'
                      }
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="Nhập số lượng"
                    />
                  </Form.Item>
                ))}
              </div>
              {productList.length > 0 && (
                <Form.Item>
                  <Button
                    variant="solid"
                    color="blue"
                    // loading={isPending}
                    htmlType="submit"
                  >
                    Cập nhật
                  </Button>
                </Form.Item>
              )}
            </Spin>
          </Form>
        </Spin>
      </ComponentCard>
    </>
  );
};

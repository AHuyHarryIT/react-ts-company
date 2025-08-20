import { AddPoExportRequest } from '@/types/purchaseOrdersType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { productService } from '@services/ProductService';
import { AddPurchaseOrdersQuantitiesExport } from '@services/PurchaseOrdersService';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  FormProps,
  InputNumber,
  message,
  Spin
} from 'antd';
import type { Dayjs } from 'dayjs';

interface FormFields {
  date: Dayjs;
  [key: `product_${number | string}`]: number;
}

export const AddExportQuantity = () => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useMutation({
    mutationKey: ['add', 'productQuantities'],
    mutationFn: async (values: AddPoExportRequest) => {
      const response = await AddPurchaseOrdersQuantitiesExport(values);
      return response;
    },
    onMutate: () => {
      message.loading({ content: 'Đang cập nhật...', key: 'update-export' });
    },
    onSuccess: () => {
      form.resetFields();
      message.success({
        content: 'Cập nhật thành công!',
        key: 'update-export'
      });
    },
    onError: () => {
      message.error({ content: 'Cập nhật thất bại!', key: 'update-export' });
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
      message.error({
        content: 'Vui lòng nhập ít nhất một sản phẩm',
        key: 'update-export'
      });
      return;
    }

    mutate({
      date: values.date.format('YYYY-MM-DD'),
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
      <ComponentCard title="Thêm PO xuất hàng">
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

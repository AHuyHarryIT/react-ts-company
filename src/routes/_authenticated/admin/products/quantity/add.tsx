import { createFileRoute } from '@tanstack/react-router';
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
import { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { Dayjs } from 'dayjs';

import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';

import { IconAdd } from '@components/icons';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { IoCloseOutline } from 'react-icons/io5';
import { useMutation } from '@tanstack/react-query';
import {
  addProductsQuantity,
  AddProductQuantitiesRequest
} from '@services/TotalQuantityService';

export const Route = createFileRoute(
  '/_authenticated/admin/products/quantity/add'
)({
  component: RouteComponent
});

interface ProductField {
  date: Dayjs | null;
  productType: number;
  shift: number;
  productId: string;
  quantity: number;
}

interface FormFields {
  products?: ProductField[];
}

function RouteComponent() {
  const [form] = Form.useForm<FormFields>();
  const size: SizeType = 'large';

  const { data: products } = useCrudList({
    queryKey: 'products',
    service: productService,
    initialFilters: {
      limit: 0
    }
  });

  const productOptions = products?.map((product) => ({
    label: product.name,
    value: product.id
  }));
  const { mutate, isPending } = useMutation({
    mutationKey: ['addProductQuantity'],
    mutationFn: async (values: AddProductQuantitiesRequest) => {
      return await addProductsQuantity(values);
    },
    onSuccess: () => {
      message.success({
        key: 'addProductQuantities',
        content: 'Thêm sản lượng thành công'
      });
      form.resetFields();
    },
    onError: (error) => {
      message.error({
        key: 'addProductQuantities',
        content: 'Lỗi khi thêm sản lượng sản xuất'
      });
      if (import.meta.env.DEV) {
        console.error('Error adding product quantities:', error);
      }
    },
    onMutate: () => {
      message.loading({
        key: 'addProductQuantities',
        content: 'Đang thêm sản lượng...'
      });
    }
  });

  const onFinish: FormProps<FormFields>['onFinish'] = (values: FormFields) => {
    if (values.products?.length == 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    const requestBody: AddProductQuantitiesRequest = {
      products:
        values.products?.map((product) => ({
          date: product.date?.format('DD-MM-YYYY') || '',
          status: product.productType,
          shift: product.productType == 1 ? product.shift : undefined, // Only include shift if productType is 1
          productId: product.productId,
          quantity: product.quantity
        })) || []
    };

    mutate(requestBody);
  };

  return (
    <>
      <BackButton to="/admin/products" />
      <ComponentCard title="Thêm sản lượng sản xuất">
        <Form
          form={form}
          layout="vertical"
          size={size}
          onFinish={onFinish}
          initialValues={{ products: [{}] }}
          scrollToFirstError={{
            behavior: 'instant',
            block: 'center',
            focus: true
          }}
        >
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-4">
                {fields.map((field) => (
                  <Card
                    size="default"
                    title={`Sản phẩm ${field.name + 1}`}
                    key={field.key}
                    extra={
                      <IoCloseOutline onClick={() => remove(field.name)} />
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Form.Item
                        label="Thời gian cập nhật"
                        name={[field.name, 'date']}
                        rules={[
                          { required: true, message: 'Vui lòng chọn thời gian' }
                        ]}
                        initialValue={dayjs()}
                      >
                        <DatePicker
                          format={'DD-MM-YYYY'}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Loại sản lượng"
                        name={[field.name, 'productType']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng chọn loại sản lượng'
                          }
                        ]}
                      >
                        <Select
                          options={[
                            {
                              label: 'Hàng 100%',
                              value: 1
                            },
                            {
                              label: 'Hàng 200%',
                              value: 2
                            },
                            {
                              label: 'Hàng lỗi',
                              value: 6
                            },
                            {
                              label: 'Xuất hàng',
                              value: 3
                            }
                          ]}
                          placeholder="Chọn loại sản lượng"
                        />
                      </Form.Item>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) =>
                          prev.products?.[field.name]?.productType !==
                          curr.products?.[field.name]?.productType
                        }
                      >
                        {({ getFieldValue }) => {
                          const productType = getFieldValue([
                            'products',
                            field.name,
                            'productType'
                          ]);
                          return productType === 1 ? (
                            <Form.Item
                              label="Ca làm việc"
                              name={[field.name, 'shift']}
                              rules={[
                                {
                                  validator(_, value, callback) {
                                    if (!value) {
                                      callback('Vui lòng chọn ca làm việc');
                                    } else {
                                      callback();
                                    }
                                  }
                                }
                              ]}
                            >
                              <Select
                                options={[
                                  {
                                    label: 'Ca 1',
                                    value: 1
                                  },
                                  {
                                    label: 'Ca 2',
                                    value: 2
                                  }
                                ]}
                                placeholder="Chọn ca làm việc"
                              />
                            </Form.Item>
                          ) : null;
                        }}
                      </Form.Item>
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
                        />
                      </Form.Item>
                      <Form.Item
                        label="Sản lượng"
                        name={[field.name, 'quantity']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập sản lượng'
                          }
                        ]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  <IconAdd /> Thêm sản phẩm
                </Button>
              </div>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: '16px', marginBottom: '0' }}>
            <Button
              variant="solid"
              color="green"
              loading={isPending}
              htmlType="submit"
            >
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </ComponentCard>
    </>
  );
}

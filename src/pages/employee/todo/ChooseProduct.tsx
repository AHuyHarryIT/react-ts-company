import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { IconHistory } from '@components/icons';
import { UserInfo } from '@components/UserInfo';
import { productService } from '@services/ProductService';
import { createTodo } from '@services/TodoService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button, Form, FormProps, message, Select } from 'antd';
import { FaEdit, FaHome } from 'react-icons/fa';

interface FormValues {
  productId: string;
  shift: string;
}

interface ProductOption {
  label: string;
  value: string;
  searchText: string;
}

export const ChooseProduct = () => {
  const [form] = Form.useForm();

  const { data: productData } = useQuery({
    queryKey: ['product', 'list'],
    queryFn: () => productService.list({ limit: 0 })
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['product', 'update'],
    mutationFn: (values: FormValues) =>
      createTodo({
        productId: values.productId,
        shift: values.shift
      }),
    onError: () => {
      message.error('Sản phẩm đã tồn tại hoặc không hợp lệ');
    },
    onMutate: () => {
      message.loading('Đang cập nhật sản phẩm...');
    },
    onSuccess: () => {
      form.resetFields();
      message.success('Cập nhật sản phẩm thành công');
    }
  });

  const productOptions: ProductOption[] =
    productData?.data.map((product) => ({
      label: product.name,
      value: product.id,
      searchText: `${product.code} ${product.name}`.toLowerCase()
    })) || [];

  const shiftOptions = [
    { label: 'Ca 1', value: 'Ca 1' },
    { label: 'Ca 2', value: 'Ca 2' }
  ];

  const formProps: FormProps<FormValues> = {
    ...customFormProps,
    form: form,
    onFinish: (values) => {
      mutate(values);
    }
  };

  return (
    <>
      <BackButton to="/" />
      <ComponentCard title="Cập Nhật Loại Sản Phẩm Cần Kiểm Hàng Hoặc Sản Xuất">
        <div className="flex flex-col flex-wrap items-center gap-4 lg:flex-row">
          <Link to="/">
            <Button variant="solid" color="blue" icon={<FaHome />}>
              TRANG CHỦ
            </Button>
          </Link>
          <Link to="/employee/activity-schedule">
            <Button variant="solid" color="gold" icon={<IconHistory />}>
              LỊCH SỬ ĐÃ CHỌN
            </Button>
          </Link>
          <Link to="/employee/todo/update-quantity">
            <Button variant="solid" color="green" icon={<FaEdit />}>
              CẬP NHẬT SẢN LƯỢNG
            </Button>
          </Link>
        </div>
        <div className="space-y-6 lg:w-1/2">
          <div className="text-center text-xl font-bold">
            Thông tin sản phẩm
          </div>
          <UserInfo />

          <Form<FormValues> {...formProps}>
            <Form.Item<FormValues>
              label="Chọn sản phẩm"
              name="productId"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            >
              <Select
                options={productOptions}
                allowClear
                showSearch
                placeholder="Chọn sản phẩm"
                filterOption={(input, option) => {
                  if (!option?.searchText) return false;
                  return option.searchText.includes(input.toLowerCase());
                }}
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item<FormValues>
              label="Chọn ca làm việc"
              name="shift"
              rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
            >
              <Select
                options={shiftOptions}
                allowClear
                placeholder="Chọn ca làm việc"
              />
            </Form.Item>
            <Form.Item>
              <Button
                variant="solid"
                color="green"
                htmlType="submit"
                loading={isPending}
              >
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </div>
      </ComponentCard>
    </>
  );
};

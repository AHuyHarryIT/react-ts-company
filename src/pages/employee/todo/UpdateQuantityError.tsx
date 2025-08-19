import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { IconHistory } from '@components/icons';
import { UserInfo } from '@components/UserInfo';
import { fetchTodoList, updateTodoQuantity } from '@services/TodoService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button, Form, InputNumber, message, Select } from 'antd';
import { FormProps } from 'antd/lib';
import { BsArrowLeft } from 'react-icons/bs';

interface FormValues {
  productId: string;
  quantity: number;
}

export const UpdateQuantityError = () => {
  const [form] = Form.useForm();

  const { data: todoData } = useQuery({
    queryKey: ['product', 'todo', 'list'],
    queryFn: () => fetchTodoList()
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['product', 'todo', 'update-quantity'],
    mutationFn: (data: FormValues) => updateTodoQuantity(data),
    onMutate: () => {
      message.loading('Đang cập nhật sản lượng...');
    },
    onSuccess: () => {
      form.resetFields();
      message.success('Cập nhật sản lượng thành công');
    },
    onError: () => {
      message.error('Cập nhật sản lượng thất bại');
    }
  });

  const todoOptions = todoData?.map((todo) => ({
    key: todo.id,
    label: todo.product.name,
    value: todo.product.id
  }));

  const formProps: FormProps<FormValues> = {
    ...customFormProps,
    form: form,
    onFinish: (values) => {
      mutate(values);
    }
  };
  return (
    <>
      <ComponentCard title="Cập Nhật Sản Lượng Hàng Lỗi">
        <div className="flex flex-col flex-wrap items-center gap-4 lg:flex-row">
          <Link to="/employee/todo/add-product">
            <Button variant="solid" color="blue" icon={<BsArrowLeft />}>
              NHẬP SẢN PHẨM
            </Button>
          </Link>
          <Link to="/employee/todo/history">
            <Button variant="solid" color="gold" icon={<IconHistory />}>
              LỊCH SỬ
            </Button>
          </Link>
        </div>
        <div className="space-y-6 lg:w-1/2">
          <UserInfo />
          <Form<FormValues> {...formProps}>
            <Form.Item<FormValues>
              label="Chọn sản phẩm"
              name="productId"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            >
              <Select
                options={todoOptions}
                allowClear
                showSearch
                placeholder="Chọn sản phẩm"
              />
            </Form.Item>
            <Form.Item<FormValues>
              label="Số lượng sản phẩm"
              name="quantity"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng sản phẩm' },
                { type: 'number', message: 'Số lượng phải lớn hơn 0' }
              ]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
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

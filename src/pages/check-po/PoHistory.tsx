import { DailyQuantitiesType } from '@/types/dailyQuantitiesType';
import { UpdatePoRequest } from '@/types/purchaseOrdersType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { customTableProps } from '@components/custom/TableProps.custom';
import { productService } from '@services/ProductService';
import {
  getPurchaseOrdersHistory,
  updatePurchaseOrdersQuantities
} from '@services/PurchaseOrdersService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  FormProps,
  Input,
  InputNumber,
  message,
  Select,
  SelectProps,
  Spin,
  Table,
  TableColumnsType,
  TableProps
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DeleteModel } from './DeleteModel';

interface FormFields {
  date: string;
  [key: `product_${number | string}`]: number;
}

export const PoHistory = () => {
  const [form] = Form.useForm<FormFields>();
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [date, setDate] = useState<Dayjs>();
  const [searchText, setSearchText] = useState<string>('');

  const queryClient = useQueryClient();

  const { mutate: updatePurchaseOrder, isPending } = useMutation({
    mutationKey: ['updatePurchaseOrder'],
    mutationFn: (data: UpdatePoRequest) => updatePurchaseOrdersQuantities(data),
    onMutate: () => {
      message.loading({
        content: 'Đang cập nhật...',
        key: 'update-po-quantity'
      });
    },
    onSuccess: () => {
      message.success({
        content: 'Cập nhật thành công!',
        key: 'update-po-quantity'
      });
      setDate(undefined);
      queryClient.invalidateQueries();
    },
    onError: () => {
      message.error({
        content: 'Cập nhật thất bại!',
        key: 'update-po-quantity'
      });
    }
  });

  const { data: purchaseOrdersHistory, isLoading: isLoadingHistory } = useQuery(
    {
      queryKey: ['purchaseOrdersHistory', month, date],
      queryFn: () => getPurchaseOrdersHistory(month.format('YYYY-MM'))
    }
  );

  const { data: products, isFetching: isLoadingProducts } = useQuery({
    queryKey: ['purchaseOrdersHistory', date],
    queryFn: () =>
      productService.list({
        limit: 0,
        include: ['dailyQuantitiesPo'],
        date: date?.format('YYYY-MM-DD')
      }),
    enabled: !!date
  });

  const productList = products?.data || [];

  // Filter data based on search text
  const filteredHistoryData =
    purchaseOrdersHistory?.dailyQuantitiesPo?.filter((item) =>
      item.product?.name?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

  // Filter product list based on search text
  const filteredProductList = productList.filter((product) =>
    product.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const dateOptions: SelectProps['options'] =
    purchaseOrdersHistory?.dates.map((date) => ({
      label: date,
      value: date
    })) || [];

  const columns: TableColumnsType<DailyQuantitiesType> = [
    {
      title: 'STT',
      align: 'center',
      render: (_text, _record, index) => index + 1
    },
    {
      title: 'Tên sản phẩm',
      key: 'name',
      dataIndex: ['product', 'name']
    },
    {
      title: 'Số lượng hiện tại',
      key: 'currentQuantity',
      dataIndex: ['quantity'],
      align: 'center'
    },
    {
      title: 'Ngày nhập sản lượng xuất hàng',
      key: 'importDate',
      dataIndex: ['date'],
      align: 'center'
    },
    {
      title: 'Thời gian cập nhật cuối cùng',
      key: 'updatedAt',
      dataIndex: ['updated_at'],
      align: 'center',
      render: (text) => dayjs(text).format('DD-MM-YYYY HH:mm:ss')
    },
    {
      title: 'Người nhập',
      key: 'createdBy',
      dataIndex: ['employee', 'name'],
      align: 'center'
    },
    {
      title: 'Thao tác',
      key: 'action',
      dataIndex: ['id'],
      align: 'center',
      render: (value, record) => (
        <DeleteModel id={value} name={record.product?.name || ''} />
      )
    }
  ];

  const tableProps: TableProps<DailyQuantitiesType> = {
    ...(customTableProps as unknown as TableProps<DailyQuantitiesType>),
    columns,
    rowKey: 'id',
    dataSource: filteredHistoryData,
    loading: isLoadingHistory
  };

  const formProps: FormProps<FormFields> = {
    ...customFormProps,
    form,
    onFinish: async (values) => {
      values.date = date?.format('YYYY-MM-DD') || '';
      // filter not null values
      const productQuantities = Object.entries(values)
        .filter(([key, val]) => key.startsWith('product_') && val > 0)
        .map(([key, val]) => ({
          productId: key.split('_')[1],
          quantity: val
        }));
      await updatePurchaseOrder({
        date: values.date,
        products: productQuantities
      });
    }
  };

  return (
    <>
      <BackButton to="/admin/check-po" />
      <ComponentCard title="Danh sách lịch sử cập nhật sản lượng">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              picker="month"
              value={month}
              onChange={(date) =>
                date ? (setMonth(date), setDate(undefined)) : setMonth(dayjs())
              }
            />
            <Select
              options={dateOptions}
              placeholder="Chọn ngày"
              allowClear
              value={date?.format('YYYY-MM-DD')}
              onChange={(date) =>
                date ? setDate(dayjs(date)) : setDate(undefined)
              }
            />
          </div>
          <div>
            <Input.Search
              placeholder="Nhập tên sản phẩm"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </div>
        </div>
        {!date ? (
          <Table<DailyQuantitiesType> {...tableProps} />
        ) : (
          <Spin spinning={isLoadingProducts}>
            <Form<FormFields> {...formProps}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                {filteredProductList.map((product) => (
                  <Form.Item<FormFields>
                    key={`product_${product.id}_${date?.format('YYYY-MM-DD')}`}
                    label={<div className="font-semibold">{product.name}</div>}
                    name={`product_${product.id}_${date?.format('YYYY-MM-DD')}`}
                    initialValue={product.daily_quantities_po?.[0]?.quantity}
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
              {filteredProductList.length > 0 && (
                <Form.Item>
                  <Button
                    variant="solid"
                    color="blue"
                    loading={isPending}
                    htmlType="submit"
                  >
                    Cập nhật
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Spin>
        )}
      </ComponentCard>
    </>
  );
};

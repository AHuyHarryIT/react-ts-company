import {
  Button,
  DatePicker,
  Flex,
  Form,
  FormProps,
  InputNumber,
  Select
} from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { ProductType } from '@/types/productType';
import { Shift } from '@/types/shift';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { PrintBoxStamp } from '@components/print/BoxStamp';
import { ShiftEnumOptions } from '@constants/shift.enum';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';

interface FormFields {
  date: Dayjs;
  shift: Shift;
  totalBox: number;
  startBox: number;
  productCode: ProductType['code'];
}

export default function BoxStamp() {
  const [form] = Form.useForm<FormFields>();
  const [selectProduct, setSelectProduct] = useState<ProductType>();
  const [startBox, setStartBox] = useState<number>(0);
  const [totalBox, setTotalBox] = useState<number>(0);

  // Disable shortcut for print (Ctrl + P or Cmd + P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: productsData } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: {
      limit: 0
    }
  });

  const productOptions =
    productsData?.map((product) => ({
      value: product.code,
      label: product.name
    })) || [];

  const formProps: FormProps<FormFields> = {
    ...customFormProps,
    form: form,
    onFinish: (values) => {
      setSelectProduct(
        productsData.find((product) => product.code === values.productCode)
      );
      setStartBox(values.startBox);
      setTotalBox(values.totalBox);
    },
    onReset: () => {
      setSelectProduct(undefined);
      setStartBox(0);
      setTotalBox(0);
    }
  };

  return (
    <>
      <ComponentCard title="Tạo Tem Thùng">
        <Form<FormFields> {...formProps}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Form.Item<FormFields>
              label="Ngày"
              name="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item<FormFields>
              label="Ca"
              name="shift"
              rules={[{ required: true, message: 'Vui lòng chọn ca' }]}
            >
              <Select options={ShiftEnumOptions} placeholder="Chọn ca" />
            </Form.Item>
            <Form.Item<FormFields>
              label="Số lượng tem"
              name="totalBox"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng tem' }
              ]}
              extra={
                <>
                  <strong>Lưu ý:</strong>
                  <span>
                    Trường hợp nếu cần in lại nhiều tem với số lượng khác nhau
                    thì nhập số lượng tem theo các số lượng cần in, ví dụ: cần
                    in 2 tem 50 và 200 thì nhập số lượng là 50,200
                  </span>
                </>
              }
            >
              <InputNumber
                placeholder="Nhập số lượng tem"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item<FormFields>
              label="Tem bắt đầu"
              name="startBox"
              rules={[{ required: true, message: 'Vui lòng nhập tem bắt đầu' }]}
              extra={
                <>
                  <strong>Lưu ý:</strong>
                  <span>
                    Trường hợp nếu cần in lại nhiều tem với số tem khác nhau thì
                    nhập cách mỗi số tem ví dụ tem 10 và 20 thì nhập "10,20"
                  </span>
                </>
              }
            >
              <InputNumber
                placeholder="Nhập tem bắt đầu"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item<FormFields>
              label="Sản phẩm"
              name="productCode"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              extra={(() => {
                const selected = productsData.find(
                  (product) =>
                    product.code === form.getFieldValue('productCode')
                );
                return selected ? (
                  <>
                    <div>
                      <strong>Code:</strong> {selected.code}
                    </div>
                    <div>
                      <strong>PSC:</strong> {selected.quanEntityBin}
                    </div>
                  </>
                ) : null;
              })()}
            >
              <Select
                options={productOptions}
                placeholder="Chọn sản phẩm"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <Form.Item>
            <Flex gap={8}>
              <Button color="green" variant="solid" htmlType="submit">
                Tạo Tem
              </Button>
              <Button color="primary" variant="solid" htmlType="reset">
                Hủy
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </ComponentCard>
      {selectProduct && (
        <ComponentCard title="Xem trước khi in">
          <PrintBoxStamp
            product={selectProduct}
            startBox={startBox}
            totalBox={totalBox}
            shift={form.getFieldValue('shift') as Shift}
            date={form.getFieldValue('date')?.format('DD/MM/YYYY') || ''}
          />
        </ComponentCard>
      )}
    </>
  );
}

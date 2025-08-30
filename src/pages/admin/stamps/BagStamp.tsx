import {
  Button,
  DatePicker,
  Flex,
  Form,
  FormProps,
  Input,
  InputNumber,
  Select
} from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

import { ProductType } from '@/types/productType';
import { Shift } from '@/types/shift';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { PrintBagStamp } from '@components/print/PrintBagStamp';
import { ShiftEnumOptions } from '@constants/shift.enum';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';

interface FormFields {
  date: Dayjs;
  shift: Shift;
  totalBag: number;
  startBag: number;
  productCode: ProductType['code'];
}

export default function BagStamp() {
  const [form] = Form.useForm<FormFields>();
  const [stampData, setStampData] = useState<{
    product: ProductType;
    startBag: number;
    totalBag: number;
    shift: Shift;
    date: Dayjs;
  }>();
  const previewRef = useRef<HTMLDivElement>(null);

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
      setStampData({
        product: productsData.find(
          (product) => product.code === values.productCode
        )!,
        startBag: values.startBag,
        totalBag: values.totalBag,
        shift: values.shift,
        date: values.date
      });

      // Scroll to preview section after a short delay to ensure it's rendered
      setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    },
    onReset: () => {
      setStampData(undefined);
    }
  };

  return (
    <>
      <ComponentCard title="Tạo Tem Bịch">
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
              name="totalBag"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng tem' }
              ]}
              extra={
                <>
                  <p className="font-bold text-black">
                    Lưu ý: Trường hợp nếu cần in lại nhiều tem với số tem khác
                    nhau thì nhập số lượng tem theo các số lượng cần in, ví dụ:
                    cần in 2 tem lẻ 3,5 thì nhập số lượng là 2
                  </p>
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
              name="startBag"
              rules={[
                { required: true, message: 'Vui lòng nhập tem bắt đầu' },
                {
                  pattern: /^[0-9]+(,[0-9]+)*$/,
                  message: 'Vui lòng nhập số tem hợp lệ (ví dụ: 1,2,3 hoặc 5)'
                }
              ]}
              extra={
                <>
                  <p className="font-bold text-black">
                    Lưu ý: Trường hợp nếu cần in lại nhiều tem với số tem khác
                    nhau thì nhập cách mỗi số tem dấu phẩy(,). ví dụ tem 1 và 2
                    thì nhập, ví dụ: 3,5
                  </p>
                </>
              }
            >
              <Input placeholder="Nhập tem bắt đầu" />
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
                      <strong>PSC:</strong> {selected.quantity_per_package}
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
      {stampData && (
        <div ref={previewRef}>
          <ComponentCard title="Xem trước khi in">
            <PrintBagStamp
              product={stampData.product}
              startStamp={stampData.startBag}
              totalStamp={stampData.totalBag}
              shift={stampData.shift}
              date={stampData.date}
            />
          </ComponentCard>
        </div>
      )}
    </>
  );
}

import {
  Button,
  DatePicker,
  Flex,
  Form,
  FormProps,
  Input,
  InputNumber,
  Radio,
  Select
} from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

import { ProductType } from '@/types/productType';
import { Shift } from '@/types/shift';
import ComponentCard from '@components/common/ComponentCard';
import { customFormProps } from '@components/custom/FormProps.custom';
import { PrintBagStamp } from '@components/print/PrintBagStamp';
import { PrintBoxStamp } from '@components/print/PrintBoxStamp';
import { ShiftEnumOptions } from '@constants/shift.enum';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { useNavigate } from '@tanstack/react-router';

interface FormFields {
  date: Dayjs;
  shift: Shift;
  totalStamp: number;
  startStamp: number;
  productCode: ProductType['code'];
  purpose: 'new' | 'additional' | 'reprint';
}

export default function StampForm() {
  const [form] = Form.useForm<FormFields>();
  const [type, setType] = useState<'box' | 'bag'>('bag');
  const [stampData, setStampData] = useState<{
    product: ProductType;
    startStamp: number;
    totalStamp: number;
    shift: Shift;
    date: Dayjs;
    purpose: 'new' | 'additional' | 'reprint';
  }>();
  const [hasComma, setHasComma] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const stampLabel = type === 'box' ? 'thùng' : 'bịch';

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
      // Auto calculate totalStamp if hasComma
      const finalTotalStamp = hasComma
        ? values.startStamp.toString().split(',').length
        : values.totalStamp;

      setStampData({
        product: productsData.find(
          (product) => product.code === values.productCode
        )!,
        startStamp: values.startStamp,
        totalStamp: finalTotalStamp,
        shift: values.shift,
        date: values.date,
        purpose: values.purpose
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
      <ComponentCard title="Tạo Tem">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Loại tem:</label>
          <Radio.Group
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setStampData(undefined);
              form.resetFields();
            }}
            className="flex gap-4"
          >
            <Radio value="bag">Tem Bịch</Radio>
            <Radio value="box">Tem Thùng</Radio>
          </Radio.Group>
        </div>
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
              label="Mục đích in"
              name="purpose"
              rules={[{ required: true, message: 'Vui lòng chọn mục đích in' }]}
              initialValue="new"
            >
              <Select
                placeholder="Chọn mục đích in"
                options={[
                  { value: 'new', label: 'In mới' },
                  { value: 'additional', label: 'In thêm' },
                  { value: 'reprint', label: 'In lại' }
                ]}
              />
            </Form.Item>
            {!hasComma && (
              <Form.Item<FormFields>
                label="Số lượng tem"
                name="totalStamp"
                rules={[
                  {
                    required: !hasComma,
                    message: 'Vui lòng nhập số lượng tem'
                  }
                ]}
              >
                <InputNumber
                  placeholder="Nhập số lượng tem"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            <Form.Item<FormFields>
              label="Tem bắt đầu"
              name="startStamp"
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
                    {!hasComma &&
                      `Lưu ý: Trường hợp nếu cần in lại nhiều tem với số tem khác nhau thì nhập cách mỗi số tem dấu phẩy(,). ví dụ tem ${stampLabel} 1 và 2 thì nhập, ví dụ: 3,5`}
                  </p>
                </>
              }
            >
              <Input
                placeholder="Nhập tem bắt đầu"
                onChange={(e) => {
                  const value = e.target.value;
                  const hasCommaInValue = value.includes(',');
                  setHasComma(hasCommaInValue);

                  // If hasComma changed, reset totalStamp field
                  if (hasCommaInValue !== hasComma) {
                    form.setFieldValue('totalStamp', undefined);
                  }
                }}
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
              <Button
                color="default"
                variant="outlined"
                onClick={() => navigate({ to: '/stamps/history' })}
              >
                Xem Lịch Sử
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </ComponentCard>
      {stampData && (
        <div ref={previewRef}>
          <ComponentCard title="Xem trước khi in">
            {type === 'bag' ? (
              <PrintBagStamp
                product={stampData.product}
                startStamp={stampData.startStamp}
                totalStamp={stampData.totalStamp}
                shift={stampData.shift}
                date={stampData.date}
                purpose={stampData.purpose}
              />
            ) : (
              <PrintBoxStamp
                product={stampData.product}
                startStamp={stampData.startStamp}
                totalStamp={stampData.totalStamp}
                shift={stampData.shift}
                date={stampData.date}
                purpose={stampData.purpose}
              />
            )}
          </ComponentCard>
        </div>
      )}
    </>
  );
}

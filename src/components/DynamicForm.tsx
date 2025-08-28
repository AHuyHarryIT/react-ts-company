import { SizeType } from 'antd/es/config-provider/SizeContext';
import { Rule } from 'antd/es/form';

import { FieldConfig } from '@/types/form';
import { UploadImage } from '@components/ui/upload/UploadImage';
import { FileType } from '@utils/fileType';
import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  Form,
  FormInstance,
  FormProps,
  Input,
  InputNumber,
  Select,
  TimePicker,
  Upload
} from 'antd';

import { STORAGE_URL } from '@/configs/environment.config';
import { AiOutlineUpload } from 'react-icons/ai';

interface DynamicFormProps {
  form: FormInstance;
  fields: FieldConfig[]; // Array of field configurations
  onFinish: FormProps['onFinish']; // Function to handle form submission
  loading?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline'; // Form layout type
  submitButtonText?: string; // Text for the submit button
  size?: SizeType;
  resetForm?: () => void; // Function to reset the form
  zodRules?: Record<string, Rule[]>; // Zod validation rules for the form fields
  isGrid?: boolean; // Flag to indicate if the form should be displayed in a grid layout
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  form,
  fields,
  onFinish,
  loading,
  layout = 'vertical',
  submitButtonText = 'Submit',
  size,
  resetForm,
  zodRules = {},
  isGrid = false
}) => {
  const renderField = (field: FieldConfig) => {
    if (field.hidden) return null;

    const commonProps = {
      placeholder: field.placeholder || `Nhập ${field.label.toLowerCase()}`,
      disabled: field.disabled
    };

    switch (field.type) {
      case 'email':
        return <Input {...commonProps} />;
      case 'text':
        return <Input {...commonProps} />;
      case 'textarea':
        return <Input.TextArea {...commonProps} rows={4} />;
      case 'number':
        return <InputNumber {...commonProps} style={{ width: '100%' }} />;
      case 'password':
        return <Input.Password {...commonProps} />;
      case 'checkbox':
        return <Checkbox>{field.label}</Checkbox>;
      case 'checkbox-group':
        return (
          <Checkbox.Group {...commonProps} options={field.options}>
            {field.label}
          </Checkbox.Group>
        );
      case 'select':
        return (
          <Select
            {...commonProps}
            showSearch
            allowClear
            options={field.options}
            filterOption={(input, option) =>
              option
                ? option.label.toLowerCase().includes(input.toLowerCase())
                : false
            }
            placeholder={`Chọn ${field.label.toLowerCase()}`}
          />
        );
      case 'select-multiple':
        return (
          <Select
            {...commonProps}
            allowClear
            mode="multiple"
            options={field.options}
            filterOption={(input, option) =>
              option
                ? option.label.toLowerCase().includes(input.toLowerCase())
                : false
            }
            placeholder={`Chọn ${field.label.toLowerCase()}`}
          />
        );
      case 'date':
        return (
          <DatePicker
            {...commonProps}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder={`Chọn ${field.label.toLowerCase()}`}
          />
        );
      case 'time':
        return (
          <TimePicker
            {...commonProps}
            style={{ width: '100%' }}
            format="HH:mm:ss"
            placeholder={`Chọn ${field.label.toLowerCase()}`}
          />
        );
      case 'datetime':
        return (
          <DatePicker
            {...commonProps}
            style={{ width: '100%' }}
            showTime
            placeholder={`Chọn ${field.label.toLowerCase()}`}
          />
        );
      case 'file':
        return (
          <Upload {...commonProps} beforeUpload={() => false} maxCount={1}>
            <Input
              readOnly
              value="Tải lên tệp..."
              addonAfter={<AiOutlineUpload />}
            />
          </Upload>
        );
      case 'image': {
        const image = form.getFieldValue(`${field.name}`);
        return (
          <UploadImage
            {...commonProps}
            maxCount={1}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                onSuccess?.('ok');
              }, 0);
            }}
            onChange={async ({ fileList }) => {
              if (fileList.length > 0) {
                // convert file to File
                form.setFieldsValue({
                  [field.name]: fileList[0].originFileObj as FileType
                });
              }
            }}
            imageList={() => {
              if (image && image.length > 0) {
                return [
                  {
                    uid: '-1',
                    name: 'photo.jpg',
                    status: 'done',
                    url: `${STORAGE_URL}/${image}`
                  }
                ];
              } else return [];
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  const formItemLayout = () => {
    return fields.map((field) => (
      <Form.Item
        key={field.name}
        name={field.name}
        label={field.label}
        hidden={field.hidden}
        required={field.required}
        rules={
          field.rules ||
          zodRules[field.name] ||
          (field.required
            ? [{ required: true, message: `Vui lòng nhập ${field.label}` }]
            : [])
        }
      >
        {renderField(field)}
      </Form.Item>
    ));
  };

  return (
    <Form
      form={form}
      layout={layout}
      onFinish={(values) => {
        onFinish?.(values);
      }}
      autoComplete="off"
      disabled={loading}
      size={size}
    >
      {isGrid ? (
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {formItemLayout()}
        </div>
      ) : (
        <div className="flex flex-col gap-4">{formItemLayout()}</div>
      )}
      <Flex gap={'small'} wrap justify="end">
        {resetForm && (
          <Button
            onClick={resetForm}
            variant="solid"
            size={size}
            loading={loading}
          >
            Reset
          </Button>
        )}

        <Button
          color="green"
          variant="solid"
          htmlType="submit"
          size={size}
          loading={loading}
        >
          {submitButtonText}
        </Button>
      </Flex>
    </Form>
  );
};

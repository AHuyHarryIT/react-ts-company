import { Rule } from 'antd/es/form';

export type FieldType =
  | 'text'
  | 'password'
  | 'number'
  | 'email'
  | 'select'
  | 'textarea'
  | 'date'
  | 'file'
  | 'image';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hidden?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[]; // for select
  rules?: Rule[]; // Antd Form rules
}

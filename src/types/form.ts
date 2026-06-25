import { Rule } from 'antd/es/form';

export type FieldType =
  | 'text'
  | 'password'
  | 'number'
  | 'email'
  | 'select'
  | 'select-multiple'
  | 'checkbox'
  | 'checkbox-group'
  | 'textarea'
  | 'date'
  | 'native-date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'image';

export interface FieldConfig {
  name: string | string[] | number[];
  label: string;
  type: FieldType;
  required?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[]; // for select
  rules?: Rule[]; // Antd Form rules
  index?: number; // for sorting
}

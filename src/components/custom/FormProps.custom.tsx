import { FormProps } from 'antd';

export const customFormProps: FormProps = {
  layout: 'vertical',
  size: 'large',
  scrollToFirstError: {
    behavior: 'smooth',
    block: 'start',
    focus: true
  }
};

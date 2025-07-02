import { FormProps } from 'antd';

export const customFormProps: FormProps = {
  layout: 'vertical',
  size: 'large',
  scrollToFirstError: {
    behavior: 'instant',
    block: 'start',
    focus: true
  }
};

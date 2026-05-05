import { PaginationProps } from 'antd';

export const DEFAULT_PAGE_SIZE_OPTIONS = [
  '10',
  '20',
  '50',
  '100',
  '200',
  '500'
];

export const defaultPaginationShowTotal: PaginationProps['showTotal'] = (
  total,
  range
) => `Hiển thị ${range[0]}-${range[1]} (Tổng ${total})`;

export const customPaginationProps: PaginationProps = {
  align: 'end',
  size: 'default',
  showSizeChanger: true,
  pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
  showTotal: defaultPaginationShowTotal
};

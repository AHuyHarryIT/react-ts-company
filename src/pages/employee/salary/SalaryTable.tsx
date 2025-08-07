import { Table } from 'antd';
import React from 'react';

export interface SalaryTableType {
  key?: string | number;
  description: string;
  hours: number;
  amount: number;
  note: string | null;
}

interface SalaryTableProps {
  data: SalaryTableType[];
}
export const SalaryTable: React.FC<SalaryTableProps> = ({ data }) => {
  return (
    <Table
      bordered
      pagination={false}
      dataSource={data}
      rowKey={(record) => record.key ?? record.description}
    >
      <Table.Column
        title="Diễn giải"
        dataIndex="description"
        render={(value) => <span className="font-semibold">{value}</span>}
      />
      <Table.Column
        title="Số giờ / ngày"
        dataIndex="hours"
        align="center"
        render={(value) => {
          if (!value) return '-';
          return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          });
        }}
      />
      <Table.Column
        title="Thành tiền"
        dataIndex="amount"
        align="center"
        render={(value) => {
          if (!value) return '-';
          return value.toLocaleString('en-US', {
            maximumFractionDigits: 0
          });
        }}
      />
      <Table.Column title="Ghi chú" dataIndex="note" />
    </Table>
  );
};

import { SalaryType } from '@/types/salaryType';
import { WalletOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { Card } from 'antd';

type salaryDataType = {
  month: string;
  total: number;
};

export function SalaryChart({ data }: { data: SalaryType[] }) {
  const chartData: salaryDataType[] = data
    .map((item) => ({
      month: item.title.replace('Bảng Lương Tháng ', ''),
      total: item.total
    }))
    .reverse();

  const config = {
    data: chartData,
    xField: 'month',
    yField: 'total',
    axis: {
      y: {
        labelFormatter: (v: number) => v.toLocaleString('vi-VN') + ' ₫',
        title: 'Tổng lương'
      }
    },
    label: {
      text: (d: salaryDataType) => d.total.toLocaleString('vi-VN') + ' ₫',
      textBaseline: 'bottom'
    },
    tooltip: {
      title: (d: salaryDataType) => d.month,
      items: [
        {
          field: 'total',
          name: 'Tổng lương',
          valueFormatter: (value: number) =>
            value.toLocaleString('vi-VN') + ' ₫'
        }
      ]
    }
  };

  return (
    <Card
      title={
        <>
          <WalletOutlined /> Tổng quan bảng lương
        </>
      }
    >
      <Column {...config} />
    </Card>
  );
}

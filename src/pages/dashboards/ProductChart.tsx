import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';
import { TrophyOutlined } from '@ant-design/icons';
import { Bar } from '@ant-design/plots';
import { Card } from 'antd';

type ProductDataType = {
  product: string;
  quantity: number;
};

export function ProductChart({ data }: { data: TotalMonthQuantityType[] }) {
  const chartData: ProductDataType[] = (data || [])
    .map((item) => ({
      product: `SP-${item.product_id}`,
      quantity: item.totalQuan || 0
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const config = {
    data: chartData,
    isGroup: false,
    xField: 'product',
    yField: 'quantity',
    legend: { position: 'top' },
    label: {
      position: 'top',
      style: { fill: '#000', fontSize: 12 },
      formatter: (d: ProductDataType) => d.quantity.toLocaleString('en-US')
    },
    tooltip: {
      title: (d: ProductDataType) => d.product,
      items: [
        {
          field: 'quantity',
          name: 'Số lượng',
          valueFormatter: (value: number) => value.toLocaleString('en-US')
        }
      ]
    }
  };

  return (
    <Card
      title={
        <>
          <TrophyOutlined /> So sánh sản phẩm theo nhóm
        </>
      }
    >
      <Bar {...config} />
    </Card>
  );
}

import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';
import { Bar } from '@ant-design/plots';
import { Card, Badge, Statistic } from 'antd';

type ProductDataType = {
  product: string;
  quantity: number;
  index: number;
};

export function ProductChart({ data }: { data: TotalMonthQuantityType[] }) {
  const chartData: ProductDataType[] = (data || [])
    .map((item) => ({
      product: item.product?.name || 'N/A',
      quantity: item.totalQuan || 0,
      index: 0
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((item, index) => ({ ...item, index }));

  // Utility function to format numbers
  const formatNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(value >= 10000000000 ? 0 : 1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }
    return value.toString();
  };

  const config = {
    data: chartData,
    isGroup: false,
    xField: 'product', // Đổi lại: product ở trục X (ngang)
    yField: 'quantity', // Đổi lại: quantity ở trục Y (dọc)
    height: 400,
    color: '#3b82f6', // Single blue color
    columnStyle: {
      radius: [4, 4, 0, 0], // Đổi lại cho column chart dọc
      cursor: 'pointer'
    },
    legend: false,
    label: {
      position: 'top', // Đổi lại thành 'top'
      offset: 12,
      style: {
        fill: '#374151',
        fontSize: 11,
        fontWeight: 500,
        textAlign: 'center' // Đổi lại thành 'center'
      },
      formatter: (d: ProductDataType) => {
        return formatNumber(d.quantity);
      }
    },
    axis: {
      y: {
        labelFormatter: (value: number) => {
          return formatNumber(value);
        }
      },
      x: {
        labelFormatter: (text: string) => {
          if (window.innerWidth < 768) {
            return text.length > 12 ? `${text.slice(0, 12)}...` : text;
          }
          return text.length > 15 ? `${text.slice(0, 15)}...` : text;
        }
      }
    },
    tooltip: {
      title: (d: ProductDataType) => `Sản phẩm ${d.product}`,
      showTitle: true,
      domStyles: {
        'g2-tooltip': {
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      },
      items: [
        {
          field: 'quantity',
          name: 'Số lượng bán',
          valueFormatter: (value: number) => {
            return `${formatNumber(value)} sản phẩm`;
          }
        }
      ]
    },
    animation: {
      appear: {
        animation: 'grow-in-y',
        duration: 800,
        delay: (_: ProductDataType, index: number) => index * 100
      }
    },
    interactions: [
      {
        type: 'element-highlight-by-color'
      },
      {
        type: 'active-region'
      }
    ]
  };

  // Calculate statistics
  const maxQuantity = chartData.length > 0 ? chartData[0].quantity : 0;
  const totalQuantity = chartData.reduce((sum, item) => sum + item.quantity, 0);
  const avgQuantity =
    chartData.length > 0 ? Math.round(totalQuantity / chartData.length) : 0;
  const minQuantity =
    chartData.length > 0 ? chartData[chartData.length - 1].quantity : 0;

  return (
    <div className="h-full w-full">
      <Card
        className="h-full border-0 bg-white shadow-lg"
        style={{
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        title={
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibol mb-1 text-lg text-gray-800 uppercase">
                Top Sản Phẩm Sản Xuất
              </h3>
              <p className="flex items-center gap-2 text-sm font-normal text-gray-500">
                <Badge count={chartData.length} showZero color="#6b7280" />
                <span>
                  {chartData.length} sản phẩm hàng đầu theo số lượng sản xuất
                  theo tháng {data[0]?.month || 'N/A'}
                </span>
              </p>
            </div>
          </div>
        }
        extra={
          <div className="hidden items-center gap-4 lg:flex">
            <span className="rounded bg-gray-50 px-2 py-1 text-xs font-bold text-gray-600">
              Top sản phẩm
            </span>
          </div>
        }
      >
        {/* Top Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card
            className="border border-gray-200 bg-white shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            <Statistic
              title={
                <span className="text-xs font-medium text-gray-600">
                  Cao nhất
                </span>
              }
              value={maxQuantity}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatNumber(Number(value))}
                </span>
              )}
            />
          </Card>

          <Card
            className="border border-gray-200 bg-white shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            <Statistic
              title={
                <span className="text-xs font-medium text-gray-600">
                  Trung bình
                </span>
              }
              value={avgQuantity}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatNumber(Number(value))}
                </span>
              )}
            />
          </Card>

          <Card
            className="border border-gray-200 bg-white shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            <Statistic
              title={
                <span className="text-xs font-medium text-gray-600">
                  Tổng cộng
                </span>
              }
              value={totalQuantity}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatNumber(Number(value))}
                </span>
              )}
            />
          </Card>

          <Card
            className="border border-gray-200 bg-white shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            <Statistic
              title={
                <span className="text-xs font-medium text-gray-600">
                  Thấp nhất
                </span>
              }
              value={minQuantity}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatNumber(Number(value))}
                </span>
              )}
            />
          </Card>
        </div>

        <div className="relative">
          {/* Chart container */}
          <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div
              className="w-full"
              style={{ height: 'clamp(300px, 50vh, 400px)' }}
            >
              <Bar {...config} height={undefined} autoFit={true} />
            </div>
          </div>

          {/* Empty state */}
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-50">
              <div className="p-6 text-center">
                <p className="mb-1 text-base font-medium text-gray-600">
                  Chưa có dữ liệu sản phẩm
                </p>
                <p className="text-sm text-gray-500">
                  Dữ liệu sản phẩm sẽ xuất hiện tại đây
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Production Analysis */}
        {chartData.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-800">
              Báo cáo sản lượng
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-3">
                <span className="text-gray-600">Sản phẩm chính:</span>
                <span className="font-medium text-gray-900">
                  {chartData[0]?.product || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-3">
                <span className="text-gray-600">Sản lượng cao nhất:</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(maxQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-3">
                <span className="text-gray-600">Sản lượng thấp nhất:</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(minQuantity)}
                </span>
              </div>
            </div>

            {/* Simple production summary */}
            <div className="mt-3 rounded border border-gray-200 bg-white p-3">
              <h5 className="mb-2 text-xs font-medium text-gray-700">
                Tổng quan sản xuất
              </h5>
              <div className="space-y-1 text-xs text-gray-600">
                <div>
                  • Tổng cộng: <strong>{formatNumber(totalQuantity)}</strong>{' '}
                  sản phẩm được sản xuất
                </div>
                <div>
                  • Sản lượng trung bình:{' '}
                  <strong>{formatNumber(avgQuantity)}</strong> sản phẩm/loại
                </div>
                <div>
                  • Chênh lệch cao-thấp:{' '}
                  <strong>{formatNumber(maxQuantity - minQuantity)}</strong> sản
                  phẩm
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

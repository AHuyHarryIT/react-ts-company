import { SalaryType } from '@/types/salaryType';
import { Column } from '@ant-design/plots';
import { Badge, Card, Statistic } from 'antd';

type salaryDataType = {
  month: string;
  total: number;
  index: number;
};

export function SalaryChart({ data }: { data: SalaryType[] }) {
  const chartData: salaryDataType[] = data
    .map((item) => ({
      month: item.title.replace('Bảng Lương Tháng ', ''),
      total: item.total,
      index: 0
    }))
    .reverse()
    .map((item, index) => ({ ...item, index }));

  // Utility function to format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(value >= 10000000000 ? 0 : 1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }
    return `${value.toLocaleString('vi-VN')}`;
  };

  const config = {
    data: chartData,
    xField: 'month',
    yField: 'total',
    height: 400,
    color: '#3b82f6', // Single blue color
    columnStyle: {
      radius: [4, 4, 0, 0],
      cursor: 'pointer'
    },
    axis: {
      y: {
        labelFormatter: (v: number) => formatCurrency(v),
        title: {
          text: 'Tổng lương',
          style: {
            fontSize: 11,
            fontWeight: 500,
            fill: '#6b7280'
          }
        },
        grid: {
          line: {
            style: {
              stroke: '#f0f0f0',
              strokeDasharray: '3,3'
            }
          }
        }
      }
    },
    label: {
      text: (d: salaryDataType) => formatCurrency(d.total),
      textBaseline: 'bottom',
      offset: 12,
      style: {
        fill: '#1f2937',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }
    },
    tooltip: {
      title: (d: salaryDataType) => `Tháng ${d.month}`,
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
          field: 'total',
          name: 'Tổng lương',
          valueFormatter: (value: number) => formatCurrency(value)
        }
      ]
    },
    animation: {
      appear: {
        animation: 'grow-in-y',
        duration: 1200,
        delay: (_: salaryDataType, index: number) => index * 200
      }
    },
    interactions: [
      {
        type: 'element-highlight-by-color'
      },
      {
        type: 'active-region'
      },
      {
        type: 'brush'
      }
    ]
  };

  // Calculate statistics
  const totalSalaries = chartData.reduce((sum, item) => sum + item.total, 0);
  const avgSalary =
    chartData.length > 0 ? Math.round(totalSalaries / chartData.length) : 0;
  const maxSalary =
    chartData.length > 0 ? Math.max(...chartData.map((item) => item.total)) : 0;
  const minSalary =
    chartData.length > 0 ? Math.min(...chartData.map((item) => item.total)) : 0;

  // Calculate growth trend
  const latestMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const growthRate = previousMonth
    ? ((latestMonth.total - previousMonth.total) / previousMonth.total) * 100
    : 0;

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
              <h3 className="mb-1 text-lg font-semibold text-gray-800 uppercase">
                Tổng Quan Bảng Lương
              </h3>
              <p className="flex items-center gap-2 text-sm font-normal text-gray-500">
                <Badge count={chartData.length} showZero color="#6b7280" />
                <span>{chartData.length} tháng được theo dõi</span>
                {growthRate > 0 ? (
                  <span className="text-xs font-medium text-red-600">
                    +{growthRate.toFixed(1)}%
                  </span>
                ) : growthRate < 0 ? (
                  <span className="text-xs font-medium text-green-500">
                    {growthRate.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Ổn định</span>
                )}
              </p>
            </div>
          </div>
        }
        extra={
          <div className="hidden items-center gap-4 lg:flex">
            <span className="rounded bg-gray-50 px-2 py-1 text-xs font-bold text-gray-600">
              Theo dõi lương
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
              value={maxSalary}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(value))}
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
              value={avgSalary}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(value))}
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
              value={totalSalaries}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(value))}
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
              value={minSalary}
              formatter={(value) => (
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(value))}
                </span>
              )}
            />
          </Card>
        </div>

        <div className="relative">
          {/* Chart container with glass effect */}
          <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div
              className="w-full"
              style={{ height: 'clamp(300px, 50vh, 400px)' }}
            >
              <Column {...config} height={undefined} autoFit={true} />
            </div>
          </div>

          {/* Empty state with enhanced design */}
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-50">
              <div className="p-6 text-center">
                <p className="mb-1 text-base font-medium text-gray-600">
                  Chưa có dữ liệu lương
                </p>
                <p className="text-sm text-gray-500">
                  Dữ liệu bảng lương sẽ xuất hiện tại đây
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Salary Analysis */}
        {chartData.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-800">
              Phân tích lương tháng
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-3">
                <span className="text-gray-600">Chênh lệch cao-thấp</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(maxSalary - minSalary)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-3">
                <span className="text-gray-600">Tháng trên TB</span>
                <span className="font-medium text-gray-900">
                  {chartData.filter((item) => item.total >= avgSalary).length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-gray-100 bg-white p-3">
                <span className="text-gray-600">Xu hướng</span>
                <span
                  className={`font-medium ${
                    growthRate > 0
                      ? 'text-red-600'
                      : growthRate < 0
                        ? 'text-green-500'
                        : 'text-gray-600'
                  }`}
                >
                  {growthRate > 0 ? '+' : ''}
                  {growthRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Latest month highlight */}
            {latestMonth && (
              <div className="mt-3 rounded border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Tháng gần nhất:{' '}
                      <span className="text-blue-600">{latestMonth.month}</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Lương:{' '}
                      <strong>{formatCurrency(latestMonth.total)}</strong>
                    </p>
                  </div>
                  {growthRate !== 0 && (
                    <div
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        growthRate > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {growthRate > 0 ? '+' : ''}
                      {growthRate.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

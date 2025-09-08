import React, { useMemo } from 'react';
import { Card, Table, Typography, Row, Col, Statistic } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { StorageType } from '@/types/storageType';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface LotReportData {
  lotNumber: string;
  productCode: string;
  productName: string;
  fromBin: number;
  toBin: number;
  totalBins: number;
  date: string;
  employeeName: string;
  employeeId: string;
}

interface ProductLotReport {
  productCode: string;
  productName: string;
  lots: LotReportData[];
}

interface LotReportProps {
  data: StorageType[];
}

export const LotReport: React.FC<LotReportProps> = ({ data }) => {
  // Tổng hợp dữ liệu theo LOT (xử lý cả A-20082025 và A-20082025-1)
  const lotReportData: ProductLotReport[] = useMemo(() => {
    const lotMap = new Map<
      string,
      {
        lots: StorageType[];
        product: { code: string; name: string };
        employee: { name: string; id: string };
        date: string;
      }
    >();

    // Nhóm dữ liệu theo LOT + PRODUCT_ID (để tránh trùng lặp khi nhiều sản phẩm có cùng LOT)
    data.forEach((item) => {
      // Xử lý mã LOT - có thể là A-20082025 hoặc A-20082025-1
      let mainLotNumber = item.lot;

      // Nếu mã LOT có dạng A-20082025-1-001 (có STT thùng ở cuối)
      // thì chỉ lấy A-20082025-1
      const lotParts = item.lot.split('-');
      if (lotParts.length > 3) {
        // Có STT thùng ở cuối, bỏ phần cuối
        mainLotNumber = lotParts.slice(0, 3).join('-');
      }
      // Nếu chỉ có A-20082025 hoặc A-20082025-1 thì giữ nguyên

      // QUAN TRỌNG: Sử dụng cả LOT + PRODUCT_ID để tránh trường hợp:
      // Sản phẩm A có LOT A-20082025-2 và Sản phẩm B cũng có LOT A-20082025-2
      const key = `${mainLotNumber}_${item.product_id}`;
      if (!lotMap.has(key)) {
        lotMap.set(key, {
          lots: [],
          product: {
            code: item.product?.code || '',
            name: item.product?.name || ''
          },
          employee: {
            name: item.employee?.name || '',
            id: item.employee_id
          },
          date: dayjs(item.created_at).format('DD-MM-YYYY')
        });
      }
      lotMap.get(key)!.lots.push(item);
    });

    // Chuyển đổi sang định dạng báo cáo và nhóm theo sản phẩm
    const reportDataMap = new Map<string, LotReportData[]>();

    Array.from(lotMap.values()).forEach((group) => {
      const sortedBins = group.lots
        .map((item) => item.bin)
        .sort((a, b) => a - b);

      // Lấy mã LOT chính từ item đầu tiên
      const firstLot = group.lots[0].lot;
      let mainLotNumber = firstLot;

      const lotParts = firstLot.split('-');
      if (lotParts.length > 3) {
        // Có STT thùng ở cuối, bỏ phần cuối
        mainLotNumber = lotParts.slice(0, 3).join('-');
      }

      const lotData: LotReportData = {
        lotNumber: mainLotNumber,
        productCode: group.product.code,
        productName: group.product.name,
        fromBin: sortedBins[0],
        toBin: sortedBins[sortedBins.length - 1],
        totalBins: sortedBins.length,
        date: group.date,
        employeeName: group.employee.name,
        employeeId: group.employee.id
      };

      // Nhóm theo sản phẩm (sử dụng kết hợp product_id và product_name để đảm bảo chính xác)
      // Mỗi sản phẩm sẽ có danh sách các LOT riêng biệt
      const productKey = `${group.product.code}_${group.product.name}`;
      if (!reportDataMap.has(productKey)) {
        reportDataMap.set(productKey, []);
      }
      reportDataMap.get(productKey)!.push(lotData);
    });

    // Trả về dữ liệu được nhóm theo sản phẩm
    return Array.from(reportDataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b)) // Sort theo mã sản phẩm
      .map(([productKey, lots]) => {
        // Sắp xếp lots theo lotNumber trong cùng sản phẩm
        const sortedLots = lots.sort((a, b) =>
          a.lotNumber.localeCompare(b.lotNumber)
        );
        const [productCode, productName] = productKey.split('_');
        return {
          productCode,
          productName: productName || productCode,
          lots: sortedLots
        };
      });
  }, [data]);

  // Thống kê tổng quan
  const statistics = useMemo(() => {
    const allLots = lotReportData.flatMap((product) => product.lots);
    const totalLots = allLots.length;
    const totalBins = allLots.reduce((sum, lot) => sum + lot.totalBins, 0);
    const uniqueProducts = lotReportData.length;
    const uniqueEmployees = new Set(
      allLots.map((lot) => lot.employeeId).filter((id) => id)
    ).size;

    return { totalLots, totalBins, uniqueProducts, uniqueEmployees };
  }, [lotReportData]);

  const columns: ColumnsType<LotReportData> = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, index) => <span className="font-normal">{index + 1}</span>
    },
    {
      title: 'Mã LOT',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 150,
      align: 'center',
      render: (text) => (
        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-medium">
          {text}
        </span>
      )
    },
    {
      title: 'Bắt đầu - Kết thúc thùng',
      key: 'binRange',
      align: 'center',
      render: (_, record) => (
        <span className="rounded-md border border-yellow-300 bg-yellow-100 px-3 py-1.5 font-mono text-sm font-semibold text-yellow-800">
          {record.fromBin} → {record.toBin}
        </span>
      )
    },
    {
      title: 'Tổng số thùng',
      dataIndex: 'totalBins',
      key: 'totalBins',
      align: 'center',
      render: (value) => (
        <span className="rounded bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-600">
          {value}
        </span>
      )
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (text) => text
    },
    {
      title: 'Nhân viên nhập',
      key: 'employee',
      align: 'center',
      render: (_, record) => (
        <div>
          <div className="font-bold">{record.employeeName}</div>
          <div className="text-xs text-gray-600">
            Mã NV: {record.employeeId}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="py-4">
      {/* Thống kê tổng quan */}
      <Card
        title={
          <Title level={4} className="!m-0">
            Thống kê tổng quan
          </Title>
        }
        className="mb-4"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <div className="text-center">
              <Statistic title="Tổng số LOT" value={statistics.totalLots} />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="text-center">
              <Statistic
                title="Tổng số thùng đã xuất"
                value={statistics.totalBins}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="text-center">
              <Statistic
                title="Tổng sản phẩm đã xuất"
                value={statistics.uniqueProducts}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="text-center">
              <Statistic
                title="Số nhân viên"
                value={statistics.uniqueEmployees}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Báo cáo chi tiết sản phẩm theo LOT - Mỗi sản phẩm một bảng riêng */}
      {lotReportData.length === 0 ? (
        <Card>
          <div className="py-10 text-center text-gray-500">
            <Text>Không có dữ liệu để hiển thị</Text>
          </div>
        </Card>
      ) : (
        lotReportData.map((productGroup) => (
          <Card
            key={`${productGroup.productCode}_${productGroup.productName}`}
            title={
              <div className="flex items-center gap-3">
                <Title level={4} className="!m-0">
                  {productGroup.productName}
                </Title>
                <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-500">
                  {productGroup.productCode}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {productGroup.lots.length} LOT •{' '}
                  {productGroup.lots.reduce(
                    (sum, lot) => sum + lot.totalBins,
                    0
                  )}{' '}
                  thùng
                </span>
              </div>
            }
            className="mb-4"
          >
            <Table
              columns={columns}
              dataSource={productGroup.lots}
              rowKey={(record) =>
                `${record.lotNumber}_${record.productCode}_${record.employeeId}_${record.date}`
              }
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '50', '200'],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} LOT`
              }}
              scroll={{ x: 'max-content' }}
              size="small"
              bordered
              className="overflow-x-auto"
            />
          </Card>
        ))
      )}
    </div>
  );
};

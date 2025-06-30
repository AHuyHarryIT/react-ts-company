import { useQuery } from '@tanstack/react-query';
import { Table, TableColumnsType, TableProps } from 'antd';
import React, { useState } from 'react';

import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { RowTableActions } from './RowTableActions';

export type TotalTableType = {
  id: string;
  name: string;
  code: string;
  stockMOQ: number;
  catonQuantity: number;
  planTime: number;
  realTime: number;
  FAPV: number;
  FASV: number;
  FAVV: number;
  stockStartQuantity: number;
  realityQuantity: number;
  exportQuantity: number;
  checked200: number;
  notCheck200: number;
  stockEndQuantity: number;
  storageTime: number;
  times: {
    [date: string]: {
      quantity: number;
    };
  };
};

interface TotalTableProps {
  month: string; // MM-YYYY
  months?: string[];
}

export const TotalTable: React.FC<TotalTableProps> = ({
  month,
  months = []
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const {
    data: tableData,
    pagination,
    queryResult
  } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: {
      page: page,
      limit: limit,
      include: ['totalmonthquantities'],
      month: month
    }
  });

  const { data: monthlyQuantities } = useQuery({
    queryKey: ['month-quantities', page, limit],
    queryFn: ({ signal }) => {
      return getMonthlyQuantities({ limit: 0, status: 3, signal: signal });
    }
  });

  const dataSource: TotalTableType[] = tableData.map((product) => {
    const timeMap: TotalTableType['times'] = {};
    const totalMonthQuantities: TotalMonthQuantityType[] =
      product?.totalmonthquantities || [];

    const realityQuantity =
      totalMonthQuantities.find((item) => item.status === 1)?.totalQuan || 0;
    const importQuantity =
      totalMonthQuantities.find((item) => item.status === 2)?.totalQuan || 0;
    const exportQuantity =
      totalMonthQuantities.find((item) => item.status === 3)?.totalQuan || 0;
    const stockStartQuantity =
      totalMonthQuantities.find((item) => item.status === 4)?.totalQuan || 0;
    const stockQuantity200 =
      totalMonthQuantities.find((item) => item.status === 5)?.totalQuan || 0;
    const errorQuantity =
      totalMonthQuantities.find((item) => item.status === 6)?.totalQuan || 0;
    const stockQuantityMOQ =
      totalMonthQuantities.find((item) => item.status === 7)?.totalQuan || 0;

    const checked200 = stockQuantity200 + importQuantity - exportQuantity;
    const stockEndQuantity =
      stockStartQuantity + realityQuantity - exportQuantity - errorQuantity;
    const notCheck200 =
      stockStartQuantity +
      realityQuantity -
      exportQuantity -
      checked200 -
      errorQuantity;
    const catonQuantity = product.quanEntityBin
      ? stockQuantityMOQ / product.quanEntityBin
      : 0;
    const planTime =
      product.CAV && product.cycle
        ? ((((stockQuantityMOQ / product.CAV) * product.cycle) / 3600 / 24) *
            100) /
          90
        : 0;
    const realTime =
      product.CAV && product.cycle
        ? ((((exportQuantity / product.CAV) * product.cycle) / 3600 / 24) *
            100) /
          90
        : 0;

    const storageTime =
      stockQuantityMOQ !== 0 ? stockEndQuantity / (stockQuantityMOQ / 24) : 0;

    monthlyQuantities
      ?.filter((item) => item.product_id == product.id)
      .forEach((item) => {
        if (!timeMap[item.month]) {
          timeMap[item.month] = { quantity: 0 };
        }
        timeMap[item.month].quantity += item.totalQuan;
      });

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      stockMOQ: stockQuantityMOQ,
      catonQuantity: catonQuantity,
      planTime: planTime,
      realTime: realTime,
      FAPV: product.FAPV || 0,
      FASV: product.FASV || 0,
      FAVV: product.FAVV || 0,
      stockStartQuantity: stockStartQuantity,
      realityQuantity: realityQuantity,
      exportQuantity: exportQuantity,
      checked200: checked200,
      notCheck200: notCheck200,
      stockEndQuantity: stockEndQuantity,
      storageTime: storageTime,
      times: timeMap
    };
  });

  const dateColumns: TableColumnsType<TotalTableType> = months.map((month) => {
    return {
      key: `${month}_quantity`,
      title: (
        <div>
          Số lượng
          <br />
          Đã xuất tháng {month}
        </div>
      ),
      align: 'center',
      className: 'bg-indigo-300',
      dataIndex: ['times', month, 'quantity'],
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString({
          maximumFractionDigits: 0
        });
      }
    };
  });

  const columns: TableColumnsType<TotalTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: <div className="">Tên sản phẩm</div>,
      fixed: 'left',
      dataIndex: 'name'
    },
    {
      title: (
        <div className="">
          Sản Lượng
          <br />
          (MOQ)
        </div>
      ),
      minWidth: 100,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'stockMOQ',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('vi-VN', {
          style: 'decimal',
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: (
        <div className="">
          Thùng CATON/tháng
          <br />
          (MOQ)
        </div>
      ),
      minWidth: 100,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'catonQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('vi-VN', {
          style: 'decimal',
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: (
        <div className="">
          Dự định
          <br />
          Thời gian hoạt động thiết bị
          <br />
          (ngày/tháng)
        </div>
      ),
      minWidth: 200,
      align: 'center',
      dataIndex: 'planTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('vi-VN', {
          style: 'decimal',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: (
        <div className="">
          Thực tế
          <br />
          Thời gian hoạt động thiết bị
          <br />
          (ngày/tháng)
        </div>
      ),
      minWidth: 200,
      align: 'center',
      dataIndex: 'realTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('vi-VN', {
          style: 'decimal',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="">FAPV出荷</div>,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'FAPV',
      render: (value) => {
        if (!value) return '';
        return value == 1 ? 'O' : '';
      }
    },
    {
      title: <div className="">FASV出荷</div>,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'FASV',
      render: (value) => {
        if (!value) return '';
        return value == 1 ? 'O' : '';
      }
    },
    {
      title: <div className="">FAVV出荷</div>,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'FAVV',
      render: (value) => {
        if (!value) return '';
        return value == 1 ? 'O' : '';
      }
    },
    {
      title: (
        <div className="">
          Số lượng
          <br />
          tồn đầu kỳ
        </div>
      ),
      align: 'center',
      dataIndex: 'stockStartQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div className="">
          Thực tế
          <br />
          sản xuất
          <br />
          (cái/tháng)
        </div>
      ),
      align: 'center',
      dataIndex: 'realityQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div className="">
          Số Lượng
          <br />
          đã xuất
        </div>
      ),
      align: 'center',
      dataIndex: 'exportQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div className="">
          Số lượng
          <br />
          đã kiểm 200%
        </div>
      ),
      align: 'center',
      dataIndex: 'checked200',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div className="">
          Số lượng
          <br />
          chưa kiểm 200%
        </div>
      ),
      align: 'center',
      dataIndex: 'notCheck200',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div className="">
          Số lượng
          <br />
          tồn cuối kỳ
        </div>
      ),
      align: 'center',
      dataIndex: 'stockEndQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div className="">
          Số ngày
          <br />
          tồn kho
        </div>
      ),
      align: 'center',
      dataIndex: 'storageTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('vi-VN', {
          style: 'decimal',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
      }
    },
    ...dateColumns.reverse(),
    {
      title: <div>Thao tác</div>,
      align: 'center',
      render: (_, record) => {
        return <RowTableActions productId={record.id} />;
      }
    }
  ];

  const tableProps: TableProps<TotalTableType> = {
    rowKey: (record) => ['product', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    size: 'small',
    scroll: { x: 'max-content' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      pageSize: limit,
      current: page,
      total: pagination.total,
      showTotal: (total) => `Tổng ${total}`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      }
    }
  };

  return <Table {...tableProps} />;
};

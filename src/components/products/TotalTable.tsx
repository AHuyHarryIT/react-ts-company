import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Table, TableColumnsType, TableProps } from 'antd';
import React, { useMemo } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';
import { customTableProps } from '@components/custom/TableProps.custom';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { calculateTotalProduct } from '@utils/calculateTotalProduct';
import { RowTableActions } from './RowTableActions';
import { Link } from '@tanstack/react-router';

export type TotalTableType = {
  id: string;
  name: string;
  code: string;
  stockMOQ: number;
  catonQuantity: number;
  planTime: number;
  realTime: number;
  FAPV: boolean;
  FASV: boolean;
  FAVV: boolean;
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
  months?: string[];
  queryResult: UseQueryResult<PaginatedResponse<ProductType>>;
  setParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export const TotalTable: React.FC<TotalTableProps> = ({
  months = [],
  queryResult,
  setParams
}) => {
  const { data: response } = queryResult;
  const { tableData, pagination } = useMemo(() => {
    return {
      tableData: response?.data || [],
      pagination: {
        current: response?.current_page,
        total: response?.total,
        pageSize: response?.per_page
      }
    };
  }, [response]);

  const { data: monthlyQuantities } = useQuery({
    queryKey: ['month-quantities'],
    queryFn: () => {
      return getMonthlyQuantities({ limit: 0, status: 3 });
    }
  });

  const dataSource = calculateTotalProduct(
    tableData,
    monthlyQuantities ?? []
  ) as TotalTableType[];

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
      minWidth: 120,
      align: 'center',
      className: 'bg-indigo-300',
      dataIndex: ['times', month, 'quantity'],
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    };
  });

  const columns: TableColumnsType<TotalTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) =>
        index +
        1 +
        (pagination.pageSize ?? 50) * ((pagination.current ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      minWidth: 100,
      fixed: 'left',
      dataIndex: 'name',
      render: (value, record) => {
        return (
          <Link to={'/admin/products/$id'} params={{ id: record.id }}>
            {value}
          </Link>
        );
      }
    },
    {
      title: <div>Mã sản phẩm</div>,
      minWidth: 100,
      dataIndex: 'code'
    },
    {
      title: (
        <div>
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
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Thùng CATON/tháng
          <br />
          (MOQ)
        </div>
      ),
      minWidth: 120,
      className: 'bg-indigo-300',
      align: 'center',
      dataIndex: 'catonQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
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
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: (
        <div>
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
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div>FAPV出荷</div>,
      className: 'bg-indigo-300',
      minWidth: 50,
      align: 'center',
      dataIndex: 'FAPV',
      render: (value) => {
        if (!value) return '';
        return value ? '〇' : '';
      }
    },
    {
      title: <div>FASV出荷</div>,
      className: 'bg-indigo-300',
      minWidth: 50,
      align: 'center',
      dataIndex: 'FASV',
      render: (value) => {
        if (!value) return '';
        return value ? '〇' : '';
      }
    },
    {
      title: <div>FAVV出荷</div>,
      className: 'bg-indigo-300',
      minWidth: 50,
      align: 'center',
      dataIndex: 'FAVV',
      render: (value) => {
        if (!value) return '';
        return value ? '〇' : '';
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn đầu kỳ
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'stockStartQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Thực tế
          <br />
          sản xuất
          <br />
          (cái/tháng)
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'realityQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số Lượng
          <br />
          đã xuất
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'exportQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đã kiểm 200%
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'checked200',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          chưa kiểm 200%
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'notCheck200',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn cuối kỳ
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'stockEndQuantity',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString();
      }
    },
    {
      title: (
        <div>
          Số ngày
          <br />
          tồn kho
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'storageTime',
      render: (value) => {
        if (!value) return 0;
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 1
        });
      }
    },
    ...dateColumns.reverse(),
    {
      title: <div>Thao tác</div>,
      minWidth: 100,
      align: 'center',
      render: (_, record) => {
        return <RowTableActions productId={record.id} />;
      }
    }
  ];

  const tableProps: TableProps<TotalTableType> = {
    ...(customTableProps as unknown as TableProps<TotalTableType>),
    rowKey: (record) => ['product', record.id].join('-'),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: pagination.pageSize,
      current: pagination.current,
      total: pagination.total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({ ...prev, limit: size }));
      },
      onChange: (page) => {
        setParams((prev) => ({ ...prev, page }));
      }
    }
  };

  return <Table {...tableProps} />;
};

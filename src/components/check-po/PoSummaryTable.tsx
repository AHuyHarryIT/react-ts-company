import { Table, TableColumnsType, TableProps } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { customTableProps } from '@components/custom/TableProps.custom';
import { useCrudList } from '@hooks/useCrudList';
import { productService } from '@services/ProductService';
import { QueryParams } from '@/types/queryParams';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import {
  calculateTotalProduct,
  TotalTableResult
} from '@utils/calculateTotalProduct';

interface PoSummaryTableProps {
  month: Dayjs;
  search?: string;
}

export const PoSummaryTable: React.FC<PoSummaryTableProps> = ({
  month,
  search
}) => {
  const [dataSource, setDataSource] = useState<TotalTableResult[]>([]);
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: [
      'totaldailyquantities',
      'totalmonthquantities',
      'totaldailyquantitiespo'
    ],
    month: month.format('YYYY-MM')
  });

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      month: month.format('YYYY-MM'),
      'filter[search]': search?.trim() || undefined
    }));
  }, [month, search]);

  const { queryResult } = useCrudList({
    service: productService,
    queryKey: 'check-po-products-summary',
    initialFilters: params
  });

  const tableData = useMemo(
    () => queryResult.data?.data || [],
    [queryResult.data?.data]
  );
  const total = queryResult.data?.total || 0;

  const { data: monthlyQuantitiesStatus8, isLoading: isLoadingStatus8 } =
    useQuery({
      queryKey: ['check-po-month-quantities', 'po-export', 8],
      queryFn: () => getMonthlyQuantities({ limit: 0, status: 8 })
    });

  const { data: monthlyQuantitiesStatus3, isLoading: isLoadingStatus3 } =
    useQuery({
      queryKey: ['check-po-month-quantities', 'po-export', 3],
      queryFn: () => getMonthlyQuantities({ limit: 0, status: 3 })
    });

  const monthlyQuantities = useMemo(
    () => [
      ...(monthlyQuantitiesStatus8 ?? []),
      ...(monthlyQuantitiesStatus3 ?? [])
    ],
    [monthlyQuantitiesStatus3, monthlyQuantitiesStatus8]
  );

  useEffect(() => {
    if (!tableData.length) {
      setDataSource([]);
      return;
    }

    setDataSource(
      calculateTotalProduct(
        tableData,
        monthlyQuantities,
        month.format('YYYY-MM')
      )
    );
  }, [monthlyQuantities, month, tableData]);

  const isLoading =
    queryResult.isLoading || isLoadingStatus8 || isLoadingStatus3;

  const renderNumber = (value: number) => {
    if (!value) return 0;
    return value.toLocaleString();
  };

  const renderDecimal = (value: number) => {
    if (!value) return 0;
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 1
    });
  };

  const columns: TableColumnsType<TotalTableResult> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      width: 64,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: <div>Tên sản phẩm</div>,
      width: 180,
      fixed: 'left',
      dataIndex: 'name',
      ellipsis: true
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          con/thùng
        </div>
      ),
      width: 110,
      align: 'center',
      dataIndex: 'quanEntityBin',
      render: renderNumber
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn đầu kỳ
        </div>
      ),
      width: 120,
      align: 'center',
      dataIndex: 'stockStartQuantity',
      render: renderNumber
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
      width: 120,
      align: 'center',
      dataIndex: 'realityQuantity',
      render: renderNumber
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đã xuất
        </div>
      ),
      width: 110,
      align: 'center',
      dataIndex: 'exportQuantity',
      render: renderNumber
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đã kiểm
          <br />
          200%
        </div>
      ),
      width: 120,
      align: 'center',
      dataIndex: 'checked200',
      render: renderNumber
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          chưa kiểm
          <br />
          200%
        </div>
      ),
      width: 120,
      align: 'center',
      dataIndex: 'notCheck200',
      render: renderNumber
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          tồn cuối kỳ
        </div>
      ),
      width: 120,
      align: 'center',
      dataIndex: 'stockEndQuantity',
      render: renderNumber
    },
    {
      title: (
        <div>
          Số ngày
          <br />
          tồn kho
        </div>
      ),
      width: 100,
      align: 'center',
      dataIndex: 'storageTime',
      render: renderDecimal
    }
  ];

  const tableProps: TableProps<TotalTableResult> = {
    ...(customTableProps as unknown as TableProps<TotalTableResult>),
    tableLayout: 'fixed',
    className: 'product-sticky-table admin-page-sticky-table',
    rowKey: (record) => ['check-po-summary', record.id].join('-'),
    columns,
    dataSource,
    loading: isLoading,
    sticky: {
      offsetHeader: 0
    },
    scroll: {
      x: 'max-content',
      scrollToFirstRowOnChange: false
    },
    pagination: {
      ...customTableProps.pagination,
      position: ['bottomRight'],
      pageSize: params.limit,
      current: params.page,
      total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page
        }));
      }
    }
  };

  return <Table {...tableProps} />;
};

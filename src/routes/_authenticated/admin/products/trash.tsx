import { createFileRoute } from '@tanstack/react-router';
import { Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import { ProductType } from '@/types/productType';
import { QueryParams } from '@/types/queryParams';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { useCrudList } from '@hooks/useCrudList';
import { ProductModelEnumOptions } from '@schemas/product/productModelEnum.enum';
import { ProductModelSizeEnumOptions } from '@schemas/product/productModelSizeEnum.enum';
import { productService } from '@services/ProductService';

export const Route = createFileRoute('/_authenticated/admin/products/trash')({
  component: RouteComponent
});

function RouteComponent() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10
  });

  const {
    data: products,
    pagination,
    queryResult: { isLoading, isFetching, refetch }
  } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: params,
    isTrash: true
  });

  const handleChange: TableProps<ProductType>['onChange'] = (
    _,
    filters,
    sorter
  ) => {
    // Sort
    let sortValue = undefined;
    if (!Array.isArray(sorter) && sorter.order && sorter.field) {
      sortValue = `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`;
    }

    // Filter
    const newFilters: QueryParams = {};
    Object.entries(filters).forEach(([key, value]) => {
      newFilters[`filter[${key}]`] = value?.toString();
    });
    setParams((prev) => ({
      ...newFilters,
      sort: sortValue,
      page: prev.page,
      limit: prev.limit
    }));
  };

  const columns: TableColumnsType<ProductType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Tên sản phẩm',
      fixed: 'left',
      minWidth: 100,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      filterSearch: true
    },
    {
      title: 'Mã sản phẩm',
      align: 'center',
      minWidth: 100,
      key: 'code',
      dataIndex: 'code',
      sorter: true
    },
    {
      title: 'Kích thước khuôn',
      align: 'center',
      minWidth: 130,
      dataIndex: 'moldSize',
      filters: ProductModelSizeEnumOptions.map((item) => ({
        text: item.label,
        value: item.value
      })),
      filterSearch: true
    },
    {
      title: 'CAV',
      align: 'center',
      minWidth: 100,
      dataIndex: 'CAV',
      sorter: true
    },
    {
      title: 'Mã thùng',
      align: 'center',
      minWidth: 100,
      dataIndex: 'binCode',
      filters: ProductModelEnumOptions.map((item) => ({
        text: item.label,
        value: item.value
      })),
      filterSearch: true
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          con/thùng
        </div>
      ),
      minWidth: 100,
      align: 'center',
      dataIndex: 'quanEntityBin',
      sorter: true
    },
    {
      title: 'Thao tác',
      align: 'center',
      minWidth: 100,
      render: (_value, record) => {
        return (
          <ConfirmButton
            isRestore={true}
            id={record.id}
            service={productService}
            content={
              <p>
                Bạn có chắc chắn muốn khôi phục sản phẩm{' '}
                <strong>
                  {record.name} - {record.code}
                </strong>{' '}
                không?
              </p>
            }
          />
        );
      }
    }
  ];

  const tableProps: TableProps<ProductType> = {
    rowKey: (record) => ['retrieval', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: products,
    loading: isLoading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      pageSize: pagination.pageSize,
      current: pagination.current,
      total: pagination.total,
      showTotal: (total) => `Tổng ${total}`,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page: page
        }));
      }
    },
    onChange: handleChange
  };

  return (
    <>
      <BackButton to="/admin/products" />
      <ComponentCard title="Thùng rác">
        <RefreshButton refresh={refetch} isLoading={isFetching} />
        <Table {...tableProps} />
      </ComponentCard>
    </>
  );
}

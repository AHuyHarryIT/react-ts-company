import { QueryParams } from '@/types/queryParams';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customPaginationProps } from '@components/custom/PaginationProps.custom';
import { DateRangeCard } from '@components/ui/DateRangeCard';
import { fetchEmpSalaries } from '@services/SalaryService';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Alert, Empty, Input, Pagination, PaginationProps, Spin } from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useState } from 'react';

export default function SalariesList() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 12
  });

  const {
    data: salaries,
    isFetching,
    isLoading,
    refetch,
    isError
  } = useQuery({
    queryKey: ['salariesList', 'employee', params],
    queryFn: async () => await fetchEmpSalaries(params)
  });

  const paginationProps: PaginationProps = {
    ...customPaginationProps,
    pageSizeOptions: ['12', '24', '48', '60', '120', '240'],
    current: salaries?.current_page ?? 1,
    pageSize: salaries?.per_page ?? 12,
    total: salaries?.total ?? 0,
    onChange: (page, pageSize) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        limit: pageSize
      }));
    }
  };

  const handleSearch = debounce((value: string) => {
    setParams((prev) => ({
      ...prev,
      'filter[title]': value ? value : undefined
    }));
  }, 300);

  return (
    <>
      <BackButton />
      <ComponentCard title="Danh sách bảng lương">
        <RefreshButton isLoading={isFetching} refresh={refetch} />
        <div className="text-right">
          <Input.Search
            className="max-w-3xs"
            allowClear
            placeholder="Nhập tiêu đề"
            onChange={(e) => {
              const inputValue = e.target.value;
              handleSearch(inputValue);
            }}
          />
        </div>
        {isError && (
          <Alert message="Đã có lỗi xảy ra vui lòng thử lại sau" type="error" />
        )}
        <Spin spinning={isLoading}>
          {salaries && salaries.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {salaries.data.map((item) => (
                <Link
                  key={item.id}
                  to={`/employee/salaries/$id`}
                  params={{ id: item.id }}
                >
                  <DateRangeCard
                    key={`schedule_${item.id}-${item.start_date}-${item.end_date}`}
                    title={item.title}
                    startDate={dayjs(item.start_date)}
                    endDate={dayjs(item.end_date)}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <Empty />
          )}
          <div className="mt-4">
            <Pagination {...paginationProps} />
          </div>
        </Spin>
      </ComponentCard>
    </>
  );
}

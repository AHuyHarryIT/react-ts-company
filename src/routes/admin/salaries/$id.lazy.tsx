import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Alert, Radio, Tabs, TabsProps, Typography } from 'antd';
import { useState } from 'react';

import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AttendanceTable } from '@components/salaries/AttendanceTable';
import CategoryTable from '@components/salaries/CategoryTable';
import { SalaryDetailTable } from '@components/salaries/SalaryDetailTable';
import { SalaryTable } from '@components/salaries/SalaryTable';
import { fetchSalary } from '@services/SalaryService';

const { Title } = Typography;

type CompanyType = 'vvp' | 'a7a';

export const Route = createLazyFileRoute('/admin/salaries/$id')({
  component: RouteComponent
});

function RouteComponent() {
  const { id } = Route.useParams();

  const [company, setCompany] = useState<CompanyType>('vvp');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['fetchSalary', id, company],
    queryFn: () => fetchSalary({ id: id, company: company })
  });

  const { category, salary, salaryDetail, attendance } = data || {
    category: [],
    salary: [],
    salaryDetail: [],
    attendance: []
  };

  const SalaryTabs: TabsProps['items'] = [
    {
      key: 'category',
      label: `Danh mục`,
      children: <CategoryTable data={category} loading={isLoading} />
    },
    {
      key: 'salary',
      label: `Bảng lương thanh toán`,
      children: <SalaryTable data={salary} loading={isLoading} />
    },
    {
      key: 'salaryDetail',
      label: `Bảng lương chi tiết`,
      children: <SalaryDetailTable data={salaryDetail} loading={isLoading} />
    },
    {
      key: 'timekeeping',
      label: `Bảng lương chấm công`,
      children: (
        <AttendanceTable
          data={attendance}
          company={company}
          loading={isLoading}
        />
      )
    }
  ];

  return (
    <>
      <BackButton />
      <ComponentCard title="Chi tiết bảng lương">
        <RefreshButton isLoading={isFetching} refresh={refetch} />

        {isError && (
          <Alert
            message="Có lỗi xảy ra"
            description="Vui lòng thử lại sau"
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Title level={5}>Công ty:</Title>
        <Radio.Group
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          options={[
            { label: 'VVP', value: 'vvp' },
            { label: 'A7A', value: 'a7a' }
          ]}
        />

        <Tabs items={SalaryTabs} size="middle" type="card" animated />
      </ComponentCard>
    </>
  );
}

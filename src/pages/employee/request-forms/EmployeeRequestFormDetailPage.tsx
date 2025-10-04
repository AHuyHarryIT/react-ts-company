import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Spin, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RequestFormDetailView } from '@components/RequestForm';
import { employeeRequestFormService } from '@services/RequestFormService';

export default function EmployeeRequestFormDetailPage() {
  const { id } = useParams({
    from: '/_authenticated/employee/request-forms/$id'
  });
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['employee-request-form-detail', id],
    queryFn: () => employeeRequestFormService.getDetail(Number(id)),
    enabled: !!id
  });

  const handleBack = () => {
    navigate({ to: '/employee/request-forms' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
        <Alert
          message="Lỗi"
          description="Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const requestForm = data?.data;

  if (!requestForm) {
    return (
      <div className="space-y-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
        <Alert
          message="Không tìm thấy"
          description="Không tìm thấy đơn yêu cầu này."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại danh sách
        </Button>
      </div>

      {/* Detail Content */}
      <Card>
        <RequestFormDetailView data={requestForm} />
      </Card>
    </div>
  );
}

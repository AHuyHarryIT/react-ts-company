import React, { useEffect } from 'react';
import {
  Form,
  InputNumber,
  Button,
  message,
  Skeleton,
  Card,
  Row,
  Col,
  Typography
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getConfig, updateConfig } from '../../services/SalaryWebService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;

interface ConfigTabProps {
  company: string;
}

const ConfigTab: React.FC<ConfigTabProps> = ({ company }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['salaryConfig', company],
    queryFn: () => getConfig(company),
    refetchOnWindowFocus: false
  });

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, number>) =>
      updateConfig(company, values),
    onSuccess: () => {
      message.success('Cập nhật cấu hình thành công!');
      queryClient.invalidateQueries({ queryKey: ['salaryConfig', company] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      message.error(
        axiosErr?.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình.'
      );
    }
  });

  useEffect(() => {
    if (data?.data) {
      // Chuẩn hoá dữ liệu tự động cho form
      form.setFieldsValue({
        ...data.data,
        insurance_company_rate: Number(
          (data.data.insurance_company_rate * 100).toFixed(2)
        ),
        insurance_employee_rate: Number(
          (data.data.insurance_employee_rate * 100).toFixed(2)
        ),
        union_fee_rate: Number((data.data.union_fee_rate * 100).toFixed(2))
      });
    }
  }, [data, form]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  const handleFinish = (values: Record<string, number>) => {
    // Format lại dữ liệu chia 100 trước khi gửi lên API
    const payload = {
      ...values,
      insurance_company_rate: values.insurance_company_rate / 100,
      insurance_employee_rate: values.insurance_employee_rate / 100,
      union_fee_rate: values.union_fee_rate / 100
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl p-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Title level={5} className="!m-0">
            Tham số {company.toUpperCase()}
          </Title>
          <Text type="secondary" className="text-xs">
            Chỉnh sửa hệ số và tỷ lệ làm cơ sở hệ thống lương
          </Text>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={saveMutation.isPending}
        >
          Lưu cấu hình
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        size="middle"
        className="space-y-4"
      >
        <Card
          size="small"
          title="Thời gian & Phân bổ"
          className="border-gray-200 shadow-sm"
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Ngày công chuẩn / tháng"
                name="standard_work_days"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full [&_input]:text-center"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Giờ làm / ngày"
                name="hours_per_day"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full [&_input]:text-center"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Hệ số chia giờ"
                name="hourly_divisor"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full [&_input]:text-center" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title="Tăng ca & Giới hạn công"
          className="border-gray-200 shadow-sm"
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Hệ số lương OT"
                name="overtime_multiplier"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full [&_input]:text-center"
                  step={0.1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Max công (Sản xuất)"
                name="max_work_days_worker"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full [&_input]:text-center" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Max công (Văn phòng)"
                name="max_work_days_office"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full [&_input]:text-center" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title="Tỷ lệ Bảo hiểm & Công đoàn (%)"
          className="border-gray-200 shadow-sm"
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="BHXH Công ty đóng"
                name="insurance_company_rate"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full [&_input]:text-center"
                  step={0.5}
                  max={100}
                  min={0}
                  suffix="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="BHXH Nhân viên đóng"
                name="insurance_employee_rate"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full [&_input]:text-center"
                  step={0.5}
                  max={100}
                  min={0}
                  suffix="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Phí công đoàn"
                name="union_fee_rate"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full [&_input]:text-center"
                  step={0.1}
                  max={100}
                  min={0}
                  suffix="%"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Khác" className="border-gray-200 shadow-sm">
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Đơn vị làm tròn"
                name="rounding_unit"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full [&_input]:text-center" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default ConfigTab;

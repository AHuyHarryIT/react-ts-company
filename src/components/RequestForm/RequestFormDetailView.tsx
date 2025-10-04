import React from 'react';
import { Card, Row, Col, Tag, Space, Typography, Descriptions } from 'antd';
import dayjs from 'dayjs';
import {
  RequestForm,
  REQUEST_FORM_TYPES,
  REQUEST_FORM_STATUSES
} from '@/types/requestFormType';
import { GiayUyQuyenDetail } from './Types/Special';
import { StandardRequestFormDetail } from './Components/StandardRequestFormDetail';

const { Title, Text } = Typography;

interface RequestFormDetailProps {
  data: RequestForm;
}

export const RequestFormDetailView: React.FC<RequestFormDetailProps> = ({
  data
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderFormContent = () => {
    // Use specific detail components for each form type
    if (data.type === 'giay_uy_quyen') {
      return <GiayUyQuyenDetail data={data} />;
    }

    // Use standard component for all other form types
    if (
      [
        'don_xin_tu_chuc',
        'don_xin_nghi_viec',
        'don_xin_nghi_phep',
        'don_xin_di_tre_ve_som'
      ].includes(data.type)
    ) {
      return <StandardRequestFormDetail data={data} />;
    }

    // Fallback for any new form types - use standard template
    return <StandardRequestFormDetail data={data} />;
  };

  return (
    <div className="mx-auto max-w-4xl bg-white">
      {/* Status and Basic Info */}
      <Card className="no-print mb-4">
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Space size="large">
              <div>
                <Text strong>Loại đơn: </Text>
                <Tag color="blue">{REQUEST_FORM_TYPES[data.type]}</Tag>
              </div>
              <div>
                <Text strong>Trạng thái: </Text>
                <Tag color={getStatusColor(data.status)}>
                  {REQUEST_FORM_STATUSES[data.status]}
                </Tag>
              </div>
              <div>
                <Text strong>Ngày nộp: </Text>
                <Text>
                  {dayjs(data.submitted_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
              {data.approved_at && (
                <div>
                  <Text strong>Ngày duyệt: </Text>
                  <Text>
                    {dayjs(data.approved_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
              )}
            </Space>
          </Col>
          {/* Rejection Reason */}
          {data.status === 'rejected' && data.rejection_reason && (
            <Col span={24}>
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2">
                  <Text strong className="text-red-700">
                    Lý do từ chối:
                  </Text>
                  <Text className="text-gray-800">{data.rejection_reason}</Text>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Form Content */}
      <div className="print-content">{renderFormContent()}</div>

      {/* Rejection Section - Only show for rejected forms */}
      {data.status === 'rejected' && data.approved_by_employee && (
        <Card className="no-print mt-4">
          <Title level={4}>Thông tin từ chối đơn</Title>
          <Descriptions column={1}>
            <Descriptions.Item label="Người từ chối">
              {data.approved_by_employee.name} ({data.approved_by_employee.id})
            </Descriptions.Item>
            {data.approved_at && (
              <Descriptions.Item label="Thời gian từ chối">
                {dayjs(data.approved_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default RequestFormDetailView;

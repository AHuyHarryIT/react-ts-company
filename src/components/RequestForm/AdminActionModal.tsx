import React, { useState } from 'react';
import {
  Modal,
  Form,
  Upload,
  Button,
  Typography,
  Card,
  Tag,
  Divider,
  message,
  Tabs,
  Input
} from 'antd';
import {
  CheckOutlined,
  UploadOutlined,
  UserOutlined,
  CrownOutlined,
  FileImageOutlined,
  InboxOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import dayjs from 'dayjs';
import SignaturePad from '@/components/common/SignaturePad';
import { RequestForm, REQUEST_FORM_TYPES } from '@/types/requestFormType';

const { Title, Text } = Typography;

export interface AdminActionModalProps {
  visible: boolean;
  onCancel: () => void;
  onApprove: (data: {
    action: 'approve';
    digital_signature_supervisor?: File;
    digital_signature_manager?: File;
  }) => void;
  onReject: (data: { action: 'reject'; reject_reason: string }) => void;
  record: RequestForm | null;
  loading?: boolean;
  mode?: 'approve' | 'reject';
}

export const AdminActionModal: React.FC<AdminActionModalProps> = ({
  visible,
  onCancel,
  onApprove,
  onReject,
  record,
  loading = false,
  mode = 'approve'
}) => {
  const [form] = Form.useForm();
  const [supervisorSignature, setSupervisorSignature] = useState<UploadFile[]>(
    []
  );
  const [managerSignature, setManagerSignature] = useState<UploadFile[]>([]);

  // Signature data from canvas
  const [supervisorSignatureData, setSupervisorSignatureData] = useState<
    string | null
  >(null);
  const [managerSignatureData, setManagerSignatureData] = useState<
    string | null
  >(null);

  // Track signature type (upload or draw)
  const [supervisorSignatureType, setSupervisorSignatureType] = useState<
    'upload' | 'draw'
  >('upload');
  const [managerSignatureType, setManagerSignatureType] = useState<
    'upload' | 'draw'
  >('upload');

  // Convert dataURL to File
  const dataURLToFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleOk = async () => {
    try {
      await form.validateFields();

      if (mode === 'reject') {
        // Handle reject
        const rejectReason = form.getFieldValue('reject_reason');
        onReject({
          action: 'reject',
          reject_reason: rejectReason
        });
      } else {
        // Handle approve
        const approvalData: {
          action: 'approve';
          digital_signature_supervisor?: File;
          digital_signature_manager?: File;
        } = { action: 'approve' };

        // Handle supervisor signature
        if (
          supervisorSignatureType === 'upload' &&
          supervisorSignature.length > 0 &&
          supervisorSignature[0].originFileObj
        ) {
          approvalData.digital_signature_supervisor =
            supervisorSignature[0].originFileObj;
        } else if (
          supervisorSignatureType === 'draw' &&
          supervisorSignatureData
        ) {
          approvalData.digital_signature_supervisor = dataURLToFile(
            supervisorSignatureData,
            'supervisor_signature.png'
          );
        }

        // Handle manager signature
        if (
          managerSignatureType === 'upload' &&
          managerSignature.length > 0 &&
          managerSignature[0].originFileObj
        ) {
          approvalData.digital_signature_manager =
            managerSignature[0].originFileObj;
        } else if (managerSignatureType === 'draw' && managerSignatureData) {
          approvalData.digital_signature_manager = dataURLToFile(
            managerSignatureData,
            'manager_signature.png'
          );
        }

        onApprove(approvalData);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSupervisorSignature([]);
    setManagerSignature([]);
    setSupervisorSignatureType('upload');
    setManagerSignatureType('upload');
    setSupervisorSignatureData(null);
    setManagerSignatureData(null);

    onCancel();
  };

  // Supervisor signature upload props
  const supervisorUploadProps: UploadProps = {
    fileList: supervisorSignature,
    beforeUpload: (file) => {
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được tải lên file hình ảnh (PNG, JPG, JPEG)!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Dung lượng file phải nhỏ hơn 5MB!');
        return false;
      }
      return false; // Prevent automatic upload
    },
    onChange: ({ fileList }) => {
      // Only keep the latest file
      setSupervisorSignature(fileList.slice(-1));
    },
    onRemove: () => {
      setSupervisorSignature([]);
    },
    accept: 'image/*',
    maxCount: 1
  };

  // Manager signature upload props
  const managerUploadProps: UploadProps = {
    fileList: managerSignature,
    beforeUpload: (file) => {
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được tải lên file hình ảnh (PNG, JPG, JPEG)!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Dung lượng file phải nhỏ hơn 5MB!');
        return false;
      }
      return false; // Prevent automatic upload
    },
    onChange: ({ fileList }) => {
      // Only keep the latest file
      setManagerSignature(fileList.slice(-1));
    },
    onRemove: () => {
      setManagerSignature([]);
    },
    accept: 'image/*',
    maxCount: 1
  };

  if (!record) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          {mode === 'reject' ? (
            <>
              <CloseOutlined className="text-red-500" />
              <span>Từ chối đơn yêu cầu</span>
            </>
          ) : (
            <>
              <CheckOutlined className="text-green-500" />
              <span>Duyệt đơn yêu cầu</span>
            </>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={mode === 'reject' ? 700 : 900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger={mode === 'reject'}
          icon={mode === 'reject' ? <CloseOutlined /> : <CheckOutlined />}
          loading={loading}
          onClick={handleOk}
        >
          {loading
            ? mode === 'reject'
              ? 'Đang từ chối...'
              : 'Đang duyệt...'
            : mode === 'reject'
              ? 'Từ chối đơn'
              : 'Duyệt đơn'}
        </Button>
      ]}
    >
      <div className="space-y-6">
        {/* Request Information */}
        <Card size="small" className="border-blue-200 bg-blue-50">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Title level={5} className="mb-0 flex-1">
                <Text strong>{record.title}</Text>
              </Title>
              <Tag color="blue" className="ml-4">
                {REQUEST_FORM_TYPES[record.type]}
              </Tag>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Text strong>Nhân viên:</Text>
                <span className="text-gray-900">{record.employee.name}</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Text strong>MSNV:</Text>
                <span className="text-gray-900">{record.employee.id}</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Text strong>Ngày nộp:</Text>
                <span className="text-gray-900">
                  {dayjs(record.submitted_at).format('DD/MM/YYYY HH:mm')}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {mode === 'reject' ? (
          <>
            <Divider orientation="left">
              <span className="font-medium text-red-600">Lý do từ chối</span>
            </Divider>

            <Form form={form} layout="vertical">
              <Form.Item
                name="reject_reason"
                label="Nhập lý do từ chối"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do từ chối' },
                  { min: 10, message: 'Lý do từ chối phải có ít nhất 10 ký tự' }
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối đơn yêu cầu này..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Form>
          </>
        ) : (
          <>
            <Divider orientation="left">
              <span className="font-medium text-blue-600">
                Chữ ký phê duyệt
              </span>
            </Divider>

            {/* Signature Upload Form */}
            <Form form={form} layout="vertical">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Supervisor Signature */}
                <Card size="small" className="border-orange-200">
                  <div className="mb-4 text-center">
                    <UserOutlined className="mb-2 text-2xl text-orange-500" />
                    <Title level={5} className="mb-0 text-orange-600">
                      Chữ ký Tổ trưởng/Giám sát
                    </Title>
                  </div>

                  <Tabs
                    activeKey={supervisorSignatureType}
                    onChange={(key) =>
                      setSupervisorSignatureType(key as 'upload' | 'draw')
                    }
                    items={[
                      {
                        key: 'upload',
                        label: (
                          <span>
                            <UploadOutlined /> Tải file
                          </span>
                        ),
                        children: (
                          <Upload.Dragger {...supervisorUploadProps}>
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                              Kéo thả file chữ ký vào đây hoặc click để chọn
                            </p>
                            <p className="ant-upload-hint">
                              Hỗ trợ: JPG, PNG, GIF, SVG (tối đa 2MB)
                            </p>
                          </Upload.Dragger>
                        )
                      },
                      {
                        key: 'draw',
                        label: (
                          <span>
                            <FileImageOutlined /> Ký online
                          </span>
                        ),
                        children: (
                          <div>
                            <Typography.Text className="mb-3 block">
                              Vẽ chữ ký Tổ trưởng/Giám sát:
                            </Typography.Text>
                            <SignaturePad
                              width={300}
                              height={150}
                              onSignatureChange={(signature) => {
                                setSupervisorSignatureData(signature);
                              }}
                            />
                          </div>
                        )
                      }
                    ]}
                  />
                </Card>

                {/* Manager Signature */}
                <Card size="small" className="border-green-200">
                  <div className="mb-4 text-center">
                    <CrownOutlined className="mb-2 text-2xl text-green-500" />
                    <Title level={5} className="mb-0 text-green-600">
                      Chữ ký Quản lý/Phê duyệt
                    </Title>
                  </div>

                  <Tabs
                    activeKey={managerSignatureType}
                    onChange={(key) =>
                      setManagerSignatureType(key as 'upload' | 'draw')
                    }
                    items={[
                      {
                        key: 'upload',
                        label: (
                          <span>
                            <UploadOutlined /> Tải file
                          </span>
                        ),
                        children: (
                          <Upload.Dragger {...managerUploadProps}>
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                              Kéo thả file chữ ký vào đây hoặc click để chọn
                            </p>
                            <p className="ant-upload-hint">
                              Hỗ trợ: JPG, PNG, GIF, SVG (tối đa 2MB)
                            </p>
                          </Upload.Dragger>
                        )
                      },
                      {
                        key: 'draw',
                        label: (
                          <span>
                            <FileImageOutlined /> Ký online
                          </span>
                        ),
                        children: (
                          <div>
                            <Typography.Text className="mb-3 block">
                              Vẽ chữ ký Quản lý/Phê duyệt:
                            </Typography.Text>
                            <SignaturePad
                              width={300}
                              height={150}
                              onSignatureChange={(signature) => {
                                setManagerSignatureData(signature);
                              }}
                            />
                          </div>
                        )
                      }
                    ]}
                  />
                </Card>
              </div>
            </Form>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AdminActionModal;

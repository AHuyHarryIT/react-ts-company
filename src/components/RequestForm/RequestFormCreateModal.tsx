import React, { useState } from 'react';
import {
  Form,
  Select,
  Button,
  message,
  Card,
  Divider,
  Upload,
  Tabs,
  Typography
} from 'antd';
import { InboxOutlined, FileImageOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import dayjs from 'dayjs';

import SignaturePad from '@components/common/SignaturePad';
import { customFormProps } from '@components/custom/FormProps.custom';
import { RequestFormFieldsRenderer } from '@/components/RequestForm/RequestFormFieldsRenderer';
import { employeeRequestFormService } from '@services/RequestFormService';
import { authStore } from '@stores/authStore';
import {
  RequestFormType,
  REQUEST_FORM_TYPES,
  CreateRequestFormDto,
  RequestForm
} from '@/types/requestFormType';

interface CreateRequestFormProps {
  onSuccess?: () => void;
  editData?: RequestForm;
}

interface FormData {
  type: RequestFormType;
  form_data: Record<string, unknown>;
}

interface DigitalSignatureData {
  file?: File;
  canvasSignature?: string;
  signatureType: 'upload' | 'draw';
}

interface MultipleSignaturesState {
  // Cho đơn ủy quyền (giay_uy_quyen) - 2 chữ ký
  digital_signature_delegator?: DigitalSignatureData;
  digital_signature_authorized?: DigitalSignatureData;

  // Cho các đơn khác - chỉ 1 chữ ký cá nhân
  digital_signature_applicant?: DigitalSignatureData;
}
export const RequestFormCreateModal: React.FC<CreateRequestFormProps> = ({
  onSuccess,
  editData
}) => {
  const [form] = Form.useForm<FormData>();
  const [selectedType, setSelectedType] = useState<RequestFormType | null>(
    null
  );
  const [signatures, setSignatures] = useState<MultipleSignaturesState>({});
  const queryClient = useQueryClient();

  // Get current user info
  const authState = useStore(authStore);
  const currentUser = authState.user;

  // Populate form data when editing
  React.useEffect(() => {
    if (editData) {
      // Parse form_data if it's string
      let parsedFormData = editData.form_data;
      if (typeof editData.form_data === 'string') {
        try {
          parsedFormData = JSON.parse(editData.form_data);
        } catch {
          // Error parsing form_data
          parsedFormData = {};
        }
      }

      // Convert date strings to dayjs objects for form fields
      const convertedFormData = { ...parsedFormData };

      // Convert date fields to dayjs objects
      const dateFields = [
        'ngay_tu_chuc',
        'ngay_thoi_viec',
        'ngay_nghi_phep',
        'ngay_nghi',
        'ngay_di_tre_ve_som',
        'gio_vao',
        'gio_ra'
      ];

      dateFields.forEach((field) => {
        if (convertedFormData[field]) {
          const dateValue = dayjs(
            convertedFormData[field] as string | number | Date
          );
          if (dateValue.isValid()) {
            convertedFormData[field] = dateValue;
          }
        }
      });

      // Set form values
      form.setFieldsValue({
        type: editData.type,
        form_data:
          (convertedFormData as Record<string, object | undefined>) || {}
      });

      // Set selected type to show form fields
      setSelectedType(editData.type);
    }
  }, [editData, form]);

  // Logic auto-fill được xử lý trong handleTypeChange để tránh trùng lặp    // Get signature fields for selected type
  const getSignatureFields = (
    type: RequestFormType | null
  ): Array<{ key: keyof MultipleSignaturesState; label: string }> => {
    if (!type) return [];

    if (type === 'giay_uy_quyen') {
      // Đơn Ủy Quyền: Cho phép 2 chữ ký
      return [
        { key: 'digital_signature_delegator', label: 'Chữ ký bên ủy quyền' },
        {
          key: 'digital_signature_authorized',
          label: 'Chữ ký bên được ủy quyền'
        }
      ];
    } else {
      // Các đơn khác: Chỉ cho phép 1 chữ ký cá nhân
      return [{ key: 'digital_signature_applicant', label: 'Chữ ký cá nhân' }];
    }
  };

  // Map gender từ enum sang Vietnamese
  const getGenderText = (gender: string | undefined) => {
    switch (gender) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Khác';
      default:
        return 'Nam';
    }
  };

  // Function to generate content from form data based on templates
  const generateContentFromFormData = (
    type: RequestFormType,
    formData: Record<string, unknown>
  ): string => {
    const userInfo = currentUser;

    switch (type) {
      case 'giay_uy_quyen': {
        const delegatorName = String(userInfo?.name || '').padEnd(25);
        const delegatorId = String(userInfo?.id || '').padEnd(15);
        const delegatorGender = getGenderText(userInfo?.gender).padEnd(10);
        const delegatorRole = userInfo?.role?.name || '';

        const authorizedName = String(
          formData.ten_nguoi_duoc_uy_quyen || ''
        ).padEnd(25);
        const authorizedId = String(
          formData.ma_nhan_vien_duoc_uy_quyen || ''
        ).padEnd(15);
        const authorizedGender = String(
          formData.gioi_tinh_nguoi_duoc_uy_quyen || ''
        ).padEnd(10);
        const authorizedRole = String(
          formData.chuc_vu_nguoi_duoc_uy_quyen || ''
        );

        return `I. BÊN ỦY QUYỀN
Họ và tên: ${delegatorName}    MSNV: ${delegatorId}    Giới tính: ${delegatorGender}    Chức vụ: ${delegatorRole}

II. BÊN ĐƯỢC ỦY QUYỀN
Họ và tên: ${authorizedName}    MSNV: ${authorizedId}    Giới tính: ${authorizedGender}    Chức vụ: ${authorizedRole}

III. NỘI DUNG ỦY QUYỀN
${formData.noi_dung_uy_quyen || '........................................................................................................................................'}`;
      }

      case 'don_xin_tu_chuc': {
        const tuChucDate = formData.ngay_tu_chuc
          ? new Date(formData.ngay_tu_chuc as string | number | Date)
          : null;
        const userName =
          userInfo?.name || '......................................';
        const userGender = getGenderText(userInfo?.gender);
        const userRole =
          userInfo?.role?.name || '..............................';
        return `Họ và tên: ${userName} Giới tính: ${userGender} Chức vụ: ${userRole}

Nay tôi làm đơn này, kính xin Ban giám đốc cho tôi được từ chức kể từ ngày ${tuChucDate ? tuChucDate.getDate() : '.......'} tháng ${tuChucDate ? tuChucDate.getMonth() + 1 : '.......'} năm ${tuChucDate ? tuChucDate.getFullYear() : '........'}

Lý do: ${formData.ly_do || '........................................................................................................................................'}

Kính trình Ban giám đốc Công ty, phòng nhân sự xem xét và giải quyết cho tôi được từ chức theo nguyện vọng trên.

Tôi xin chân thành cảm ơn!`;
      }

      case 'don_xin_nghi_viec': {
        const nghiViecDate = formData.ngay_thoi_viec
          ? new Date(formData.ngay_thoi_viec as string | number | Date)
          : null;
        const nghiViecUserName =
          userInfo?.name || '......................................';
        const nghiViecUserGender = getGenderText(userInfo?.gender);
        const nghiViecUserRole =
          userInfo?.role?.name || '..............................';
        return `Họ và tên: ${nghiViecUserName} Giới tính: ${nghiViecUserGender} Chức vụ: ${nghiViecUserRole}

Nay tôi làm đơn này, kính xin Ban giám đốc cho tôi được thôi việc kể từ ngày ${nghiViecDate ? nghiViecDate.getDate() : '.......'} tháng ${nghiViecDate ? nghiViecDate.getMonth() + 1 : '.......'} năm ${nghiViecDate ? nghiViecDate.getFullYear() : '........'}

Lý do: ${formData.ly_do || '........................................................................................................................................'}

Kính trình Ban giám đốc Công ty, phòng nhân sự xem xét và giải quyết cho tôi được nghỉ theo nguyện vọng trên.

Tôi xin chân thành cảm ơn!`;
      }

      case 'don_xin_nghi_phep': {
        const nghiPhepDate = formData.ngay_nghi
          ? new Date(formData.ngay_nghi as string | number | Date)
          : null;
        const nghiPhepDateStr = nghiPhepDate
          ? `${nghiPhepDate.getDate()}/${nghiPhepDate.getMonth() + 1}/${nghiPhepDate.getFullYear()}`
          : '................';
        const nghiPhepUserName =
          userInfo?.name || '......................................';
        const nghiPhepUserGender = getGenderText(userInfo?.gender);
        const nghiPhepUserRole =
          userInfo?.role?.name || '..............................';
        return `Họ và tên: ${nghiPhepUserName} Giới tính: ${nghiPhepUserGender} Chức vụ: ${nghiPhepUserRole}

Ngày nghỉ: ${nghiPhepDateStr}

Lý do: ${formData.ly_do || '........................................................................................................................................'}

Kính trình Ban giám đốc Công ty, phòng nhân sự xem xét và giải quyết cho tôi được nghỉ theo nguyện vọng trên.

Tôi xin đảm bảo về làm lại bình thường sau ngày nghỉ phép đã ghi trong đơn.

Tôi xin chân thành cảm ơn!`;
      }

      case 'don_xin_di_tre_ve_som': {
        const diTreVeSomDate = formData.ngay_di_tre_ve_som
          ? new Date(formData.ngay_di_tre_ve_som as string | number | Date)
          : null;
        const diTreVeSomDateStr = diTreVeSomDate
          ? `${diTreVeSomDate.getDate()}/${diTreVeSomDate.getMonth() + 1}/${diTreVeSomDate.getFullYear()}`
          : '................';
        const gioVaoTime = formData.gio_vao
          ? new Date(formData.gio_vao as string | number | Date)
          : null;
        const gioVaoStr = gioVaoTime
          ? `${gioVaoTime.getHours().toString().padStart(2, '0')}:${gioVaoTime.getMinutes().toString().padStart(2, '0')}`
          : '.....................';
        const gioRaTime = formData.gio_ra
          ? new Date(formData.gio_ra as string | number | Date)
          : null;
        const gioRaStr = gioRaTime
          ? `${gioRaTime.getHours().toString().padStart(2, '0')}:${gioRaTime.getMinutes().toString().padStart(2, '0')}`
          : '..................';
        const diTreVeSomUserName =
          userInfo?.name || '......................................';
        const diTreVeSomUserGender = getGenderText(userInfo?.gender);
        const diTreVeSomUserRole =
          userInfo?.role?.name || '..............................';
        return `Họ và tên: ${diTreVeSomUserName} Giới tính: ${diTreVeSomUserGender} Chức vụ: ${diTreVeSomUserRole}

Ngày đi trễ-về sớm: ${diTreVeSomDateStr}                    Giờ vào: ${gioVaoStr}                    Giờ ra: ${gioRaStr}

Lý do: ${formData.ly_do || '........................................................................................................................................'}

Kính trình Ban giám đốc Công ty, phòng nhân sự xem xét và giải quyết cho tôi vào trễ và về sớm theo nguyện vọng trên.

Tôi xin đảm bảo vào làm lại bình thường sau giờ xin phép đã ghi trong đơn.

Tôi xin chân thành cảm ơn!`;
      }

      default:
        return `${REQUEST_FORM_TYPES[type]} - ${Object.entries(formData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`;
    }
  };

  const { mutate: createRequest, isPending } = useMutation({
    mutationFn: (
      data: CreateRequestFormDto | { id: number; data: CreateRequestFormDto }
    ) => {
      if (editData && 'id' in data) {
        // Update existing request
        return employeeRequestFormService.update(data.id, data.data);
      } else {
        // Create new request
        return employeeRequestFormService.create(data as CreateRequestFormDto);
      }
    },
    onSuccess: () => {
      message.success(
        editData
          ? 'Đơn yêu cầu đã được cập nhật thành công!'
          : 'Đơn yêu cầu đã được tạo thành công!'
      );
      form.resetFields();
      setSelectedType(null);
      setSignatures({});
      // Invalidate all request form related queries
      queryClient.invalidateQueries({ queryKey: ['employee-request-forms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-request-forms'] });
      queryClient.invalidateQueries({ queryKey: ['request-forms'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-request-forms-statistics']
      });
      onSuccess?.();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(
        error?.response?.data?.message ||
          (editData
            ? 'Có lỗi xảy ra khi cập nhật đơn yêu cầu'
            : 'Có lỗi xảy ra khi tạo đơn yêu cầu')
      );
    }
  });

  const handleTypeChange = (type: RequestFormType) => {
    setSelectedType(type);

    // Auto-fill thông tin người ủy quyền cho form Giấy Ủy Quyền
    // Thông tin người ủy quyền (bên A) sẽ được tự động điền từ user hiện tại
    // Người dùng chỉ cần nhập thông tin người được ủy quyền (bên B)
    const getAutoFillData = () => {
      if (type === 'giay_uy_quyen' && currentUser) {
        return {
          // Thông tin người ủy quyền (bên A) - auto fill từ user hiện tại
          ten_nguoi_uy_quyen: currentUser.name,
          ma_nhan_vien_uy_quyen: currentUser.id,
          gioi_tinh_nguoi_uy_quyen:
            currentUser.gender === 'male'
              ? 'Nam'
              : currentUser.gender === 'female'
                ? 'Nữ'
                : 'Khác',
          chuc_vu_nguoi_uy_quyen: currentUser.role?.name || '',
          // Thông tin người được ủy quyền (bên B) - để trống cho user nhập
          ten_nguoi_duoc_uy_quyen: '',
          ma_nhan_vien_duoc_uy_quyen: '',
          gioi_tinh_nguoi_duoc_uy_quyen: '',
          chuc_vu_nguoi_duoc_uy_quyen: '',
          noi_dung_uy_quyen: ''
        };
      }
      return {};
    };

    // Reset form khi thay đổi loại đơn (chỉ khi không edit)
    if (!editData) {
      form.setFieldsValue({
        type,
        form_data: getAutoFillData()
      });
    } else {
      const existingFormData = form.getFieldValue('form_data') || {};
      const autoFillData = getAutoFillData();
      form.setFieldsValue({
        type,
        form_data: { ...existingFormData, ...autoFillData }
      });
    }
  };

  const handleSubmit = (values: FormData) => {
    // Tự động lấy title từ loại đơn
    const autoTitle = REQUEST_FORM_TYPES[values.type];

    // Tự động generate content từ form_data
    const autoContent = generateContentFromFormData(
      values.type,
      values.form_data
    );

    // Tạo FormData để hỗ trợ multipart/form-data với digital signature
    const formData = new FormData();
    formData.append('type', values.type);
    formData.append('title', autoTitle);
    formData.append('content', autoContent);
    formData.append('form_data', JSON.stringify(values.form_data));

    // Thêm digital signatures theo loại đơn
    const signatureFields = getSignatureFields(values.type);
    signatureFields.forEach((field) => {
      const signature = signatures[field.key];
      if (signature) {
        if (signature.signatureType === 'upload' && signature.file) {
          formData.append(field.key, signature.file);
        } else if (
          signature.signatureType === 'draw' &&
          signature.canvasSignature
        ) {
          // Convert canvas signature to File
          const byteString = atob(signature.canvasSignature.split(',')[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);

          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([arrayBuffer], { type: 'image/png' });
          const file = new File([blob], `signature_${Date.now()}.png`, {
            type: 'image/png'
          });
          formData.append(field.key, file);
        }
      }
    });

    if (editData) {
      // Update existing request
      createRequest({
        id: editData.id,
        data: formData as unknown as CreateRequestFormDto
      });
    } else {
      // Create new request
      createRequest(formData as unknown as CreateRequestFormDto);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">
          {editData ? 'SỬA ĐƠN YÊU CẦU' : 'TẠO ĐƠN YÊU CẦU MỚI'}
        </h2>
      </div>

      <Form
        {...customFormProps}
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <Form.Item
            label="Loại đơn yêu cầu"
            name="type"
            rules={[
              { required: true, message: 'Vui lòng chọn loại đơn yêu cầu' }
            ]}
            className="mb-0"
          >
            <Select
              placeholder="Chọn loại đơn yêu cầu"
              onChange={handleTypeChange}
              disabled={!!editData}
              size="large"
              options={Object.entries(REQUEST_FORM_TYPES).map(
                ([key, value]) => ({
                  label: value,
                  value: key
                })
              )}
            />
          </Form.Item>
        </div>

        {/* Hiển thị thông tin nhân viên tự động điền */}
        {currentUser && (
          <Card
            size="small"
            className="mb-4"
            title={
              selectedType === 'giay_uy_quyen'
                ? 'Thông tin bên ủy quyền'
                : 'Thông tin nhân viên'
            }
          >
            <div className="flex justify-between text-sm">
              <div className="flex-[2] text-center">
                <strong>Họ và Tên:</strong> {currentUser.name}
              </div>
              <div className="flex-1 text-center">
                <strong>MSNV:</strong> {currentUser.id}
              </div>
              <div className="flex-1 text-center">
                <strong>Giới tính:</strong> {getGenderText(currentUser.gender)}
              </div>
              <div className="flex-1 text-center">
                <strong>Chức vụ:</strong> {currentUser.role?.name || 'Chưa có'}
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-blue-600 italic">
              💡 Thông tin này sẽ được tự động điền vào đơn yêu cầu. Bạn chỉ cần
              điền thêm thông tin chi tiết ở phần bên dưới.
            </p>
          </Card>
        )}

        {selectedType && (
          <>
            <Divider orientation="left">Chi tiết đơn yêu cầu</Divider>
            <RequestFormFieldsRenderer formType={selectedType} />
          </>
        )}

        {/* Digital Signature Section */}
        {selectedType && (
          <>
            <Divider orientation="left">
              <span className="font-medium text-blue-600">Chữ ký điện tử</span>
            </Divider>

            <div
              className={`grid gap-6 ${selectedType === 'giay_uy_quyen' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
            >
              {getSignatureFields(selectedType).map((field) => (
                <Card
                  key={field.key}
                  size="small"
                  className="border-blue-200"
                  title={field.label}
                >
                  <Tabs
                    defaultActiveKey="upload"
                    centered
                    onChange={(key) => {
                      setSignatures((prev) => ({
                        ...prev,
                        [field.key]: {
                          signatureType: key as 'upload' | 'draw',
                          file: undefined,
                          canvasSignature: undefined
                        }
                      }));
                    }}
                    items={[
                      {
                        key: 'upload',
                        label: (
                          <span>
                            <FileImageOutlined />
                            Upload File
                          </span>
                        ),
                        children: (
                          <div>
                            <Upload.Dragger
                              name={field.key}
                              multiple={false}
                              accept=".jpg,.jpeg,.png,.gif,.svg"
                              beforeUpload={(file) => {
                                // Validate file size (2MB = 2 * 1024 * 1024 bytes)
                                const isLt2M = file.size / 1024 / 1024 < 2;
                                if (!isLt2M) {
                                  message.error(
                                    'Kích thước file phải nhỏ hơn 2MB!'
                                  );
                                  return false;
                                }

                                // Validate file type
                                const allowedTypes = [
                                  'image/jpeg',
                                  'image/jpg',
                                  'image/png',
                                  'image/gif',
                                  'image/svg+xml'
                                ];
                                if (!allowedTypes.includes(file.type)) {
                                  message.error(
                                    'Chỉ chấp nhận file JPG, PNG, GIF, SVG!'
                                  );
                                  return false;
                                }

                                setSignatures((prev) => ({
                                  ...prev,
                                  [field.key]: {
                                    signatureType: 'upload',
                                    file: file,
                                    canvasSignature: undefined
                                  }
                                }));

                                message.success(
                                  `${file.name} đã được chọn thành công cho ${field.label}`
                                );
                                return false; // Prevent auto upload
                              }}
                              onRemove={() => {
                                setSignatures((prev) => ({
                                  ...prev,
                                  [field.key]: {
                                    ...prev[field.key],
                                    file: undefined
                                  }
                                }));
                              }}
                              fileList={
                                signatures[field.key]?.file
                                  ? [
                                      {
                                        uid: '1',
                                        name: signatures[field.key]!.file!.name,
                                        status: 'done' as const,
                                        url: URL.createObjectURL(
                                          signatures[field.key]!.file!
                                        )
                                      }
                                    ]
                                  : []
                              }
                            >
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
                          </div>
                        )
                      },
                      {
                        key: 'draw',
                        label: (
                          <span>
                            <FileImageOutlined />
                            Ký Online
                          </span>
                        ),
                        children: (
                          <div className="signature-pad-container flex flex-col items-center">
                            <Typography.Text className="mb-3 block text-center">
                              Vẽ chữ ký của bạn trong khung bên dưới:
                            </Typography.Text>
                            <div className="flex w-full max-w-full justify-center overflow-hidden rounded-lg border border-gray-300 bg-white p-3">
                              <SignaturePad
                                width={
                                  selectedType === 'giay_uy_quyen' ? 280 : 420
                                }
                                height={
                                  selectedType === 'giay_uy_quyen' ? 150 : 200
                                }
                                onSignatureChange={(signature) => {
                                  setSignatures((prev) => ({
                                    ...prev,
                                    [field.key]: {
                                      signatureType: 'draw',
                                      canvasSignature: signature || undefined,
                                      file: undefined
                                    }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        )
                      }
                    ]}
                  />
                </Card>
              ))}
            </div>
          </>
        )}

        <Form.Item className="mt-6 mb-0">
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                form.resetFields();
                setSelectedType(null);
                setSignatures({});
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              disabled={!selectedType}
            >
              {editData ? 'Cập nhật đơn' : 'Tạo đơn'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RequestFormCreateModal;

import React from 'react';
import { Card, Row, Col, Tag, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { STORAGE_URL } from '@/configs/environment.config';
import {
  RequestForm,
  REQUEST_FORM_TYPES,
  REQUEST_FORM_STATUSES
} from '@/types/requestFormType';
import { useAuthorizedEmployee } from '@/hooks/useAuthorizedEmployee';

const { Title, Text } = Typography;

interface RequestFormDetailProps {
  data: RequestForm;
}

const AuthorizationDetailView: React.FC<{ data: RequestForm }> = ({ data }) => {
  const parsedFormData = React.useMemo(() => {
    if (data.form_data) {
      if (typeof data.form_data === 'object') return data.form_data;
      if (typeof data.form_data === 'string') {
        try {
          return JSON.parse(data.form_data);
        } catch {
          return {};
        }
      }
    }
    return {};
  }, [data.form_data]);

  // Fetch thông tin đầy đủ của người được ủy quyền, với placeholder data từ backend response
  const { data: authorizedEmployee, isLoading: isLoadingAuthorized } =
    useAuthorizedEmployee(
      parsedFormData?.authorized_employee_id as string,
      // Placeholder data để hiển thị ngay (nếu backend đã trả về)
      parsedFormData?.authorized_employee_id
        ? {
            id: parsedFormData.authorized_employee_id as string,
            name: '', // Sẽ được fetch từ API
            employee_code: parsedFormData.authorized_employee_id as string
          }
        : undefined
    );

  // Fetch thông tin đầy đủ của người tạo đơn
  // Backend data.employee KHÔNG có role_name, phải fetch từ API
  const { data: delegatorEmployee, isLoading: isLoadingDelegator } =
    useAuthorizedEmployee(
      data.employee.id?.toString(),
      // Placeholder data để hiển thị name ngay (optimistic UI)
      {
        id: data.employee.id?.toString(),
        name: data.employee.name,
        employee_code: data.employee.id?.toString(),
        gender: (data.employee as Record<string, unknown>)?.gender as
          | string
          | undefined
        // KHÔNG set role_name ở đây - cần fetch từ API
      },
      false // Không skip fetch - cần lấy role_name từ API
    );

  const getGenderText = (gender: string | undefined) => {
    if (!gender) return '';
    switch (gender.toLowerCase()) {
      case 'male':
      case 'nam':
        return 'Nam';
      case 'female':
      case 'nữ':
      case 'nu':
        return 'Nữ';
      case 'other':
      case 'khác':
      case 'khac':
        return 'Khác';
      default:
        return gender;
    }
  };

  // Thông tin người ủy quyền - ưu tiên dữ liệu có sẵn từ data.employee, sau đó mới fetch thêm
  const delegatorName = data.employee.name || delegatorEmployee?.name || '';
  const delegatorMSNV = data.employee.id || delegatorEmployee?.id || '';
  const delegatorGender =
    getGenderText(
      (data.employee as Record<string, unknown>)?.gender as string | undefined
    ) || getGenderText(delegatorEmployee?.gender);
  // role_name phải lấy từ API fetch, hiển thị loading nếu đang fetch
  const delegatorPosition =
    delegatorEmployee?.role_name || (isLoadingDelegator ? '...' : '');

  // Thông tin người được ủy quyền - hiển thị ngay nếu có, sau đó update khi fetch xong
  const authorizedName =
    authorizedEmployee?.name || (isLoadingAuthorized ? '...' : '');
  const authorizedMSNV =
    authorizedEmployee?.id || parsedFormData?.authorized_employee_id || '';
  const authorizedGender = getGenderText(authorizedEmployee?.gender);
  const authorizedPosition =
    authorizedEmployee?.role_name || (isLoadingAuthorized ? '...' : '');

  const authorizationScope = parsedFormData?.authorization_scope || '';

  return (
    <div className="bg-white p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8">
        <div className="flex-1 text-left">
          <div className="mb-1">
            <Text strong style={{ fontSize: '12px', fontWeight: 'bold' }}>
              CÔNG TY TNHH MTV VINH VINH PHÁT
            </Text>
          </div>
          <div className="mb-1">
            <Text style={{ fontSize: '11px' }}>
              Địa chỉ: 359 Đường Ấp Chiến Lược, Khu phố 2,
            </Text>
          </div>
          <div>
            <Text style={{ fontSize: '11px' }}>
              Phường Bình Hưng Hoà, TP.Hồ Chí Minh.
            </Text>
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="mb-1">
            <Text strong style={{ fontSize: '12px', fontWeight: 'bold' }}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </Text>
          </div>
          <div>
            <Text
              strong
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Độc lập - Tự do - Hạnh phúc
            </Text>
          </div>
        </div>
      </div>

      <div className="mb-3 text-center">
        <Title
          level={2}
          className="mb-2"
          style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          GIẤY ỦY QUYỀN
        </Title>
        <div className="mb-2 text-left">
          <Text strong className="text-xs sm:text-sm">
            Kính gửi: - Ban giám đốc Công Ty TNHH MTV VINH VINH PHÁT
          </Text>
          <br />
          <Text
            strong
            className="text-xs sm:text-sm"
            style={{ marginLeft: '61px' }}
          >
            - Phòng nhân sự
          </Text>
        </div>
      </div>

      <div className="mb-3" style={{ lineHeight: '1.4' }}>
        <div className="mb-2">
          <Text strong>I. BÊN ỦY QUYỀN</Text>
          <div className="mt-1 hidden gap-4 md:flex">
            <div className="min-w-0 flex-[2]">
              <Text className="whitespace-nowrap">
                <strong>Họ và tên:</strong> {delegatorName}
              </Text>
            </div>
            <div className="min-w-0 flex-[0.8]">
              <Text className="whitespace-nowrap">
                <strong>MSNV:</strong> {delegatorMSNV}
              </Text>
            </div>
            <div className="min-w-0 flex-[0.7]">
              <Text className="whitespace-nowrap">
                <strong>Giới tính:</strong> {delegatorGender}
              </Text>
            </div>
            <div className="min-w-0 flex-[1.2]">
              <Text className="whitespace-nowrap">
                <strong>Chức vụ:</strong> {delegatorPosition}
              </Text>
            </div>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2 md:hidden">
            <div className="col-span-2">
              <Text className="text-xs sm:text-sm">
                <strong>Họ và tên:</strong> {delegatorName}
              </Text>
            </div>
            <div>
              <Text className="text-xs sm:text-sm">
                <strong>MSNV:</strong> {delegatorMSNV}
              </Text>
            </div>
            <div>
              <Text className="text-xs sm:text-sm">
                <strong>Giới tính:</strong> {delegatorGender}
              </Text>
            </div>
            <div className="col-span-2">
              <Text className="text-xs sm:text-sm">
                <strong>Chức vụ:</strong> {delegatorPosition}
              </Text>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <Text strong>II. BÊN ĐƯỢC ỦY QUYỀN</Text>
          <div className="mt-1 hidden gap-4 md:flex">
            <div className="min-w-0 flex-[2]">
              <Text className="whitespace-nowrap">
                <strong>Họ và tên:</strong> {authorizedName}
              </Text>
            </div>
            <div className="min-w-0 flex-[0.8]">
              <Text className="whitespace-nowrap">
                <strong>MSNV:</strong> {authorizedMSNV}
              </Text>
            </div>
            <div className="min-w-0 flex-[0.7]">
              <Text className="whitespace-nowrap">
                <strong>Giới tính:</strong> {authorizedGender}
              </Text>
            </div>
            <div className="min-w-0 flex-[1.2]">
              <Text className="whitespace-nowrap">
                <strong>Chức vụ:</strong> {authorizedPosition}
              </Text>
            </div>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2 md:hidden">
            <div className="col-span-2">
              <Text className="text-xs sm:text-sm">
                <strong>Họ và tên:</strong> {authorizedName}
              </Text>
            </div>
            <div>
              <Text className="text-xs sm:text-sm">
                <strong>MSNV:</strong> {authorizedMSNV}
              </Text>
            </div>
            <div>
              <Text className="text-xs sm:text-sm">
                <strong>Giới tính:</strong> {authorizedGender}
              </Text>
            </div>
            <div className="col-span-2">
              <Text className="text-xs sm:text-sm">
                <strong>Chức vụ:</strong> {authorizedPosition}
              </Text>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <Text strong>III. NỘI DUNG ỦY QUYỀN</Text>
          <div className="mt-1">
            <Text>{authorizationScope}</Text>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-3 text-right">
          <Text strong>
            TP.Hồ Chí Minh, ngày {dayjs(data.created_at).format('DD')} tháng{' '}
            {dayjs(data.created_at).format('MM')} năm{' '}
            {dayjs(data.created_at).format('YYYY')}
          </Text>
        </div>

        {/* Mobile & Desktop Layout - 2 columns centered with proper spacing */}
        <div className="flex items-start justify-center gap-8 sm:gap-64">
          <div className="w-full max-w-[150px] text-center sm:max-w-[200px]">
            <div className="mb-2 sm:mb-2">
              <Text strong className="text-xs sm:text-base">
                Bên được ủy quyền
              </Text>
            </div>
            <div className="mb-2 flex h-[80px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2 sm:h-[100px]">
              {data.digital_signature_authorized ? (
                <img
                  src={`${STORAGE_URL}/${data.digital_signature_authorized}`}
                  alt="Chữ ký bên được ủy quyền"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML =
                      '<span class="text-gray-400 text-xs sm:text-sm">[Lỗi]</span>';
                  }}
                />
              ) : (
                <Text className="text-xs text-gray-400 sm:text-sm">
                  [Vùng chữ ký]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-2">
              <Text className="text-xs font-medium sm:text-base">
                {authorizedName}
              </Text>
            </div>
          </div>

          <div className="w-full max-w-[150px] text-center sm:max-w-[200px]">
            <div className="mb-2 sm:mb-2">
              <Text strong className="text-xs sm:text-base">
                Bên ủy quyền
              </Text>
            </div>
            <div className="mb-2 flex h-[80px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2 sm:h-[100px]">
              {data.digital_signature_delegator ? (
                <img
                  src={`${STORAGE_URL}/${data.digital_signature_delegator}`}
                  alt="Chữ ký bên ủy quyền"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML =
                      '<span class="text-gray-400 text-xs sm:text-sm">[Lỗi]</span>';
                  }}
                />
              ) : (
                <Text className="text-xs text-gray-400 sm:text-sm">
                  [Vùng chữ ký]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-2">
              <Text className="text-xs font-medium sm:text-base">
                {data.employee.name}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StandardDetailView: React.FC<{ data: RequestForm }> = ({ data }) => {
  // Check if employee is the same as supervisor (supervisor creates their own request)
  const isEmployeeSupervisor = React.useMemo(() => {
    if (!data.supervisor_id || !data.employee_id) return false;
    return data.supervisor_id.toString() === data.employee_id.toString();
  }, [data.supervisor_id, data.employee_id]);

  const parsedFormData = React.useMemo(() => {
    if (data.form_data) {
      if (typeof data.form_data === 'object') return data.form_data;
      if (typeof data.form_data === 'string') {
        try {
          return JSON.parse(data.form_data);
        } catch {
          return {};
        }
      }
    }
    return {};
  }, [data.form_data]);

  // Extract supervisor name from content
  const supervisorName = React.useMemo(() => {
    if (!data.content || typeof data.content !== 'string') {
      return null;
    }

    // Tìm pattern: [Vùng chữ ký điện tử]     SUPERVISOR_NAME     [Quản lý nhà máy cần ký tại đây]
    const signatureLineMatch = data.content.match(
      /\[Vùng chữ ký điện tử\]\s+(.+?)\s+(?:\[Quản lý nhà máy|Quản lý)/
    );

    if (signatureLineMatch && signatureLineMatch[1]) {
      const name = signatureLineMatch[1].trim();
      if (name.length > 3 && name.length < 50 && !name.includes('[')) {
        return name;
      }
    }

    return null;
  }, [data.content]);

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

  const renderFormattedContent = (content: string) => {
    // Validate content trước khi split
    if (!content || typeof content !== 'string') {
      console.warn('⚠️ Content is missing or invalid:', content);
      return (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="font-medium text-yellow-700">
            ⚠️ Nội dung đơn chưa được tạo
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Vui lòng liên hệ quản trị viên để cập nhật
          </p>
        </div>
      );
    }

    const lines = content.split('\n');
    const processedElements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const cleanLine = line.replace(/\r/g, '').trim();

      // Skip signature section (từ "TP.Hồ Chí Minh, ngày..." đến cuối)
      if (
        cleanLine.includes('TP.') &&
        cleanLine.includes('Hồ Chí Minh') &&
        cleanLine.includes('ngày')
      ) {
        // Skip tất cả dòng còn lại (phần ngày tháng + chữ ký)
        break;
      }

      const isPersonalInfoLine =
        (cleanLine.includes('Họ và tên:') || cleanLine.includes('Tôi tên:')) &&
        cleanLine.includes('Giới tính:') &&
        cleanLine.includes('Chức vụ:');

      if (isPersonalInfoLine) {
        const nameMatch = cleanLine.match(
          /(?:Họ và tên|Tôi tên):\s*([^G]*?)(?=\s{2,}Giới tính:|$)/
        );
        const genderMatch = cleanLine.match(
          /Giới tính:\s*([^C]*?)(?=\s{2,}Chức vụ:|$)/
        );
        const positionMatch = cleanLine.match(/Chức vụ:\s*(.*)$/);

        const name = nameMatch?.[1]?.trim() || data?.employee?.name || '';
        const gender =
          genderMatch?.[1]?.trim() ||
          getGenderText((data?.employee as { gender?: string })?.gender) ||
          '';
        const position = positionMatch?.[1]?.trim() || '';
        const msnv = data?.employee?.id || '';

        processedElements.push(
          <React.Fragment key={i}>
            <div className="mb-2 hidden gap-4 md:flex">
              <div className="min-w-0 flex-[2]">
                <Text className="whitespace-nowrap">
                  <strong>Họ và Tên:</strong>{' '}
                  <span className="ml-2">{name}</span>
                </Text>
              </div>
              <div className="min-w-0 flex-[0.8]">
                <Text className="whitespace-nowrap">
                  <strong>MSNV:</strong> <span className="ml-2">{msnv}</span>
                </Text>
              </div>
              <div className="min-w-0 flex-[0.7]">
                <Text className="whitespace-nowrap">
                  <strong>Giới tính:</strong>{' '}
                  <span className="ml-2">{gender}</span>
                </Text>
              </div>
              <div className="min-w-0 flex-[1.2]">
                <Text className="whitespace-nowrap">
                  <strong>Chức vụ:</strong>{' '}
                  <span className="ml-2">{position}</span>
                </Text>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2 md:hidden">
              <div className="col-span-2">
                <Text className="text-xs sm:text-sm">
                  <strong>Họ và Tên:</strong>{' '}
                  <span className="ml-2">{name}</span>
                </Text>
              </div>
              <div>
                <Text className="text-xs sm:text-sm">
                  <strong>MSNV:</strong> <span className="ml-2">{msnv}</span>
                </Text>
              </div>
              <div>
                <Text className="text-xs sm:text-sm">
                  <strong>Giới tính:</strong>{' '}
                  <span className="ml-2">{gender}</span>
                </Text>
              </div>
              <div className="col-span-2">
                <Text className="text-xs sm:text-sm">
                  <strong>Chức vụ:</strong>{' '}
                  <span className="ml-2">{position}</span>
                </Text>
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        if (cleanLine !== '') {
          const reasonPatternMatch = cleanLine.match(
            /(.*?)Lý do:\s*\.{10,}(.*)/i
          );

          if (reasonPatternMatch) {
            const beforeReason = reasonPatternMatch[1];
            const afterReason = reasonPatternMatch[2];

            let reason = '';
            if (parsedFormData?.ly_do_tu_chuc)
              reason = parsedFormData.ly_do_tu_chuc;
            else if (parsedFormData?.ly_do_nghi_viec)
              reason = parsedFormData.ly_do_nghi_viec;
            else if (parsedFormData?.ly_do_nghi_phep)
              reason = parsedFormData.ly_do_nghi_phep;
            else if (parsedFormData?.ly_do_di_tre_ve_som)
              reason = parsedFormData.ly_do_di_tre_ve_som;
            else if (parsedFormData?.ly_do) reason = parsedFormData.ly_do;

            processedElements.push(
              <div key={i} className="mb-0.5">
                <Text>
                  {beforeReason}Lý do:{' '}
                  {reason ||
                    '........................................................................................................................................'}
                  {afterReason}
                </Text>
              </div>
            );
          } else {
            const datePhepPatternMatch = cleanLine.match(
              /(.*?)Ngày nghỉ:\s*([^]*)/i
            );

            if (datePhepPatternMatch) {
              const beforeDate = datePhepPatternMatch[1];
              let dateText = '................';
              let dateValue = null;

              if (parsedFormData?.ngay_nghi_phep)
                dateValue = new Date(parsedFormData.ngay_nghi_phep);
              else if (parsedFormData?.ngay_nghi)
                dateValue = new Date(parsedFormData.ngay_nghi);

              if (dateValue && !isNaN(dateValue.getTime())) {
                dateText = `${dateValue.getDate()}/${dateValue.getMonth() + 1}/${dateValue.getFullYear()}`;
              }

              processedElements.push(
                <div key={i} className="mb-0.5">
                  <Text>
                    {beforeDate}Ngày nghỉ: <strong>{dateText}</strong>
                  </Text>
                </div>
              );
            } else {
              const diTreVeSomPatternMatch =
                cleanLine.match(/Ngày đi trễ-về sớm:/i);

              if (diTreVeSomPatternMatch) {
                let dateText = '................';
                let timeInText = '.....................';
                let timeOutText = '..................';

                // Check ngay_ap_dung (new field name)
                if (parsedFormData?.ngay_ap_dung) {
                  const dateValue = new Date(parsedFormData.ngay_ap_dung);
                  if (!isNaN(dateValue.getTime())) {
                    dateText = `${dateValue.getDate()} tháng ${dateValue.getMonth() + 1} năm ${dateValue.getFullYear()}`;
                  }
                }

                // Check gio_vao_tre (new field name)
                if (parsedFormData?.gio_vao_tre) {
                  const timeInValue = new Date(parsedFormData.gio_vao_tre);
                  if (!isNaN(timeInValue.getTime())) {
                    timeInText = `${timeInValue.getHours().toString().padStart(2, '0')}:${timeInValue.getMinutes().toString().padStart(2, '0')}`;
                  }
                }

                // Check gio_ve_som (new field name)
                if (parsedFormData?.gio_ve_som) {
                  const timeOutValue = new Date(parsedFormData.gio_ve_som);
                  if (!isNaN(timeOutValue.getTime())) {
                    timeOutText = `${timeOutValue.getHours().toString().padStart(2, '0')}:${timeOutValue.getMinutes().toString().padStart(2, '0')}`;
                  }
                }

                processedElements.push(
                  <div key={i} className="mb-1">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-left">
                        <Text>
                          Ngày đi trễ-về sớm: <strong>{dateText}</strong>
                        </Text>
                      </div>
                      <div className="text-center">
                        <Text>
                          Giờ vào: <strong>{timeInText}</strong>
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text>
                          Giờ ra: <strong>{timeOutText}</strong>
                        </Text>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const datePatternMatch = cleanLine.match(
                  /(.*?)(kể từ ngày\s+(?:\.{3,}|\d+)\s*tháng\s+(?:\.{3,}|\d+)\s*năm\s+(?:\.{3,}|\d+))(.*)/i
                );

                if (datePatternMatch) {
                  const beforeDate = datePatternMatch[1];
                  const afterDate = datePatternMatch[3];

                  let dateText =
                    'kể từ ngày ....... tháng ....... năm ........';
                  let dateValue = null;

                  if (parsedFormData?.ngay_tu_chuc)
                    dateValue = new Date(parsedFormData.ngay_tu_chuc);
                  else if (parsedFormData?.ngay_nghi_viec)
                    dateValue = new Date(parsedFormData.ngay_nghi_viec);
                  else if (parsedFormData?.ngay_nghi_phep)
                    dateValue = new Date(parsedFormData.ngay_nghi_phep);
                  else if (parsedFormData?.ngay_di_tre_ve_som)
                    dateValue = new Date(parsedFormData.ngay_di_tre_ve_som);
                  else if (parsedFormData?.ngay_thoi_viec)
                    dateValue = new Date(parsedFormData.ngay_thoi_viec);
                  else if (parsedFormData?.ngay_nghi)
                    dateValue = new Date(parsedFormData.ngay_nghi);

                  if (dateValue && !isNaN(dateValue.getTime())) {
                    dateText = `kể từ ngày ${dateValue.getDate()} tháng ${dateValue.getMonth() + 1} năm ${dateValue.getFullYear()}`;
                  }

                  processedElements.push(
                    <div key={i} className="mb-0.5">
                      <Text>
                        {beforeDate}
                        <strong>{dateText}</strong>
                        {afterDate}
                      </Text>
                    </div>
                  );
                } else {
                  processedElements.push(
                    <div key={i} className="mb-0.5">
                      <Text>{cleanLine}</Text>
                    </div>
                  );
                }
              }
            }
          }
        }
      }
      i++;
    }
    return processedElements;
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="text-left">
          <div className="mb-1">
            <Text strong style={{ fontSize: '14px', fontWeight: 'bold' }}>
              CÔNG TY TNHH MTV VINH VINH PHÁT
            </Text>
          </div>
          <div className="mb-1">
            <Text style={{ fontSize: '12px' }}>
              Địa chỉ: 359 Đường Ấp Chiến Lược, Khu phố 2,
            </Text>
          </div>
          <div>
            <Text style={{ fontSize: '12px' }}>
              Phường Bình Hưng Hoà, TP.Hồ Chí Minh.
            </Text>
          </div>
        </div>
        <div className="text-center">
          <div className="mb-1">
            <Text strong style={{ fontSize: '14px', fontWeight: 'bold' }}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </Text>
          </div>
          <div>
            <Text
              strong
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Độc lập - Tự do - Hạnh phúc
            </Text>
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <Title
          level={2}
          className="mb-2"
          style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          {REQUEST_FORM_TYPES[data.type]}
        </Title>
        <div className="mb-4 text-left">
          <div>
            <Text strong>
              Kính gửi: - Ban giám đốc Công Ty TNHH MTV VINH VINH PHÁT
            </Text>
          </div>
          <div style={{ paddingLeft: '61px' }}>
            <Text strong>- Phòng nhân sự</Text>
          </div>
        </div>
      </div>

      <div className="mb-4" style={{ lineHeight: '1.4' }}>
        {renderFormattedContent(data.content)}
      </div>

      <div className="mt-8">
        <div className="mb-6 text-right">
          <Text strong>
            TP.Hồ Chí Minh, ngày {dayjs(data.created_at).format('DD')} tháng{' '}
            {dayjs(data.created_at).format('MM')} năm{' '}
            {dayjs(data.created_at).format('YYYY')}
          </Text>
        </div>

        {/* Mobile & Desktop Layout - Conditional columns based on supervisor */}
        <div
          className={`grid gap-2 sm:gap-8 ${isEmployeeSupervisor ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          <div className="text-center">
            <div className="mb-2 sm:mb-3">
              <Text strong className="text-xs sm:text-base">
                {isEmployeeSupervisor ? 'Tổ trưởng làm đơn' : 'Người làm đơn'}
              </Text>
            </div>
            <div className="mb-2 flex h-[60px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-1 sm:mb-4 sm:h-[100px] sm:p-2">
              {data.digital_signature_applicant ? (
                <img
                  src={`${STORAGE_URL}/${data.digital_signature_applicant}`}
                  alt="Chữ ký người làm đơn"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML =
                      '<span class="text-gray-400 text-xs">[Lỗi]</span>';
                  }}
                />
              ) : (
                <Text className="text-xs text-gray-400 sm:text-sm">
                  [Vùng chữ ký]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-1 sm:pt-2">
              <Text className="text-xs font-medium sm:text-base">
                {data.employee.name}
              </Text>
            </div>
          </div>

          {/* Only show supervisor column if employee is not supervisor */}
          {!isEmployeeSupervisor && (
            <div className="text-center">
              <div className="mb-2 sm:mb-3">
                <Text strong className="text-xs sm:text-base">
                  Tổ trưởng
                </Text>
              </div>
              <div className="mb-2 flex h-[60px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-1 sm:mb-4 sm:h-[100px] sm:p-2">
                {data.digital_signature_supervisor ? (
                  <img
                    src={`${STORAGE_URL}/${data.digital_signature_supervisor}`}
                    alt="Chữ ký tổ trưởng"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML =
                        '<span class="text-gray-400 text-xs">[Lỗi]</span>';
                    }}
                  />
                ) : (
                  <Text className="text-xs text-gray-400 sm:text-sm">
                    [Tổ trưởng ký]
                  </Text>
                )}
              </div>
              <div className="border-t border-gray-400 pt-1 sm:pt-2">
                <Text className="text-xs font-medium sm:text-base">
                  {supervisorName || '__________'}
                </Text>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="mb-2 sm:mb-3">
              <Text strong className="text-xs sm:text-base">
                Quản lý nhà máy
              </Text>
            </div>
            <div className="mb-2 flex h-[60px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-1 sm:mb-4 sm:h-[100px] sm:p-2">
              {data.digital_signature_manager ? (
                <img
                  src={`${STORAGE_URL}/${data.digital_signature_manager}`}
                  alt="Chữ ký quản lý nhà máy"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML =
                      '<span class="text-gray-400 text-xs">[Lỗi]</span>';
                  }}
                />
              ) : (
                <Text className="text-xs text-gray-400 sm:text-sm">
                  [Quản lý nhà máy ký]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-1 sm:pt-2">
              <Text className="text-xs font-medium sm:text-base">
                Nguyễn Được Thưởng
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailView: React.FC<RequestFormDetailProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'authorized_approved':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const renderFormContent = () => {
    if (data.type === 'giay_uy_quyen') {
      return <AuthorizationDetailView data={data} />;
    }

    if (
      [
        'don_xin_tu_chuc',
        'don_xin_nghi_viec',
        'don_xin_nghi_phep',
        'don_xin_di_tre_ve_som'
      ].includes(data.type)
    ) {
      return <StandardDetailView data={data} />;
    }

    return <StandardDetailView data={data} />;
  };

  return (
    <div className="mx-auto max-w-4xl bg-white">
      <Card className="no-print mb-4">
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={24} md={24}>
            <Space size="middle" wrap className="w-full">
              <div>
                <Text strong className="text-xs sm:text-sm">
                  Loại đơn:{' '}
                </Text>
                <Tag color="blue" className="text-xs sm:text-sm">
                  {REQUEST_FORM_TYPES[data.type]}
                </Tag>
              </div>
              <div>
                <Text strong className="text-xs sm:text-sm">
                  Trạng thái:{' '}
                </Text>
                <Tag
                  color={getStatusColor(data.status)}
                  className="text-xs sm:text-sm"
                >
                  {REQUEST_FORM_STATUSES[data.status]}
                </Tag>
              </div>
              <div>
                <Text strong className="text-xs sm:text-sm">
                  Ngày nộp:{' '}
                </Text>
                <Text className="text-xs sm:text-sm">
                  {dayjs(data.submitted_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
              {data.approved_at && (
                <div>
                  <Text strong className="text-xs sm:text-sm">
                    Ngày duyệt:{' '}
                  </Text>
                  <Text className="text-xs sm:text-sm">
                    {dayjs(data.approved_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
              )}
            </Space>
          </Col>
          {data.status === 'rejected' && data.rejection_reason && (
            <Col span={24}>
              <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 sm:mt-4 sm:p-3">
                <div className="flex items-start gap-1 sm:items-center sm:gap-2">
                  <Text strong className="text-xs text-red-700 sm:text-sm">
                    Lý do từ chối:
                  </Text>
                  <Text className="text-xs text-gray-800 sm:text-sm">
                    {data.rejection_reason}
                  </Text>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      <div className="print-content">{renderFormContent()}</div>
    </div>
  );
};

export default DetailView;

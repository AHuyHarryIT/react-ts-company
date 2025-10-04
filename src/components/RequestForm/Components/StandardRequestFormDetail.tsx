import React from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { STORAGE_URL } from '@/configs/environment.config';
import { RequestForm, REQUEST_FORM_TYPES } from '@/types/requestFormType';

const { Title, Text } = Typography;

interface StandardRequestFormDetailProps {
  data: RequestForm;
}

export const StandardRequestFormDetail: React.FC<
  StandardRequestFormDetailProps
> = ({ data }) => {
  // Parse form_data if it's a string (from JSON)
  const parsedFormData = React.useMemo(() => {
    if (data.form_data) {
      if (typeof data.form_data === 'object') {
        return data.form_data;
      }
      if (typeof data.form_data === 'string') {
        try {
          return JSON.parse(data.form_data);
        } catch {
          // Error parsing form_data
          return {};
        }
      }
    }
    return {};
  }, [data.form_data]);

  // Map gender từ enum sang Vietnamese như trong GiayUyQuyenDetail
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
    const lines = content.split('\n');
    const processedElements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const cleanLine = line.replace(/\r/g, '').trim();

      // Kiểm tra nếu là dòng có thông tin cá nhân (có "Họ và tên:" hoặc "Tôi tên:" và "Giới tính:" và "Chức vụ:")
      const isPersonalInfoLine =
        (cleanLine.includes('Họ và tên:') || cleanLine.includes('Tôi tên:')) &&
        cleanLine.includes('Giới tính:') &&
        cleanLine.includes('Chức vụ:');

      if (isPersonalInfoLine) {
        // Parse thông tin cá nhân từ một dòng
        const nameMatch = cleanLine.match(
          /(?:Họ và tên|Tôi tên):\s*([^G]*?)(?=\s{2,}Giới tính:|$)/
        );
        const genderMatch = cleanLine.match(
          /Giới tính:\s*([^C]*?)(?=\s{2,}Chức vụ:|$)/
        );
        const positionMatch = cleanLine.match(/Chức vụ:\s*(.*)$/);

        // Auto fill từ data.employee nếu content không có thông tin
        const name = nameMatch?.[1]?.trim() || data?.employee?.name || '';
        const gender =
          genderMatch?.[1]?.trim() ||
          getGenderText((data?.employee as { gender?: string })?.gender) ||
          '';
        const position = positionMatch?.[1]?.trim() || '';

        // Lấy MSNV từ data.employee.id
        const msnv = data?.employee?.id || '';

        processedElements.push(
          <div
            key={i}
            className="mb-2 grid gap-4"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr' }}
          >
            <div className="text-left">
              <Text>
                <strong>Họ và Tên:</strong> <span className="ml-2">{name}</span>
              </Text>
            </div>
            <div className="text-left">
              <Text>
                <strong>MSNV:</strong> <span className="ml-2">{msnv}</span>
              </Text>
            </div>
            <div className="text-left">
              <Text>
                <strong>Giới tính:</strong>{' '}
                <span className="ml-2">{gender}</span>
              </Text>
            </div>
            <div className="text-left">
              <Text>
                <strong>Chức vụ:</strong>{' '}
                <span className="ml-2">{position}</span>
              </Text>
            </div>
          </div>
        );
      } else {
        // Skip empty lines
        if (cleanLine !== '') {
          // Kiểm tra và thay thế phần "Lý do: ..."
          const reasonPatternMatch = cleanLine.match(
            /(.*?)Lý do:\s*\.{10,}(.*)/i
          );

          if (reasonPatternMatch) {
            const beforeReason = reasonPatternMatch[1];
            const afterReason = reasonPatternMatch[2];

            // Lấy lý do từ form_data tùy theo loại đơn
            let reason = '';
            // Thử cả field names cũ và mới để đảm bảo compatibility
            if (parsedFormData?.ly_do_tu_chuc)
              reason = parsedFormData.ly_do_tu_chuc;
            else if (parsedFormData?.ly_do_nghi_viec)
              reason = parsedFormData.ly_do_nghi_viec;
            else if (parsedFormData?.ly_do_nghi_phep)
              reason = parsedFormData.ly_do_nghi_phep;
            else if (parsedFormData?.ly_do_di_tre_ve_som)
              reason = parsedFormData.ly_do_di_tre_ve_som;
            else if (parsedFormData?.ly_do) reason = parsedFormData.ly_do; // Fallback cho tất cả

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
          }
          // Kiểm tra pattern "Ngày nghỉ:" cho đơn nghỉ phép
          else {
            const datePhepPatternMatch = cleanLine.match(
              /(.*?)Ngày nghỉ:\s*([^]*)/i
            );

            if (datePhepPatternMatch) {
              const beforeDate = datePhepPatternMatch[1];

              // Lấy ngày nghỉ phép từ form_data
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
            }
            // Kiểm tra pattern "Ngày đi trễ-về sớm:" cho đơn đi trễ về sớm
            else {
              const diTreVeSomPatternMatch = cleanLine.match(
                /(.*?)Ngày đi trễ-về sớm:\s*([^G]*?)(?:\s+Giờ vào:\s*([^G]*?))?(?:\s+Giờ ra:\s*(.*))?$/i
              );

              if (diTreVeSomPatternMatch) {
                // Lấy dữ liệu từ form_data
                let dateText = '................';
                let timeInText = '.....................';
                let timeOutText = '..................';

                // Xử lý ngày
                if (parsedFormData?.ngay_di_tre_ve_som) {
                  const dateValue = new Date(parsedFormData.ngay_di_tre_ve_som);
                  if (!isNaN(dateValue.getTime())) {
                    dateText = `${dateValue.getDate()}/${dateValue.getMonth() + 1}/${dateValue.getFullYear()}`;
                  }
                }

                // Xử lý giờ vào
                if (parsedFormData?.gio_vao) {
                  const timeInValue = new Date(parsedFormData.gio_vao);
                  if (!isNaN(timeInValue.getTime())) {
                    timeInText = `${timeInValue.getHours().toString().padStart(2, '0')}:${timeInValue.getMinutes().toString().padStart(2, '0')}`;
                  }
                }

                // Xử lý giờ ra
                if (parsedFormData?.gio_ra) {
                  const timeOutValue = new Date(parsedFormData.gio_ra);
                  if (!isNaN(timeOutValue.getTime())) {
                    timeOutText = `${timeOutValue.getHours().toString().padStart(2, '0')}:${timeOutValue.getMinutes().toString().padStart(2, '0')}`;
                  }
                }

                processedElements.push(
                  <div key={i} className="mb-0.5">
                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                    >
                      <div className="text-left">
                        <Text>
                          <strong>Ngày đi trễ-về sớm:</strong> {dateText}
                        </Text>
                      </div>
                      <div className="text-center">
                        <Text>
                          <strong>Giờ vào:</strong> {timeInText}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text>
                          <strong>Giờ ra:</strong> {timeOutText}
                        </Text>
                      </div>
                    </div>
                  </div>
                );
              }
              // Kiểm tra và in đậm phần "kể từ ngày ... tháng ... năm ..." với ngày thực
              else {
                const datePatternMatch = cleanLine.match(
                  /(.*?)(kể từ ngày\s+(?:\.{3,}|\d+)\s*tháng\s+(?:\.{3,}|\d+)\s*năm\s+(?:\.{3,}|\d+))(.*)/i
                );

                if (datePatternMatch) {
                  const beforeDate = datePatternMatch[1];
                  const afterDate = datePatternMatch[3];

                  // Lấy ngày từ form_data tùy theo loại đơn
                  let dateText =
                    'kể từ ngày ....... tháng ....... năm ........';
                  let dateValue = null;

                  // Thử cả field names cũ và mới để đảm bảo compatibility
                  if (parsedFormData?.ngay_tu_chuc)
                    dateValue = new Date(parsedFormData.ngay_tu_chuc);
                  else if (parsedFormData?.ngay_nghi_viec)
                    dateValue = new Date(parsedFormData.ngay_nghi_viec);
                  else if (parsedFormData?.ngay_nghi_phep)
                    dateValue = new Date(parsedFormData.ngay_nghi_phep);
                  else if (parsedFormData?.ngay_di_tre_ve_som)
                    dateValue = new Date(parsedFormData.ngay_di_tre_ve_som);
                  // Fallback field names từ CreateRequestForm.tsx
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
                  // Các dòng khác hiển thị bình thường
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
    <div className="bg-white p-8">
      {/* Header with company info on left and national info on right */}
      <div className="mb-8 flex items-start justify-between">
        {/* Left side - Company info */}
        <div className="text-left">
          <div className="mb-1">
            <Text
              strong
              style={{
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
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
              Phường Bình Hưng Hoà, TP.HCM
            </Text>
          </div>
        </div>

        {/* Right side - National info */}
        <div className="text-center">
          <div className="mb-1">
            <Text
              strong
              style={{
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
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

      {/* Document title and header info */}
      <div className="mb-6 text-center">
        <Title
          level={2}
          className="mb-2"
          style={{
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
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

      {/* Hiển thị nội dung được tự động tạo với format đặc biệt */}
      <div className="mb-4" style={{ lineHeight: '1.4' }}>
        {renderFormattedContent(data.content)}
      </div>

      {/* Approval Date Section */}
      {data.approved_at && (
        <div className="my-6 rounded border border-green-200 bg-green-50 p-4">
          <div className="text-center">
            <Text strong className="text-green-700">
              Ngày duyệt đơn:{' '}
              {dayjs(data.approved_at).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        </div>
      )}

      {/* Date and Signature Section */}
      <div className="mt-8">
        {/* Ngày tháng */}
        <div className="mb-6 text-right">
          <Text strong>
            TP.HCM, ngày {dayjs(data.created_at).format('DD')} tháng{' '}
            {dayjs(data.created_at).format('MM')} năm{' '}
            {dayjs(data.created_at).format('YYYY')}
          </Text>
        </div>

        {/* 3 chữ ký: Người làm đơn, Tổ trưởng, Quản lý */}
        <div className="flex items-start justify-between gap-8">
          {/* Người làm đơn */}
          <div className="mx-auto max-w-48 flex-1 text-center">
            <div className="mb-3">
              <Text strong className="text-base">
                Người làm đơn
              </Text>
            </div>
            <div className="mb-4 flex h-[100px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2">
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
                      '<span class="text-gray-400 text-sm">[Không thể tải chữ ký]</span>';
                  }}
                />
              ) : (
                <Text className="text-sm text-gray-400">
                  [Vùng chữ ký điện tử]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-2">
              <Text className="font-medium">{data.employee.name}</Text>
            </div>
          </div>

          {/* Tổ trưởng */}
          <div className="mx-auto max-w-48 flex-1 text-center">
            <div className="mb-3">
              <Text strong className="text-base">
                Tổ trưởng
              </Text>
            </div>
            <div className="mb-4 flex h-[100px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2">
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
                      '<span class="text-gray-400 text-sm">[Không thể tải chữ ký]</span>';
                  }}
                />
              ) : (
                <Text className="text-sm text-gray-400">
                  [Tổ trưởng cần ký tại đây]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-2">
              <Text className="font-medium">
                {parsedFormData?.ten_to_truong || '_________________'}
              </Text>
            </div>
          </div>

          {/* Quản lý */}
          <div className="mx-auto max-w-48 flex-1 text-center">
            <div className="mb-3">
              <Text strong className="text-base">
                Quản lý
              </Text>
            </div>
            <div className="mb-4 flex h-[100px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2">
              {data.digital_signature_manager ? (
                <img
                  src={`${STORAGE_URL}/${data.digital_signature_manager}`}
                  alt="Chữ ký quản lý"
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
                      '<span class="text-gray-400 text-sm">[Không thể tải chữ ký]</span>';
                  }}
                />
              ) : (
                <Text className="text-sm text-gray-400">
                  [Quản lý cần ký tại đây]
                </Text>
              )}
            </div>
            <div className="border-t border-gray-400 pt-2">
              <Text className="font-medium">Nguyễn Được Thưởng</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

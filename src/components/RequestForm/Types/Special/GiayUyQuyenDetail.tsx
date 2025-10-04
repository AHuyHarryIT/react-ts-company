import React from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { STORAGE_URL } from '@/configs/environment.config';
import { RequestForm } from '@/types/requestFormType';

const { Title, Text } = Typography;

interface GiayUyQuyenDetailProps {
  data: RequestForm;
}

export const GiayUyQuyenDetail: React.FC<GiayUyQuyenDetailProps> = ({
  data
}) => {
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

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const processedElements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const cleanLine = line.replace(/\r/g, '').trim();

      // Kiểm tra các phần I. II. III.
      const isSectionTitle = cleanLine.match(
        /^(I\.|II\.|III\.)\s*(Bên ủy quyền|Bên được ủy quyền|Nội dung ủy quyền)/i
      );

      if (isSectionTitle) {
        processedElements.push(
          <div key={i} className="mt-4 mb-2">
            <Text
              strong
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              {cleanLine.toUpperCase()}
            </Text>
          </div>
        );
      } else if (cleanLine !== '') {
        // Kiểm tra nếu là dòng có thông tin cá nhân (có "Họ và tên:" hoặc "Tôi tên:" và "Giới tính:" và "Chức vụ:")
        const isPersonalInfoLine =
          (cleanLine.includes('Họ và tên:') ||
            cleanLine.includes('Tôi tên:')) &&
          cleanLine.includes('Giới tính:') &&
          cleanLine.includes('Chức vụ:');

        if (isPersonalInfoLine) {
          // Parse thông tin cá nhân từ một dòng
          const nameMatch = cleanLine.match(
            /(?:Họ và tên|Tôi tên):\s*([^MG]*?)(?=\s*MSNV:|(?=\s{2,}Giới tính:)|$)/
          );
          const msnvMatch = cleanLine.match(
            /MSNV:\s*([^G]*?)(?=\s{2,}Giới tính:|$)/
          );
          const genderMatch = cleanLine.match(
            /Giới tính:\s*([^C]*?)(?=\s{2,}Chức vụ:|$)/
          );
          const positionMatch = cleanLine.match(/Chức vụ:\s*(.*)$/);

          const name = nameMatch?.[1]?.trim() || '';
          const msnv = msnvMatch?.[1]?.trim() || '';
          const gender = genderMatch?.[1]?.trim() || '';
          const position = positionMatch?.[1]?.trim() || '';

          // Skip dòng MSNV tiếp theo nếu có (vì đã parse từ dòng hiện tại)
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextCleanLine = nextLine.replace(/\r/g, '').trim();
            if (
              nextCleanLine.match(/^MSNV:\s*.*$/) &&
              !nextCleanLine.includes('Họ và tên') &&
              !nextCleanLine.includes('Giới tính')
            ) {
              i++; // Skip dòng MSNV đơn lẻ
            }
          }

          processedElements.push(
            <div
              key={i}
              className="mt-1 mb-2 grid gap-4"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr' }}
            >
              <div className="text-left">
                <Text>
                  <strong>Họ và tên:</strong>{' '}
                  <span className="ml-2">{name}</span>
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
                  <span className="ml-2">
                    {gender ||
                      parsedFormData?.gioi_tinh_nguoi_duoc_uy_quyen ||
                      '.................'}
                  </span>
                </Text>
              </div>
              <div className="text-left">
                <Text>
                  <strong>Chức vụ:</strong>{' '}
                  <span className="ml-2">
                    {position ||
                      parsedFormData?.chuc_vu_nguoi_duoc_uy_quyen ||
                      '..............................'}
                  </span>
                </Text>
              </div>
            </div>
          );
        } else {
          // Skip dòng MSNV đơn lẻ vì đã được xử lý với thông tin cá nhân
          const isMSNVOnly = cleanLine.match(/^MSNV:\s*.*$/);
          if (!isMSNVOnly) {
            // Các dòng khác hiển thị bình thường với khoảng cách khít hơn
            const isSection = cleanLine.match(/^(I\.|II\.|III\.)/);
            processedElements.push(
              <div key={i} className={isSection ? 'mt-2 mb-1' : 'mb-0.5'}>
                <Text style={{ fontWeight: isSection ? 'bold' : 'normal' }}>
                  {cleanLine}
                </Text>
              </div>
            );
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
              Phường Bình Hưng Hoà, TP.Hồ Chí Minh
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
          GIẤY ỦY QUYỀN
        </Title>

        <div className="mb-4 text-left">
          <Text strong>
            Kính gửi: - Ban giám đốc Công Ty TNHH MTV VINH VINH PHÁT
          </Text>
          <br />
          <Text strong style={{ marginLeft: '61px' }}>
            - Phòng nhân sự
          </Text>
        </div>
      </div>

      {/* Hiển thị nội dung được tự động tạo với format đặc biệt */}
      <div
        className="mt-4 mb-4"
        style={{ lineHeight: '1.4', marginTop: '15px', marginBottom: '15px' }}
      >
        {renderFormattedContent(data.content)}
      </div>

      {/* Date and Signature Section for Giay Uy Quyen */}
      <div className="mt-8">
        {/* Ngày tháng */}
        <div className="mb-6 text-right">
          <Text strong>
            TP.HCM, ngày {dayjs(data.created_at).format('DD')} tháng{' '}
            {dayjs(data.created_at).format('MM')} năm{' '}
            {dayjs(data.created_at).format('YYYY')}
          </Text>
        </div>

        {/* 2 chữ ký: Bên được ủy quyền và Bên ủy quyền */}
        <div className="flex items-start justify-between gap-8">
          {/* Bên được ủy quyền */}
          <div className="mx-auto max-w-48 flex-1 text-center">
            <div className="mb-3">
              <Text strong className="text-base">
                Bên được ủy quyền
              </Text>
            </div>
            <div className="mb-4 flex h-[100px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2">
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
              <Text className="font-medium">
                {parsedFormData?.ten_nguoi_duoc_uy_quyen || 'Đinh Phương Thảo'}
              </Text>
            </div>
          </div>

          {/* Bên ủy quyền */}
          <div className="mx-auto max-w-48 flex-1 text-center">
            <div className="mb-3">
              <Text strong className="text-base">
                Bên ủy quyền
              </Text>
            </div>
            <div className="mb-4 flex h-[100px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-2">
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
        </div>
      </div>
    </div>
  );
};

export default GiayUyQuyenDetail;

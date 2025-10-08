import { FieldConfig } from '@/types/form';
import { RequestFormType } from '@/types/requestFormType';

// Field configurations for each form type based on the form images
export const getRequestFormFields = (type: RequestFormType): FieldConfig[] => {
  // Loại bỏ trường title và content vì sẽ tự động điền từ loại đơn và chi tiết form
  const baseFields: FieldConfig[] = [];

  const formDataFields = getFormDataFields(type);

  return [...baseFields, ...formDataFields];
};

// Utility function to get fields specific to each form type
const getFormDataFields = (type: RequestFormType): FieldConfig[] => {
  switch (type) {
    case 'giay_uy_quyen':
      return [
        {
          name: 'nguoi_uy_quyen',
          label: 'Người ủy quyền',
          type: 'text',
          required: true,
          placeholder: 'Nhập tên người ủy quyền'
        },
        {
          name: 'so_cmnd_nguoi_uy_quyen',
          label: 'Số CMND/CCCD người ủy quyền',
          type: 'text',
          required: true,
          placeholder: 'Nhập số CMND/CCCD'
        },
        {
          name: 'dia_chi_nguoi_uy_quyen',
          label: 'Địa chỉ người ủy quyền',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập địa chỉ'
        },
        {
          name: 'nguoi_duoc_uy_quyen',
          label: 'Người được ủy quyền',
          type: 'text',
          required: true,
          placeholder: 'Nhập tên người được ủy quyền'
        },
        {
          name: 'so_cmnd_nguoi_duoc_uy_quyen',
          label: 'Số CMND/CCCD người được ủy quyền',
          type: 'text',
          required: true,
          placeholder: 'Nhập số CMND/CCCD'
        },
        {
          name: 'dia_chi_nguoi_duoc_uy_quyen',
          label: 'Địa chỉ người được ủy quyền',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập địa chỉ'
        },
        {
          name: 'noi_dung_uy_quyen',
          label: 'Nội dung ủy quyền',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập nội dung ủy quyền'
        }
      ];

    case 'don_xin_tu_chuc':
      return [
        {
          name: 'ngay_tu_chuc',
          label: 'Ngày từ chức',
          type: 'date',
          required: true,
          placeholder: 'Chọn ngày từ chức'
        },
        {
          name: 'ly_do',
          label: 'Lý do từ chức',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập lý do từ chức'
        }
      ];

    case 'don_xin_nghi_viec':
      return [
        {
          name: 'ngay_thoi_viec',
          label: 'Ngày thôi việc',
          type: 'date',
          required: true,
          placeholder: 'Chọn ngày thôi việc'
        },
        {
          name: 'ly_do',
          label: 'Lý do thôi việc',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập lý do thôi việc'
        }
      ];

    case 'don_xin_nghi_phep':
      return [
        {
          name: 'ngay_nghi',
          label: 'Ngày nghỉ',
          type: 'date',
          required: true,
          placeholder: 'Chọn ngày nghỉ'
        },
        {
          name: 'ly_do',
          label: 'Lý do nghỉ phép',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập lý do nghỉ phép'
        }
      ];

    case 'don_xin_di_tre_ve_som':
      return [
        {
          name: 'ngay_ap_dung',
          label: 'Ngày đi trễ - về sớm',
          type: 'date',
          required: true,
          placeholder: 'Chọn ngày'
        },
        {
          name: 'gio_vao_tre',
          label: 'Giờ vào',
          type: 'time',
          required: true,
          placeholder: 'Chọn giờ vào'
        },
        {
          name: 'gio_ve_som',
          label: 'Giờ ra',
          type: 'time',
          required: true,
          placeholder: 'Chọn giờ ra'
        },
        {
          name: 'ly_do_di_tre_ve_som',
          label: 'Lý do đi trễ - về sớm',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập lý do'
        }
      ];

    default:
      return [];
  }
};

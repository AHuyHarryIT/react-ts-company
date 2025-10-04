export type RequestFormType =
  | 'giay_uy_quyen'
  | 'don_xin_tu_chuc'
  | 'don_xin_nghi_viec'
  | 'don_xin_nghi_phep'
  | 'don_xin_di_tre_ve_som';

export type RequestFormStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'Nghỉ phép năm' | 'Nghỉ ốm' | 'Nghỉ việc riêng';

export type LateEarlyType = 'di_tre' | 've_som' | 'ca_hai';

// Base request form
export interface RequestForm {
  id: number;
  employee_id: string;
  type: RequestFormType;
  title: string;
  content: string;
  form_data: Record<string, unknown>;
  status: RequestFormStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
  submitted_at: string;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;

  // Digital signatures - Đơn Ủy Quyền (2 chữ ký)
  digital_signature_delegator?: string | null; // Chữ ký bên ủy quyền
  digital_signature_authorized?: string | null; // Chữ ký bên được ủy quyền

  // Digital signatures - Các đơn khác (chỉ 1 chữ ký cá nhân)
  digital_signature_applicant?: string | null; // Chữ ký cá nhân

  // Digital signatures - Admin approval signatures
  digital_signature_supervisor?: string | null; // Chữ ký tổ trưởng/giám sát
  digital_signature_manager?: string | null; // Chữ ký quản lý/phê duyệt

  employee: {
    id: string;
    name: string;
  };
  approved_by_employee?: {
    id: string;
    name: string;
  } | null;
}

// Form data interfaces for each type
export interface GiayUyQuyenFormData {
  ma_nhan_vien_duoc_uy_quyen: string; // Mã nhân viên được ủy quyền
  ten_nguoi_duoc_uy_quyen: string; // Tên được auto-fill từ mã NV
  gioi_tinh_nguoi_duoc_uy_quyen: string; // Giới tính người được ủy quyền
  chuc_vu_nguoi_duoc_uy_quyen: string; // Chức vụ người được ủy quyền
  noi_dung_uy_quyen: string; // Nội dung ủy quyền
}

export interface DonXinTuChucFormData {
  ngay_nop_don: string;
  ngay_nghi_viec_mong_muon: string;
  ly_do_tu_chuc: string;
  cong_viec_ban_giao: string;
  dia_chi_lien_lac: string;
  so_dien_thoai: string;
}

export interface DonXinNghiViecFormData {
  ngay_bat_dau_nghi: string;
  ngay_du_kien_tro_lai: string;
  so_ngay_nghi: number;
  ly_do_nghi_viec: string;
  dia_chi_trong_thoi_gian_nghi: string;
  nguoi_lien_lac_khan_cap: string;
  ghi_chu?: string;
}

export interface DonXinNghiPhepFormData {
  ngay_nghi_tu: string;
  ngay_nghi_den: string;
  so_ngay_nghi: number;
  loai_nghi_phep: LeaveType;
  ly_do: string;
  dia_chi_lien_lac: string;
  so_dien_thoai_lien_lac: string;
  nguoi_thay_the: string;
  cong_viec_can_ban_giao: string;
}

export interface DonXinDiTreVeSomFormData {
  ngay_ap_dung: string;
  loai_don: LateEarlyType;
  gio_vao_binh_thuong: string;
  gio_vao_mong_muon: string;
  gio_ra_binh_thuong: string;
  gio_ra_mong_muon: string;
  so_gio_lam_bu: number;
  cach_lam_bu: string;
  ly_do: string;
  ghi_chu?: string;
}

// Union type for all form data
export type RequestFormData =
  | GiayUyQuyenFormData
  | DonXinTuChucFormData
  | DonXinNghiViecFormData
  | DonXinNghiPhepFormData
  | DonXinDiTreVeSomFormData;

// Create/Update DTOs
export interface CreateRequestFormDto {
  type: RequestFormType;
  title: string;
  content: string;
  form_data: RequestFormData;
}

export interface UpdateRequestFormDto {
  title?: string;
  content?: string;
  form_data?: Partial<RequestFormData>;
}

// Filter/Query params
export interface RequestFormFilters {
  type?: RequestFormType;
  status?: RequestFormStatus;
  employee_id?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
  page?: number;
}

// API Response types
export interface RequestFormListResponse {
  success: boolean;
  data: {
    data: RequestForm[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  types: Record<RequestFormType, string>;
  statuses: Record<RequestFormStatus, string>;
}

export interface RequestFormDetailResponse {
  success: boolean;
  data: RequestForm;
}

export interface RequestFormTypesResponse {
  success: boolean;
  data: {
    types: Record<RequestFormType, string>;
    statuses: Record<RequestFormStatus, string>;
  };
}

export interface RequestFormStatisticsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    by_type: Record<
      RequestFormType,
      {
        name: string;
        count: number;
        pending: number;
      }
    >;
  };
}

// Action DTOs
export interface ApproveRequestFormDto {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

// Constants
export const REQUEST_FORM_TYPES: Record<RequestFormType, string> = {
  giay_uy_quyen: 'Giấy ủy quyền',
  don_xin_tu_chuc: 'Đơn xin từ chức',
  don_xin_nghi_viec: 'Đơn xin nghỉ việc',
  don_xin_nghi_phep: 'Đơn xin nghỉ phép',
  don_xin_di_tre_ve_som: 'Đơn xin đi trễ - về sớm'
};

export const REQUEST_FORM_STATUSES: Record<RequestFormStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
};

export const LEAVE_TYPES: Record<LeaveType, string> = {
  'Nghỉ phép năm': 'Nghỉ phép năm',
  'Nghỉ ốm': 'Nghỉ ốm đau',
  'Nghỉ việc riêng': 'Nghỉ việc cá nhân'
};

export const LATE_EARLY_TYPES: Record<LateEarlyType, string> = {
  di_tre: 'Đi trễ',
  ve_som: 'Về sớm',
  ca_hai: 'Cả đi trễ và về sớm'
};

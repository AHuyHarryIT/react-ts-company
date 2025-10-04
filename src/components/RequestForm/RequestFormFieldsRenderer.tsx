import React from 'react';
import { Form, Input, DatePicker, Select, TimePicker } from 'antd';

export const GiayUyQuyenForm: React.FC = () => {
  return (
    <>
      <Form.Item
        name={['form_data', 'ten_nguoi_duoc_uy_quyen']}
        label="Họ và tên người được ủy quyền"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập họ và tên người được ủy quyền'
          },
          { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
        ]}
      >
        <Input placeholder="Nhập họ và tên người được ủy quyền" />
      </Form.Item>

      <Form.Item
        name={['form_data', 'ma_nhan_vien_duoc_uy_quyen']}
        label="MSNV người được ủy quyền"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập mã số nhân viên được ủy quyền'
          },
          { pattern: /^[0-9]+$/, message: 'Mã số nhân viên chỉ được chứa số' }
        ]}
      >
        <Input placeholder="Nhập MSNV người được ủy quyền" type="number" />
      </Form.Item>

      <Form.Item
        name={['form_data', 'gioi_tinh_nguoi_duoc_uy_quyen']}
        label="Giới tính người được ủy quyền"
        rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
      >
        <Select
          placeholder="Chọn giới tính người được ủy quyền"
          options={[
            { label: 'Nam', value: 'Nam' },
            { label: 'Nữ', value: 'Nữ' },
            { label: 'Khác', value: 'Khác' }
          ]}
        />
      </Form.Item>

      <Form.Item
        name={['form_data', 'chuc_vu_nguoi_duoc_uy_quyen']}
        label="Chức vụ người được ủy quyền"
        rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
      >
        <Select
          placeholder="Chọn hoặc nhập chức vụ người được ủy quyền"
          showSearch
          allowClear
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={[
            { label: 'KH-Mua hàng', value: 'KH-Mua hàng' },
            { label: 'Kho', value: 'Kho' },
            { label: 'Khuôn', value: 'Khuôn' },
            { label: 'Bảo trì điện', value: 'Bảo trì điện' },
            { label: 'Kỹ thuật', value: 'Kỹ thuật' },
            { label: 'QA-QC', value: 'QA-QC' },
            { label: 'Ngoại Quan', value: 'Ngoại Quan' },
            { label: 'Sản xuất', value: 'Sản xuất' },
            { label: 'Bảo trì + Kho', value: 'Bảo trì + Kho' },
            { label: 'Quản lý', value: 'Quản lý' },
            { label: 'QC', value: 'QC' },
            { label: 'Tổ trưởng sản xuất', value: 'Tổ trưởng sản xuất' },
            { label: 'Tổ phó sản xuất', value: 'Tổ phó sản xuất' },
            { label: 'Tổ trưởng ngoại quan', value: 'Tổ trưởng ngoại quan' }
          ]}
        />
      </Form.Item>

      <Form.Item
        name={['form_data', 'noi_dung_uy_quyen']}
        label="Nội dung ủy quyền"
        rules={[
          { required: true, message: 'Vui lòng nhập nội dung ủy quyền' },
          { min: 10, message: 'Nội dung ủy quyền phải có ít nhất 10 ký tự' }
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập nội dung ủy quyền"
          showCount
          maxLength={500}
        />
      </Form.Item>
    </>
  );
};

export const DonXinTuChucForm: React.FC = () => {
  return (
    <>
      <Form.Item
        name={['form_data', 'ngay_tu_chuc']}
        label="Ngày từ chức"
        rules={[{ required: true, message: 'Vui lòng chọn ngày từ chức' }]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ly_do']}
        label="Lý do"
        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
      >
        <Input.TextArea rows={3} placeholder="Nhập lý do từ chức" />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ten_to_truong']}
        label="Tổ trưởng"
        rules={[{ required: true, message: 'Vui lòng nhập tên tổ trưởng' }]}
      >
        <Input placeholder="Nhập tên tổ trưởng" />
      </Form.Item>
    </>
  );
};

export const DonXinNghiViecForm: React.FC = () => {
  return (
    <>
      <Form.Item
        name={['form_data', 'ngay_thoi_viec']}
        label="Ngày thôi việc"
        rules={[{ required: true, message: 'Vui lòng chọn ngày thôi việc' }]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ly_do']}
        label="Lý do"
        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
      >
        <Input.TextArea rows={3} placeholder="Nhập lý do nghỉ việc" />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ten_to_truong']}
        label="Tổ trưởng"
        rules={[{ required: true, message: 'Vui lòng nhập tên tổ trưởng' }]}
      >
        <Input placeholder="Nhập tên tổ trưởng" />
      </Form.Item>
    </>
  );
};

export const DonXinNghiPhepForm: React.FC = () => {
  return (
    <>
      <Form.Item
        name={['form_data', 'ngay_nghi']}
        label="Ngày nghỉ"
        rules={[{ required: true, message: 'Vui lòng chọn ngày nghỉ' }]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ly_do']}
        label="Lý do"
        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
      >
        <Input.TextArea rows={3} placeholder="Nhập lý do nghỉ phép" />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ten_to_truong']}
        label="Tổ trưởng"
        rules={[{ required: true, message: 'Vui lòng nhập tên tổ trưởng' }]}
      >
        <Input placeholder="Nhập tên tổ trưởng" />
      </Form.Item>
    </>
  );
};

export const DonXinDiTreVeSomForm: React.FC = () => {
  return (
    <>
      <Form.Item
        name={['form_data', 'ngay_di_tre_ve_som']}
        label="Ngày"
        rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={['form_data', 'gio_vao']}
        label="Giờ vào"
        rules={[{ required: true, message: 'Vui lòng chọn giờ vào' }]}
      >
        <TimePicker format="HH:mm" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={['form_data', 'gio_ra']}
        label="Giờ ra"
        rules={[{ required: true, message: 'Vui lòng chọn giờ ra' }]}
      >
        <TimePicker format="HH:mm" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ly_do']}
        label="Lý do"
        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
      >
        <Input.TextArea rows={3} placeholder="Nhập lý do" />
      </Form.Item>
      <Form.Item
        name={['form_data', 'ten_to_truong']}
        label="Tổ trưởng"
        rules={[{ required: true, message: 'Vui lòng nhập tên tổ trưởng' }]}
      >
        <Input placeholder="Nhập tên tổ trưởng" />
      </Form.Item>
    </>
  );
};

export const RequestFormFieldsRenderer: React.FC<{ formType: string }> = ({
  formType
}) => {
  switch (formType) {
    case 'giay_uy_quyen':
      return <GiayUyQuyenForm />;
    case 'don_xin_tu_chuc':
      return <DonXinTuChucForm />;
    case 'don_xin_nghi_viec':
      return <DonXinNghiViecForm />;
    case 'don_xin_nghi_phep':
      return <DonXinNghiPhepForm />;
    case 'don_xin_di_tre_ve_som':
      return <DonXinDiTreVeSomForm />;
    default:
      return null;
  }
};

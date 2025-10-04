# 📋 RequestForm API Documentation

## 📖 Tổng quan

Hệ thống API quản lý các loại đơn yêu cầu của nhân viên, bao gồm:

- **Giấy ủy quyền**
- **Đơn xin từ chức**
- **Đơn xin nghỉ việc**
- **Đơn xin nghỉ phép**
- **Đơn xin đi trễ - về sớm**

---

## 🔐 Authentication

Tất cả API đều yêu cầu authentication token trong header:

```http
Authorization: Bearer {your_token}
```

---

## 👨‍💼 EMPLOYEE API ENDPOINTS

### Base URL: `/api/employee/request-forms`

**Middleware:** `api.authEmployees`

### 1. 📋 Lấy danh sách đơn của employee

```http
GET /api/employee/request-forms
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Lọc theo loại đơn |
| `status` | string | No | Lọc theo trạng thái (`pending`, `approved`, `rejected`) |
| `from_date` | date | No | Từ ngày (YYYY-MM-DD) |
| `to_date` | date | No | Đến ngày (YYYY-MM-DD) |
| `per_page` | integer | No | Số item per page (default: 15) |

**Example Request:**

```bash
GET /api/employee/request-forms?type=giay_uy_quyen&status=pending&per_page=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "per_page": 10,
    "total": 25,
    "last_page": 3
  },
  "types": {
    "giay_uy_quyen": "Giấy ủy quyền",
    "don_xin_tu_chuc": "Đơn xin từ chức",
    "don_xin_nghi_viec": "Đơn xin nghỉ việc",
    "don_xin_nghi_phep": "Đơn xin nghỉ phép",
    "don_xin_di_tre_ve_som": "Đơn xin đi trễ - về sớm"
  },
  "statuses": {
    "pending": "Chờ duyệt",
    "approved": "Đã duyệt",
    "rejected": "Từ chối"
  }
}
```

### 2. ➕ Tạo đơn mới

```http
POST /api/employee/request-forms
```

**Content-Type:** `multipart/form-data` (nếu có upload chữ ký)

**Request Body cho Đơn Ủy Quyền:**

```json
{
  "type": "giay_uy_quyen",
  "title": "Đơn ủy quyền công việc",
  "content": "Tôi xin ủy quyền cho...",
  "form_data": {
    "nguoi_duoc_uy_quyen": "Nguyễn Văn A",
    "chuc_vu": "Nhân viên",
    "cong_viec": "Ký hợp đồng",
    "thoi_gian": "01/10/2025 - 31/10/2025"
  },
  "digital_signature_delegator": "file", // optional: Chữ ký bên ủy quyền
  "digital_signature_authorized": "file" // optional: Chữ ký bên được ủy quyền
}
```

**Request Body cho Đơn khác (nghỉ phép, từ chức, v.v.):**

```json
{
  "type": "don_xin_nghi_phep",
  "title": "Đơn xin nghỉ phép",
  "content": "Tôi xin được nghỉ phép...",
  "form_data": {...},
  "digital_signature_applicant": "file", // optional: Chữ ký người làm đơn
  "digital_signature_supervisor": "file", // optional: Chữ ký tổ trưởng/giám sát
  "digital_signature_manager": "file" // optional: Chữ ký quản lý/phê duyệt
}
```

**5 Loại Chữ Ký:**
| Field Name | Description | Áp dụng cho |
|------------|-------------|-------------|
| `digital_signature_delegator` | Chữ ký bên ủy quyền | Chỉ đơn ủy quyền |
| `digital_signature_authorized` | Chữ ký bên được ủy quyền | Chỉ đơn ủy quyền |
| `digital_signature_applicant` | Chữ ký người làm đơn | Các đơn khác |
| `digital_signature_supervisor` | Chữ ký tổ trưởng/giám sát | Các đơn khác |
| `digital_signature_manager` | Chữ ký quản lý/phê duyệt | Các đơn khác |

- **File types:** JPG, PNG, GIF, SVG
- **Max size:** 2MB per file
- **Storage:** `storage/app/public/digital_signatures/`

**Response:**

```json
{
  "success": true,
  "message": "Đơn yêu cầu đã được tạo thành công",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "type": "giay_uy_quyen",
    "title": "Đơn ủy quyền công việc",
    "content": "Tôi xin ủy quyền cho...",
    "form_data": {...},
    "status": "pending",
    "submitted_at": "2025-10-01 10:30:00",
    "employee": {
      "id": "EMP001",
      "name": "Nguyễn Văn A"
    }
  }
}
```

### 3. 📝 Lấy danh sách loại đơn

```http
GET /api/employee/request-forms/types
```

**Response:**

```json
{
  "success": true,
  "data": {
    "types": {
      "giay_uy_quyen": "Giấy ủy quyền",
      "don_xin_tu_chuc": "Đơn xin từ chức",
      "don_xin_nghi_viec": "Đơn xin nghỉ việc",
      "don_xin_nghi_phep": "Đơn xin nghỉ phép",
      "don_xin_di_tre_ve_som": "Đơn xin đi trễ - về sớm"
    },
    "statuses": {
      "pending": "Chờ duyệt",
      "approved": "Đã duyệt",
      "rejected": "Từ chối"
    }
  }
}
```

### 3.1. 🖊️ Lấy thông tin chữ ký theo loại đơn

```http
GET /api/employee/request-forms/signature-fields?type={type}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Loại đơn (giay_uy_quyen, don_xin_nghi_phep, v.v.) |

**Response cho Đơn Ủy Quyền:**

```json
{
  "success": true,
  "data": {
    "type": "giay_uy_quyen",
    "type_name": "Giấy ủy quyền",
    "signature_fields": {
      "digital_signature_delegator": "Chữ ký bên ủy quyền",
      "digital_signature_authorized": "Chữ ký bên được ủy quyền"
    }
  }
}
```

**Response cho Đơn khác:**

```json
{
  "success": true,
  "data": {
    "type": "don_xin_nghi_phep",
    "type_name": "Đơn xin nghỉ phép",
    "signature_fields": {
      "digital_signature_applicant": "Chữ ký người làm đơn",
      "digital_signature_supervisor": "Chữ ký tổ trưởng/giám sát",
      "digital_signature_manager": "Chữ ký quản lý/phê duyệt"
    }
  }
}
```

### 4. 👁️ Xem chi tiết đơn

```http
GET /api/employee/request-forms/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "type": "giay_uy_quyen",
    "title": "Đơn ủy quyền công việc",
    "content": "Tôi xin ủy quyền cho...",
    "form_data": {...},
    "status": "pending",
    "approved_by": null,
    "rejection_reason": null,
    "submitted_at": "2025-10-01 10:30:00",
    "approved_at": null,
    "employee": {
      "id": "EMP001",
      "name": "Nguyễn Văn A"
    },
    "approved_by_employee": null
  }
}
```

### 5. ✏️ Cập nhật đơn (chỉ đơn chưa duyệt)

```http
PUT /api/employee/request-forms/{id}
```

**Content-Type:** `multipart/form-data` (nếu có upload chữ ký)

**Request Body:**

```json
{
  "title": "Tiêu đề mới", // optional
  "content": "Nội dung mới", // optional
  "form_data": {
    // optional
    "nguoi_duoc_uy_quyen": "Nguyễn Văn B"
  },
  "digital_signature": "file" // optional: File chữ ký điện tử mới (sẽ thay thế file cũ)
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đơn yêu cầu đã được cập nhật thành công",
  "data": {...}
}
```

### 6. 🗑️ Xóa đơn (chỉ đơn chưa duyệt)

```http
DELETE /api/employee/request-forms/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Đơn yêu cầu đã được xóa thành công"
}
```

---

## 👨‍💻 ADMIN API ENDPOINTS

### Base URL: `/api/request-forms`

**Middleware:** `api.authAdmin`

### 1. 📊 Lấy tất cả đơn yêu cầu

```http
GET /api/request-forms
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Lọc theo loại đơn |
| `status` | string | No | Lọc theo trạng thái |
| `employee_id` | string | No | Lọc theo employee |
| `from_date` | date | No | Từ ngày |
| `to_date` | date | No | Đến ngày |
| `per_page` | integer | No | Số item per page |

**Example Request:**

```bash
GET /api/request-forms?status=pending&employee_id=EMP001&per_page=20
```

### 2. 📈 Xem thống kê đơn yêu cầu

```http
GET /api/request-forms/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 25,
    "approved": 100,
    "rejected": 25,
    "by_type": {
      "giay_uy_quyen": {
        "name": "Giấy ủy quyền",
        "count": 30,
        "pending": 5
      },
      "don_xin_nghi_phep": {
        "name": "Đơn xin nghỉ phép",
        "count": 80,
        "pending": 15
      }
    }
  }
}
```

### 3. 👁️ Xem chi tiết đơn

```http
GET /api/request-forms/{id}
```

### 4. ✅ Duyệt/Từ chối đơn

```http
POST /api/request-forms/{id}/approve
```

**Content-Type:** `multipart/form-data` (khi có upload chữ ký)

**Duyệt đơn (không có chữ ký):**

```json
{
  "action": "approve"
}
```

**Duyệt đơn (có chữ ký quản lý):**

```json
{
  "action": "approve",
  "digital_signature_supervisor": "[FILE - Chữ ký tổ trưởng/giám sát]",
  "digital_signature_manager": "[FILE - Chữ ký quản lý/phê duyệt]"
}
```

**Từ chối đơn:**

```json
{
  "action": "reject",
  "rejection_reason": "Không đủ điều kiện nghỉ phép"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đơn yêu cầu đã được duyệt thành công",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_by": "ADMIN001",
    "approved_at": "2025-10-01 15:30:00",
    "digital_signature_supervisor": "signatures/1735123456_digital_signature_supervisor_chuky.png",
    "digital_signature_manager": "signatures/1735123456_digital_signature_manager_chuky.png",
    "approved_by_employee": {
      "id": "ADMIN001",
      "name": "Admin User"
    }
  }
}
```

---

## 📋 CÁC LOẠI ĐƠN VÀ FORM_DATA

### 1. 📜 Giấy ủy quyền (`giay_uy_quyen`)

```json
{
  "type": "giay_uy_quyen",
  "title": "Đơn ủy quyền làm việc",
  "content": "Tôi tên là... xin ủy quyền cho...",
  "form_data": {
    "nguoi_duoc_uy_quyen": "Nguyễn Văn A",
    "chuc_vu": "Nhân viên",
    "bo_phan": "Kế toán",
    "cong_viec_uy_quyen": "Ký hợp đồng với khách hàng",
    "thoi_gian_bat_dau": "2025-10-01",
    "thoi_gian_ket_thuc": "2025-10-15",
    "ly_do": "Đi công tác"
  }
}
```

### 2. 💼 Đơn xin từ chức (`don_xin_tu_chuc`)

```json
{
  "type": "don_xin_tu_chuc",
  "title": "Đơn xin từ chức",
  "content": "Tôi xin được phép từ chức...",
  "form_data": {
    "ngay_nop_don": "2025-10-01",
    "ngay_nghi_viec_mong_muon": "2025-11-01",
    "ly_do_tu_chuc": "Lý do cá nhân",
    "cong_viec_ban_giao": "Hoàn thành dự án X, bàn giao tài liệu cho Nguyễn Văn B",
    "dia_chi_lien_lac": "123 Đường ABC, Quận 1, TP.HCM",
    "so_dien_thoai": "0909123456"
  }
}
```

### 3. 🏠 Đơn xin nghỉ việc (`don_xin_nghi_viec`)

```json
{
  "type": "don_xin_nghi_viec",
  "title": "Đơn xin nghỉ việc tạm thời",
  "content": "Tôi xin được nghỉ việc tạm thời...",
  "form_data": {
    "ngay_bat_dau_nghi": "2025-10-15",
    "ngay_du_kien_tro_lai": "2025-11-15",
    "so_ngay_nghi": 31,
    "ly_do_nghi_viec": "Điều trị bệnh",
    "dia_chi_trong_thoi_gian_nghi": "456 Đường DEF",
    "nguoi_lien_lac_khan_cap": "Nguyễn Thị C - 0901234567",
    "ghi_chu": "Sẽ báo cáo tình hình sức khỏe định kỳ"
  }
}
```

### 4. 🌴 Đơn xin nghỉ phép (`don_xin_nghi_phep`)

```json
{
  "type": "don_xin_nghi_phep",
  "title": "Đơn xin nghỉ phép",
  "content": "Tôi xin được nghỉ phép...",
  "form_data": {
    "ngay_nghi_tu": "2025-10-20",
    "ngay_nghi_den": "2025-10-22",
    "so_ngay_nghi": 3,
    "loai_nghi_phep": "Nghỉ phép năm",
    "ly_do": "Về quê thăm gia đình",
    "dia_chi_lien_lac": "789 Đường GHI, Tỉnh XYZ",
    "so_dien_thoai_lien_lac": "0902345678",
    "nguoi_thay_the": "Trần Văn D",
    "cong_viec_can_ban_giao": "Hoàn thành báo cáo tháng, trả lời email khách hàng"
  }
}
```

**Loại nghỉ phép:**

- `"Nghỉ phép năm"` - Nghỉ phép hàng năm
- `"Nghỉ ốm"` - Nghỉ ốm đau
- `"Nghỉ việc riêng"` - Nghỉ việc cá nhân

### 5. ⏰ Đơn xin đi trễ - về sớm (`don_xin_di_tre_ve_som`)

```json
{
  "type": "don_xin_di_tre_ve_som",
  "title": "Đơn xin đi trễ - về sớm",
  "content": "Tôi xin được điều chỉnh giờ làm việc...",
  "form_data": {
    "ngay_ap_dung": "2025-10-25",
    "loai_don": "di_tre",
    "gio_vao_binh_thuong": "08:00",
    "gio_vao_mong_muon": "09:30",
    "gio_ra_binh_thuong": "17:00",
    "gio_ra_mong_muon": "17:00",
    "so_gio_lam_bu": 1.5,
    "cach_lam_bu": "Làm thêm 1.5h vào ngày hôm sau",
    "ly_do": "Đưa con đi khám bệnh",
    "ghi_chu": "Chỉ áp dụng 1 ngày"
  }
}
```

**Loại đơn:**

- `"di_tre"` - Đi trễ
- `"ve_som"` - Về sớm
- `"ca_hai"` - Cả đi trễ và về sớm

---

## 📤 RESPONSE FORMAT

### ✅ Success Response

```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "type": "giay_uy_quyen",
    "title": "Đơn ủy quyền",
    "content": "Nội dung đơn",
    "form_data": {...},
    "digital_signature_delegator": "digital_signatures/digital_signature_delegator_EMP001_1696147800.png",
    "digital_signature_authorized": null,
    "digital_signature_applicant": null,
    "digital_signature_supervisor": null,
    "digital_signature_manager": null,
    "status": "pending",
    "approved_by": null,
    "rejection_reason": null,
    "submitted_at": "2025-10-01 10:30:00",
    "approved_at": "2025-10-01 10:30:00",
    "created_at": "2025-10-01 10:30:00",
    "updated_at": "2025-10-01 10:30:00",
    "employee": {
      "id": "EMP001",
      "name": "Nguyễn Văn A"
    },
    "approved_by_employee": null
  }
}
```

### ❌ Error Response

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "error": "Chi tiết lỗi"
}
```

---

## ✍️ CHỮ KÝ ĐIỆN TỬ

### � 5 Loại Chữ Ký

| Field Name                     | Description               | Áp dụng cho          |
| ------------------------------ | ------------------------- | -------------------- |
| `digital_signature_delegator`  | Chữ ký bên ủy quyền       | **Chỉ** đơn ủy quyền |
| `digital_signature_authorized` | Chữ ký bên được ủy quyền  | **Chỉ** đơn ủy quyền |
| `digital_signature_applicant`  | Chữ ký người làm đơn      | Các đơn khác         |
| `digital_signature_supervisor` | Chữ ký tổ trưởng/giám sát | Các đơn khác         |
| `digital_signature_manager`    | Chữ ký quản lý/phê duyệt  | Các đơn khác         |

### 📁 File Requirements

| Property          | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **File types**    | JPG, JPEG, PNG, GIF, SVG                             |
| **Max file size** | 2MB per file                                         |
| **Storage path**  | `storage/app/public/digital_signatures/`             |
| **File naming**   | `{field_name}_{employee_id}_{timestamp}.{extension}` |

### 🔒 Security Features

- File được lưu trữ riêng biệt theo employee_id và loại chữ ký
- Tự động xóa file cũ khi upload file mới cho cùng loại chữ ký
- Tự động xóa tất cả file chữ ký khi xóa đơn
- Chỉ employee tạo đơn mới có thể thay đổi chữ ký

### 📷 API để lấy thông tin chữ ký theo loại đơn

```bash
GET /api/employee/request-forms/signature-fields?type=giay_uy_quyen
GET /api/employee/request-forms/signature-fields?type=don_xin_nghi_phep
```

### 📷 Access Digital Signatures

```bash
# Chữ ký đơn ủy quyền
GET http://domain.com/storage/digital_signatures/digital_signature_delegator_EMP001_1696147800.png
GET http://domain.com/storage/digital_signatures/digital_signature_authorized_EMP001_1696147801.png

# Chữ ký đơn khác
GET http://domain.com/storage/digital_signatures/digital_signature_applicant_EMP001_1696147802.png
GET http://domain.com/storage/digital_signatures/digital_signature_supervisor_EMP001_1696147803.png
GET http://domain.com/storage/digital_signatures/digital_signature_manager_EMP001_1696147804.png
```

### 🔄 Update Multiple Digital Signatures

```bash
curl -X PUT "http://your-domain.com/api/employee/request-forms/1" \
-H "Authorization: Bearer your_token" \
-F "digital_signature_applicant=@/path/to/applicant_signature.png" \
-F "digital_signature_supervisor=@/path/to/supervisor_signature.png"
```

---

## 🔄 STATUS CODES

| Status Code | Description           |
| ----------- | --------------------- |
| `200`       | Success               |
| `201`       | Created               |
| `400`       | Bad Request           |
| `401`       | Unauthorized          |
| `403`       | Forbidden             |
| `404`       | Not Found             |
| `422`       | Validation Error      |
| `500`       | Internal Server Error |

---

## 🚫 BUSINESS RULES

### Employee Rules:

- Chỉ xem được đơn của mình
- Chỉ sửa/xóa được đơn có status `pending`
- Không thể duyệt đơn

### Admin Rules:

- Xem được tất cả đơn của tất cả nhân viên
- Chỉ có thể duyệt/từ chối đơn có status `pending`
- Khi từ chối đơn phải có lý do (`rejection_reason`)
- Khi duyệt đơn có thể upload chữ ký quản lý (`digital_signature_supervisor`, `digital_signature_manager`)

---

## 🔒 MIDDLEWARE

| Middleware               | Description                    |
| ------------------------ | ------------------------------ |
| `auth:sanctum`           | Laravel Sanctum authentication |
| `check.token.expiration` | Kiểm tra token expiration      |
| `api.authEmployees`      | Middleware cho Employee        |
| `api.authAdmin`          | Middleware cho Admin           |

---

## 📝 EXAMPLES

### Employee tạo đơn nghỉ phép (JSON):

```bash
curl -X POST "http://your-domain.com/api/employee/request-forms" \
-H "Authorization: Bearer your_token" \
-H "Content-Type: application/json" \
-d '{
  "type": "don_xin_nghi_phep",
  "title": "Đơn xin nghỉ phép về quê",
  "content": "Tôi xin được nghỉ phép để về quê thăm gia đình",
  "form_data": {
    "ngay_nghi_tu": "2025-10-20",
    "ngay_nghi_den": "2025-10-22",
    "so_ngay_nghi": 3,
    "loai_nghi_phep": "Nghỉ phép năm",
    "ly_do": "Về quê thăm gia đình"
  }
}'
```

### Employee tạo đơn ủy quyền với chữ ký:

```bash
curl -X POST "http://your-domain.com/api/employee/request-forms" \
-H "Authorization: Bearer your_token" \
-F "type=giay_uy_quyen" \
-F "title=Đơn ủy quyền làm việc" \
-F "content=Tôi xin ủy quyền cho..." \
-F 'form_data={"nguoi_duoc_uy_quyen":"Nguyễn Văn A","cong_viec":"Ký hợp đồng"}' \
-F "digital_signature_delegator=@/path/to/delegator_signature.png" \
-F "digital_signature_authorized=@/path/to/authorized_signature.png"
```

### Employee tạo đơn nghỉ phép với chữ ký:

```bash
curl -X POST "http://your-domain.com/api/employee/request-forms" \
-H "Authorization: Bearer your_token" \
-F "type=don_xin_nghi_phep" \
-F "title=Đơn xin nghỉ phép về quê" \
-F "content=Tôi xin được nghỉ phép để về quê thăm gia đình" \
-F 'form_data={"ngay_nghi_tu":"2025-10-20","ngay_nghi_den":"2025-10-22","so_ngay_nghi":3,"loai_nghi_phep":"Nghỉ phép năm","ly_do":"Về quê thăm gia đình"}' \
-F "digital_signature_applicant=@/path/to/applicant_signature.png" \
-F "digital_signature_supervisor=@/path/to/supervisor_signature.png" \
-F "digital_signature_manager=@/path/to/manager_signature.png"
```

### Admin duyệt đơn (không có chữ ký):

```bash
curl -X POST "http://your-domain.com/api/request-forms/1/approve" \
-H "Authorization: Bearer admin_token" \
-H "Content-Type: application/json" \
-d '{
  "action": "approve"
}'
```

### Admin duyệt đơn (có chữ ký quản lý):

```bash
curl -X POST "http://your-domain.com/api/request-forms/1/approve" \
-H "Authorization: Bearer admin_token" \
-F "action=approve" \
-F "digital_signature_supervisor=@supervisor_signature.png" \
-F "digital_signature_manager=@manager_signature.png"
```

### Admin từ chối đơn:

```bash
curl -X POST "http://your-domain.com/api/request-forms/1/approve" \
-H "Authorization: Bearer admin_token" \
-H "Content-Type: application/json" \
-d '{
  "action": "reject",
  "rejection_reason": "Không đủ số ngày phép năm còn lại"
}'
```

---

**📅 Last Updated:** October 1, 2025  
**📋 Version:** 1.0.0  
**👨‍💻 Created by:** Development Team

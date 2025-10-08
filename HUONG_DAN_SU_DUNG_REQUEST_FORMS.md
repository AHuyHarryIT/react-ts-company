# 📋 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG ĐƠN YÊU CẦU

## 🎯 MỤC LỤC

1. [Dành cho Nhân viên](#1-dành-cho-nhân-viên)
2. [Dành cho Tổ trưởng (Supervisor)](#2-dành-cho-tổ-trưởng-supervisor)
3. [Dành cho Quản lý (Manager/Admin)](#3-dành-cho-quản-lý-manageradmin)
4. [Các loại đơn](#4-các-loại-đơn)
5. [Quy trình duyệt đơn](#5-quy-trình-duyệt-đơn)

---

## 1. DÀNH CHO NHÂN VIÊN

### 📝 Tạo đơn mới

1. Vào menu **"Đơn Yêu Cầu"**
2. Click nút **"Tạo đơn mới"**
3. Chọn **loại đơn** cần tạo
4. Điền **thông tin** theo form
5. **Ký tên** (vẽ chữ ký hoặc upload ảnh)
6. Click **"Tạo đơn"**

### 👁️ Xem danh sách đơn

- **Tab "Đơn Yêu Cầu"**: Xem tất cả đơn đã tạo
- **Trạng thái**:
  - 🟡 **Chờ duyệt**: Đơn đang chờ tổ trưởng/quản lý ký
  - 🟢 **Đã duyệt**: Đơn đã được phê duyệt
  - 🔴 **Từ chối**: Đơn bị từ chối (xem lý do trong chi tiết)
  - 🔵 **Đã ký ủy quyền**: Người được ủy quyền đã ký (chỉ đơn Giấy ủy quyền)

### ✏️ Chỉnh sửa / Xóa đơn

- ✅ **Có thể sửa/xóa**: Khi đơn vừa tạo, **chưa có ai ký**
- ❌ **KHÔNG thể sửa/xóa**: Khi tổ trưởng hoặc quản lý **đã ký**

### 🖊️ Ký đơn Giấy ủy quyền

**Nếu bạn là người được ủy quyền:**

1. Vào tab **"Duyệt Đơn Ủy Quyền"**
2. Tìm đơn có tên bạn
3. Click **"Ký đơn"**
4. Vẽ hoặc upload chữ ký
5. Xác nhận

---

## 2. DÀNH CHO TỔ TRƯỞNG (SUPERVISOR)

### 🔍 Truy cập

- Menu: **"Quản lý đơn yêu cầu"** `/request-forms`
- Chỉ thấy **đơn của nhân viên trong tổ mình**

### ✅ Duyệt đơn

1. Click nút **👁️ Xem** để xem chi tiết đơn
2. Kiểm tra thông tin
3. Click nút **✅ Duyệt đơn**
4. **Vẽ hoặc upload chữ ký**
5. Click **"Ký và Duyệt"**

> ⚠️ **Lưu ý**: Sau khi tổ trưởng ký, đơn sẽ chuyển sang chờ **Quản lý** ký tiếp.

### ❌ Từ chối đơn

1. Click nút **❌ Từ chối**
2. Nhập **lý do từ chối**
3. Click **"Xác nhận từ chối"**

> ⚠️ **Quan trọng**:
>
> - Chỉ có thể từ chối khi **chưa ai ký**
> - Sau khi ký rồi thì **KHÔNG thể từ chối** nữa

### 🚫 Hạn chế

- **KHÔNG xem** được đơn **Giấy ủy quyền**
- **KHÔNG sửa/xóa** đơn của nhân viên
- Sau khi ký rồi **KHÔNG thấy nút "Duyệt đơn"** nữa (chờ quản lý ký)

---

## 3. DÀNH CHO QUẢN LÝ (MANAGER/ADMIN)

### 🔍 Truy cập

- Menu: **"Quản lý đơn yêu cầu"** `/request-forms`
- Thấy **TẤT CẢ các đơn** (bao gồm Giấy ủy quyền)

### ✅ Duyệt đơn (Ký tiếp sau Tổ trưởng)

1. Xem đơn đã có **chữ ký Tổ trưởng**
2. Click **✅ Duyệt đơn**
3. **Vẽ hoặc upload chữ ký**
4. Click **"Ký và Duyệt"**

> ✅ Sau khi quản lý ký → Đơn chuyển sang trạng thái **"Đã duyệt"**

### ✅ Duyệt đơn Giấy ủy quyền

**Đơn Giấy ủy quyền đặc biệt:**

- Nhân viên và người được ủy quyền **ký trước**
- Quản lý **duyệt sau** (không cần ký)
- Click **"Duyệt đơn"** để phê duyệt

### ❌ Từ chối đơn

- **Có thể từ chối** khi chưa có chữ ký nào
- **KHÔNG thể từ chối** sau khi Tổ trưởng đã ký (logic đã khóa)

### 🗂️ Lọc và tìm kiếm

- **Lọc theo**:
  - Loại đơn
  - Trạng thái
  - Tổ trưởng
  - Nhân viên
- **Tìm kiếm**: Theo tên nhân viên, nội dung

### 🔄 Làm mới dữ liệu

- Click nút **"Làm mới"**
- Hoặc dữ liệu tự động cập nhật mỗi **5 giây**

---

## 4. CÁC LOẠI ĐƠN

### 📄 1. Giấy ủy quyền

- **Mục đích**: Ủy quyền công việc cho người khác
- **Quy trình**: Người ủy quyền ký → Người được ủy quyền ký → Admin duyệt
- **Chữ ký**: 2 chữ ký (người ủy quyền + người được ủy quyền)

### 📄 2. Đơn xin nghỉ phép

- **Thông tin**: Ngày nghỉ, lý do
- **Quy trình**: Nhân viên nộp → Tổ trưởng ký → Quản lý ký
- **Chữ ký**: 3 chữ ký (nhân viên + tổ trưởng + quản lý)

### 📄 3. Đơn xin từ chức

- **Thông tin**: Ngày từ chức, lý do
- **Quy trình**: Nhân viên nộp → Tổ trưởng ký → Quản lý ký
- **Chữ ký**: 3 chữ ký

### 📄 4. Đơn xin nghỉ việc

- **Thông tin**: Ngày nghỉ việc, lý do
- **Quy trình**: Nhân viên nộp → Tổ trưởng ký → Quản lý ký
- **Chữ ký**: 3 chữ ký

### 📄 5. Đơn xin đi trễ/về sớm

- **Thông tin**: Loại (đi trễ/về sớm/cả hai), ngày, giờ, lý do
- **Quy trình**: Nhân viên nộp → Tổ trưởng ký → Quản lý ký
- **Chữ ký**: 3 chữ ký

---

## 5. QUY TRÌNH DUYỆT ĐƠN

### 🔄 Quy trình đơn thường (4 loại đơn)

```
1. NHÂN VIÊN tạo đơn + ký
   ↓
2. TỔ TRƯỞNG xem và ký
   ↓
3. QUẢN LÝ xem và ký
   ↓
4. ✅ ĐƠN ĐƯỢC DUYỆT
```

### 🔄 Quy trình đơn Giấy ủy quyền

```
1. NHÂN VIÊN (người ủy quyền) tạo đơn + ký
   ↓
2. NGƯỜI ĐƯỢC ỦY QUYỀN ký
   ↓
3. ADMIN/QUẢN LÝ duyệt (không cần ký)
   ↓
4. ✅ ĐƠN ĐƯỢC DUYỆT
```

### 🚫 Quy trình từ chối

```
- Tổ trưởng/Quản lý có thể TỪ CHỐI khi:
  ✅ Đơn CHƯA có chữ ký nào

- KHÔNG thể từ chối khi:
  ❌ Tổ trưởng đã ký (chỉ cho phép Quản lý ký tiếp)
  ❌ Quản lý đã ký
  ❌ Đã có bất kỳ chữ ký nào
```

---

## 📊 BẢNG PHÂN QUYỀN

| Chức năng         | Nhân viên     | Tổ trưởng         | Quản lý         |
| ----------------- | ------------- | ----------------- | --------------- |
| Tạo đơn           | ✅            | ❌                | ❌              |
| Xem đơn của mình  | ✅            | ✅ (đơn trong tổ) | ✅ (tất cả)     |
| Sửa/Xóa đơn       | ✅ (chưa ký)  | ❌                | ❌              |
| Ký đơn thường     | ✅ (chữ ký 1) | ✅ (chữ ký 2)     | ✅ (chữ ký 3)   |
| Ký đơn ủy quyền   | ✅            | ❌                | ❌ (chỉ duyệt)  |
| Từ chối đơn       | ❌            | ✅ (chưa ai ký)   | ✅ (chưa ai ký) |
| Xem lý do từ chối | ✅            | ✅                | ✅              |

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 🔒 Bảo mật chữ ký

- Chữ ký điện tử có **giá trị pháp lý**
- **KHÔNG chia sẻ** tài khoản cho người khác ký thay

### 📝 Quy định chung

1. **Kiểm tra kỹ** thông tin trước khi ký
2. Sau khi ký **KHÔNG thể chỉnh sửa**
3. Đơn bị từ chối **không thể khôi phục**, phải tạo đơn mới
4. Nếu sai thông tin trước khi ai ký → **Xóa và tạo lại**
5. Nếu sai thông tin sau khi có người ký → **Liên hệ admin**

### 🔄 Cập nhật dữ liệu

- Tự động làm mới mỗi **5 giây**
- Click nút **"Làm mới"** để cập nhật ngay
- **Hard refresh** (Ctrl + F5) nếu gặp lỗi hiển thị

### 📱 Thông báo

- Nhận thông báo khi đơn được duyệt/từ chối
- Nhận thông báo khi có đơn cần ký (nếu là người được ủy quyền)

---

## 🆘 HỖ TRỢ

**Gặp vấn đề?**

- Liên hệ IT Support
- Email: support@company.com
- Hotline: 1900-xxxx

---

**Cập nhật lần cuối: 08/10/2025**

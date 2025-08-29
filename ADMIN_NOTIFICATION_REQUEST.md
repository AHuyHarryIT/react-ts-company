# Tính Năng Yêu Cầu Quyền Thông Báo Tự Động Cho Admin

## Mô tả

Hệ thống tự động yêu cầu quyền thông báo khi admin đăng nhập lần đầu, giúp đảm bảo admin không bỏ lỡ các thông báo quan trọng như yêu cầu duyệt tem từ nhân viên.

## Cách hoạt động

### 1. Khi Admin Đăng Nhập

- Hệ thống kiểm tra vai trò user (chỉ admin)
- Kiểm tra trạng thái quyền thông báo hiện tại
- Nếu chưa có quyền và chưa từng hỏi → hiển thị modal sau 2 giây
- Nếu đã từ chối và chưa qua 24h → không hỏi lại

### 2. UI Components

- **Modal yêu cầu quyền**: Hiển thị tự động khi cần
- **Indicator trong header**: Icon bell cho admin theo dõi trạng thái
- **Trang demo**: `/admin/notification-demo` để test tính năng

### 3. Files đã tạo/cập nhật

#### Hooks:

- `src/hooks/useNotificationPermission.ts` - Hook chính quản lý quyền thông báo
- `src/hooks/useAdminNotificationRequest.ts` - Hook chuyên dụng cho admin login

#### Components:

- `src/components/common/AdminNotificationRequestModal.tsx` - Modal yêu cầu quyền
- `src/components/common/NotificationStatusIndicator.tsx` - Indicator trong header

#### Pages:

- `src/pages/admin/NotificationDemo.tsx` - Trang demo và test
- `src/routes/_authenticated/admin/notification-demo.tsx` - Route cho trang demo

#### Layout Updates:

- `src/layouts/AppLayout.tsx` - Tích hợp modal yêu cầu quyền
- `src/partials/Header.tsx` - Thêm indicator cho admin

## Storage

- `admin_notification_requested`: Đánh dấu đã yêu cầu
- `admin_notification_request_time`: Thời gian yêu cầu cuối

## Test

Truy cập `/admin/notification-demo` để test các tính năng và xem cách hoạt động.

## Lưu ý

- Chỉ admin mới thấy modal và indicator
- Không hỏi lại nếu đã từ chối trong vòng 24h
- Modal hiển thị sau 2 giây để UI ổn định
- Tương thích với hệ thống thông báo hiện tại

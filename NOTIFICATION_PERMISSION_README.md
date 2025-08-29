# Hệ thống Yêu cầu Quyền Thông báo

Hệ thống này cung cấp các component và hook để yêu cầu quyền thông báo từ người dùng một cách thân thiện và dễ sử dụng.

## Cấu trúc File

```
src/
├── hooks/
│   └── useNotificationPermission.ts          # Hook chính để quản lý quyền thông báo
├── components/
│   └── common/
│       ├── NotificationPermissionCard.tsx    # Card hiển thị trạng thái và yêu cầu quyền
│       ├── NotificationPermissionModal.tsx   # Modal yêu cầu quyền
│       └── NotificationPermissionButton.tsx  # Button đơn giản yêu cầu quyền
├── utils/
│   └── notificationUtil.ts                   # Các utility function cho thông báo
└── pages/
    └── admin/
        └── NotificationPermissionDemo.tsx    # Trang demo các tính năng
```

## Tính năng

### 1. Hook: `useNotificationPermission`

Hook chính để quản lý trạng thái quyền thông báo:

```typescript
const {
  permission, // 'default' | 'granted' | 'denied'
  isSupported, // boolean - trình duyệt có hỗ trợ không
  requestPermission, // function - yêu cầu quyền
  isLoading // boolean - đang yêu cầu quyền
} = useNotificationPermission();
```

**Ví dụ sử dụng:**

```typescript
import { useNotificationPermission } from '@hooks/useNotificationPermission';

function MyComponent() {
  const { permission, requestPermission } = useNotificationPermission();

  const handleRequest = async () => {
    const result = await requestPermission();
    console.log('Kết quả:', result);
  };

  return (
    <button onClick={handleRequest}>
      Trạng thái: {permission}
    </button>
  );
}
```

### 2. Component: `NotificationPermissionCard`

Card hiển thị đầy đủ thông tin về quyền thông báo:

```typescript
<NotificationPermissionCard
  title="Quyền thông báo"
  description="Cho phép ứng dụng gửi thông báo..."
  onPermissionGranted={() => console.log('Đã cấp quyền')}
  onPermissionDenied={() => console.log('Đã từ chối')}
  showStatusAlert={true}
/>
```

**Props:**

- `title?: string` - Tiêu đề card
- `description?: string` - Mô tả
- `onPermissionGranted?: () => void` - Callback khi cấp quyền
- `onPermissionDenied?: () => void` - Callback khi từ chối
- `showStatusAlert?: boolean` - Hiển thị alert trạng thái

### 3. Component: `NotificationPermissionButton`

Button đơn giản để yêu cầu quyền:

```typescript
<NotificationPermissionButton
  variant="primary"
  showTestButton={true}
  onPermissionGranted={() => console.log('Đã cấp quyền')}
>
  Cho phép thông báo
</NotificationPermissionButton>
```

**Props:**

- `variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text'`
- `size?: 'small' | 'middle' | 'large'`
- `showTestButton?: boolean` - Hiển thị button thử nghiệm
- `onPermissionGranted?: () => void`
- `onPermissionDenied?: () => void`
- `children?: React.ReactNode` - Nội dung button

### 4. Component: `NotificationPermissionModal`

Modal để yêu cầu quyền thông báo:

```typescript
<NotificationPermissionModal
  open={modalOpen}
  onCancel={() => setModalOpen(false)}
  title="Cấp quyền thông báo"
  content="Ứng dụng muốn gửi thông báo..."
  onPermissionGranted={() => console.log('Đã cấp quyền')}
  onPermissionDenied={() => console.log('Đã từ chối')}
/>
```

**Props:**

- `open: boolean` - Trạng thái hiển thị modal
- `onCancel: () => void` - Callback khi đóng modal
- `title?: string` - Tiêu đề modal
- `content?: string` - Nội dung modal
- `onPermissionGranted?: () => void`
- `onPermissionDenied?: () => void`

### 5. Utilities

#### `sendNotification(title, options?)`

Gửi thông báo nếu đã có quyền:

```typescript
import { sendNotification } from '@utils/notificationUtil';

sendNotification('Tiêu đề', {
  body: 'Nội dung thông báo',
  icon: '/logo.svg',
  data: { type: 'custom' }
});
```

#### `isNotificationSupported()`

Kiểm tra trình duyệt có hỗ trợ thông báo không:

```typescript
import { isNotificationSupported } from '@utils/notificationUtil';

if (isNotificationSupported()) {
  // Trình duyệt hỗ trợ thông báo
}
```

#### `getNotificationPermission()`

Lấy trạng thái quyền hiện tại:

```typescript
import { getNotificationPermission } from '@utils/notificationUtil';

const permission = getNotificationPermission(); // 'default' | 'granted' | 'denied'
```

## Cách tích hợp

### Bước 1: Thêm vào component

```typescript
import { NotificationPermissionCard } from '@components/common/NotificationPermissionCard';

function SettingsPage() {
  return (
    <div>
      <h1>Cài đặt</h1>
      <NotificationPermissionCard
        onPermissionGranted={() => {
          // Lưu cài đặt, hiển thị thông báo thành công
        }}
      />
    </div>
  );
}
```

### Bước 2: Sử dụng trong header/navbar

```typescript
import { NotificationPermissionButton } from '@components/common/NotificationPermissionButton';

function Header() {
  return (
    <div className="header">
      <NotificationPermissionButton size="small" />
    </div>
  );
}
```

### Bước 3: Modal khi lần đầu truy cập

```typescript
import { useState, useEffect } from 'react';
import { NotificationPermissionModal } from '@components/common/NotificationPermissionModal';
import { useNotificationPermission } from '@hooks/useNotificationPermission';

function App() {
  const [showModal, setShowModal] = useState(false);
  const { permission } = useNotificationPermission();

  useEffect(() => {
    // Hiển thị modal nếu chưa được hỏi quyền
    if (permission === 'default') {
      setShowModal(true);
    }
  }, [permission]);

  return (
    <div>
      <NotificationPermissionModal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onPermissionGranted={() => setShowModal(false)}
        onPermissionDenied={() => setShowModal(false)}
      />
    </div>
  );
}
```

## Demo

Truy cập trang demo tại: `/admin/notification-demo` để xem các component hoạt động.

## Lưu ý

1. **Trình duyệt hỗ trợ**: Tất cả trình duyệt hiện đại đều hỗ trợ Notification API
2. **HTTPS**: Thông báo chỉ hoạt động trên HTTPS (hoặc localhost)
3. **Quyền người dùng**: Một khi bị từ chối, cần hướng dẫn người dùng cấp quyền thủ công
4. **UX**: Nên giải thích rõ lý do cần quyền thông báo trước khi yêu cầu
5. **Fallback**: Luôn có phương án dự phòng khi người dùng từ chối quyền

## Tùy chỉnh

### Thay đổi icon thông báo

Chỉnh sửa trong `notificationUtil.ts`:

```typescript
sendNotification('Tiêu đề', {
  icon: '/custom-icon.svg', // Thay đổi icon
  badge: '/badge.svg' // Icon nhỏ
});
```

### Thêm âm thanh thông báo

```typescript
// Trong public/sounds/ đã có notification.mp3
const audio = new Audio('/sounds/notification.mp3');
audio.play().catch(() => {
  // Xử lý lỗi nếu không thể phát âm thanh
});
```

### Styling tùy chỉnh

Các component sử dụng Ant Design, có thể override CSS:

```css
.notification-permission-card .ant-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

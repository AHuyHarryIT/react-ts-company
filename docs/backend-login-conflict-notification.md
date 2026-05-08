# Backend Request: Thong bao khi tai khoan dang nhap o noi khac

## Muc tieu

Khi user da dang nhap tren mot trinh duyet/thiet bi A, sau do cung tai khoan do dang nhap tren trinh duyet/thiet bi B, backend can thong bao cho phien A de frontend hien notification:

> Tai khoan cua ban dang duoc dang nhap o mot noi khac.

Hien frontend khong the tu phat hien case nay neu khac browser/thiet bi, vi token/session dang nam rieng trong tung browser. Can backend quan ly session hien tai cua user va gui event realtime hoac cung cap API de frontend poll.

## Gia dinh hien tai

- Frontend dung Bearer token trong `Authorization`.
- Frontend da co Laravel Echo + Pusher.
- Frontend co the lang nghe private channel neu backend ho tro `/broadcasting/auth`.
- Mong muon ban dau la thong bao cho phien cu. Viec co logout phien cu ngay hay khong can BE/PM chot them.

## Phuong an uu tien: Realtime qua Laravel Echo/Pusher

### 1. Backend tao `session_id` moi moi lan login

Moi lan login thanh cong, backend tao mot `session_id` duy nhat cho lan dang nhap do, vi du UUID.

Backend nen luu tren user hoac bang sessions rieng:

- `user_id`
- `session_id`
- `token_id` hoac token hash neu co
- `user_agent`
- `ip_address`
- `last_login_at`
- `is_current` hoac `revoked_at`

Neu chi can single active session, co the luu nhanh tren users:

- `current_session_id`
- `last_login_at`

### 2. Login response tra them `session_id`

Endpoint:

```http
POST /api/login
```

Response hien tai can them field:

```json
{
  "id": "123",
  "name": "Nguyen Van A",
  "role_id": 1,
  "role_name": "Admin",
  "token": "bearer-token",
  "session_id": "9ecf8d3b-1f4d-4d56-8e23-9f9f6ad1e001"
}
```

Frontend se luu `session_id` nay de so sanh voi event nhan duoc.

### 3. Khi co login moi, broadcast event cho user do

Sau khi user login thanh cong o browser B:

- Backend cap nhat `current_session_id` thanh session moi.
- Backend broadcast event toi channel rieng cua user.
- Payload event gom `session_id` moi.
- Browser A dang nghe channel se thay `session_id` trong event khac voi `session_id` hien tai va hien notification.

Channel de xuat:

```text
private-auth.user.{userId}
```

Event de xuat:

```text
.auth.logged-in-elsewhere
```

Payload de xuat:

```json
{
  "session_id": "9ecf8d3b-1f4d-4d56-8e23-9f9f6ad1e001",
  "message": "Tai khoan cua ban vua duoc dang nhap o mot noi khac.",
  "logged_in_at": "2026-05-08T05:30:00.000000Z",
  "ip_address": "optional",
  "user_agent": "optional"
}
```

### 4. Vi du Laravel event

```php
class UserLoggedInElsewhere implements ShouldBroadcast
{
    public function __construct(
        public User $user,
        public string $sessionId
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('auth.user.' . $this->user->id);
    }

    public function broadcastAs(): string
    {
        return 'auth.logged-in-elsewhere';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'message' => 'Tai khoan cua ban vua duoc dang nhap o mot noi khac.',
            'logged_in_at' => now()->toISOString(),
        ];
    }
}
```

### 5. Private channel authorization

Backend can cho user chi subscribe duoc channel cua chinh minh:

```php
Broadcast::channel('auth.user.{userId}', function ($user, $userId) {
    return (string) $user->id === (string) $userId;
});
```

Frontend se can Echo config gui Bearer token khi authorize private channel. Backend vui long dam bao endpoint broadcast auth dung token hien tai:

```http
POST /broadcasting/auth
Authorization: Bearer {token}
```

## Phuong an fallback: Polling API

Neu realtime chua san sang, backend co the lam API de frontend poll moi 15-30 giay.

Endpoint de xuat:

```http
GET /api/auth/session-status
Authorization: Bearer {token}
```

Response khi session hien tai van moi nhat:

```json
{
  "valid": true,
  "current_session_id": "session-cua-token-hien-tai",
  "latest_session_id": "session-cua-token-hien-tai",
  "logged_in_elsewhere": false
}
```

Response khi tai khoan da login o noi khac:

```json
{
  "valid": true,
  "current_session_id": "session-cua-token-hien-tai",
  "latest_session_id": "session-moi-hon",
  "logged_in_elsewhere": true,
  "message": "Tai khoan cua ban vua duoc dang nhap o mot noi khac."
}
```

## Neu muon logout phien cu

Can chot hanh vi mong muon:

1. Chi thong bao: phien cu van dung duoc den khi token het han.
2. Thong bao va bat dang xuat: backend revoke token/session cu, cac request tiep theo tra `401`.
3. Thong bao va cho user bam "Dang nhap lai": frontend tu clear auth khi user xac nhan.

Khuyen nghi: neu muc tieu la bao mat, chon phuong an 2. Neu chi can nhac user, chon phuong an 1 hoac 3.

Neu backend revoke token cu, response `401` nen co ma loi ro de frontend hien dung message:

```json
{
  "message": "Tai khoan cua ban da duoc dang nhap o noi khac.",
  "code": "LOGGED_IN_ELSEWHERE"
}
```

## Tieu chi nghiem thu

- Login lan 1 tren browser A thanh cong va FE nhan `session_id`.
- Login lan 2 cung tai khoan tren browser B thanh cong va BE tao `session_id` moi.
- Browser A nhan realtime event `.auth.logged-in-elsewhere` tren channel `private-auth.user.{userId}`.
- Payload event co `session_id` cua lan login moi.
- Browser B khong tu hien canh bao cho chinh session moi.
- Neu BE revoke phien cu, request API tu browser A sau do tra `401` voi `code = LOGGED_IN_ELSEWHERE`.
- Private channel khong cho user khac subscribe vao `auth.user.{userId}`.

## Thong tin FE can de tich hop

Backend vui long xac nhan:

- Ten field trong login response: co dung `session_id` khong?
- Channel name chinh xac.
- Event name chinh xac.
- Payload event chinh xac.
- Co revoke token cu khong, hay chi thong bao?
- Neu revoke, ma loi API khi token cu bi vo hieu hoa la gi?

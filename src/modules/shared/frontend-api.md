# Frontend API — Password Management

หน้านี้สำหรับทีมหน้าบ้าน (HAL-ERP frontend) เพื่อเชื่อมต่อ 3 endpoints ใหม่ของระบบจัดการรหัสผ่าน

- **Base URL**: `https://<hal-erp-host>/api`
- **Content-Type**: `application/json`
- **i18n**: เซิร์ฟเวอร์เลือกข้อความตาม header `Accept-Language` (`en` หรือ `lo`) — error message จะถูกแปลให้อัตโนมัติ
- **Response wrapper**: response ทุกตัวจะถูกห่อด้วย `TransformResponseInterceptor` ของระบบ (เหมือน endpoint อื่น)

---

## 1. Change password (authenticated)

ผู้ใช้ที่ login แล้วเปลี่ยนรหัสผ่านของตัวเอง — ต้องระบุรหัสปัจจุบัน

- **Method/Path**: `PUT /api/users/change-password`
- **Auth**: ต้องมี JWT ใน header `Authorization: Bearer <access_token>`
- **Body**:

```json
{
  "old_password": "currentSecret123",
  "new_password": "brandNewSecret456",
  "confirm_password": "brandNewSecret456"
}
```

| Field | Type | Rule |
| --- | --- | --- |
| `old_password` | string | required, length 6–255 |
| `new_password` | string | required, length 6–255 |
| `confirm_password` | string | required, ต้องเท่ากับ `new_password` |

- **Success (200)**:

```json
{ "message": "Password has been changed successfully" }
```

- **Errors**:

| HTTP | i18n key | เกิดเมื่อ |
| --- | --- | --- |
| `401` | `errors.unauthorized` | ไม่มี/ผิด JWT |
| `400` | `errors.incorrect_password` | `old_password` ไม่ตรงกับ hash ใน DB |
| `400` | `validation.PASSWORD_MISMATCH` | `confirm_password !== new_password` |
| `400` | `validation.PASSWORD_LENGTH` | new password สั้นหรือยาวเกิน |
| `400` | `validation.IS_NOT_EMPTY` / `IS_DEFINED` | ขาดฟิลด์ |

> **BREAKING (จากของเดิม):** endpoint เดิม `PUT /api/users/change-password/:id` ถูกลบทิ้ง — เปลี่ยนเป็น `PUT /api/users/change-password` ไม่มี `:id` และ user id อ่านจาก JWT

---

## 2. Forgot password (public)

ผู้ใช้ที่ลืมรหัสผ่านขอลิงก์รีเซ็ตทางอีเมล — endpoint นี้ตอบ `200` เสมอ (ไม่ leak ว่า email มีในระบบหรือไม่)

- **Method/Path**: `POST /api/users/forgot-password`
- **Auth**: ไม่ต้อง (`@Public()`)
- **Body**:

```json
{ "email": "user@example.com" }
```

| Field | Type | Rule |
| --- | --- | --- |
| `email` | string | required, valid email format |

- **Success (200)** — เหมือนกันทุกกรณี:

```json
{ "message": "If the email is registered, a reset link has been sent" }
```

- **Errors**:

| HTTP | i18n key | เกิดเมื่อ |
| --- | --- | --- |
| `400` | `validation.IS_EMAIL` | format อีเมลผิด |
| `400` | `validation.IS_DEFINED` / `IS_NOT_EMPTY` | ขาดฟิลด์ |

**Behavior detail:**
- หากอีเมลมีใน DB: ระบบจะออก JWT แล้ว enqueue งานส่งอีเมล (fire-and-forget) — frontend ไม่ทราบและไม่ควรรอ
- หากอีเมลไม่มี: response เหมือนเดิม
- ลิงก์ในอีเมลคือ `https://<HAL_DOMAIN>/reset-password?token=<JWT>` — frontend ต้องรองรับ route `/reset-password` ที่อ่าน `token` จาก query string

---

## 3. Reset password (public)

ผู้ใช้คลิกลิงก์ในอีเมลแล้วตั้งรหัสผ่านใหม่

- **Method/Path**: `POST /api/users/reset-password`
- **Auth**: ไม่ต้อง (`@Public()`)
- **Body**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "new_password": "brandNewSecret456",
  "confirm_password": "brandNewSecret456"
}
```

| Field | Type | Rule |
| --- | --- | --- |
| `token` | string | required — ค่าจาก query string `token` ของลิงก์ในอีเมล |
| `new_password` | string | required, length 6–255 |
| `confirm_password` | string | required, ต้องเท่ากับ `new_password` |

- **Success (200)**:

```json
{ "message": "Password has been reset successfully" }
```

- **Errors**:

| HTTP | i18n key | เกิดเมื่อ |
| --- | --- | --- |
| `401` | `errors.invalid_or_expired_token` | token หมดอายุ, signature ผิด, `purpose !== 'reset-password'`, `iat < password_changed_at`, user.email ไม่ตรง payload, หรือ user ถูกลบ |
| `400` | `validation.PASSWORD_MISMATCH` | `confirm_password !== new_password` |
| `400` | `validation.PASSWORD_LENGTH` | new password สั้น/ยาวเกิน |
| `400` | `validation.IS_DEFINED` / `IS_NOT_EMPTY` | ขาดฟิลด์ |

---

## Token format

JWT แบบ HS256 — frontend ไม่ต้อง decode เอง, ส่งเป็น opaque string

| Claim | Value |
| --- | --- |
| `user_id` | number |
| `email` | string |
| `purpose` | `"reset-password"` |
| `iat` | issued-at (sec) |
| `exp` | expires-at (sec) |

- **Token lifetime**: 15 นาที (ค่าเริ่มต้น `RESET_PASSWORD_TOKEN_EXPIRES_IN=15m`)
- **Single-use semantics**: หลัง `reset-password` หรือ `change-password` สำเร็จ ระบบจะอัปเดต `users.password_changed_at = NOW()` — token ใด ๆ ที่ออกก่อนหน้านี้จะ invalid ทันที (ตรวจผ่าน `iat < password_changed_at`)

---

## Error response shape

ทุก error ที่ throw จาก `ManageDomainException` หรือ class-validator จะถูก format ผ่าน global filter เป็น:

```json
{
  "statusCode": 401,
  "message": "The link is invalid or has expired. Please request a new one.",
  "errorKey": "errors.invalid_or_expired_token"
}
```

(หน้าตา exact ดูจาก `CustomI18nValidationExceptionFilter` ใน `hal-erp/src/main.ts` — ถ้าทีม backend update format ใหม่ จะแจ้งล่วงหน้า)

---

## Flow diagram

```
Forgot password flow:

  Browser              hal-erp (NestJS)        hal-erp-approval        BullMQ          Mailer (SMTP)
    │                       │                       │                    │                   │
    │ POST /forgot-password │                       │                    │                   │
    ├──────────────────────▶│                       │                    │                   │
    │                       │ lookup user by email  │                    │                   │
    │                       │ (silent on miss)      │                    │                   │
    │                       │                       │                    │                   │
    │                       │ sign reset JWT        │                    │                   │
    │                       │ (purpose=reset-pwd,   │                    │                   │
    │                       │  exp=15m)             │                    │                   │
    │                       │                       │                    │                   │
    │                       │ POST /api/approval/   │                    │                   │
    │                       │ send-reset-password-  │                    │                   │
    │                       │ mail (x-secret-key)   │                    │                   │
    │                       ├──────────────────────▶│                    │                   │
    │                       │                       │ enqueue            │                   │
    │                       │                       │ SEND_RESET_        │                   │
    │                       │                       │ PASSWORD_MAIL_JOB  │                   │
    │                       │                       ├───────────────────▶│                   │
    │ 200 generic message   │ 200 generic message ◀─┤ 200 { Queued }     │                   │
    │◀──────────────────────┤                       │                    │                   │
    │                                                                    │                   │
    │                                                processor picks job │                   │
    │                                                builds resetUrl     │                   │
    │                                                = HAL_DOMAIN +      │                   │
    │                                                /reset-password?    │                   │
    │                                                token=...           │                   │
    │                                                                    ├──────────────────▶│
    │                                                                    │  render template  │
    │                                                                    │  forgot-password  │
    │                                                                    │  send via SMTP    │
    │                                                                    │                   │
    │ ◀── email arrives in inbox ──────────────────────────────────────────────────────────  │

Reset flow (after click):

  Browser              hal-erp (NestJS)
    │ GET /reset-password?token=<JWT>  (frontend route)
    │ (user enters new_password + confirm_password)
    │
    │ POST /reset-password
    ├──────────────────────▶│
    │                       │ verify JWT (signature + exp + purpose)
    │                       │ transaction:
    │                       │   - find user by payload.user_id
    │                       │   - check user.email == payload.email
    │                       │   - check payload.iat >= password_changed_at
    │                       │   - bcrypt.hash(new_password, 10)
    │                       │   - update password + password_changed_at
    │ 200 success           │
    │◀──────────────────────┤
```

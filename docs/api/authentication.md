# Beyon Authentication API

Base URL: `/api/v1/auth`

## Public Endpoints

### Register

```
POST /api/v1/auth/register
```

**Request:**
```json
{
  "name": "Gowtham",
  "email": "gowtham@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "STUDENT"
}
```

**Roles:** `STUDENT`, `INSTITUTION`, `COMPANY` (ADMIN not allowed via public registration)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "gowtham@example.com",
    "name": "Gowtham",
    "role": "STUDENT",
    "status": "PENDING_VERIFICATION",
    "emailVerified": false
  }
}
```

**Errors:**
- `400` — Validation error (invalid email, weak password, passwords don't match)
- `403` — Admin registration not allowed
- `409` — Email already exists

---

### Login

```
POST /api/v1/auth/login
```

**Request:**
```json
{
  "email": "gowtham@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "gowtham@example.com",
      "name": "Gowtham",
      "role": "STUDENT",
      "status": "ACTIVE",
      "emailVerified": true
    }
  }
}
```

**Errors:**
- `401` — Invalid credentials or too many attempts
- `403` — Account suspended/deactivated

**Rate Limit:** 5 attempts per 15 minutes per email

---

### Verify Email

```
POST /api/v1/auth/verify-email
```

**Request:**
```json
{
  "token": "raw-token-from-email"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `404` — Invalid token
- `409` — Token already used
- `401` — Token expired

---

### Resend Verification

```
POST /api/v1/auth/resend-verification
```

**Request:**
```json
{
  "email": "gowtham@example.com"
}
```

**Response (200):** Always returns success (prevents account enumeration)

---

### Forgot Password

```
POST /api/v1/auth/forgot-password
```

**Request:**
```json
{
  "email": "gowtham@example.com"
}
```

**Response (200):** Always returns success (prevents account enumeration)

---

### Reset Password

```
POST /api/v1/auth/reset-password
```

**Request:**
```json
{
  "token": "raw-reset-token",
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400` — Password validation failed
- `404` — Invalid token
- `409` — Token already used
- `401` — Token expired

---

## Protected Endpoints

Requires `Authorization: Bearer <token>` header.

### Current User

```
GET /api/v1/auth/me
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "gowtham@example.com",
    "name": "Gowtham",
    "role": "STUDENT",
    "status": "ACTIVE",
    "emailVerified": true
  }
}
```

**Errors:**
- `401` — Missing or invalid token

---

## Password Policy

- Minimum 8 characters, maximum 128
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Token Storage

- Access tokens: HTTP-only cookies (web) / Electron secure storage (desktop)
- Tokens expire after 15 minutes
- Tokens are signed with HMAC-SHA256

## Audit Events

All auth actions are logged with:
- Event type (LOGIN_SUCCESS, LOGIN_FAILURE, REGISTRATION, etc.)
- Email
- IP address
- User agent
- Timestamp

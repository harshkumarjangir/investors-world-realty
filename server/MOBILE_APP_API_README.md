# 📱 Investors World Realty — Mobile App API Guide (For Flutter Developer)

**Base URL (Local Dev):** `http://localhost:5000/api/v1`  
**Base URL (VPS/Prod):** `https://serveriwr.harshkumarjangir.in/api/v1`

> **Note:** On the VPS, the server runs on port **5001** (port 5000 is occupied by another app). The production domain handles this via Nginx reverse proxy.

---

## 🔧 Setup & Configuration

### Headers (All Requests)
```
Content-Type: application/json
Accept-Language: en  (or "hi" for Hindi)
```

### Authenticated Requests (add after login)
```
Authorization: Bearer <access_token>
```

### Response Format (All Endpoints)
```json
{
  "status": "success" | "error",
  "message": "Description",
  "data": { ... } | [ ... ] | null
}
```

### Paginated Response Format
```json
{
  "status": "success",
  "message": "Description",
  "data": [ ... ],
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 100,
  "pageSize": 20
}
```

### Error Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (token expired/missing) |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 423 | Account locked (too many failed attempts) |
| 429 | Rate limited |
| 500 | Server error |

---

## 🔐 1. Authentication

### 1.1 Login (Step 1 — Verify Credentials)
```
POST /auth/login
```
**Body:**
```json
{
  "userId": "IW100001",
  "password": "Test@1234",
  "deviceToken": "firebase_fcm_token",
  "platform": "android"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "associateId": "uuid",
    "message": "OTP sent to registered email"
  }
}
```
**Notes:**
- `deviceToken` = Firebase FCM token for push notifications
- `platform` = "android" | "ios"
- After 5 failed attempts, account locks for 30 minutes (returns 423)
- OTP is sent to the associate's registered email

---

### 1.2 Verify OTP (Step 2 — Get Tokens)
```
POST /auth/verify-otp
```
**Body:**
```json
{
  "associateId": "uuid-from-login-response",
  "otp": "123456"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "userId": "IW100001",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "status": "ACTIVE",
      "theme": "light",
      "language": "en"
    }
  }
}
```
- Access token expires in 8 hours
- Refresh token expires in 7 days

---

### 1.3 Refresh Token
```
POST /auth/refresh
```
**Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```
**Response:** Same as login (new accessToken + refreshToken)

**Flutter Implementation Note:** Use an interceptor to auto-refresh when you get 401.

---

### 1.3 Logout
```
POST /auth/logout  🔒
```
**Body:**
```json
{
  "refreshToken": "your_refresh_token",
  "deviceToken": "fcm_token_to_unregister"
}
```

---

### 1.4 Forgot Password
```
POST /auth/forgot-password
```
**Body:**
```json
{
  "identifier": "9999900001"
}
```
**Notes:** `identifier` can be phone number or email. OTP is sent to the associated email address (also logged in server console).

---

### 1.5 Reset Password (with OTP)
```
POST /auth/reset-password
```
**Body:**
```json
{
  "identifier": "9999900001",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

---

### 1.6 Change Password 🔒
```
POST /auth/change-password
```
**Body:**
```json
{
  "currentPassword": "Test@1234",
  "newPassword": "NewPass@456"
}
```

---

## 📊 2. Dashboard 🔒

### 2.1 Get Dashboard Data
```
GET /associate/dashboard
```
**Response:**
```json
{
  "data": {
    "cards": {
      "lastPayment": 5000,
      "totalPayment": 25000,
      "selfAmount": 10000,
      "totalAmount": 50000
    },
    "userDetails": {
      "joiningDate": "2024-01-15T00:00:00.000Z",
      "activationDate": "2024-01-16T00:00:00.000Z",
      "packageName": "Gold Package",
      "panNumber": "ABCDE1234F",
      "totalActivation": 12
    },
    "advancePayment": {
      "credit": 30000,
      "debit": 5000,
      "balance": 25000
    }
  }
}
```

---

### 2.2 Get Advance Payment Status
```
GET /associate/advance-payment
```
**Response:**
```json
{
  "data": {
    "credit": 30000,
    "debit": 5000,
    "balance": 25000
  }
}
```

---

### 2.3 Get Referral Link
```
GET /associate/referral-link
```
**Response:**
```json
{
  "data": {
    "referralLink": "https://investorsworld.com/register?ref=IW100001",
    "userId": "IW100001"
  }
}
```
**Flutter:** Use `share_plus` package to share this link.

---

### 2.4 Get Referral QR Code
```
GET /associate/referral-qr
```
**Response:** Returns PNG image (binary). Set `responseType: ResponseType.bytes` in Dio.

---

## 👤 3. Profile 🔒

### 3.1 Get Profile
```
GET /associate/profile
```
**Response:**
```json
{
  "data": {
    "userId": "IW100001",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "9999900001",
    "dateOfBirth": "1990-05-15",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "panNumber": "ABCDE1234F",
    "profilePhoto": "/uploads/profiles/uuid.jpg",
    "status": "ACTIVE",
    "joiningDate": "2024-01-15T00:00:00.000Z",
    "activationDate": "2024-01-16T00:00:00.000Z",
    "packageName": "Gold Package",
    "kycStatus": {
      "pan": "APPROVED",
      "aadhaar": "PENDING",
      "bank": "APPROVED"
    }
  }
}
```

---

### 3.2 Update Profile
```
PATCH /associate/profile
```
**Body:**
```json
{
  "phone": "9876543211",
  "email": "newemail@example.com",
  "address": "456 New Street",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

---

### 3.3 Upload Profile Photo
```
POST /associate/profile/photo
Content-Type: multipart/form-data
```
**Form Fields:**
- `photo` — JPEG/PNG file, max 2MB

**Flutter (Dio):**
```dart
FormData formData = FormData.fromMap({
  'photo': await MultipartFile.fromFile(filePath, filename: 'photo.jpg'),
});
await dio.post('/associate/profile/photo', data: formData);
```

---

### 3.4 Upload PAN KYC
```
POST /associate/kyc/pan
Content-Type: multipart/form-data
```
**Form Fields:**
- `document` — JPEG/PNG/PDF, max 5MB
- `documentNumber` — PAN number string (e.g., "ABCDE1234F")

---

### 3.5 Upload Aadhaar KYC
```
POST /associate/kyc/aadhaar
Content-Type: multipart/form-data
```
**Form Fields:**
- `document` — JPEG/PNG/PDF, max 5MB
- `documentNumber` — 12-digit Aadhaar number

---

### 3.6 Update Bank Details
```
POST /associate/kyc/bank
```
**Body:**
```json
{
  "accountNumber": "1234567890",
  "ifsc": "SBIN0001234",
  "bankName": "State Bank of India",
  "branch": "Main Branch"
}
```

---

## ⚙️ 4. Settings 🔒

### 4.1 Get Settings
```
GET /associate/settings
```
**Response:**
```json
{
  "data": {
    "theme": "light",
    "language": "en"
  }
}
```

### 4.2 Update Settings
```
PATCH /associate/settings
```
**Body:**
```json
{
  "theme": "dark",
  "language": "hi"
}
```
**Values:** theme = "light" | "dark", language = "en" | "hi"

---

## 🌳 5. Genealogy / Team Structure 🔒

### 5.1 Get Binary Tree
```
GET /genealogy/tree?depth=5
```
**Query Params:**
- `depth` (optional, default 5) — how many levels deep

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "IW100001",
    "name": "Rajesh Kumar",
    "status": "ACTIVE",
    "position": "LEFT",
    "level": 0,
    "leftChild": {
      "id": "uuid",
      "userId": "IW100002",
      "name": "Suresh",
      "status": "ACTIVE",
      "position": "LEFT",
      "level": 1,
      "leftChild": null,
      "rightChild": null
    },
    "rightChild": {
      "id": "uuid",
      "userId": "IW100003",
      "name": "Priya",
      "status": "ACTIVE",
      "position": "RIGHT",
      "level": 1,
      "leftChild": null,
      "rightChild": null
    }
  }
}
```

---

### 5.2 Get Downline Members
```
GET /genealogy/downline?status=ACTIVE&leg=left&level=2&page=1&pageSize=20
```
**Query Params (all optional):**
- `status` — ACTIVE | INACTIVE | SUSPENDED
- `leg` — left | right
- `level` — specific level number
- `page`, `pageSize` — pagination

**Response:** Paginated list of downline associates.

---

### 5.3 Get Sponsor Details
```
GET /genealogy/sponsor
```
**Response:**
```json
{
  "data": {
    "userId": "IW100000",
    "name": "Admin Sponsor",
    "phone": "9999900000",
    "status": "ACTIVE"
  }
}
```

---

### 5.4 Get Team Summary
```
GET /genealogy/team-summary
```
**Response:**
```json
{
  "data": {
    "totalTeam": 45,
    "activeMembers": 38,
    "inactiveMembers": 7,
    "leftTeam": 22,
    "rightTeam": 23,
    "leftVolume": 150000,
    "rightVolume": 145000
  }
}
```

---

## 💰 6. Income / Payout 🔒

### 6.1 Income Summary
```
GET /income/summary
```
**Response:**
```json
{
  "data": {
    "totalIncome": 75000,
    "directIncome": 30000,
    "levelIncome": 25000,
    "matchingIncome": 15000,
    "rewardIncome": 5000,
    "pendingIncome": 3000,
    "paidIncome": 72000
  }
}
```

---

### 6.2 Income History (Paginated)
```
GET /income/history?page=1&pageSize=20
```
**Response:** Paginated list of income records with type, amount, status, date.

---

### 6.3 Commission Calculator
```
POST /income/calculator
```
**Body:**
```json
{
  "areaInGaj": 500,
  "rank": 1
}
```
**Response:** Estimated commission breakdown based on area sold and rank slab.

**Notes:**
- Commission is gap-based: seller gets their rank's full slab %
- Uplines get the difference between their slab and previous level's slab
- President Club (rank 7) always gets flat 2% on every sale

---

## 👛 7. Wallet / Fund Section 🔒

### 7.1 Get Wallet Balance
```
GET /wallet/balance
```
**Response:**
```json
{
  "data": {
    "balance": 25000,
    "totalCredits": 75000,
    "totalDebits": 50000
  }
}
```

---

### 7.2 Fund Transfer
```
POST /wallet/transfer
```
**Body:**
```json
{
  "recipientUserId": "IW100002",
  "amount": 1000,
  "description": "Fund transfer"
}
```

---

### 7.3 Transaction History
```
GET /wallet/transactions?page=1&pageSize=20
```
**Response:** Paginated list of all wallet transactions (credits + debits).

---

### 7.4 Request Withdrawal
```
POST /wallet/withdraw
```
**Body:**
```json
{
  "amount": 5000
}
```

---

### 7.5 Withdrawal History
```
GET /wallet/withdrawals?page=1&pageSize=20
```
**Response:** Paginated list of withdrawal requests with status.

---

## 🏠 8. Properties

### 8.1 List Properties (Public — no auth needed)
```
GET /properties?location=Mumbai&minPrice=1000000&maxPrice=5000000&type=Villa&page=1&pageSize=20
```
**Query Params (all optional):**
- `location` — city/area filter
- `minPrice`, `maxPrice` — price range
- `type` — Villa, Plot, Apartment, etc.
- `page`, `pageSize`

**Response:** Paginated list with id, name, location, price, area, type, images, status.

---

### 8.2 Property Detail
```
GET /properties/:id
```
**Response:** Full property object with images[], videos[], amenities[], etc.

---

### 8.3 Property Inquiry 🔒
```
POST /properties/:id/inquiry
```
**Body:**
```json
{
  "message": "I am interested in this property. Please contact me."
}
```

---

### 8.4 Book Property 🔒
```
POST /properties/:id/book
```
**Body:**
```json
{
  "amount": 500000
}
```

---

### 8.5 My Bookings 🔒
```
GET /properties/bookings
```
**Response:** List of user's property bookings with status.

---

### 8.6 EMI Calculator (Public)
```
POST /properties/emi-calculator
```
**Body:**
```json
{
  "principal": 5000000,
  "annualRate": 8.5,
  "tenureMonths": 240
}
```
**Response:**
```json
{
  "data": {
    "emi": 43391,
    "totalPayment": 10413840,
    "totalInterest": 5413840
  }
}
```

---

## 📋 9. Registration (New Associate) 🔒

### 9.1 Validate Sponsor
```
GET /registration/validate-sponsor?sponsorId=IW100001
```
**Response:**
```json
{
  "data": {
    "valid": true,
    "sponsorName": "Rajesh Kumar",
    "sponsorUserId": "IW100001"
  }
}
```

---

### 9.2 Register New Associate
```
POST /registration/register
```
**Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "panNumber": "ABCDE1234F",
  "sponsorId": "IW100001",
  "password": "John@1234",
  "dateOfBirth": "1990-05-15"
}
```
**Notes:**
- `sponsorId` = existing associate's userId (referral code)
- No package or placement required
- Associate is created with status `INACTIVE` — requires admin approval to activate
- Sponsor must be ACTIVE and must have downline capacity based on their rank

---

### 9.3 Activate Associate (Admin Only) 🔒
```
POST /registration/activate
```
**Body:**
```json
{
  "associateId": "uuid-of-new-associate"
}
```
**Notes:**
- This is an admin-only action
- Only associates with status `INACTIVE` can be activated
- On activation: status → ACTIVE, wallet created, placed in binary tree under sponsor

---

## 🔔 10. Notifications 🔒

### 10.1 Register Device Token (call after login)
```
POST /notifications/device-token
```
**Body:**
```json
{
  "token": "fcm_device_token_string",
  "platform": "android"
}
```

---

### 10.2 Remove Device Token (call before logout)
```
DELETE /notifications/device-token
```
**Body:**
```json
{
  "token": "fcm_device_token_string"
}
```

---

### 10.3 Get Notifications
```
GET /notifications?page=1&pageSize=20
```
**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Payout Credited",
      "message": "₹5,000 has been credited to your wallet",
      "type": "PAYOUT",
      "isRead": false,
      "createdAt": "2024-06-15T10:30:00.000Z",
      "data": { "payoutId": "uuid" }
    }
  ]
}
```
**Notification Types:** PAYOUT, REGISTRATION, PROPERTY, ANNOUNCEMENT, INCOME, KYC, BOOKING, SYSTEM

---

### 10.4 Mark Notification as Read
```
PATCH /notifications/:id/read
```

---

## 📄 11. Documents 🔒

### 11.1 Download Welcome Letter
```
GET /documents/welcome-letter
```
**Response:** PDF file (binary). Use `responseType: ResponseType.bytes` in Dio.

---

### 11.2 Download Payment Receipt
```
GET /documents/receipt/:transactionId
```
**Response:** PDF file.

---

### 11.3 Download Agreement
```
GET /documents/agreement
```
**Response:** PDF file.

---

### 11.4 Get KYC Documents
```
GET /documents/kyc
```
**Response:**
```json
{
  "data": {
    "pan": { "url": "/uploads/kyc/pan-uuid.pdf", "status": "APPROVED", "number": "ABCDE1234F" },
    "aadhaar": { "url": "/uploads/kyc/aadhaar-uuid.pdf", "status": "PENDING", "number": "123456789012" },
    "bank": { "status": "APPROVED", "accountNumber": "****7890", "bankName": "SBI" }
  }
}
```

---

## 🎫 12. Support 🔒

### 12.1 List Tickets
```
GET /support/tickets?page=1&pageSize=20
```

---

### 12.2 Create Ticket
```
POST /support/tickets
```
**Body:**
```json
{
  "subject": "Cannot login to my account",
  "description": "I am getting invalid credentials error even with correct password."
}
```

---

### 12.3 Get Ticket Detail
```
GET /support/tickets/:id
```
**Response:** Ticket with all messages (conversation thread).

---

### 12.4 Reply to Ticket
```
POST /support/tickets/:id/reply
```
**Body:**
```json
{
  "message": "I have tried resetting my password but still facing the issue."
}
```

---

## 🌐 13. Public Endpoints (No Auth Required)

### 13.1 Health Check
```
GET /public/health
```

### 13.2 Public Properties
```
GET /public/properties?location=Mumbai&type=Villa
```

### 13.3 App Version Check
```
GET /public/app-version?platform=android&version=1.0.0
```
**Response:**
```json
{
  "data": {
    "updateAvailable": true,
    "forceUpdate": false,
    "latestVersion": "1.2.0",
    "storeUrl": "https://play.google.com/store/apps/details?id=com.investorsworld.realty"
  }
}
```
**Flutter:** Call this on app startup. If `forceUpdate=true`, show mandatory update dialog.

---

### 13.4 Branding Assets
```
GET /public/branding
```
**Response:**
```json
{
  "data": [
    { "key": "logo", "url": "https://..." },
    { "key": "splash", "url": "https://..." }
  ]
}
```

---

### 13.5 Contact Form
```
POST /public/contact
```
**Body:**
```json
{
  "name": "Visitor Name",
  "email": "visitor@gmail.com",
  "phone": "9876543210",
  "message": "I want to know more about your investment plans."
}
```

---

### 13.6 Public EMI Calculator
```
POST /public/emi-calculator
```
Same body/response as Section 8.6.

---

### 13.7 Commission Calculator
```
POST /public/commission-calculator
```
**Body:**
```json
{
  "areaInGaj": 500,
  "rank": 1
}
```
**Response:** Estimated commission breakdown based on gap-method calculation.

---

## 🧪 14. Postman Collection Setup

### Environment Variables
Create a Postman environment called **"IWR Dev"** with:

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:5001/api/v1` |
| `accessToken` | _(set after OTP verification)_ |
| `refreshToken` | _(set after OTP verification)_ |
| `associateId` | _(set after login step 1)_ |

### Test Credentials
```
User ID: IW100001
Password: Test@1234
Admin Email: notespoint2023@gmail.com
Admin Password: Admin@123456
```

### Postman Testing Flow

#### Step 1: Login (Verify Credentials → Get associateId)
```
POST {{baseUrl}}/auth/login
Body: { "userId": "IW100001", "password": "Test@1234", "deviceToken": "test", "platform": "android" }
```
Response returns `data.associateId`. OTP is sent to registered email (also logged in server console).

#### Step 2: Verify OTP (Get Tokens)
```
POST {{baseUrl}}/auth/verify-otp
Body: { "associateId": "{{associateId}}", "otp": "123456" }
```
Save `data.accessToken` → environment variable `accessToken`
Save `data.refreshToken` → environment variable `refreshToken`

#### Step 3: Use Token
For all 🔒 endpoints, add header:
```
Authorization: Bearer {{accessToken}}
```

#### Step 4: Test Sequence
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/auth/login` | Verify credentials, get associateId |
| 2 | POST | `/auth/verify-otp` | Verify OTP, get tokens |
| 3 | GET | `/associate/dashboard` | Dashboard data |
| 4 | GET | `/associate/profile` | Profile info |
| 5 | GET | `/genealogy/tree?depth=3` | Binary tree |
| 6 | GET | `/genealogy/team-summary` | Team stats |
| 7 | GET | `/income/summary` | Income breakdown |
| 8 | GET | `/wallet/balance` | Wallet balance |
| 9 | GET | `/wallet/transactions?page=1` | Transaction history |
| 10 | GET | `/properties?page=1` | Property list |
| 11 | GET | `/notifications?page=1` | Notifications |
| 12 | GET | `/support/tickets` | Support tickets |
| 13 | GET | `/associate/settings` | User settings |
| 14 | GET | `/documents/kyc` | KYC status |
| 15 | GET | `/associate/referral-link` | Referral link |
| 16 | GET | `/public/app-version?platform=android&version=1.0.0` | Version check |

---

## 📱 15. Flutter Integration Notes

### Authentication Flow
```
1. App Start → GET /public/app-version (check for updates)
2. Login Screen → POST /auth/login (userId + password)
3. OTP Screen → POST /auth/verify-otp (associateId + otp)
4. Save accessToken + refreshToken in secure storage
5. Register FCM token → POST /notifications/device-token
6. On 401 → POST /auth/refresh (auto-retry original request)
7. Logout → POST /auth/logout → clear storage → login screen
```

### Push Notifications (Firebase)
- Server sends push via Firebase Admin SDK
- App receives via `firebase_messaging` package
- Notification types determine navigation:
  - `PAYOUT` → Income screen
  - `REGISTRATION` → Team/Genealogy screen
  - `PROPERTY` → Property detail
  - `ANNOUNCEMENT` → Notifications list
  - `KYC` → Profile/KYC section
  - `BOOKING` → My Bookings

### File Uploads
All file uploads use `multipart/form-data`:
```dart
// Example: Profile photo upload
final formData = FormData.fromMap({
  'photo': await MultipartFile.fromFile(
    file.path,
    filename: 'profile.jpg',
    contentType: MediaType('image', 'jpeg'),
  ),
});
await dio.post('/associate/profile/photo', data: formData);
```

### Image URLs
Profile photos and property images return relative paths like `/uploads/profiles/uuid.jpg`.
Prepend the base URL: `http://localhost:5000/uploads/profiles/uuid.jpg`
Production: `https://serveriwr.harshkumarjangir.in/uploads/profiles/uuid.jpg`

### Pagination Pattern
```dart
// Standard pagination call
final response = await dio.get('/wallet/transactions', queryParameters: {
  'page': currentPage,
  'pageSize': 20,
});
final items = response.data['data'] as List;
final totalPages = response.data['totalPages'];
```

### Dark/Light Mode
- User preference stored server-side (GET/PATCH `/associate/settings`)
- On login, read `user.theme` and apply
- On toggle, PATCH settings + update local state

### Language (i18n)
- Supported: `en` (English), `hi` (Hindi)
- Server returns localized messages based on user's saved language
- For unauthenticated requests, send `Accept-Language: hi` header

---

## 📐 16. Suggested Flutter App Structure

```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── api_config.dart          # Base URL, timeouts
│   ├── routes.dart              # Named routes
│   └── theme.dart               # Light/Dark themes
├── core/
│   ├── dio_client.dart          # Dio instance + interceptors
│   ├── secure_storage.dart      # Token storage
│   └── push_notification.dart   # FCM setup
├── models/
│   ├── user.dart
│   ├── dashboard.dart
│   ├── property.dart
│   ├── transaction.dart
│   ├── notification.dart
│   ├── tree_node.dart
│   └── ...
├── providers/ (or bloc/cubit)
│   ├── auth_provider.dart
│   ├── dashboard_provider.dart
│   ├── wallet_provider.dart
│   └── ...
├── screens/
│   ├── splash/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── forgot_password_screen.dart
│   │   └── change_password_screen.dart
│   ├── dashboard/
│   ├── profile/
│   ├── genealogy/
│   ├── properties/
│   ├── income/
│   ├── wallet/
│   ├── notifications/
│   ├── documents/
│   ├── support/
│   ├── registration/
│   └── settings/
├── widgets/
│   ├── common/
│   └── ...
└── utils/
    ├── formatters.dart
    └── validators.dart
```

---

## 🔑 17. Key Packages for Flutter

| Package | Purpose |
|---------|---------|
| `dio` | HTTP client with interceptors |
| `flutter_secure_storage` | Store tokens securely |
| `firebase_messaging` | Push notifications |
| `firebase_core` | Firebase initialization |
| `provider` or `flutter_bloc` | State management |
| `go_router` | Navigation |
| `share_plus` | Share referral link |
| `image_picker` | Photo upload |
| `file_picker` | Document upload |
| `flutter_pdfview` | View PDF documents |
| `path_provider` | File download paths |
| `cached_network_image` | Image caching |
| `intl` | Date/number formatting |
| `flutter_localizations` | i18n |

---

## ⚠️ 18. Important Notes

1. **Token Refresh:** Access token expires in 8 hours. Refresh token expires in 7 days. Implement Dio interceptor to catch 401, call `/auth/refresh`, retry original request.

2. **File Downloads (PDFs):** Documents endpoints return binary PDF. Save to device using `path_provider` + write bytes.

3. **Binary Tree:** The genealogy tree is recursive JSON. Use a tree widget or custom painter for visualization.

4. **Amounts:** All monetary values are in INR (₹). Format with Indian number system (e.g., ₹1,25,000).

5. **Status Colors:**
   - ACTIVE/APPROVED/COMPLETED/PAID → Green
   - PENDING → Yellow/Orange
   - INACTIVE/SUSPENDED/REJECTED → Red

6. **Offline:** Consider caching dashboard + profile data locally for offline viewing.

7. **App Version:** Check `/public/app-version` on every app launch. Handle force update scenario.

---

_Document generated: June 2026 | Server version: 1.1.0_

---

## 📝 Changelog

### v1.1.0 (June 2026)
- Added 2-step OTP login for both associates and admin
- Registration no longer requires package or placement — only `sponsorId`
- Associates start as `INACTIVE`, require admin approval to activate
- Commission is gap-based (seller gets full slab %, uplines get the difference)
- Access token extended from 15m → 8h
- Added Masters module (admin-only): Schemes, Plots, PLC Charges, Plot Types, Account Master
- Added Plot Booking module (Transactions): create booking, approve/reject, receipt download
- Seed data: IW100001–IW100005 available for testing (password: `Test@1234`)

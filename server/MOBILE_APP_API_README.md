# 📱 Investors World Realty — Mobile App API Guide (For Flutter Developer)

**Base URL (Local Dev):** `http://localhost:5001/api/v1`  
**Base URL (VPS/Prod):** `https://serveriwr.harshkumarjangir.in/api/v1`

> **Note:** Server runs on port **5001** on VPS (port 5000 is occupied by another app). The production domain routes through Nginx reverse proxy.

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
| 200 | Success / Created |
| 400 | Validation error |
| 401 | Unauthorized (token expired/missing) |
| 403 | Forbidden / Account suspended |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 423 | Account locked (5 failed attempts → 30 min lock) |
| 429 | Rate limited |
| 500 | Server error |

---

## 🔐 1. Authentication

Login is **single-step** — credentials in, **30-day token** out. No OTP, no refresh token needed.

> OTP is only used for **forgot password**. Not for login.

### 1.1 Login
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
    "accessToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "userId": "IW100001",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "phone": "9999900001",
      "status": "ACTIVE",
      "rank": 1,
      "theme": "light",
      "language": "en"
    }
  }
}
```
**Notes:**
- **No refresh token** — access token lasts **30 days**
- When expired, user logs in again
- `deviceToken` = Firebase FCM token (optional)
- `platform` = `"android"` | `"ios"`
- After 5 failed attempts → account locked 30 min (HTTP 423)

---

### 1.2 Logout
```
POST /auth/logout  🔒
```
**Body:**
```json
{
  "deviceToken": "fcm_token_to_unregister"
}
```

---

### 1.3 Forgot Password (Send OTP)
```
POST /auth/forgot-password
```
**Body:** `{ "identifier": "user@example.com" }`
identifier = email or phone.

---

### 1.4 Reset Password (Verify OTP + New Password)
```
POST /auth/reset-password
```
**Body:**
```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

---

### 1.5 Change Password 🔒
```
POST /auth/change-password
```
**Body:** `{ "currentPassword": "Test@1234", "newPassword": "NewPass@456" }`

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
      "userId": "IW100001",
      "name": "Rajesh Kumar",
      "joiningDate": "2024-01-15T00:00:00.000Z",
      "activationDate": "2024-01-16T00:00:00.000Z",
      "panNumber": "XXXXX234F",
      "totalActivations": 3,
      "rank": 2,
      "rankName": "Business Adviser",
      "totalAreaSold": 1200,
      "profilePhoto": "/uploads/profiles/uuid.jpg",
      "status": "ACTIVE"
    },
    "advancePayment": {
      "credit": 30000,
      "debit": 5000,
      "balance": 25000
    },
    "referral": {
      "referralLink": "https://app.investorsworld.com/register?ref=IW100001",
      "userId": "IW100001"
    }
  }
}
```

**Card fields:**
- `lastPayment` — amount of the most recent completed transaction
- `totalPayment` — sum of all income-type credits (direct + level + matching + reward)
- `selfAmount` — sum of direct income commissions earned personally
- `totalAmount` — sum of all wallet credits

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

### 2.3 Get Referral Link
```
GET /associate/referral-link
```

### 2.4 Get Referral QR Code
```
GET /associate/referral-qr
```
**Response:** PNG image (binary).

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
    "id": "uuid",
    "userId": "IW100001",
    "name": "Rajesh Kumar",
    "email": "developertest@yopmail.com",
    "phone": "9999900001",
    "dateOfBirth": "1990-05-15",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "panNumber": "ABCDE1234F",
    "profilePhoto": "/uploads/profiles/uuid.jpg",
    "status": "ACTIVE",
    "rank": 2,
    "rankName": "Business Adviser",
    "totalAreaSold": 1200,
    "joiningDate": "2024-01-15T00:00:00.000Z",
    "activationDate": "2024-01-16T00:00:00.000Z",
    "theme": "light",
    "language": "en",
    "joiningType": "FULL_TIME",
    "nomineeName": "Sunita Devi",
    "nomineeRelation": "Spouse",
    "nomineeDob": "1992-08-20T00:00:00.000Z",
    "sponsor": {
      "userId": "IW100000",
      "name": "Sponsor Name",
      "phone": "9999900000",
      "email": "sponsor@example.com"
    },
    "treeNode": { "position": "LEFT", "level": 1 },
    "kycStatus": {
      "pan":     { "status": "APPROVED", "number": "ABCDE1234F", "url": "/uploads/kyc/pan.jpg" },
      "aadhaar": { "status": "PENDING",  "number": "123456789012", "url": "/uploads/kyc/aadhar.jpg" },
      "bank":    { "status": "APPROVED", "accountNumber": "1234567890", "ifsc": "SBIN0001234", "bankName": "SBI", "branch": "Main Branch" }
    }
  }
}
```

### 3.2 Update Profile
```
PATCH /associate/profile
Content-Type: multipart/form-data
```
Updates profile details and optionally uploads a profile photo in a single request.
**Parameters:**
* **Form Field (File, Optional):** `profilePhoto` — JPEG/PNG, max 2MB
* **Form Fields (Text, Optional):**
  * `phone` — New phone number
  * `email` — New email address
  * `address` — New address
  * `city` — New city
  * `state` — New state
  * `pincode` — New pincode
  * `fatherHusbandName`, `gender`, `profession`, `maritalStatus`, `aadhaarNo`
  * `joiningType` — `"FULL_TIME"` or `"PART_TIME"`
  * `nomineeName`, `nomineeRelation`, `nomineeDob` (YYYY-MM-DD)
  * `bankName`, `bankBranchName`, `bankAccountNo`, `bankIfscCode`

---

### 3.3 Get Settings
```
GET /associate/settings
```

### 3.4 Update Settings
```
PATCH /associate/settings
```
**Body:** `{ "theme": "dark", "language": "hi" }`

---

### 3.5 Request Account Deletion 🔒
```
POST /associate/delete-request
```
Initiates a 7-day scheduled account deletion. The user will receive an email notification warning them about the impending deletion.

**Response:**
```json
{
  "status": "success",
  "message": "Your account has been scheduled for deletion. It will be permanently deleted in 7 days.",
  "data": {
    "scheduledDeletionAt": "2026-06-25T11:00:00.000Z"
  }
}
```

---

## 🆔 4. KYC 🔒

### 4.1 Submit KYC Details & Documents
```
POST /associate/kyc
Content-Type: multipart/form-data
```
Submit PAN, Aadhaar, and Bank details/documents in a single consolidated API. You can submit one, two, or all of them together.
**Parameters:**
* **Form Fields (Files, Optional):**
  * `panDocument` — JPEG/PNG/PDF file, max 5MB (requires `panNumber` text field to be provided)
  * `aadhaarDocument` — JPEG/PNG/PDF file, max 5MB (requires `aadhaarNumber` text field to be provided)
* **Form Fields (Text, Optional):**
  * `panNumber` — PAN number (matches `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`)
  * `aadhaarNumber` — Aadhaar number (exactly 12 digits)
  * `bankAccountNumber` — Bank account number (requires `bankIfsc` and `bankName`)
  * `bankIfsc` — Bank IFSC code (requires `bankAccountNumber` and `bankName`)
  * `bankName` — Bank name (requires `bankAccountNumber` and `bankIfsc`)
  * `bankBranch` — Bank branch name (optional)

### 4.2 Get KYC Documents
```
GET /documents/kyc
```

---

## 🌳 5. Genealogy / Team Structure 🔒

### 5.1 Get Binary Tree
```
GET /genealogy/tree?depth=5
```
Response includes: `associateId`, `userId`, `name`, `status`, `rank`, `totalAreaSold`, `phone`, `joiningDate`, `position`, `level`, `left`, `right`.

### 5.2 Get Downline Members
```
GET /genealogy/downline?status=ACTIVE&leg=left&level=2&page=1&pageSize=20
```
All query params are optional.

### 5.3 Get Sponsor
```
GET /genealogy/sponsor
```

### 5.4 Get Team Summary
```
GET /genealogy/team-summary
```

---

## 💰 6. Income 🔒

### 6.1 Income Summary
```
GET /income/summary
```

### 6.2 Income History
```
GET /income/history?page=1&pageSize=20
```

### 6.3 Commission Calculator
```
POST /income/calculator
```
**Body:** `{ "areaInGaj": 500, "rank": 1 }`

---

## 🏅 6A. Promotion & Rank System

Associates are automatically promoted based on property sales:

| Rank | Name | Promotion Trigger |
|------|------|------------------|
| 1 | Business Associate | Starting rank |
| 2 | Business Adviser | Personal sale of 500 gaj total |
| 3 | Business Head | 3 direct downlines each with 500 gaj |
| 4 | Dist. Business Head | 3 direct downlines each qualify |
| 5 | State Business Head | Same pattern |
| 6 | Regional Business Head | Same pattern |
| 7 | National Business Head | Same pattern |
| 8 | Vice President Sales | Same pattern |
| 9 | President Sales | Same pattern |
| 10 | President Club | Highest rank, unlimited downlines |

**Commission model (gap-based):**
- Any rank can sell a property
- Seller gets their **full rank slab %**
- Each upline in the chain gets the **gap** between their slab % and the previously-paid level
- President Club (rank 10) always gets a flat **2%** on every sale in their downline

---

## 👛 7. Wallet 🔒

### 7.1 Wallet Dashboard (Unified UI)
```
GET /wallet/dashboard
```
**Description:** Use this for the main Wallet screen. It returns `balance`, `totalCredits` (Income), `totalDebits` (Expenses), and `recentTransactions` (merged list of latest transactions and withdrawals).

### 7.2 Fund Transfer
```
POST /wallet/transfer
```
**Body:** `{ "recipientUserId": "IW100002", "amount": 1000, "description": "Transfer" }`

### 7.3 All Activity (Merged History)
```
GET /wallet/all-activity?page=1&pageSize=20
```
**Description:** Use this for the "See All" transactions screen. Returns perfectly paginated, chronologically sorted, and merged regular transactions + withdrawals. 
**Response Item fields:** `id`, `title`, `amount`, `type`, `rawType`, `date`, `status`, `isCredit` (boolean).

### 7.4 Request Withdrawal
```
POST /wallet/withdraw
```
**Body:** `{ "amount": 5000 }`

---

## 🏠 8. Properties

### 8.1 List Properties (Public)
```
GET /properties?location=Mumbai&minPrice=1000000&maxPrice=5000000&type=Villa&page=1&pageSize=20
```

### 8.2 Property Detail
```
GET /properties/:id
```

### 8.3 Book Property 🔒 (Deprecated - Use Initiate & Verify instead)
```
POST /properties/:id/book
```
**Body:** `{ "amount": 500000 }`

### 8.4 My Bookings 🔒
```
GET /properties/bookings
```

### 8.5 Property Inquiry 🔒
```
POST /properties/:id/inquiry
```
**Body:** `{ "message": "I am interested." }`

### 8.6 EMI Calculator (Public)
```
POST /properties/emi-calculator
```
**Body:** `{ "principal": 5000000, "annualRate": 8.5, "tenureMonths": 240 }`

### 8.7 Hold Property 🔒
```
POST /properties/:id/hold
```
**Body:**
```json
{
  "customerName": "Jane Doe",
  "customerMobile": "9876543210",
  "customerAddress": "123 Main St, Jaipur"
}
```
**Description:** Places the property on hold for 48 hours. During this period, the property cannot be booked by another associate for just the booking amount (only a full payment in person recorded by an admin can override it).

### 8.8 Initiate Property Booking Payment 🔒
```
POST /properties/:id/payment/initiate
```
**Body:**
```json
{
  "amount": 50000,
  "customerName": "Jane Doe",
  "customerMobile": "9876543210",
  "customerAddress": "123 Main St, Jaipur"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Payment initiated successfully",
  "data": {
    "orderId": "order_Hk8sK9n2JkLmN9",
    "amount": 5000000,
    "currency": "INR",
    "bookingId": "c62fb253-7c3e-46cf-a1ab-5d1c9efc9b68",
    "keyId": "rzp_test_mock"
  }
}
```

### 8.9 Update Property Payment Booking 🔒
```
POST /properties/payment/booking
```
**Body (Success):**
```json
{
  "status": "SUCCESS",
  "razorpayOrderId": "order_Hk8sK9n2JkLmN9",
  "razorpayPaymentId": "pay_Hk8tL8m9KlM7N8",
  "razorpaySignature": "31bfa82946bd7e21a221f753c1cf3bc27ea8b9c288921820b127ea821a8cd398"
}
```
**Body (Failed):**
```json
{
  "status": "FAILED",
  "razorpayOrderId": "order_Hk8sK9n2JkLmN9",
  "errorReason": "Payment cancelled by user"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Payment verified and booking confirmed successfully",
  "data": {
    "id": "c62fb253-7c3e-46cf-a1ab-5d1c9efc9b68",
    "status": "CONFIRMED",
    "receiptNo": "REC000001",
    "amount": "50000",
    "modeOfPayment": "Online (Razorpay)",
    "paymentDate": "2026-06-08T11:00:00.000Z"
  }
}
```

---

## 📋 9. Registration

### 9.1 Validate Sponsor
```
GET /registration/validate-sponsor?sponsorId=IW100001
```

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
  "dateOfBirth": "1990-05-15",
  "joiningType": "FULL_TIME",
  "nomineeName": "Jane Doe",
  "nomineeRelation": "Spouse",
  "nomineeDob": "1993-08-20"
}
```
**Notes:**
- **`sponsorId` is OPTIONAL.** Users downloading from Play Store without a referral link can register without it — just omit the field or send empty string.
- If no `sponsorId`, the admin assigns them under the root associate on activation.
- If `sponsorId` is provided, it must be an ACTIVE associate with downline capacity (rank 2+).
- Associate starts as `INACTIVE` — admin must approve/activate.
- `password` rules: min 8 chars, 1 uppercase, 1 number, 1 special character.
- `joiningType`: `"FULL_TIME"` or `"PART_TIME"` (optional — can be updated later via profile)
- `nomineeName`, `nomineeRelation`, `nomineeDob` are all optional — can be filled later via profile update.

### 9.3 Request Account Deletion 🔒
```
POST /registration/request-delete
```
**Body:** _(none)_

---

## 🔔 10. Notifications 🔒

### 10.1 Get Notifications
```
GET /notifications?page=1&pageSize=20
```

### 10.2 Mark as Read
```
PATCH /notifications/:id/read
```

### 10.3 Register Device Token
```
POST /notifications/device-token
```
**Body:** `{ "token": "fcm_token", "platform": "android" }`

### 10.4 Remove Device Token
```
DELETE /notifications/device-token
```
**Body:** `{ "token": "fcm_token" }`

### 10.5 Delete Notification
```
DELETE /notifications/:id
```
_Soft delete a notification from the mobile app. It will no longer show up to the user but remains in database archives._

---

## 📄 11. Documents 🔒

### 11.1 Get Welcome Letter Data
```
GET /documents/welcome-letter
```
_Returns a JSON object containing all the formatted dates, titles, and paragraphs needed to render the Welcome Letter directly inside the Flutter app (no longer returns a PDF file)._

### 11.2 Download Payment Receipt
```
GET /documents/receipt/:transactionId
```

### 11.3 Download Agreement
```
GET /documents/agreement
```

---

## 🎫 12. Support 🔒

### 12.1 List Tickets
```
GET /support/tickets?page=1&pageSize=20
```

### 12.2 Create Ticket
```
POST /support/tickets
```
**Body:** `{ "subject": "Issue title", "description": "Detailed description" }`

### 12.3 Get Ticket Detail
```
GET /support/tickets/:id
```

### 12.4 Reply to Ticket
```
POST /support/tickets/:id/reply
```
**Body:** `{ "message": "Reply text" }`

---

## 🌐 13. Public Endpoints (No Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/public/health` | Health check |
| GET | `/public/app-version?platform=android&version=1.0.0` | Version check |
| GET | `/public/branding` | Logo, splash assets |
| GET | `/public/properties` | Property listing |
| POST | `/public/commission-calculator` | Gap commission estimate |
| POST | `/public/emi-calculator` | EMI calculation |
| POST | `/public/contact` | Contact form |
| GET | `/public/privacy` | Privacy Policy (JSON with `htmlcode`) |
| GET | `/public/terms` | Terms & Conditions (JSON with `htmlcode`) |
| GET | `/public/support` | Help & support page (JSON with `htmlcode`) |

**Flutter WebView example:**
```dart
// Fetch JSON, decode, and load string in WebView
final response = await dio.get('$baseUrl/public/privacy');
final htmlCode = response.data['htmlcode'];
webViewController.loadHtmlString(htmlCode);
```


---

## 🧪 14. Postman Testing Guide

### Environment Variables
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
Admin Email: admindevelopertest@yopmail.com
Admin Password: Admin@123456
```

### Testing Flow
1. `POST /auth/login` → save `data.associateId` to env variable
2. Check server console for OTP → `POST /auth/verify-otp` → save tokens
3. All 🔒 routes: `Authorization: Bearer {{accessToken}}`
4. On 401: `POST /auth/refresh` → update `accessToken`

---

## 📱 15. Flutter Integration Notes

### Authentication Flow
```
1. App Start → GET /public/app-version (force update check)
2. Login Screen → POST /auth/login (userId + password) → tokens returned directly
3. Save accessToken + refreshToken in flutter_secure_storage
4. Register FCM → POST /notifications/device-token
5. On 401 → POST /auth/refresh → retry original request
6. Logout → POST /auth/logout → clear storage → login screen
```
**OTP is only used for:**
- Registration email verification (signup)
- Forgot password flow

### File Uploads
```dart
final formData = FormData.fromMap({
  'profilePhoto': await MultipartFile.fromFile(filePath, filename: 'photo.jpg'),
});
await dio.patch('/associate/profile', data: formData);
```

### Image URLs
Paths from API are relative (e.g., `/uploads/profiles/uuid.jpg`).  
Prepend base: `https://serveriwr.harshkumarjangir.in/uploads/profiles/uuid.jpg`

### Pagination
```dart
final response = await dio.get('/wallet/transactions', queryParameters: {
  'page': currentPage,
  'pageSize': 20,
});
final items = response.data['data'] as List;
final totalPages = response.data['totalPages'];
```

---

## 📐 16. Flutter App Structure

```
lib/
├── config/
│   ├── api_config.dart
│   ├── routes.dart
│   └── theme.dart
├── core/
│   ├── dio_client.dart       # interceptors + auto-refresh
│   ├── secure_storage.dart
│   └── push_notification.dart
├── models/
│   ├── user.dart
│   ├── dashboard.dart
│   ├── property.dart
│   ├── transaction.dart
│   ├── notification.dart
│   └── tree_node.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── otp_screen.dart        # NEW: OTP verification
│   │   ├── forgot_password.dart
│   │   └── change_password.dart
│   ├── dashboard/
│   ├── profile/
│   ├── genealogy/
│   ├── properties/
│   ├── income/
│   ├── wallet/
│   ├── notifications/
│   ├── documents/
│   ├── support/
│   └── registration/
└── utils/
```

---

## ⚠️ 17. Important Notes

1. **2-Step Login:** Always call `/auth/login` first, then `/auth/verify-otp`. OTP is valid for 5 minutes. The OTP is always printed to the server console.

2. **Token Expiry:** Access token = 8 hours. Refresh token = 7 days. Use interceptor to auto-refresh.

3. **No Packages:** Registration has no `packageId`. Only `sponsorId` (the referring associate's userId like `IW100001`) is needed.

4. **No LEFT/RIGHT placement:** The binary tree placement is handled automatically by the server.

5. **Associate status flow:** `INACTIVE` (just registered) → `ACTIVE` (admin approved) → `SUSPENDED` (if flagged).

6. **Rank shown on profile:** Include `rank` and `rankName` on profile/dashboard screens.

7. **Amounts:** All monetary values in INR (₹). Format with Indian number system (₹1,25,000).

8. **Status Colors:** ACTIVE/APPROVED/PAID → Green | PENDING → Orange | INACTIVE/SUSPENDED/REJECTED → Red

---

## 📝 Changelog

### v1.3.0 (June 2026)
- **Nominee details** added to registration and profile: `nomineeName`, `nomineeRelation`, `nomineeDob`
- **Joining type** added: `joiningType` = `"FULL_TIME"` | `"PART_TIME"` — available on registration and profile update
- Both fields are optional at registration — can be filled or updated later via `PATCH /associate/profile`
- Admin panel: Add/Edit Associate modal now includes Joining Type radio buttons and Nominee section

### v1.2.0 (June 2026)
- **OTP for Associate login** — 2-step auth (credentials → OTP → tokens)
- **OTP for Forgot Password** — send OTP to email/phone, verify, then reset
- **Promotion system** — automatic rank promotion based on sales area
- `rank` and `totalAreaSold` fields now included in profile and tree responses
- Registration: no packages, no placement, only `sponsorId` required
- Associate starts `INACTIVE` — admin must approve/activate
- Advance Payment ledger (credit/debit/balance) accessible via dashboard
- Access token extended to 8h; refresh token is 7 days
- OTP always logged to server console regardless of environment

### v1.1.0 (June 2026)
- 2-step OTP login for admin panel
- Gap-based commission model
- Masters module (Schemes, Plots, PLC Charges)
- Plot Booking with receipt generation

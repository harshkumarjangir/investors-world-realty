# Investors World Realty — API Documentation

**Base URL:** `http://localhost:5000/api/v1`

**Auth:** Most endpoints require `Authorization: Bearer <token>` header.

---

## 🔐 Auth (Associate)

### POST `/auth/login`
```json
{
  "userId": "IW100001",
  "password": "Test@1234",
  "deviceToken": "fcm_token_here",
  "platform": "android"
}
```

### POST `/auth/refresh`
```json
{
  "refreshToken": "your_refresh_token"
}
```

### POST `/auth/logout` 🔒
```json
{
  "refreshToken": "your_refresh_token",
  "deviceToken": "fcm_token_here"
}
```

### POST `/auth/forgot-password`
```json
{
  "identifier": "9999900001"
}
```

### POST `/auth/reset-password`
```json
{
  "identifier": "9999900001",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

### POST `/auth/change-password` 🔒
```json
{
  "currentPassword": "Test@1234",
  "newPassword": "NewPass@456"
}
```

---

## 🔐 Auth (Admin)

### POST `/admin/auth/login`
```json
{
  "email": "admin@investorsworld.com",
  "password": "Admin@123456"
}
```

### POST `/admin/auth/verify-otp`
```json
{
  "adminId": "uuid-from-login-response",
  "otp": "123456"
}
```

### POST `/admin/auth/logout` 🔒 (Admin)
```json
{
  "refreshToken": "your_refresh_token"
}
```

---

## 📋 Registration

### GET `/registration/validate-sponsor?sponsorId=IW100001`
No body required.

### POST `/registration/register`
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
  "placement": "LEFT",
  "packageId": "default-package-001",
  "password": "John@1234",
  "dateOfBirth": "1990-05-15"
}
```

### POST `/registration/activate` 🔒
```json
{
  "associateId": "uuid-of-associate",
  "packageId": "default-package-001"
}
```

---

## 📊 Associate Dashboard 🔒

### GET `/associate/dashboard`
### GET `/associate/advance-payment`
### GET `/associate/referral-link`
### GET `/associate/referral-qr`

No body required for any of these.

---

## 👤 Associate Profile 🔒

### GET `/associate/profile`

### PATCH `/associate/profile`
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

### POST `/associate/profile/photo` (multipart/form-data)
- Field: `photo` (JPEG/PNG, max 2MB)

### POST `/associate/kyc/pan` (multipart/form-data)
- Field: `document` (JPEG/PNG/PDF, max 5MB)
- Field: `documentNumber` = `ABCDE1234F`

### POST `/associate/kyc/aadhaar` (multipart/form-data)
- Field: `document` (JPEG/PNG/PDF, max 5MB)
- Field: `documentNumber` = `123456789012`

### POST `/associate/kyc/bank`
```json
{
  "accountNumber": "1234567890",
  "ifsc": "SBIN0001234",
  "bankName": "State Bank of India",
  "branch": "Main Branch"
}
```

---

## ⚙️ Associate Settings 🔒

### GET `/associate/settings`

### PATCH `/associate/settings`
```json
{
  "theme": "dark",
  "language": "hi"
}
```

---

## 🌳 Genealogy 🔒

### GET `/genealogy/tree?depth=5`
### GET `/genealogy/downline?status=ACTIVE&leg=left&level=2&page=1&pageSize=20`
### GET `/genealogy/sponsor`
### GET `/genealogy/team-summary`

---

## 💰 Income 🔒

### GET `/income/summary`
### GET `/income/history?page=1&pageSize=20`

### POST `/income/calculator`
```json
{
  "referrals": 5,
  "depth": 3,
  "packageId": "default-package-001"
}
```

---

## 👛 Wallet 🔒

### GET `/wallet/balance`

### POST `/wallet/transfer`
```json
{
  "recipientUserId": "IW100002",
  "amount": 1000,
  "description": "Fund transfer"
}
```

### GET `/wallet/transactions?page=1&pageSize=20`

### POST `/wallet/withdraw`
```json
{
  "amount": 5000
}
```

### GET `/wallet/withdrawals?page=1&pageSize=20`

---

## 🏠 Properties

### GET `/properties?location=Mumbai&minPrice=1000000&maxPrice=5000000&type=Villa&page=1&pageSize=20`
### GET `/properties/:id`

### POST `/properties/:id/inquiry` 🔒
```json
{
  "message": "I am interested in this property. Please contact me."
}
```

### POST `/properties/:id/book` 🔒
```json
{
  "amount": 500000
}
```

### GET `/properties/bookings` 🔒

### POST `/properties/emi-calculator`
```json
{
  "principal": 5000000,
  "annualRate": 8.5,
  "tenureMonths": 240
}
```

### POST `/properties/emi-calculator/schedule`
```json
{
  "principal": 5000000,
  "annualRate": 8.5,
  "tenureMonths": 240
}
```

---

## 🔔 Notifications 🔒

### POST `/notifications/device-token`
```json
{
  "token": "fcm_device_token_string",
  "platform": "android"
}
```

### DELETE `/notifications/device-token`
```json
{
  "token": "fcm_device_token_string"
}
```

### GET `/notifications?page=1&pageSize=20`
### PATCH `/notifications/:id/read`

---

## 📄 Documents 🔒

### GET `/documents/welcome-letter`
Returns PDF file.

### GET `/documents/receipt/:transactionId`
Returns PDF file.

### GET `/documents/agreement`
Returns PDF file.

### GET `/documents/kyc`
Returns JSON with document URLs.

---

## 🎫 Support 🔒

### GET `/support/tickets?page=1&pageSize=20`

### POST `/support/tickets`
```json
{
  "subject": "Cannot login to my account",
  "description": "I am getting invalid credentials error even with correct password."
}
```

### GET `/support/tickets/:id`

### POST `/support/tickets/:id/reply`
```json
{
  "message": "I have tried resetting my password but still facing the issue."
}
```

---

## 🌐 Public (No Auth)

### GET `/public/health`
### GET `/public/properties?location=Mumbai&type=Villa`
### GET `/public/app-version?platform=android&version=1.0.0`
### GET `/public/branding`

### POST `/public/contact`
```json
{
  "name": "Visitor Name",
  "email": "visitor@gmail.com",
  "phone": "9876543210",
  "message": "I want to know more about your investment plans."
}
```

### POST `/public/emi-calculator`
```json
{
  "principal": 3000000,
  "annualRate": 9.0,
  "tenureMonths": 180
}
```

### POST `/public/commission-calculator`
```json
{
  "referrals": 5,
  "depth": 3,
  "packageId": "default-package-001"
}
```

---

## 🛡️ Admin — Dashboard 🔒 (Admin)

### GET `/admin/dashboard/`
### GET `/admin/dashboard/recent-transactions`

---

## 🛡️ Admin — Associates 🔒 (Admin)

### GET `/admin/associates?search=Rajesh&status=ACTIVE&page=1&pageSize=15`

### POST `/admin/associates`
```json
{
  "name": "New Associate",
  "phone": "8765432109",
  "email": "new@example.com",
  "address": "789 Street",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001",
  "panNumber": "XYZAB5678C",
  "sponsorId": "IW100001",
  "placement": "RIGHT",
  "packageId": "default-package-001",
  "password": "NewUser@123"
}
```

### GET `/admin/associates/:id`

### PATCH `/admin/associates/:id`
```json
{
  "name": "Updated Name",
  "phone": "9999911111",
  "email": "updated@example.com",
  "status": "ACTIVE"
}
```

### POST `/admin/associates/:id/activate`
```json
{
  "packageId": "default-package-001"
}
```

### POST `/admin/associates/:id/suspend`
### DELETE `/admin/associates/:id`

---

## 🛡️ Admin — Genealogy 🔒 (Admin)

### GET `/admin/genealogy/tree/IW100001?depth=5`
### GET `/admin/genealogy/search?q=Rajesh`
### GET `/admin/genealogy/level-analysis`
### GET `/admin/genealogy/business-tracking/IW100001`

---

## 🛡️ Admin — Payouts 🔒 (Admin)

### POST `/admin/payouts/generate`
No body required.

### GET `/admin/payouts/pending?page=1&pageSize=20`

### POST `/admin/payouts/:id/approve`
### POST `/admin/payouts/:id/reject`
```json
{
  "reason": "Insufficient documentation"
}
```

### GET `/admin/payouts/reports?startDate=2024-01-01&endDate=2025-12-31&type=DIRECT`

---

## 🛡️ Admin — Funds 🔒 (Admin)

### POST `/admin/funds/credit`
```json
{
  "associateId": "uuid-of-associate",
  "amount": 5000,
  "reason": "Bonus credit for achievement"
}
```

### POST `/admin/funds/debit`
```json
{
  "associateId": "uuid-of-associate",
  "amount": 2000,
  "reason": "Penalty deduction"
}
```

### POST `/admin/funds/transfer`
```json
{
  "fromAssociateId": "uuid-source",
  "toAssociateId": "uuid-destination",
  "amount": 3000,
  "reason": "Admin transfer"
}
```

### GET `/admin/funds/logs?associateId=uuid&startDate=2024-01-01&endDate=2025-12-31`

---

## 🛡️ Admin — Reports 🔒 (Admin)

### GET `/admin/reports/joining?startDate=2024-01-01&endDate=2025-12-31&page=1&pageSize=20`
### GET `/admin/reports/activation?startDate=2024-01-01&endDate=2025-12-31`
### GET `/admin/reports/income?type=DIRECT&startDate=2024-01-01&endDate=2025-12-31`
### GET `/admin/reports/withdrawal?status=PENDING&startDate=2024-01-01&endDate=2025-12-31`
### GET `/admin/reports/fund-transfer?startDate=2024-01-01&endDate=2025-12-31`
### GET `/admin/reports/user/:associateId`

---

## 🛡️ Admin — Properties 🔒 (Admin)

### POST `/admin/properties`
```json
{
  "name": "Green Valley Villas",
  "description": "Premium villa project",
  "location": "Sector 150, Noida",
  "city": "Noida",
  "state": "Uttar Pradesh",
  "area": 2400,
  "price": 4500000,
  "type": "Villa",
  "amenities": ["Swimming Pool", "Gym", "Park", "Security"]
}
```

### POST `/admin/properties/:id/images` (multipart/form-data)
- Field: `images` (multiple files, max 10, each under 5MB)

### POST `/admin/properties/:id/video` (multipart/form-data)
- Field: `video` (single MP4/MOV, max 100MB)

### PATCH `/admin/properties/:id`
```json
{
  "name": "Updated Name",
  "price": 5000000,
  "isFeatured": true
}
```

### PATCH `/admin/properties/:id/status`
```json
{
  "status": "BOOKED"
}
```

### DELETE `/admin/properties/:id`
### GET `/admin/properties/:id/inquiries`

---

## 🛡️ Admin — Notifications 🔒 (Admin)

### POST `/admin/notifications`
```json
{
  "title": "New Property Listed",
  "message": "Check out our new villa project in Noida!",
  "target": "all"
}
```

**Target options:**
- `"target": "all"` — send to all associates
- `"target": "specific", "targetIds": ["uuid1", "uuid2"]` — specific associates
- `"target": "package", "targetIds": ["package-uuid"]` — all associates with that package

### GET `/admin/notifications/history?page=1&pageSize=20`

---

## 🛡️ Admin — KYC 🔒 (Admin)

### GET `/admin/kyc/pending?page=1&pageSize=20`

### POST `/admin/kyc/:id/approve`

### POST `/admin/kyc/:id/reject`
```json
{
  "reason": "Document is blurry, please re-upload"
}
```

### GET `/admin/kyc/:associateId`

---

## 🛡️ Admin — Transactions 🔒 (Admin)

### GET `/admin/transactions?startDate=2024-01-01&endDate=2025-12-31&type=DIRECT_INCOME&status=COMPLETED&page=1`
### GET `/admin/transactions/wallet/:associateId?page=1&pageSize=20`
### GET `/admin/transactions/withdrawals?status=PENDING`

### POST `/admin/transactions/withdrawals/:id/approve`
### POST `/admin/transactions/withdrawals/:id/reject`
```json
{
  "reason": "KYC not verified"
}
```

---

## 🛡️ Admin — Configuration 🔒 (Admin)

### GET `/admin/config/packages`
### POST `/admin/config/packages`
```json
{
  "name": "Gold Package",
  "price": 10000,
  "benefits": ["All features", "Priority support"],
  "directPercent": 12
}
```
### PATCH `/admin/config/packages/:id`
### DELETE `/admin/config/packages/:id`

### GET `/admin/config/income-plans`
### POST `/admin/config/income-plans`
```json
{
  "type": "LEVEL",
  "level": 6,
  "percentage": 0.5,
  "isActive": true
}
```
### PATCH `/admin/config/income-plans/:id`
### DELETE `/admin/config/income-plans/:id`

### GET `/admin/config/categories`
### POST `/admin/config/categories`
```json
{ "name": "Penthouse" }
```

### GET `/admin/config/states`
### POST `/admin/config/states`
```json
{ "name": "Goa" }
```

### GET `/admin/config/cities?stateId=uuid`
### POST `/admin/config/cities`
```json
{ "name": "Panaji", "stateId": "state-uuid" }
```

### GET `/admin/config/roles`
### POST `/admin/config/roles`
```json
{
  "name": "Custom Role",
  "permissions": ["dashboard:read", "associates:read", "properties:read"]
}
```
### PATCH `/admin/config/roles/:id`
### DELETE `/admin/config/roles/:id`

---

## 🛡️ Admin — Commissions 🔒 (Admin)

### GET `/admin/commissions/slabs`

### POST `/admin/commissions/slabs`
```json
{
  "minArea": 0,
  "maxArea": 3000,
  "sellerPercent": 5.0,
  "level1Percent": 3.0,
  "level2Percent": 2.0,
  "level3Percent": 1.5,
  "level4Percent": 1.0,
  "level5Percent": 0.75,
  "level6Percent": 0.5,
  "level7Percent": 0.5,
  "level8Percent": 0.25,
  "level9Percent": 0.25,
  "level10Percent": 0.25,
  "isActive": true
}
```

### PATCH `/admin/commissions/slabs/:id`
### DELETE `/admin/commissions/slabs/:id`

### GET `/admin/commissions/pending?page=1&pageSize=20`
### GET `/admin/commissions/all?status=PENDING&associateId=uuid`
### POST `/admin/commissions/:id/approve`
### POST `/admin/commissions/:id/reject`

---

## 🛡️ Admin — App Version 🔒 (Admin)

### GET `/admin/app-version`
### POST `/admin/app-version`
```json
{
  "platform": "android",
  "minVersion": "1.0.0",
  "latestVersion": "1.2.0",
  "storeUrl": "https://play.google.com/store/apps/details?id=com.investorsworld.realty",
  "forceUpdate": false
}
```

### GET `/admin/app-version/branding`
### POST `/admin/app-version/branding`
```json
{
  "key": "logo",
  "url": "https://example.com/logo.png"
}
```

---

## 🛡️ Admin — Contact Inquiries 🔒 (Admin)

### GET `/admin/contact?page=1&pageSize=20`
### GET `/admin/contact/:id`

---

## Response Format

**Success:**
```json
{
  "status": "success",
  "message": "Description",
  "data": { ... }
}
```

**Paginated:**
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

**Error:**
```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (token missing/expired) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 423 | Account locked |
| 429 | Rate limited |
| 500 | Server error |

---

## Auth Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

🔒 = Requires authentication

---

## 🧪 Postman Testing Guide

### Setup

1. **Create Environment** in Postman called "IWR Local":
   - `baseUrl` = `http://localhost:5000/api/v1`
   - `associateToken` = (empty, will be set after login)
   - `adminToken` = (empty, will be set after admin login)
   - `associateId` = `4b319a06-82cf-4d3f-9a7b-cfbe787dde3b` (IW100001's UUID)

2. **Test Credentials:**
   - Associate: `IW100001` / `Test@1234`
   - Admin: `admin@investorsworld.com` / `Admin@123456`

### Testing Flow

#### Step 1: Associate Login
```
POST {{baseUrl}}/auth/login
Body:
{
  "userId": "IW100001",
  "password": "Test@1234"
}
```
Copy `data.accessToken` → set as `associateToken` in environment.

#### Step 2: Admin Login (2 steps)
```
POST {{baseUrl}}/admin/auth/login
Body:
{
  "email": "admin@investorsworld.com",
  "password": "Admin@123456"
}
```
Copy `data.adminId` from response. Check server console for OTP (printed in dev mode).

```
POST {{baseUrl}}/admin/auth/verify-otp
Body:
{
  "adminId": "<adminId from above>",
  "otp": "<6-digit OTP from server console>"
}
```
Copy `data.accessToken` → set as `adminToken` in environment.

#### Step 3: Test Associate Endpoints
Use `Authorization: Bearer {{associateToken}}` header for all 🔒 associate endpoints.

#### Step 4: Test Admin Endpoints
Use `Authorization: Bearer {{adminToken}}` header for all 🔒 admin endpoints.

### Quick Test Sequence

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/auth/login` | Get associate token |
| 2 | GET | `/associate/dashboard` | Verify dashboard works |
| 3 | GET | `/associate/profile` | Get profile |
| 4 | GET | `/notifications` | Get notifications |
| 5 | GET | `/genealogy/tree?depth=3` | Get binary tree |
| 6 | GET | `/wallet/balance` | Check wallet |
| 7 | GET | `/income/summary` | Income breakdown |
| 8 | GET | `/properties` | List properties |
| 9 | POST | `/admin/auth/login` | Start admin login |
| 10 | POST | `/admin/auth/verify-otp` | Complete admin login |
| 11 | GET | `/admin/dashboard/` | Admin dashboard |
| 12 | GET | `/admin/associates` | List associates |
| 13 | GET | `/admin/commissions/slabs` | View commission slabs |
| 14 | POST | `/admin/notifications` | Send notification |
| 15 | GET | `/public/health` | Health check (no auth) |

### Postman Pre-request Script (Auto-set token)

Add this to your collection's Pre-request Script to auto-login:
```javascript
// Only run if no token exists
if (!pm.environment.get("associateToken")) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/auth/login",
        method: "POST",
        header: { "Content-Type": "application/json" },
        body: { mode: "raw", raw: JSON.stringify({ userId: "IW100001", password: "Test@1234" }) }
    }, function (err, res) {
        if (!err) {
            var json = res.json();
            pm.environment.set("associateToken", json.data.accessToken);
        }
    });
}
```

---

## 🛡️ Admin — Property Commissions 🔒 (Admin)

### GET `/admin/commissions/slabs`
Returns all commission slabs (area-based rates for 10 levels).

### POST `/admin/commissions/slabs`
```json
{
  "minArea": 0,
  "maxArea": 6000,
  "sellerPercent": 4,
  "level1Percent": 6,
  "level2Percent": 7.5,
  "level3Percent": 9,
  "level4Percent": 10,
  "level5Percent": 11,
  "level6Percent": 12,
  "level7Percent": 13,
  "level8Percent": 14,
  "level9Percent": 2,
  "level10Percent": 0,
  "isActive": true
}
```

### PATCH `/admin/commissions/slabs/:id`
```json
{
  "sellerPercent": 4.5,
  "level1Percent": 6.5
}
```

### DELETE `/admin/commissions/slabs/:id`

### GET `/admin/commissions/pending?page=1&pageSize=20`
Returns pending property sale commissions awaiting approval.

### GET `/admin/commissions/all?status=PENDING&associateId=uuid&page=1&pageSize=20`
Returns all commissions with optional filters.

### POST `/admin/commissions/:id/approve`
Approves commission and credits amount to associate's wallet.

### POST `/admin/commissions/:id/reject`
Rejects the commission (no wallet credit).

---

## 📊 Commission Structure (IWR Plan — Gap Commission Model)

When a property is sold, commissions distribute using the **GAP method**. Total pool is always 16% of property price.

**Any rank can sell.** Seller gets their rank's full slab %. Uplines get the gap.

| Level | Title | 0-6000 gaj | Gap (0-6000) |
|-------|-------|------------|--------------|
| 1 | Business Associate | 4% | 4% (seller) |
| 2 | Business Adviser | 6% | 2% |
| 3 | Business Head | 7.5% | 1.5% |
| 4 | Dist. Business Head | 9% | 1.5% |
| 5 | State Business Head | 10% | 1% |
| 6 | Regional Business Head | 11% | 1% |
| 7 | National Business Head | 12% | 1% |
| 8 | Vice President Sales | 13% | 1% |
| 9 | President Sales | 14% | 1% |
| 10 | President Club | +2% | 2% (flat, always) |

**Total: 16%**

**Area Slabs:** 0-6000, 6001-10000, 10001-15000, 15001-20000, 20001-25000, 25001-30000, 30001-35000 gaj  
(Percentages decrease as area increases — see `COMMISSION_AND_PROMOTION_PLAN.md` for full table)

**Rules:**
- Seller gets their rank's full slab % (e.g., if Business Head sells, they get 7.5%)
- Uplines above seller get the GAP (difference between consecutive levels)
- President Club always gets flat 2% on every sale
- If President Club sells directly, they get 14% + 2% = 16% total
- Only ACTIVE associates earn commission
- Commission triggers when admin approves a property booking

**Promotion System:**
- First promotion (Associate → Adviser): Sell 500 gaj personally
- After promotion: Can add 3 Business Associates under them
- Subsequent promotions: All 3 downlines achieve 500 gaj each
- President Club can add anyone directly (no criteria)

---

## 📱 Mobile App Integration Notes

- All endpoints return consistent `{ status, message, data }` format
- Paginated endpoints include `currentPage, totalPages, totalItems, pageSize`
- Send `deviceToken` + `platform` during login for push notifications
- Use `Accept-Language: hi` header for Hindi responses (unauthenticated)
- Authenticated users get responses in their saved language preference
- File uploads use `multipart/form-data`
- JWT access token expires in 15 minutes — use `/auth/refresh` to get new one
- Refresh token expires in 7 days

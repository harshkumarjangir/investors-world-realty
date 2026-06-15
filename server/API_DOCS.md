# Investors World Realty — API Documentation

**Base URL (Dev):** `http://localhost:5000/api/v1`  
**Base URL (VPS/Prod):** `https://serveriwr.harshkumarjangir.in/api/v1`

> **Port note:** Locally defaults to 5000. On the VPS, set `PORT=5001` in `.env` (port 5000 is occupied by another project).

**Auth:** Most endpoints require `Authorization: Bearer <token>` header.

---

## 🔐 Auth (Associate) — 2-Step OTP Login

### POST `/auth/login` — Step 1
```json
{
  "userId": "IW100001",
  "password": "Test@1234",
  "deviceToken": "fcm_token_here",
  "platform": "android"
}
```
Returns `{ associateId }`. OTP sent to registered email + logged to console.

### POST `/auth/verify-otp` — Step 2
```json
{
  "associateId": "uuid-from-step-1",
  "otp": "123456"
}
```
Returns `{ accessToken, refreshToken, user }`. Token expires in 8h.

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

### PATCH `/associate/profile` (multipart/form-data)
Updates profile text details and optionally uploads/updates a profile photo.
- Field (File, Optional): `profilePhoto` (JPEG/PNG, max 2MB)
- Fields (Text, Optional): `phone`, `email`, `address`, `city`, `state`, `pincode`, `fatherHusbandName`, `gender`, `profession`, `maritalStatus`, `aadhaarNo`, `nomineeName`, `nomineeRelation`, `nomineeDob`, `bankName`, `bankBranchName`, `bankAccountNo`, `bankIfscCode`

---

## 🆔 KYC 🔒

### POST `/associate/kyc` (multipart/form-data)
Submit PAN, Aadhaar, and/or Bank details and documents together.
- Field (File, Optional): `panDocument` (JPEG/PNG/PDF, max 5MB)
- Field (File, Optional): `aadhaarDocument` (JPEG/PNG/PDF, max 5MB)
- Field (Text, Optional): `panNumber`
- Field (Text, Optional): `aadhaarNumber`
- Field (Text, Optional): `bankAccountNumber`
- Field (Text, Optional): `bankIfsc`
- Field (Text, Optional): `bankName`
- Field (Text, Optional): `bankBranch`

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

### GET `/genealogy/overview?depth=5&status=ACTIVE&level=2&page=1&pageSize=20`
Returns a combined payload of:
- `sponsor`: Details of the user's sponsor
- `summary`: Left/right volume and business tracking
- `tree`: Visual binary tree structure up to `depth` levels
- `downline`: Paginated list of all downline members (filtered by query params)

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

### POST `/properties/:id/book` 🔒 (Deprecated - Use Initiate & Verify instead)
```json
{
  "amount": 500000
}
```

### POST `/properties/:id/hold` 🔒
```json
{
  "customerName": "Jane Doe",
  "customerMobile": "9876543210",
  "customerAddress": "123 Main St, Jaipur"
}
```

### POST `/properties/:id/payment/initiate` 🔒
```json
{
  "amount": 50000,
  "customerName": "Jane Doe",
  "customerMobile": "9876543210",
  "customerAddress": "123 Main St, Jaipur"
}
```

### POST `/properties/payment/verify` 🔒
```json
{
  "razorpayOrderId": "order_Hk8sK9n2JkLmN9",
  "razorpayPaymentId": "pay_Hk8tL8m9KlM7N8",
  "razorpaySignature": "31bfa82946bd7e21a221f753c1cf3bc27ea8b9c288921820b127ea821a8cd398"
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
### DELETE `/notifications/:id`

---

## 📄 Documents 🔒

### GET `/documents/welcome-letter`
Returns JSON data containing all text, dates, and paragraphs needed to generate the Welcome Letter in the mobile app.

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

### GET `/public/privacy`
Returns **JSON** (`Content-Type: application/json`) — Privacy Policy for in-app WebView.
```json
{
  "htmlcode": "<!DOCTYPE html>..."
}
```

### GET `/public/terms`
Returns **JSON** (`Content-Type: application/json`) — Terms & Conditions for in-app WebView.
```json
{
  "htmlcode": "<!DOCTYPE html>..."
}
```

### GET `/public/support`
Returns **JSON** (`Content-Type: application/json`) — Help & support page. In-app tickets use `POST /support/tickets` (auth required).
```json
{
  "htmlcode": "<!DOCTYPE html>..."
}
```

### GET `/public/help-center`
Returns **JSON** (`Content-Type: application/json`) — Help center data including heading, 4 cards, and footer info.
```json
{
  "status": "success",
  "data": {
    "heading": "How can we help you?",
    "subHeading": "Our team is available to assist you with any queries.",
    "cards": [
      {
        "id": "ticket",
        "title": "Raise a Ticket",
        "description": "Report an issue or request help",
        "type": "app_route",
        "action": "/support/tickets"
      }
    ],
    "footer": {
      "time": "Available 10:00 AM - 06:00 PM",
      "days": "Monday to Saturday"
    }
  }
}
```

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


### GET `/admin/config/categories`
### POST `/admin/config/categories`
```json
{ "name": "Penthouse" }
```

### GET `/public/states` — list states (no auth)
### GET `/public/cities?state=Rajasthan` — list cities by state name (no auth)

### POST `/admin/config/states`
```json
{ "name": "Goa" }
```
### PATCH `/admin/config/states/:id`
```json
{ "name": "Goa" }
```
### DELETE `/admin/config/states/:id`

### POST `/admin/config/cities`
```json
{ "name": "Panaji", "stateId": "state-uuid" }
```
### PATCH `/admin/config/cities/:id`
```json
{ "name": "Panaji" }
```
### DELETE `/admin/config/cities/:id`

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

## 🛡️ Admin — Support Tickets 🔒 (Admin)

Requires `support:read` / `support:write` permissions.

### GET `/admin/support?page=1&pageSize=20&status=OPEN&search=TKT`
Query `status`: `ALL` | `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED`  
Query `search`: ticket number, subject, associate name, userId, or email

### GET `/admin/support/:id`
Returns ticket with full message thread and associate details.

### POST `/admin/support/:id/reply`
```json
{ "message": "We have reset your password. Please try again." }
```
Sets status to `IN_PROGRESS` when replying to `OPEN` or `RESOLVED` tickets.

### PATCH `/admin/support/:id/status`
```json
{ "status": "RESOLVED" }
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
| 200 | Success / Created |
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
   - Admin: `admindevelopertest@yopmail.com` / `Admin@123456`

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
  "email": "admindevelopertest@yopmail.com",
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
| 5 | GET | `/genealogy/overview?depth=3` | Get complete genealogy data |
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
- JWT access token expires in **8 hours** — use `/auth/refresh` to get new one
- Refresh token expires in 7 days
- OTP is always logged to server console (also sent via email)

---

## 🏗️ Admin — Plot Bookings 🔒 (Admin)

### POST `/admin/bookings`
```json
{
  "associateId": "IW100001",
  "propertyId": "prop-001",
  "customerName": "Ramesh Gupta",
  "customerMobile": "9876543210",
  "customerAddress": "12, Civil Lines, Jaipur",
  "plotType": "Residential",
  "plotNo": "46",
  "siteNo": "A-12",
  "plotArea": 200,
  "costPerUnit": 2500,
  "chargeOfPlot": 5000,
  "discount": 0,
  "totalBCV": 500000,
  "totalCost": 505000,
  "amount": 100000,
  "amountPaid": 100000,
  "modeOfPayment": "Online",
  "paymentDate": "2025-06-02",
  "bankName": "HDFC Bank",
  "emiMode": "Monthly"
}
```

### GET `/admin/bookings/unapproved?page=1&pageSize=20`
Returns all PENDING bookings awaiting approval.

### POST `/admin/bookings/:id/approve`
Approves booking, auto-generates receipt number (e.g., `REC000001`).

### POST `/admin/bookings/:id/unapprove`
Rejects/cancels a pending booking.

### GET `/admin/bookings?startDate=2025-01-01&endDate=2025-12-31&associateCode=IW100001&customerCode=Ramesh&page=1&pageSize=20`
Returns all bookings with filters.

### GET `/admin/bookings/receipts?page=1&pageSize=20`
Returns all confirmed bookings (with receipt numbers).

### GET `/admin/bookings/receipts/:id`
Returns full receipt data for a single booking (for printing).

---

## 🗂️ Admin — Masters 🔒 (Admin)

All Masters endpoints are prefixed with `/admin/masters/`. Require `config:read` / `config:write` permission.

### Account Master

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/masters/accounts?page=1&pageSize=20` | List all bank/cash accounts |
| POST | `/admin/masters/accounts` | Create account (accountName, underGroup, bankAccountNo, bankIfscCode, branchName, state, city, mobileNo, emailId, type) |
| PUT | `/admin/masters/accounts/:id` | Update account |
| DELETE | `/admin/masters/accounts/:id` | Delete account |

### Schemes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/masters/schemes?page=1&pageSize=20` | List all schemes |
| GET | `/admin/masters/schemes/:id` | Get scheme with images |
| POST | `/admin/masters/schemes` | Create scheme (schemeName, state, city, address, pinCode, schemeType, featuredScheme, googleMap, shortDescription, description) |
| PUT | `/admin/masters/schemes/:id` | Update scheme |
| DELETE | `/admin/masters/schemes/:id` | Soft delete scheme |
| PUT | `/admin/masters/schemes/:id/images` | Upload scheme images (body: `{ images: [{slot: 1, imageUrl: "..."}] }`, slots 1-6) |

### Plc Charges

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/masters/plc-charges?page=1&pageSize=50` | List PLC charges |
| POST | `/admin/masters/plc-charges` | Create PLC charge (plcName, chargeType: "Percentage"\|"Fixed", plcCharge) |
| PUT | `/admin/masters/plc-charges/:id` | Update PLC charge |
| DELETE | `/admin/masters/plc-charges/:id` | Delete PLC charge |

**PLC Charge examples:**
- Corner Plot, Percentage, 10% → adds 10% of plot cost
- East Facing, Fixed, 5000 → adds flat ₹5000

### Plot Types (Flat/Plot/Shop Master)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/masters/plot-types?page=1&pageSize=50` | List plot types |
| POST | `/admin/masters/plot-types` | Create type (typeName) |
| PUT | `/admin/masters/plot-types/:id` | Update type |
| DELETE | `/admin/masters/plot-types/:id` | Delete type |

### Plots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/masters/plots?schemeId=uuid&page=1&pageSize=20` | List plots (optionally filtered by scheme) |
| POST | `/admin/masters/plots` | Create plot |
| PUT | `/admin/masters/plots/:id` | Update plot |
| DELETE | `/admin/masters/plots/:id` | Delete plot |

**Create/Update Plot body:**
```json
{
  "schemeId": "scheme-uuid",
  "plotTypeId": "type-uuid",
  "plotSizeUnit": "Square Yards",
  "plotSize": 200,
  "totalCost": 500000,
  "plotNo": "46",
  "plcId": "plc-charge-uuid",
  "chargeOfPlot": 50000,
  "totalCostOfPlot": 550000,
  "status": "Not Used"
}
```

**Plot status values:** `Not Used`, `Booked`, `Sold`

**Auto-calculation logic:**
- `chargeOfPlot` = if PLC is Percentage: `totalCost × (plcCharge / 100)`, if Fixed: `plcCharge`
- `totalCostOfPlot` = `totalCost + chargeOfPlot`

---

## 📝 Test Data (from seed.js)

### Associates
| User ID | Name | Status | Rank |
|---------|------|--------|------|
| IW100001 | Rajesh Kumar | ACTIVE | 3 |
| IW100002 | Suresh Sharma | ACTIVE | 2 |
| IW100003 | Priya Verma | ACTIVE | 1 |
| IW100004 | Amit Patel | ACTIVE | 1 |
| IW100005 | Kavita Joshi | INACTIVE | 1 |

**Password for all:** `Test@1234`

### Properties
| ID | Name | City | Type |
|----|------|------|------|
| prop-001 | Green Valley Phase 1 | Jaipur | Plot |
| prop-002 | Royal Enclave | Ajmer | Farmhouse |
| prop-003 | IWR Commercial Hub | Jaipur | Commercial |

### Bookings
- **REC000001** — IW100001, Green Valley, Plot 46, ₹1,00,000 deposit (CONFIRMED)
- **REC000002** — IW100002, Royal Enclave, Plot 78, ₹2,00,000 deposit (CONFIRMED)
- **REC000003** — IW100003, Green Valley, Plot 52, ₹75,000 deposit (CONFIRMED)
- **booking-004** — IW100004, IWR Commercial Hub (PENDING — use for approve/reject testing)
- **booking-005** — IW100001, Royal Enclave (PENDING)
- **booking-006** — IW100002, Green Valley (PENDING)

### Admin
| Email | Password |
|-------|----------|
| admindevelopertest@yopmail.com | Admin@123456 |

---

_Document version: 1.1.0 | Updated: June 2026_

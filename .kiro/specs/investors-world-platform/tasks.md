# Tasks

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize Project Structure
- [x] Create monorepo folder structure: `server/`, `admin/`, `landing-site/`
- [x] Initialize `server/` with Node.js + Express (JavaScript, no TypeScript)
- [x] Initialize `admin/` with React + Vite + Tailwind CSS
- [x] Initialize `landing-site/` with Next.js + Tailwind CSS
- [x] Set up shared `.env` configuration pattern across all apps
- [x] Configure ESLint & Prettier for consistent code style

### Task 2: Database & ORM Setup
- [x] Install and configure Prisma ORM in `server/`
- [x] Set up PostgreSQL database connection (Neon for dev, local VPS for production)
- [x] Create full Prisma schema with all models: `Associate`, `TreeNode`, `Wallet`, `Transaction`, `Package`, `IncomePlan`, `IncomeRecord`, `Payout`, `Property`, `PropertyImage`, `PropertyVideo`, `Booking`, `KYCDocument`, `DeviceToken`, `Notification`, `SupportTicket`, `TicketMessage`, `Admin`, `AdminRole`, `AdminAuditLog`, `WithdrawalRequest`, `PropertyInquiry`, `ContactInquiry`, `AppVersion`, `BrandingAsset`, `MasterState`, `MasterCity`, `PropertyCategory`
- [x] Define all enums: `AssociateStatus`, `LegPosition`, `TransactionType`, `TransactionStatus`, `IncomeType`, `IncomeStatus`, `PayoutStatus`, `PropertyStatus`, `BookingStatus`, `KYCType`, `KYCStatus`, `NotificationType`, `TicketStatus`, `WithdrawalStatus`
- [x] Set up all indexes as defined in design document
- [x] Run initial Prisma migration
- [x] Seed database with default admin role (Super Admin) and master data
- [x] Seed default `IncomePlan` records: level percentages (levels 1–N), matching income rules, and reward milestones so the commission engine has valid configuration on first run

### Task 3: Redis Setup
- [x] Install and configure Redis client (`ioredis`)
- [x] Create Redis utility module with connection management
- [x] Define key patterns: `otp:{identifier}`, `auth:blacklist:{token}`, `rate:{ip}:{endpoint}`, `lock:{userId}`, `cache:dashboard:{adminId}`, `cache:packages`, `cache:properties:featured`, `session:{refreshToken}`
- [x] Implement Redis health check helper

### Task 4: Server Boilerplate & Middleware Stack
- [x] Set up Express app with Helmet, CORS, body parser (JSON + multipart)
- [x] Configure Morgan request logger
- [x] Implement centralized error handler middleware
- [x] Set up API versioning under `/api/v1` prefix
- [x] Implement consistent JSON response format: `{ status, message, data }`
- [x] Implement pagination utility with `currentPage`, `totalPages`, `totalItems`, `pageSize` (default 20, max 100)
- [x] Configure Multer for file uploads (profile photos, KYC docs, property images, videos)
- [x] Set up PM2 ecosystem config for cluster mode (4 workers)

### Task 5: Firebase Admin SDK Setup
- [x] Install and configure Firebase Admin SDK
- [x] Create notification service utility with FCM integration
- [x] Implement topic subscription support (`all_users`, package-specific, region-specific)
- [x] Implement retry logic for failed notification delivery (max 3 attempts, exponential backoff)

---

## Phase 2: Authentication & Security (Requirements 1, 12, 27)

### Task 6: Associate Authentication Module (`/api/v1/auth`)
- [x] Implement `POST /login` — authenticate with User ID + password, return JWT access token (15min expiry) + refresh token (7d expiry)
- [x] Implement `POST /refresh` — exchange refresh token for new access token
- [x] Implement `POST /logout` — invalidate tokens, remove device token
- [x] Implement `POST /forgot-password` — generate OTP, send via SMS/email, store in Redis (5min TTL)
- [x] Implement `POST /reset-password` — validate OTP within 5min window, set new password
- [x] Implement `POST /change-password` — validate current password, enforce password strength (8 chars, 1 uppercase, 1 number, 1 special char)
- [x] Implement account lockout after 5 failed consecutive attempts (30min lock via Redis)
- [x] Return generic "Invalid credentials" message on auth failure (no credential-specific hints)
- [x] Store refresh tokens in Redis with 7d TTL for validation
- [x] Return user preferences (theme, language) in login response

### Task 7: Auth Middleware
- [x] Implement JWT verification middleware for protected routes
- [x] Implement refresh token validation logic
- [x] Return 401 on expired/invalid tokens with prompt to refresh

### Task 8: Rate Limiter Middleware
- [x] Implement Redis-backed rate limiter
- [x] Configure 100 requests/min for public endpoints
- [x] Configure 300 requests/min for authenticated endpoints
- [x] Return 429 with "Too many requests" when limit exceeded

### Task 9: Admin Authentication (`/api/v1/admin/auth`)
- [x] Implement admin login with OTP as second factor
- [x] Implement admin JWT with role permissions embedded
- [x] Implement Role Guard middleware (check permissions per endpoint)
- [x] Support admin roles: Super Admin, Manager, Support, Accounts
- [x] Log all admin actions to `AdminAuditLog` table (admin ID, action, target entity, timestamp, IP)

### Task 10: Input Validation & Sanitization
- [x] Set up express-validator or Joi for request validation
- [x] Implement input sanitization to prevent SQL injection and XSS
- [x] Create validation schemas for all endpoints

---

## Phase 3: Core Associate Features (Requirements 2, 3, 7, 25)

### Task 11: Associate Registration Module (`/api/v1/registration`)
- [x] Implement `POST /register` — validate sponsor ID, generate unique User ID (`IW` + 6 digits), place in binary tree with spillover
- [x] Implement `GET /validate-sponsor` — check sponsor exists and is active
- [x] Implement `POST /activate` — activate with package payment, trigger Direct Income for sponsor
- [x] Validate mandatory fields: name, phone, email, address, PAN number, package selection
- [x] Validate phone and email uniqueness across Associates
- [x] Implement BFS spillover for occupied positions in specified leg — BFS must respect the leg preference (left/right) at every level, not just the immediate sponsor position

### Task 12: Associate Dashboard Module (`/api/v1/associate/dashboard`)
- [x] Implement `GET /dashboard` — return last payment, total payments, self-invested, total network amount, joining date, activation date, package name, masked PAN, total activations
- [x] Implement `GET /advance-payment` — return credit amount, debit amount, current balance
- [x] Implement `GET /referral-link` — generate unique referral URL with User ID
- [x] Implement `GET /referral-qr` — generate QR code image encoding referral link

### Task 13: Associate Profile Module (`/api/v1/associate/profile`)
- [x] Implement `GET /profile` — return all personal details, sponsor info, placement info
- [x] Implement `PATCH /profile` — update editable fields only (phone, email, address); restrict name, DOB, sponsor ID, placement
- [x] Implement `POST /profile/photo` — upload profile photo (validate JPEG/PNG, max 2MB)
- [x] Implement `POST /kyc/pan` — submit PAN card details + document image (pending verification)
- [x] Implement `POST /kyc/aadhaar` — submit Aadhaar details + document image (pending verification)
- [x] Implement `POST /kyc/bank` — submit bank details (account number, IFSC, bank name, branch) with pending status

### Task 14: Associate Settings (`/api/v1/associate/settings`)
- [x] Implement `GET /settings` — return theme and language preferences
- [x] Implement `PATCH /settings` — update theme (dark/light) and language (en/hi) preferences

---

## Phase 4: MLM Engine — Genealogy & Commissions (Requirements 4, 6, 35)

### Task 15: Binary Tree / Genealogy Module (`/api/v1/genealogy`)
- [x] Implement `GET /tree` — return binary tree structure from associate's position with configurable depth (default 5 levels)
- [x] Implement `GET /downline` — paginated downline list with status, joining date, package
- [x] Implement `GET /sponsor` — return sponsor name, User ID, phone, email
- [x] Implement `GET /team-summary` — left leg volume + right leg volume
- [x] Implement downline filters: by status (active/inactive), by leg (left/right), by level depth

### Task 16: MLM Service — Commission Engine
- [x] Implement `calculateDirectIncome(sponsorId, packageId)` — package price × direct income percentage
- [x] Implement `calculateLevelIncome(associateId)` — business volume × configured level-N percentage
- [x] Implement `calculateMatchingIncome(associateId)` — min(leftVolume, rightVolume) × matching percentage, track carry-forward
- [x] Implement `calculateRewardIncome(associateId)` — check total business volume against configured milestones

### Task 17: Income Module (`/api/v1/income`)
- [x] Implement `GET /summary` — total earnings broken down by Direct, Level, Matching, Reward
- [x] Implement `GET /history` — paginated income transactions with date, type, amount, source Associate ID
- [x] Implement `POST /calculator` — projected commissions based on referrals and team depth (uses active income plan config)

### Task 18: Commission Calculator (Public) (`/api/v1/public/commission-calculator`)
- [x] Implement `POST /commission-calculator` — calculate estimated earnings for visitors without auth
- [x] Return breakdown by income type with assumptions stated

---

## Phase 5: Wallet & Financial Operations (Requirements 8, 6, 31, 32)

### Task 19: Wallet Module (`/api/v1/wallet`)
- [x] Implement `GET /balance` — current balance, total credits, total debits
- [x] Implement `POST /transfer` — fund transfer to another associate by User ID (validate recipient, atomic debit/credit, record both transactions)
- [x] Implement `GET /transactions` — paginated transaction history with date, type, amount, description, counterparty
- [x] Implement `POST /withdraw` — create withdrawal request (validate against available balance)
- [x] Implement `GET /withdrawals` — paginated withdrawal history with date, amount, status, transaction ref
- [x] Ensure all wallet operations are atomic via Prisma `$transaction()`
- [x] Send notifications to both sender and recipient on fund transfer
- [x] Implement Wallet Balance Invariant: balance = totalCredits - totalDebits, never negative

### Task 20: Property Booking Module (`/api/v1/properties`)
- [x] Implement `POST /:id/book` — create booking request (validate property is AVAILABLE)
- [x] Implement `GET /bookings` — paginated booking history with property details, date, amount, status
- [x] Reject booking for BOOKED or SOLD properties with "property unavailable" error
- [x] Generate booking confirmation receipt PDF on successful booking
- [x] Implement admin approve/cancel booking with push notification

### Task 21: EMI Calculator (`/api/v1/properties/emi-calculator`)
- [x] Implement `POST /emi-calculator` — calculate monthly EMI using reducing balance formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
- [x] Return monthly EMI, total interest, total payment
- [x] Implement EMI schedule endpoint — month-wise breakdown (principal, interest, remaining balance)
- [x] Validate sum of principal components equals P (within rounding tolerance)

---

## Phase 6: Property Management (Requirements 5, 33)

### Task 22: Property Listings (`/api/v1/properties`)
- [x] Implement `GET /` — paginated property list with thumbnail, name, location, price, availability
- [x] Implement `GET /:id` — full property details with all images, description, amenities, video tour URLs, booking status
- [x] Implement `POST /:id/inquiry` — submit property inquiry (associate ID, property ID, message; notify admin)
- [x] Implement property filters: location, price range, property type

### Task 23: Public Property Endpoints (`/api/v1/public`)
- [x] Implement `GET /properties` — public property listings (no auth required)
- [x] Implement `POST /emi-calculator` — public EMI calculator (no auth required)

---

## Phase 7: Notifications & Documents (Requirements 9, 10, 11)

### Task 24: Notification Module (`/api/v1/notifications`)
- [x] Implement `POST /device-token` — register Firebase device token (support multi-device)
- [x] Implement `DELETE /device-token` — remove device token on logout
- [x] Implement `GET /` — paginated notification history with read/unread, title, message, type, timestamp
- [x] Implement `PATCH /:id/read` — mark notification as read
- [x] Trigger push notifications for: payout processed, new registration under sponsor, property listed/updated, announcements, income credit, KYC approved/rejected, booking status change
- [x] Support FCM topics: `all_users`, package-specific, region-specific

### Task 25: Document Module (`/api/v1/documents`)
- [x] Implement `GET /welcome-letter` — generate PDF with registration details, sponsor info, package, joining date
- [x] Implement `GET /receipt/:transactionId` — generate PDF receipt with transaction details
- [x] Implement `GET /agreement` — generate PDF membership agreement with terms and package details
- [x] Implement `GET /kyc` — return URLs to uploaded PAN, Aadhaar, bank proof documents
- [x] Restrict document access to owning associate and authorized admins

### Task 26: Support Module (`/api/v1/support`)
- [x] Implement `GET /tickets` — paginated list with ticket number, subject, status, creation date
- [x] Implement `POST /tickets` — create ticket with unique ticket number and pending status
- [x] Implement `GET /tickets/:id` — full conversation thread including admin responses
- [x] Implement `POST /tickets/:id/reply` — append message to thread, notify admin

---

## Phase 8: Admin Panel Backend (Requirements 12–23)

### Task 27: Admin Dashboard (`/api/v1/admin/dashboard`)
- [x] Implement `GET /dashboard` — total associates, active count, inactive/red count, today's registrations, total business volume, pending withdrawals, total payouts
- [x] Implement `GET /recent-transactions` — 20 most recent transactions across all types
- [x] Cache dashboard metrics in Redis with 60s TTL

### Task 28: Admin Associate Management (`/api/v1/admin/associates`)
- [x] Implement `POST /` — admin register new associate with sponsor, placement, package
- [x] Implement `PATCH /:id` — admin edit associate details (log modification)
- [x] Implement `POST /:id/activate` — activate associate, set activation date, trigger income calculations
- [x] Implement `POST /:id/suspend` — suspend associate (block login + commissions)
- [x] Implement `GET /:id` — complete profile, KYC status, wallet balance, income summary, team stats
- [x] Reject deletion of associate with active downline members

### Task 29: Admin Genealogy (`/api/v1/admin/genealogy`)
- [x] Implement `GET /tree/:associateId` — complete tree with configurable depth
- [x] Implement `GET /search` — search associate by User ID or name, return position in tree
- [x] Implement `GET /level-analysis` — associate count, active count, business volume per level
- [x] Implement `GET /business-tracking/:associateId` — left/right volume, carry-forward, paired volume

### Task 30: Admin Payout Management (`/api/v1/admin/payouts`)
- [x] Implement `POST /generate` — calculate all pending incomes for all eligible associates, create payout records
- [x] Implement `GET /pending` — paginated pending payouts with income breakdown
- [x] Implement `POST /:id/approve` — approve payout, credit to associate wallet
- [x] Implement `POST /:id/reject` — reject with reason, notify associate
- [x] Implement `GET /reports` — filterable by date range, income type, associate ID
- [x] Implement `GET /export` — download payout data as PDF or Excel

### Task 31: Admin Reports (`/api/v1/admin/reports`)
- [x] Implement joining report (date range filter)
- [x] Implement activation report (date range filter)
- [x] Implement income report (type + date range filter)
- [x] Implement withdrawal report (date range + status filter)
- [x] Implement fund transfer report (date range filter)
- [x] Implement user-wise report (complete financial history for specific associate)
- [x] Implement report export in PDF and Excel formats

### Task 32: Admin Fund Management (`/api/v1/admin/funds`)
- [x] Implement `POST /credit` — add funds with reason (record admin ID + reason)
- [x] Implement `POST /debit` — deduct funds with reason (reject if exceeds balance)
- [x] Implement `POST /transfer` — transfer between associate wallets
- [x] Implement `GET /logs` — paginated, filterable admin-initiated fund operations

### Task 33: Admin Property Management (`/api/v1/admin/properties`)
- [x] Implement `POST /` — create property listing with details (name, desc, location, area, price, type, amenities)
- [x] Implement `POST /:id/images` — upload up to 10 images (each under 5MB)
- [x] Implement `POST /:id/video` — upload video tour (MP4/MOV, max 100MB)
- [x] Implement `PATCH /:id` — edit property details
- [x] Implement `PATCH /:id/status` — update availability (available/booked/sold), notify interested associates
- [x] Implement `DELETE /:id` — soft-delete (set inactive, don't permanently remove)
- [x] Implement `GET /:id/inquiries` — all inquiries for property with associate details

### Task 34: Admin Notification Management (`/api/v1/admin/notifications`)
- [x] Implement `POST /` — create notification with title, message, target (all/specific/by package), queue via FCM
- [x] Implement `POST /promotional` — bulk promotional message delivery
- [x] Implement `POST /payment-alert` — payment alert to specific associate
- [x] Implement `GET /history` — paginated sent notifications with delivery status and target audience

### Task 35: Admin KYC Management (`/api/v1/admin/kyc`)
- [x] Implement `GET /pending` — paginated pending KYC submissions
- [x] Implement `POST /:id/approve` — approve KYC document, notify associate
- [x] Implement `POST /:id/reject` — reject with reason, notify associate, allow re-submission
- [x] Implement `GET /:associateId` — all KYC documents with status and dates

### Task 36: Admin Master Configuration (`/api/v1/admin/config`)
- [x] Implement CRUD for Packages (name, price, benefits, commission percentages)
- [x] Implement CRUD for Income Plans (level percentages, matching rules, reward milestones)
- [x] Implement CRUD for Property Categories
- [x] Implement CRUD for Geographic Data (States/Cities)
- [x] Implement CRUD for Admin Roles with permissions
- [x] Prevent deletion of master records referenced by active associates or properties

### Task 37: Admin Transaction Management (`/api/v1/admin/transactions`)
- [x] Implement `GET /` — paginated, filterable transactions (date range, type, associate, status)
- [x] Implement `GET /payment-gateway` — payment gateway records with reference, amount, status
- [x] Implement `GET /wallet/:associateId` — all wallet entries for specific associate
- [x] Implement `GET /withdrawals` — withdrawal requests with status filter and processing details
- [x] Implement `POST /withdrawals/:id/approve` — approve withdrawal request, update status to APPROVED, record transaction reference
- [x] Implement `POST /withdrawals/:id/reject` — reject withdrawal request with reason, update status to REJECTED, notify associate

### Task 38: App Version & Branding (`/api/v1/admin/app-version`, `/api/v1/public`)
- [x] Implement admin CRUD for app version management (min version, latest version, store URL, force update flag)
- [x] Implement `GET /api/v1/public/app-version` — return current min/latest version, force update status
- [x] Implement app version check logic (force update required / optional update / current)
- [x] Implement admin CRUD for branding assets (logo, splash screen)
- [x] Implement `GET /api/v1/public/branding` — serve branding assets

---

## Phase 9: Public API & Health (Requirements 24, 26, 30)

### Task 39: Public Endpoints (`/api/v1/public`)
- [x] Implement `POST /contact` — submit contact form inquiry for admin review
- [x] Implement `GET /health` — return server status, database connectivity, Redis connectivity

### Task 39a: Admin Contact Inquiry Management (`/api/v1/admin/contact`)
- [x] Implement `GET /` — paginated list of all contact form submissions with name, email, phone, message, and submission date
- [x] Implement `GET /:id` — view individual contact inquiry details

### Task 40: API Documentation
- [ ] Set up Swagger/OpenAPI at `/api/docs` (non-production only)
- [ ] Document all endpoints: request params, body schema, response schema, auth requirements, examples
- [ ] Group docs by module: auth, dashboard, profile, genealogy, wallet, payout, property, notification, admin, support

---

## Phase 10: Multi-Language Support (Requirement 34)

### Task 41: Localization
- [x] Create i18n utility for API response messages
- [x] Create English (`en`) and Hindi (`hi`) translation files for all user-facing messages
- [x] Implement `Accept-Language` header parsing for unauthenticated requests
- [x] Use associate's saved language preference for authenticated responses
- [x] Prepare translation keys for Landing Site static content
- [x] Prepare translation keys for Admin Panel interface

---

## Phase 11: Admin Panel Frontend

### Task 42: Admin Panel Setup & Auth
- [ ] Set up React + Vite + Tailwind CSS project with routing
- [ ] Implement admin login page with OTP verification
- [ ] Implement role-based navigation (show/hide features per role)
- [ ] Handle token expiry with redirect to login
- [ ] Wire up i18n (English/Hindi) using the translation keys prepared in Task 41 — apply to all admin panel pages

### Task 43: Admin Dashboard Page
- [ ] Build dashboard with key metrics cards (total associates, active, inactive, today's registrations, business volume, pending withdrawals, total payouts)
- [ ] Display visual indicators for daily/weekly trends
- [ ] Display 20 most recent transactions

### Task 44: Admin Associate Management Pages
- [ ] Build associate list page with search and filters
- [ ] Build add/edit associate form
- [ ] Build associate detail page (profile, KYC, wallet, income, team stats)
- [ ] Build activate/suspend action buttons

### Task 45: Admin Genealogy Page
- [ ] Build interactive binary tree visualization
- [ ] Build associate search within tree
- [ ] Build level-wise analysis view
- [ ] Build business tracking view per associate

### Task 46: Admin Financial Pages
- [ ] Build payout generation and management page
- [ ] Build payout approval/rejection workflow UI
- [ ] Build fund management page (credit/debit/transfer)
- [ ] Build transaction log viewer with filters

### Task 47: Admin Reports Pages
- [ ] Build report pages: joining, activation, income, withdrawal, fund transfer, user-wise
- [ ] Build date range and filter controls
- [ ] Implement PDF and Excel export functionality

### Task 48: Admin Property Management Page
- [ ] Build property CRUD interface with image and video upload
- [ ] Build property inquiry viewer
- [ ] Build property status management

### Task 49: Admin KYC & Notifications Pages
- [ ] Build KYC review queue with approve/reject workflow
- [ ] Build notification composer with audience targeting
- [ ] Build notification history viewer

### Task 50: Admin Master Configuration Pages
- [ ] Build package configuration CRUD
- [ ] Build income plan configuration CRUD
- [ ] Build property category management
- [ ] Build state/city management
- [ ] Build role & permissions management

---

## Phase 12: Landing Site (Next.js) (Requirement 24)

### Task 51: Landing Site Setup & Layout
- [ ] Set up Next.js + Tailwind CSS project with responsive layout
- [ ] Implement header/footer with navigation
- [ ] Implement dark mode / light mode toggle
- [ ] Ensure full responsiveness (mobile, tablet, desktop)

### Task 52: Landing Site Pages
- [ ] Build homepage: company overview, featured properties, income plan highlights, registration CTA
- [ ] Build about page: company history, mission, vision, team
- [ ] Build properties page: property listings from API with filters
- [ ] Build property detail page: images, details, amenities, video player (play/pause/fullscreen)
- [ ] Build contact page: office address, phone, email, contact form submission
- [ ] Build EMI calculator tool on properties section (no auth required)
- [ ] Build commission calculator on income plan page (no auth required)
- [ ] Display WhatsApp number, phone, email for direct support

### Task 53: Landing Site i18n
- [ ] Implement language switching between English and Hindi
- [ ] Translate all static content

---

## Phase 13: Testing (Design — Testing Strategy)

### Task 54: Test Infrastructure
- [ ] Set up Jest + fast-check testing framework
- [ ] Create test database setup/teardown helpers
- [ ] Create FCM and SMS mock utilities
- [ ] Create fast-check arbitraries (generators) for Associate, Transaction, Tree, etc.

### Task 55: Property-Based Tests
- [ ] Wallet Balance Invariant (Property 1)
- [ ] Fund Transfer Conservation (Property 2)
- [ ] Binary Tree Placement Correctness (Property 3)
- [ ] EMI Calculation Correctness (Property 4)
- [ ] Commission Calculation Correctness (Property 5)
- [ ] Reward Income Threshold (Property 6)
- [ ] Team Filter Consistency (Property 7)
- [ ] Property Filter Consistency (Property 8)
- [ ] User ID Uniqueness and Format (Property 9)
- [ ] Withdrawal Balance Guard (Property 10)
- [ ] Soft-Delete Exclusion (Property 11)
- [ ] Restricted Field Immutability (Property 12)
- [ ] Password Strength Enforcement (Property 13)
- [ ] Role-Based Access Control (Property 14)
- [ ] Rate Limiting Enforcement (Property 15)
- [ ] API Response Format Consistency (Property 16)
- [ ] Page Size Bounds (Property 17)
- [ ] Error Response Safety (Property 18)
- [ ] Income Summary Invariant (Property 19)
- [ ] Property Booking Availability Guard (Property 20)
- [ ] Tree Depth Constraint (Property 21)
- [ ] File Upload Validation (Property 22)

### Task 56: Unit Tests
- [ ] Authentication flow (login, OTP, lockout, token refresh)
- [ ] Registration validation (required fields, duplicate checks)
- [ ] KYC status transitions (pending → approved/rejected)
- [ ] Booking status transitions (pending → confirmed/cancelled)
- [ ] Support ticket lifecycle (open → in-progress → resolved → closed)
- [ ] Admin CRUD operations
- [ ] PDF generation content verification
- [ ] Notification payload construction

### Task 57: Integration Tests
- [ ] Full API endpoint request/response cycles (all modules)
- [ ] Database transaction isolation verification
- [ ] Redis caching behavior verification
- [ ] File upload/download flows
- [ ] Pagination across all list endpoints
- [ ] Error response format verification
- [ ] Authentication middleware chain

---

## Phase 14: Performance, Security & Deployment (Requirement 27, 28, 29)

### Task 58: Performance Optimization
- [ ] Configure PM2 cluster mode (4 workers on 4 vCPU)
- [ ] Configure Nginx reverse proxy with SSL termination and static file serving
- [ ] Implement Redis caching for: packages (1h TTL), featured properties (5min TTL), dashboard metrics (60s TTL)
- [ ] Load test with k6 or Artillery targeting 5000 concurrent users
- [ ] Verify p95 response time < 500ms, error rate < 1%
- [ ] Focus performance testing on: dashboard, tree view, wallet operations

### Task 59: Security Hardening
- [ ] Enforce HTTPS for all endpoints in production
- [ ] Configure Helmet security headers
- [ ] Configure CORS policies
- [ ] Verify input sanitization prevents SQL injection and XSS
- [ ] Ensure JWT access tokens expire in 15min, refresh tokens in 7d
- [ ] Ensure all error responses do not expose stack traces, file paths, or internal details
- [ ] Verify soft-delete records are excluded from standard queries but accessible via admin audit

### Task 60: Data Integrity
- [ ] Verify all foreign key constraints are enforced
- [ ] Verify all wallet operations use Prisma `$transaction()`
- [ ] Verify all timestamps stored in UTC
- [ ] Verify User ID format: `IW` + 6 sequential digits
- [ ] Verify soft-delete implementation for Associates, Properties, Transactions

### Task 61: Deployment
- [ ] Set up Hostinger VPS (KVM 4: 4 vCPU, 8GB RAM, 200GB SSD)
- [ ] Install Node.js, PostgreSQL, Redis, Nginx, PM2
- [ ] Configure Nginx as reverse proxy with SSL (Let's Encrypt)
- [ ] Configure Nginx to serve uploaded files from local disk storage (profile photos, KYC documents, property images, videos) with appropriate access rules
- [ ] Create upload directory structure: `uploads/profiles/`, `uploads/kyc/`, `uploads/properties/images/`, `uploads/properties/videos/`
- [ ] Configure PM2 ecosystem file for zero-downtime restarts
- [ ] Set up log rotation (daily, 30-day retention)
- [ ] Configure production environment variables
- [ ] Deploy API Server, Admin Panel, Landing Site
- [ ] Verify health check endpoint returns correct status
- [ ] Set up database backup strategy

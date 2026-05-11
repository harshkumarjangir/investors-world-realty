import swaggerUi from 'swagger-ui-express';

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Investors World Realty API',
    version: '1.0.0',
    description: 'MLM Real Estate Platform — Full API Documentation',
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth', description: 'Associate authentication' },
    { name: 'Admin Auth', description: 'Admin authentication (2FA)' },
    { name: 'Associate', description: 'Dashboard, profile, settings' },
    { name: 'Registration', description: 'Associate registration & activation' },
    { name: 'Genealogy', description: 'Binary tree and team' },
    { name: 'Income', description: 'Income and commissions' },
    { name: 'Wallet', description: 'Wallet and transactions' },
    { name: 'Properties', description: 'Property listings, booking, EMI' },
    { name: 'Notifications', description: 'Push notifications & device tokens' },
    { name: 'Documents', description: 'PDF documents (welcome letter, receipts)' },
    { name: 'Support', description: 'Support tickets' },
    { name: 'Admin', description: 'Admin panel endpoints' },
    { name: 'Public', description: 'Public endpoints (no auth)' },
  ],
  paths: {
    // ─── Auth ─────────────────────────────────────────────────────────────
    '/auth/login': {
      post: { tags: ['Auth'], summary: 'Login with User ID + password', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userId', 'password'], properties: { userId: { type: 'string', example: 'IW100001' }, password: { type: 'string' }, deviceToken: { type: 'string' }, platform: { type: 'string', enum: ['android', 'ios', 'web'] } } } } } }, responses: { 200: { description: 'Returns accessToken + refreshToken + user' }, 401: { description: 'Invalid credentials' }, 423: { description: 'Account locked' } } },
    },
    '/auth/refresh': {
      post: { tags: ['Auth'], summary: 'Refresh access token', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } } }, responses: { 200: { description: 'New access token' }, 401: { description: 'Invalid refresh token' } } },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout (invalidate tokens)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logged out' } } },
    },
    '/auth/forgot-password': {
      post: { tags: ['Auth'], summary: 'Send OTP for password reset', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['identifier'], properties: { identifier: { type: 'string', description: 'Phone or email' } } } } } }, responses: { 200: { description: 'OTP sent (if account exists)' } } },
    },
    '/auth/reset-password': {
      post: { tags: ['Auth'], summary: 'Reset password with OTP', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['identifier', 'otp', 'newPassword'], properties: { identifier: { type: 'string' }, otp: { type: 'string', minLength: 6, maxLength: 6 }, newPassword: { type: 'string' } } } } } }, responses: { 200: { description: 'Password reset' }, 400: { description: 'Invalid OTP or weak password' } } },
    },
    '/auth/change-password': {
      post: { tags: ['Auth'], summary: 'Change password (authenticated)', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } } }, responses: { 200: { description: 'Password changed' }, 400: { description: 'Incorrect current password or weak new password' } } },
    },

    // ─── Admin Auth ────────────────────────────────────────────────────────
    '/admin/auth/login': {
      post: { tags: ['Admin Auth'], summary: 'Admin login step 1 (credentials → OTP)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } } }, responses: { 200: { description: 'OTP sent, returns adminId' }, 401: { description: 'Invalid credentials' } } },
    },
    '/admin/auth/verify-otp': {
      post: { tags: ['Admin Auth'], summary: 'Admin login step 2 (verify OTP → JWT)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['adminId', 'otp'], properties: { adminId: { type: 'string' }, otp: { type: 'string' } } } } } }, responses: { 200: { description: 'Returns accessToken + admin info' }, 400: { description: 'Invalid OTP' } } },
    },

    // ─── Registration ─────────────────────────────────────────────────────
    '/registration/validate-sponsor': {
      get: { tags: ['Registration'], summary: 'Validate sponsor ID', parameters: [{ name: 'sponsorId', in: 'query', required: true, schema: { type: 'string', example: 'IW100001' } }], responses: { 200: { description: 'Sponsor is valid' }, 400: { description: 'Sponsor not found or inactive' } } },
    },
    '/registration/register': {
      post: { tags: ['Registration'], summary: 'Register new associate', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'phone', 'email', 'address', 'panNumber', 'sponsorId', 'placement', 'packageId', 'password'], properties: { name: { type: 'string' }, phone: { type: 'string', pattern: '^[6-9]\\d{9}$' }, email: { type: 'string', format: 'email' }, address: { type: 'string' }, city: { type: 'string' }, state: { type: 'string' }, pincode: { type: 'string' }, panNumber: { type: 'string' }, sponsorId: { type: 'string' }, placement: { type: 'string', enum: ['LEFT', 'RIGHT'] }, packageId: { type: 'string' }, password: { type: 'string', minLength: 8 }, dateOfBirth: { type: 'string', format: 'date' } } } } } }, responses: { 201: { description: 'Associate registered (INACTIVE)' }, 400: { description: 'Validation error' } } },
    },
    '/registration/activate': {
      post: { tags: ['Registration'], summary: 'Activate associate with package', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['associateId', 'packageId'], properties: { associateId: { type: 'string' }, packageId: { type: 'string' } } } } } }, responses: { 200: { description: 'Associate activated' }, 400: { description: 'Already active or invalid package' } } },
    },

    // ─── Associate ────────────────────────────────────────────────────────
    '/associate/dashboard': { get: { tags: ['Associate'], summary: 'Get dashboard metrics', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Dashboard data' } } } },
    '/associate/advance-payment': { get: { tags: ['Associate'], summary: 'Get advance payment (wallet summary)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Credit/debit/balance' } } } },
    '/associate/referral-link': { get: { tags: ['Associate'], summary: 'Get referral link', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Referral URL' } } } },
    '/associate/referral-qr': { get: { tags: ['Associate'], summary: 'Get referral QR code (base64)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'QR code data URL' } } } },
    '/associate/profile': {
      get: { tags: ['Associate'], summary: 'Get profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Full profile with sponsor/KYC' } } },
      patch: { tags: ['Associate'], summary: 'Update profile (phone, email, address only)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated profile' } } },
    },
    '/associate/profile/photo': { post: { tags: ['Associate'], summary: 'Upload profile photo (JPEG/PNG, max 2MB)', security: [{ bearerAuth: [] }], requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { photo: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Photo URL' } } } },
    '/associate/kyc/pan': { post: { tags: ['Associate'], summary: 'Submit PAN card', security: [{ bearerAuth: [] }], requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { document: { type: 'string', format: 'binary' }, documentNumber: { type: 'string' } } } } } }, responses: { 200: { description: 'KYC submitted' } } } },
    '/associate/kyc/aadhaar': { post: { tags: ['Associate'], summary: 'Submit Aadhaar card', security: [{ bearerAuth: [] }], responses: { 200: { description: 'KYC submitted' } } } },
    '/associate/kyc/bank': { post: { tags: ['Associate'], summary: 'Submit bank details', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Bank details submitted' } } } },
    '/associate/settings': {
      get: { tags: ['Associate'], summary: 'Get settings (theme, language)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Settings' } } },
      patch: { tags: ['Associate'], summary: 'Update settings', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated settings' } } },
    },

    // ─── Genealogy ────────────────────────────────────────────────────────
    '/genealogy/tree': { get: { tags: ['Genealogy'], summary: 'Get binary tree (configurable depth)', security: [{ bearerAuth: [] }], parameters: [{ name: 'depth', in: 'query', schema: { type: 'integer', default: 5 } }], responses: { 200: { description: 'Tree structure' } } } },
    '/genealogy/downline': { get: { tags: ['Genealogy'], summary: 'Get paginated downline', security: [{ bearerAuth: [] }], parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'leg', in: 'query', schema: { type: 'string', enum: ['left', 'right'] } }, { name: 'level', in: 'query', schema: { type: 'integer' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'pageSize', in: 'query', schema: { type: 'integer' } }], responses: { 200: { description: 'Paginated downline' } } } },
    '/genealogy/sponsor': { get: { tags: ['Genealogy'], summary: 'Get sponsor details', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sponsor info' } } } },
    '/genealogy/team-summary': { get: { tags: ['Genealogy'], summary: 'Get left/right volume', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Team volumes' } } } },

    // ─── Income ───────────────────────────────────────────────────────────
    '/income/summary': { get: { tags: ['Income'], summary: 'Income breakdown by type', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Income summary' } } } },
    '/income/history': { get: { tags: ['Income'], summary: 'Paginated income history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Income records' } } } },
    '/income/calculator': { post: { tags: ['Income'], summary: 'Project commissions', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { referrals: { type: 'integer' }, depth: { type: 'integer' }, packageId: { type: 'string' } } } } } }, responses: { 200: { description: 'Projected earnings' } } } },

    // ─── Wallet ───────────────────────────────────────────────────────────
    '/wallet/balance': { get: { tags: ['Wallet'], summary: 'Get wallet balance', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Balance, credits, debits' } } } },
    '/wallet/transfer': { post: { tags: ['Wallet'], summary: 'Transfer funds to another associate', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['recipientUserId', 'amount'], properties: { recipientUserId: { type: 'string' }, amount: { type: 'number' }, description: { type: 'string' } } } } } }, responses: { 200: { description: 'Transfer complete' }, 400: { description: 'Insufficient balance' } } } },
    '/wallet/transactions': { get: { tags: ['Wallet'], summary: 'Paginated transaction history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Transactions' } } } },
    '/wallet/withdraw': { post: { tags: ['Wallet'], summary: 'Request withdrawal', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' } } } } } }, responses: { 201: { description: 'Withdrawal request created' }, 400: { description: 'Insufficient balance' } } } },
    '/wallet/withdrawals': { get: { tags: ['Wallet'], summary: 'Withdrawal history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Withdrawal requests' } } } },

    // ─── Properties ───────────────────────────────────────────────────────
    '/properties': { get: { tags: ['Properties'], summary: 'List properties with filters', parameters: [{ name: 'location', in: 'query', schema: { type: 'string' } }, { name: 'minPrice', in: 'query', schema: { type: 'number' } }, { name: 'maxPrice', in: 'query', schema: { type: 'number' } }, { name: 'type', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Paginated properties' } } } },
    '/properties/{id}': { get: { tags: ['Properties'], summary: 'Get property details', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Full property' }, 404: { description: 'Not found' } } } },
    '/properties/{id}/inquiry': { post: { tags: ['Properties'], summary: 'Submit property inquiry', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } } } } }, responses: { 201: { description: 'Inquiry submitted' } } } },
    '/properties/{id}/book': { post: { tags: ['Properties'], summary: 'Book a property', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' } } } } } }, responses: { 201: { description: 'Booking created' }, 400: { description: 'Property unavailable' } } } },
    '/properties/bookings': { get: { tags: ['Properties'], summary: 'Get booking history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Bookings' } } } },
    '/properties/emi-calculator': { post: { tags: ['Properties'], summary: 'Calculate EMI', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['principal', 'annualRate', 'tenureMonths'], properties: { principal: { type: 'number' }, annualRate: { type: 'number' }, tenureMonths: { type: 'integer' } } } } } }, responses: { 200: { description: 'EMI result' } } } },

    // ─── Notifications ────────────────────────────────────────────────────
    '/notifications': { get: { tags: ['Notifications'], summary: 'Get notification history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated notifications' } } } },
    '/notifications/device-token': {
      post: { tags: ['Notifications'], summary: 'Register device token', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['token', 'platform'], properties: { token: { type: 'string' }, platform: { type: 'string', enum: ['android', 'ios', 'web'] } } } } } }, responses: { 201: { description: 'Token registered' } } },
      delete: { tags: ['Notifications'], summary: 'Remove device token', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } } } } }, responses: { 200: { description: 'Token removed' } } },
    },
    '/notifications/{id}/read': { patch: { tags: ['Notifications'], summary: 'Mark notification as read', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Marked as read' } } } },

    // ─── Documents ────────────────────────────────────────────────────────
    '/documents/welcome-letter': { get: { tags: ['Documents'], summary: 'Download welcome letter PDF', security: [{ bearerAuth: [] }], responses: { 200: { description: 'PDF file', content: { 'application/pdf': {} } } } } },
    '/documents/receipt/{transactionId}': { get: { tags: ['Documents'], summary: 'Download payment receipt PDF', security: [{ bearerAuth: [] }], parameters: [{ name: 'transactionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'PDF file' } } } },
    '/documents/agreement': { get: { tags: ['Documents'], summary: 'Download membership agreement PDF', security: [{ bearerAuth: [] }], responses: { 200: { description: 'PDF file' } } } },
    '/documents/kyc': { get: { tags: ['Documents'], summary: 'Get KYC document URLs', security: [{ bearerAuth: [] }], responses: { 200: { description: 'KYC document URLs and statuses' } } } },

    // ─── Support ──────────────────────────────────────────────────────────
    '/support/tickets': {
      get: { tags: ['Support'], summary: 'List support tickets', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated tickets' } } },
      post: { tags: ['Support'], summary: 'Create support ticket', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['subject', 'description'], properties: { subject: { type: 'string' }, description: { type: 'string' } } } } } }, responses: { 201: { description: 'Ticket created' } } },
    },
    '/support/tickets/{id}': { get: { tags: ['Support'], summary: 'Get ticket with thread', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket with messages' } } } },
    '/support/tickets/{id}/reply': { post: { tags: ['Support'], summary: 'Reply to ticket', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } } } } }, responses: { 201: { description: 'Reply sent' } } } },

    // ─── Public ───────────────────────────────────────────────────────────
    '/public/health': { get: { tags: ['Public'], summary: 'Health check', responses: { 200: { description: 'Server, DB, Redis status' } } } },
    '/public/contact': { post: { tags: ['Public'], summary: 'Submit contact form', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'message'], properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, message: { type: 'string' } } } } } }, responses: { 200: { description: 'Inquiry submitted' } } } },
    '/public/properties': { get: { tags: ['Public'], summary: 'Public property listings (AVAILABLE only)', responses: { 200: { description: 'Properties' } } } },
    '/public/emi-calculator': { post: { tags: ['Public'], summary: 'Public EMI calculator', responses: { 200: { description: 'EMI result' } } } },
    '/public/commission-calculator': { post: { tags: ['Public'], summary: 'Public commission calculator', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['referrals', 'depth', 'packageId'], properties: { referrals: { type: 'integer' }, depth: { type: 'integer' }, packageId: { type: 'string' } } } } } }, responses: { 200: { description: 'Projected earnings' } } } },
    '/public/app-version': { get: { tags: ['Public'], summary: 'Get app version info', parameters: [{ name: 'platform', in: 'query', required: true, schema: { type: 'string', enum: ['android', 'ios'] } }, { name: 'version', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Version status' } } } },
    '/public/branding': { get: { tags: ['Public'], summary: 'Get branding assets', responses: { 200: { description: 'Branding URLs' } } } },

    // ─── Admin (summary only) ─────────────────────────────────────────────
    '/admin/dashboard': { get: { tags: ['Admin'], summary: 'Admin dashboard metrics', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Dashboard data' } } } },
    '/admin/dashboard/recent-transactions': { get: { tags: ['Admin'], summary: 'Recent 20 transactions', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Transactions' } } } },
    '/admin/associates': { get: { tags: ['Admin'], summary: 'List associates', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated associates' } } }, post: { tags: ['Admin'], summary: 'Admin register associate', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/admin/associates/{id}': { get: { tags: ['Admin'], summary: 'Get associate details', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Full associate' } } }, patch: { tags: ['Admin'], summary: 'Edit associate', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } } },
    '/admin/associates/{id}/activate': { post: { tags: ['Admin'], summary: 'Activate associate', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Activated' } } } },
    '/admin/associates/{id}/suspend': { post: { tags: ['Admin'], summary: 'Suspend associate', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Suspended' } } } },
    '/admin/payouts/generate': { post: { tags: ['Admin'], summary: 'Generate payouts', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Payouts generated' } } } },
    '/admin/payouts/pending': { get: { tags: ['Admin'], summary: 'Pending payouts', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated payouts' } } } },
    '/admin/payouts/{id}/approve': { post: { tags: ['Admin'], summary: 'Approve payout', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Approved' } } } },
    '/admin/payouts/{id}/reject': { post: { tags: ['Admin'], summary: 'Reject payout', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Rejected' } } } },
    '/admin/funds/credit': { post: { tags: ['Admin'], summary: 'Credit associate wallet', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Credited' } } } },
    '/admin/funds/debit': { post: { tags: ['Admin'], summary: 'Debit associate wallet', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Debited' } } } },
    '/admin/kyc/pending': { get: { tags: ['Admin'], summary: 'Pending KYC submissions', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Paginated KYC' } } } },
    '/admin/kyc/{id}/approve': { post: { tags: ['Admin'], summary: 'Approve KYC', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Approved' } } } },
    '/admin/kyc/{id}/reject': { post: { tags: ['Admin'], summary: 'Reject KYC', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Rejected' } } } },
    '/admin/notifications': { post: { tags: ['Admin'], summary: 'Send notification', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sent' } } } },
    '/admin/config/packages': { get: { tags: ['Admin'], summary: 'List packages', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Packages' } } }, post: { tags: ['Admin'], summary: 'Create package', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
  },
};

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'IWR API Docs',
  }));
}

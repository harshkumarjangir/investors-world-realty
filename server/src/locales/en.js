export default {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  'auth.login.success': 'Login successful',
  'auth.login.invalid': 'Invalid credentials',
  'auth.login.locked': 'Account locked. Try again later',
  'auth.login.suspended': 'Account suspended. Contact support',
  'auth.logout.success': 'Logged out successfully',
  'auth.token.expired': 'Access token expired',
  'auth.token.invalid': 'Invalid access token',
  'auth.token.required': 'Access token required',
  'auth.token.refreshed': 'Token refreshed',
  'auth.otp.sent': 'If the account exists, an OTP has been sent',
  'auth.otp.invalid': 'Invalid or expired OTP',
  'auth.password.reset': 'Password reset successfully',
  'auth.password.changed': 'Password changed successfully',
  'auth.password.weak': 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
  'auth.password.incorrect': 'Current password is incorrect',
  'auth.permission.denied': 'Insufficient permissions',

  // ─── Registration ──────────────────────────────────────────────────────────
  'registration.success': 'Registration successful. Account is pending activation',
  'registration.activated': 'Associate activated successfully',
  'registration.sponsor.valid': 'Sponsor is valid',
  'registration.sponsor.notFound': 'Sponsor not found',
  'registration.sponsor.inactive': 'Sponsor is not active',
  'registration.phone.exists': 'Phone number is already registered',
  'registration.email.exists': 'Email address is already registered',

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  'dashboard.fetched': 'Dashboard data retrieved',
  'dashboard.advancePayment': 'Advance payment data retrieved',
  'dashboard.referralLink': 'Referral link retrieved',
  'dashboard.referralQR': 'Referral QR code generated',

  // ─── Profile ───────────────────────────────────────────────────────────────
  'profile.fetched': 'Profile retrieved',
  'profile.updated': 'Profile updated',
  'profile.photo.updated': 'Profile photo updated',
  'profile.notFound': 'Associate not found',

  // ─── KYC ───────────────────────────────────────────────────────────────────
  'kyc.pan.submitted': 'PAN document submitted',
  'kyc.aadhaar.submitted': 'Aadhaar document submitted',
  'kyc.bank.submitted': 'Bank details submitted',
  'kyc.approved': 'Your {type} document has been approved',
  'kyc.rejected': 'Your {type} document was rejected. Reason: {reason}',
  'kyc.documents.fetched': 'KYC documents retrieved',

  // ─── Settings ──────────────────────────────────────────────────────────────
  'settings.fetched': 'Settings retrieved',
  'settings.updated': 'Settings updated',

  // ─── Genealogy ─────────────────────────────────────────────────────────────
  'genealogy.tree.fetched': 'Tree data retrieved',
  'genealogy.downline.fetched': 'Downline data retrieved',
  'genealogy.sponsor.fetched': 'Sponsor details retrieved',
  'genealogy.teamSummary.fetched': 'Team summary retrieved',

  // ─── Income ────────────────────────────────────────────────────────────────
  'income.summary.fetched': 'Income summary retrieved',
  'income.history.fetched': 'Income history retrieved',
  'income.calculator.result': 'Commission projection calculated',

  // ─── Wallet ────────────────────────────────────────────────────────────────
  'wallet.balance.fetched': 'Wallet balance fetched',
  'wallet.transfer.success': 'Transfer completed successfully',
  'wallet.transfer.sent': '₹{amount} transferred to {recipient} successfully',
  'wallet.transfer.received': '₹{amount} received from {sender}',
  'wallet.transfer.insufficient': 'Insufficient wallet balance',
  'wallet.transactions.fetched': 'Transactions fetched',
  'wallet.withdrawal.submitted': 'Withdrawal request submitted',
  'wallet.withdrawal.insufficient': 'Insufficient wallet balance',
  'wallet.withdrawals.fetched': 'Withdrawal requests fetched',

  // ─── Properties ────────────────────────────────────────────────────────────
  'property.list.fetched': 'Properties fetched',
  'property.detail.fetched': 'Property fetched',
  'property.inquiry.submitted': 'Inquiry submitted successfully',
  'property.notFound': 'Property not found',
  'property.unavailable': 'Property is not available for booking',

  // ─── Booking ───────────────────────────────────────────────────────────────
  'booking.created': 'Booking created successfully',
  'booking.confirmed': 'Your booking for {property} has been confirmed',
  'booking.cancelled': 'Your booking for {property} has been cancelled',
  'booking.list.fetched': 'Bookings fetched',

  // ─── Notifications ─────────────────────────────────────────────────────────
  'notification.deviceToken.registered': 'Device token registered',
  'notification.deviceToken.removed': 'Device token removed',
  'notification.list.fetched': 'Notifications fetched',
  'notification.read': 'Notification marked as read',
  'notification.payout.approved': 'Your payout of ₹{amount} has been approved',
  'notification.payout.rejected': 'Your payout of ₹{amount} has been rejected',
  'notification.income.credit': 'You earned ₹{amount} as {type} income',

  // ─── Documents ─────────────────────────────────────────────────────────────
  'document.welcomeLetter': 'Welcome letter generated',
  'document.receipt': 'Payment receipt generated',
  'document.agreement': 'Membership agreement generated',

  // ─── Support ───────────────────────────────────────────────────────────────
  'support.ticket.created': 'Support ticket created',
  'support.ticket.list.fetched': 'Tickets retrieved',
  'support.ticket.fetched': 'Ticket retrieved',
  'support.ticket.replied': 'Reply sent',
  'support.ticket.closed': 'Cannot reply to a closed or resolved ticket',

  // ─── General ───────────────────────────────────────────────────────────────
  'general.success': 'Success',
  'general.error': 'An error occurred',
  'general.notFound': 'Resource not found',
  'general.routeNotFound': 'Route not found',
  'general.rateLimited': 'Too many requests, please try again later',
  'general.validation': 'Validation error',
  'general.serverError': 'An unexpected error occurred',
};

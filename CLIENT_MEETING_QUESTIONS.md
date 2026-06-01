# 📋 Client Meeting — Questions & Requirements Checklist

**Project:** Investors World Realty Mobile Application  
**Date:** _______________  
**Attendees:** _______________

---

## 🔑 1. Accounts & Credentials Required from Client

### Firebase Account
- [ ] Firebase project created? If not, who creates it?
- [ ] Firebase project ID
- [ ] Firebase service account JSON (for push notifications)
- [ ] Firebase Cloud Messaging (FCM) enabled?
- [ ] Which Firebase plan? (Blaze/Spark)

### Google Play Store
- [ ] Google Play Developer Account (₹1,750 one-time fee) — does client have one?
- [ ] Organization name for Play Store listing
- [ ] Play Store developer account login credentials (or invite as team member)
- [ ] App signing key — client-managed or Google-managed?

### Apple App Store
- [ ] Apple Developer Account ($99/year) — does client have one?
- [ ] Organization name & D-U-N-S number for organization account
- [ ] Apple Developer account login (or invite as team member)
- [ ] Apple certificates & provisioning profiles — who manages?

### Domain & Hosting
- [ ] Production server details (VPS IP, SSH access)
- [ ] Domain name for API (e.g., api.investorsworld.com)
- [ ] SSL certificate — who provisions?
- [ ] DNS management access

---

## 📱 2. App Configuration Questions

### Branding & Assets
- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] Splash screen design/image
- [ ] App color scheme (primary, secondary, accent colors)
- [ ] Company logo (SVG/PNG, light & dark versions)
- [ ] Feature graphic for Play Store (1024x500)
- [ ] Screenshots for store listing (phone + tablet)

### App Identity
- [ ] App name on stores: "Investors World Realty" or different?
- [ ] Package name: `com.investorsworld.realty` — confirm?
- [ ] App category on stores: Business? Finance? Real Estate?
- [ ] Short description (80 chars) for store listing
- [ ] Full description (4000 chars) for store listing
- [ ] Privacy Policy URL (required for both stores)
- [ ] Terms & Conditions URL

---

## 💼 3. Business Logic Clarifications

### User Registration & KYC
- [ ] Who can register? Only through existing sponsor or self-registration too?
- [ ] Is phone OTP verification mandatory? (SMS gateway needed — cost?)
- [ ] KYC approval — how fast should it be? Auto-approve or manual only?
- [ ] What documents are mandatory before activation? (PAN, Aadhaar, Bank — all or any?)

### Commission & Income Plan
- [ ] Confirm commission slab percentages for all area ranges
- [ ] Is matching/binary income active or only level-based?
- [ ] Reward income milestones — what are the exact thresholds?
- [ ] Commission payout frequency — daily, weekly, monthly?
- [ ] Minimum withdrawal amount?
- [ ] Any TDS deduction on payouts? (percentage?)

### Properties
- [ ] How many properties initially? (for testing/launch)
- [ ] Property booking flow — partial payment or full?
- [ ] Booking cancellation policy?
- [ ] Who uploads properties — only admin or associates too?
- [ ] Property video tours — YouTube links or self-hosted?

### Wallet & Payments
- [ ] Payment gateway integration needed? (Razorpay/PhonePe/Paytm?)
- [ ] Or manual bank transfer + admin confirmation?
- [ ] Fund transfer between associates — any limits?
- [ ] Withdrawal to bank — processing time commitment?

---

## 🔔 4. Notifications & Communication

### SMS Gateway
- [ ] SMS provider preference? (MSG91, Twilio, TextLocal?)
- [ ] SMS sender ID (e.g., "IWRLTY")
- [ ] OTP template registered with DLT?
- [ ] Monthly SMS volume estimate?

### Email
- [ ] Email provider? (company SMTP, SendGrid, AWS SES?)
- [ ] From email address (e.g., noreply@investorsworld.com)
- [ ] Email templates needed? (welcome, payout, KYC approval)

### WhatsApp
- [ ] WhatsApp Business API integration needed?
- [ ] Or just WhatsApp deep-link to support number?
- [ ] Support phone number for WhatsApp/Call

---

## 🌐 5. Multi-language Support

- [ ] Languages needed at launch: English + Hindi only? Or more?
- [ ] Who provides Hindi translations? (client or developer?)
- [ ] Any regional language planned for future? (Gujarati, Marathi, etc.)

---

## 🔒 6. Security & Compliance

- [ ] Data hosting location preference? (India mandatory?)
- [ ] GDPR/data privacy compliance needed?
- [ ] Session timeout duration? (current: 15 min access, 7 day refresh)
- [ ] Maximum login attempts before lock? (current: 5)
- [ ] Two-factor authentication for associates too? Or admin only?

---

## 📊 7. Admin Panel Questions

- [ ] How many admin users? Roles needed?
- [ ] Admin access from mobile or desktop only?
- [ ] Report export — any specific format preference?
- [ ] Audit log retention period?
- [ ] Who is the super admin? (client contact)

---

## 🚀 8. Launch & Timeline

- [ ] Target launch date?
- [ ] Beta testing phase — how many users?
- [ ] Phased rollout or full launch?
- [ ] Play Store — open testing or closed first?
- [ ] iOS — TestFlight beta first?

---

## 🛠️ 9. Post-Launch Support

- [ ] Maintenance contract duration?
- [ ] Bug fix SLA (response time)?
- [ ] Feature update frequency?
- [ ] Server monitoring — who handles?
- [ ] Database backup frequency & retention?

---

## 📝 10. Pending Deliverables from Client

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Firebase project credentials | ⬜ Pending | |
| 2 | Play Store developer account | ⬜ Pending | |
| 3 | Apple Developer account | ⬜ Pending | |
| 4 | App icon & splash screen | ⬜ Pending | |
| 5 | Company logo (SVG) | ⬜ Pending | |
| 6 | Privacy Policy URL | ⬜ Pending | |
| 7 | Production server access | ⬜ Pending | |
| 8 | Domain & SSL | ⬜ Pending | |
| 9 | SMS gateway credentials | ⬜ Pending | |
| 10 | Commission slab confirmation | ⬜ Pending | |
| 11 | Hindi translations | ⬜ Pending | |
| 12 | Store listing content | ⬜ Pending | |

---

## 💡 Recommendations to Discuss with Client

1. **Payment Gateway** — Recommend Razorpay for Indian market (easy KYC, UPI support)
2. **SMS** — MSG91 is cost-effective for Indian OTP delivery
3. **Hosting** — Recommend AWS Mumbai or DigitalOcean Bangalore for low latency
4. **App Updates** — Implement force-update mechanism (already built in API)
5. **Analytics** — Add Firebase Analytics for user behavior tracking
6. **Crash Reporting** — Firebase Crashlytics for production monitoring

---

_Prepared by: Developer Team_  
_Last updated: May 2026_

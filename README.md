# Investors World Realty — Monorepo

This repository contains all applications for the **Investors World Realty** platform, a real-estate MLM system that manages associates, binary-tree genealogy, commissions, property listings, and financial operations.

---

## Repository Structure

```
investors-world-realty/
├── server/          # Node.js + Express API server (JavaScript)
├── admin/           # React + Vite admin panel (internal dashboard)
├── landing-site/    # Next.js public-facing website
├── mobile-app/      # Flutter mobile application (iOS & Android)
└── README.md
```

---

## Apps

### `server/`
The backend REST API built with **Node.js** and **Express** (JavaScript), backed by **PostgreSQL** (via Prisma ORM) and **Redis**.

Responsibilities:
- Associate authentication, registration, and profile management
- Binary tree / genealogy engine with BFS spillover
- MLM commission engine (Direct, Level, Matching, Reward income)
- Wallet and financial operations (fund transfer, withdrawals)
- Property listings and booking management
- KYC document handling
- Push notifications via Firebase Cloud Messaging (FCM)
- Admin panel backend (associate management, payouts, reports, configuration)
- Public endpoints (contact form, health check, app version, branding)

Base URL: `/api/v1`

---

### `admin/`
The internal admin dashboard built with **React**, **Vite**, and **Tailwind CSS**.

Responsibilities:
- Admin authentication with OTP second factor
- Role-based access control (Super Admin, Manager, Support, Accounts)
- Associate management (register, activate, suspend, view profiles)
- Genealogy tree visualization
- Payout generation and approval workflow
- Fund management (credit, debit, transfer between wallets)
- KYC review queue
- Property CRUD with image/video upload
- Notification composer and history
- Reports (joining, activation, income, withdrawal, fund transfer) with PDF/Excel export
- Master configuration (packages, income plans, roles, geographic data)

---

### `landing-site/`
The public-facing marketing website built with **Next.js** and **Tailwind CSS**.

Responsibilities:
- Company overview, mission, and vision
- Featured property listings with filters and detail pages
- Property video tour player
- EMI calculator (no auth required)
- Commission calculator (no auth required)
- Associate registration call-to-action with referral link support
- Contact form submission
- English / Hindi language switching
- Dark mode / light mode toggle
- Fully responsive (mobile, tablet, desktop)

---

### `mobile-app/`
The associate-facing mobile application built with **Flutter** (iOS & Android).

Responsibilities:
- Associate login, dashboard, and profile
- Binary tree / genealogy viewer
- Income and wallet management
- Property browsing and booking
- KYC document submission
- Push notification support
- Multi-language (English / Hindi)

> **Status:** Scaffold pending — see the Mobile Application Requirement Document for full specifications.

---

## Getting Started

Each app has its own `README.md` with setup instructions. In general:

```bash
# API server
cd server
npm install
npm run dev

# Admin panel
cd admin
npm install
npm run dev

# Landing site
cd landing-site
npm install
npm run dev
```

Copy `.env.example` to `.env` in each app and fill in the required values before running.

---

## Environment Variables

Each app reads its own `.env` file. Never commit `.env` files — they are excluded via `.gitignore` in every sub-project.

---

## License

Proprietary — Investors World Realty. All rights reserved.

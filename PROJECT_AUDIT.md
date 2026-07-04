# Fowzia Bloodline — Project Audit Report

> Generated: 2026-07-04  
> Audited by: Claude Code (Sonnet 4.6)  
> Working directory: `D:\Personal\fowzia-bloodline`

---

## 1. Folder Structure

```
fowzia-bloodline/
├── app/
│   ├── layout.tsx                          ✅ Root layout with Providers + Toaster
│   ├── page.tsx                            ✅ Homepage
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx                  ✅ Login page
│   │   ├── register/
│   │   │   ├── donor/page.tsx              ✅ Donor registration (2-step)
│   │   │   └── recipient/page.tsx          ✅ Recipient registration
│   │   └── forgot-password/               ⚠️  Empty directory — NO page file
│   ├── (dashboard)/
│   │   ├── donor/
│   │   │   ├── page.tsx                    ✅ Donor index (likely redirect)
│   │   │   ├── dashboard/page.tsx          ✅ Donor dashboard
│   │   │   ├── donation-events/new/page.tsx ✅ Log donation event
│   │   │   └── rewards/                   ❌  Empty directory — NO page file
│   │   └── recipient/
│   │       ├── page.tsx                    ✅ Recipient index
│   │       ├── dashboard/page.tsx          ✅ Recipient dashboard
│   │       ├── feedback/                  ❌  Empty directory — NO page file
│   │       └── search/                    ❌  Empty directory — NO page file
│   ├── admin/
│   │   ├── page.tsx                        ✅ Admin dashboard
│   │   ├── donations/                     ❌  Empty directory — NO page file
│   │   ├── feedback/                      ❌  Empty directory — NO page file
│   │   ├── payouts/                       ❌  Empty directory — NO page file
│   │   └── users/                         ❌  Empty directory — NO page file
│   ├── about/page.tsx                      ✅
│   ├── contact/page.tsx                    ✅
│   ├── donate/page.tsx                     ✅
│   ├── donors-wall/page.tsx                ✅
│   ├── feedback/                          ❌  Empty directory — NO page file
│   ├── profile/page.tsx                    ✅
│   ├── register/page.jsx                  ⚠️  Rogue JSX file (see Critical Issues)
│   ├── search/page.tsx                     ✅
│   ├── thoughts/page.tsx                   ✅
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts     ⚠️  Legacy stub (returns 404)
│       │   └── register/
│       │       ├── donor/route.ts          ✅
│       │       └── recipient/route.ts      ✅
│       ├── admin/
│       │   ├── donations/[id]/route.ts     ✅
│       │   └── feedback/[id]/route.ts      ✅
│       ├── contact/route.ts                ✅
│       ├── contact-requests/route.ts       ✅
│       ├── donations/route.ts              ✅
│       ├── donors/route.ts                 ✅
│       ├── feedback/route.ts               ✅
│       ├── platform-donations/
│       │   ├── route.ts                    ✅
│       │   └── [id]/route.ts               ✅
│       ├── profile/route.ts                ✅
│       ├── recipients/                    ❌  Empty directory — NO route file
│       └── thoughts/route.ts               ✅
├── components/
│   ├── Navbar.tsx                          ✅
│   ├── Footer.tsx                          ✅
│   ├── Providers.tsx                       ✅ TanStack React Query wrapper
│   ├── SearchClient.tsx                    ✅
│   ├── ProfileClient.tsx                   ✅
│   ├── DonateClient.tsx                    ✅
│   ├── admin/AdminDashboardClient.tsx      ✅
│   └── donor/
│       ├── DonorCard.tsx                   ✅
│       ├── DonorDashboardClient.tsx        ✅
│       └── ContactModal.tsx                ✅
├── lib/
│   ├── auth.ts                            ⚠️  Empty stub file
│   ├── db.ts                               ✅ Prisma client singleton
│   ├── supabase.ts                         ✅ Browser Supabase client
│   ├── supabase-server.ts                  ✅ Server Supabase client
│   └── utils.ts                            ✅ Helpers, eligibility logic
├── prisma/
│   ├── schema.prisma                       ✅ Full schema defined
│   └── seed.ts                             ✅ Admin + dummy donor seed
├── types/
│   └── next-auth.d.ts                     ⚠️  Empty stub (NextAuth removed)
├── public/images/
├── middleware.ts                           ✅ Supabase auth middleware
├── next.config.js                          ✅
├── tailwind.config.js                      ✅ Custom blood/crimson theme
├── tsconfig.json                           ✅
├── BLUEPRINT.md                            ✅ Product specification
└── HOSTING-AND-ADMIN-GUIDE.md             ✅ Deployment guide
```

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 14.2.18 |
| UI | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.14 |
| Auth | Supabase Auth (`@supabase/ssr`) | — |
| Database | PostgreSQL via Supabase | — |
| ORM | Prisma | 5.22.0 |
| Validation | Zod + React Hook Form | 3.23.8 / 7.54.0 |
| State | TanStack React Query | 5.59.20 |
| File Uploads | UploadThing | 7.2.0 |
| Email | Nodemailer (Gmail SMTP) | 7.0.13 |
| Password Hashing | bcryptjs | 2.4.3 |
| Notifications | react-hot-toast | 2.4.1 |
| Icons | Lucide React | 0.460.0 |
| Date Utils | date-fns | 4.1.0 |
| Language | TypeScript | 5.6.3 |

---

## 3. Authentication Architecture

- **Provider**: Supabase Auth (email + password)
- **Session**: Managed via Supabase SSR cookies (`@supabase/ssr`)
- **Role storage**: `user.user_metadata.role` — values: `DONOR`, `RECIPIENT`, `ADMIN`
- **Middleware** (`middleware.ts`): Protects `/admin/*`, `/donor/*`, `/recipient/*` — redirects unauthenticated or wrong-role users to `/login?error=unauthorized`
- **Server client** (`lib/supabase-server.ts`): Used in API routes and server components
- **Browser client** (`lib/supabase.ts`): Used in client components

**Auth flow:**
1. User registers via `/api/auth/register/donor` or `/api/auth/register/recipient`
2. API creates Supabase Auth user with `user_metadata: { role }` and a Prisma `User` + profile record
3. Login at `/login` calls `supabase.auth.signInWithPassword()` and redirects by role
4. Middleware validates session on every protected request

**Legacy remnants:**
- `app/api/auth/[...nextauth]/route.ts` — stub that returns 404 (was NextAuth, now unused)
- `lib/auth.ts` — empty file
- `types/next-auth.d.ts` — empty type augmentation stub

---

## 4. Database Architecture (Prisma + PostgreSQL)

### Models

| Model | Purpose |
|-------|---------|
| `User` | Auth identity, role, ban status |
| `DonorProfile` | Blood group, district, eligibility, reputation, bKash |
| `RecipientProfile` | District, area |
| `Session` | JWT session tracking (currently unused with Supabase Auth) |
| `DonationEvent` | Logged donations awaiting admin review |
| `RewardTransaction` | bKash payout queue (PENDING → SENT/FAILED) |
| `ContactRequest` | Privacy-protected phone reveal requests |
| `Feedback` | Moderated ratings (1–5 stars + message) |
| `PlatformDonation` | Monetary donations to fund the platform |
| `PlatformThought` | Testimonials (admin-moderated) |
| `AdminAction` | Audit log of every admin action |

### Key Enums
`Role`, `BloodGroup` (8 values), `DonationStatus`, `RewardStatus`, `ContactRequestStatus`, `FeedbackStatus`

### Business Rules Encoded
- `isEligible` computed via `computeEligibility(lastDonationDate)` — 90-day cooldown post-donation
- `reputationScore` recalculated as average of all approved feedback ratings on every approval
- `ContactRequest` unique constraint: `(requestedById, donorProfileId)` — one request per pair
- `Feedback` unique constraint: `(donorProfileId, recipientId)` — one review per donor-recipient pair
- `RewardTransaction.donationEventId` — unique, one reward per donation event

### Schema Issues
- `User.passwordHash` is a non-nullable `String` in schema, but Supabase Auth manages passwords — this field is populated with the hash at registration time but is effectively redundant and can fall out of sync
- `Session` model exists for JWT tracking but Supabase handles sessions entirely — this table is dead

---

## 5. Supabase Integration

- **Project URL**: `https://ibifhtreecczcrnignia.supabase.co` (from `.env.local`)
- **Auth**: Supabase handles email/password auth, JWT tokens, and sessions
- **Database**: PostgreSQL hosted on Supabase, accessed via Prisma with pooled (`DATABASE_URL`) and direct (`DIRECT_URL`) connections
- **Row-Level Security**: Not configured in Prisma schema (no RLS policies visible) — Prisma bypasses RLS via service role key
- **Storage**: Not used — file uploads go through UploadThing instead
- **Realtime**: Not used

---

## 6. Routing Structure

### Public Routes
| Route | Status |
|-------|--------|
| `/` | ✅ Implemented |
| `/search` | ✅ Implemented |
| `/about` | ✅ Implemented |
| `/contact` | ✅ Implemented |
| `/login` | ✅ Implemented |
| `/register/donor` | ✅ Implemented |
| `/register/recipient` | ✅ Implemented |
| `/forgot-password` | ❌ Directory exists, no page file |
| `/donate` | ✅ Implemented |
| `/donors-wall` | ✅ Implemented |
| `/thoughts` | ✅ Implemented |
| `/register` | ⚠️ Rogue JSX page (security issue) |

### Donor Routes (protected)
| Route | Status |
|-------|--------|
| `/donor/dashboard` | ✅ Implemented |
| `/donor/donation-events/new` | ✅ Implemented |
| `/donor/donation-events` | ❌ No standalone list page (dashboard shows recent only) |
| `/donor/rewards` | ❌ Directory exists, no page file |
| `/profile` | ✅ Implemented (at `/profile`, not `/donor/profile`) |

### Recipient Routes (protected)
| Route | Status |
|-------|--------|
| `/recipient/dashboard` | ✅ Implemented |
| `/recipient/search` | ❌ Directory exists, no page file |
| `/recipient/feedback` | ❌ Directory exists, no page file |
| `/feedback` | ❌ Directory exists, no page file (Blueprint says recipients use this) |

### Admin Routes (protected)
| Route | Status |
|-------|--------|
| `/admin` | ✅ Implemented (unified dashboard with pending items) |
| `/admin/users` | ❌ Directory exists, no page file |
| `/admin/donations` | ❌ Directory exists, no page file |
| `/admin/feedback` | ❌ Directory exists, no page file |
| `/admin/payouts` | ❌ Directory exists, no page file |

### API Routes
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/auth/register/donor` | POST | ✅ |
| `/api/auth/register/recipient` | POST | ✅ |
| `/api/auth/[...nextauth]` | GET/POST | ⚠️ Stub (404) |
| `/api/donors` | GET | ✅ |
| `/api/donations` | GET, POST | ✅ |
| `/api/feedback` | POST | ✅ |
| `/api/contact-requests` | POST | ✅ |
| `/api/contact` | POST | ✅ (email via Nodemailer) |
| `/api/profile` | PATCH | ✅ |
| `/api/admin/donations/[id]` | PATCH | ✅ |
| `/api/admin/feedback/[id]` | PATCH | ✅ |
| `/api/platform-donations` | GET, POST | ✅ |
| `/api/platform-donations/[id]` | PATCH | ✅ |
| `/api/thoughts` | GET, POST | ✅ |
| `/api/recipients` | — | ❌ Empty directory, no route file |

---

## 7. Current Implementation Status

### Phase 1 — Core Platform: ✅ COMPLETE
- Project setup, database schema, auth, donor/recipient registration, search, homepage

### Phase 2 — Donation Workflow: ✅ COMPLETE
- Donation event logging with proof image upload (UploadThing), admin review API

### Phase 3 — Trust & Reputation: ✅ COMPLETE (API-level)
- Contact request system, phone reveal, feedback submission, admin feedback moderation, reputation score computation

### Phase 4 — Rewards & Payouts: ❌ INCOMPLETE
- Reward transactions are created on donation approval ✅
- bKash API integration: NOT implemented ❌
- Admin payout queue UI (`/admin/payouts`): page file missing ❌
- Reward status notifications: NOT implemented ❌
- Donor reward history page (`/donor/rewards`): page file missing ❌

### Phase 5 — Polish & Launch: PARTIAL
| Item | Status |
|------|--------|
| Email notifications (registration, review results) | ❌ Not implemented |
| Password reset flow | ❌ `/forgot-password` directory exists, no page |
| Admin user management (ban/verify) | ❌ `/admin/users` directory exists, no page |
| Contact page with form | ✅ Implemented |
| Privacy policy / terms pages | ❌ Not implemented |
| SEO metadata optimization | ⚠️ Partial (basic metadata in layout.tsx) |
| Performance audit | ❌ Not done |
| Production deployment | Unknown |

### Phase 6 — Growth Features: ❌ NOT STARTED

---

## 8. Features Fully Implemented

1. **Donor registration** — 2-step form with Zod validation, Supabase Auth user creation, Prisma records
2. **Recipient registration** — Single-step form, same pattern
3. **Login / logout** — Supabase Auth, role-based redirect, middleware protection
4. **Donor search** — Filterable by blood group, district, eligibility, verification; paginated (12/page)
5. **Donor cards** — Shows blood group badge, eligibility pill, reputation score, verification shield
6. **Contact request system** — Privacy-protected, 5/day rate limit, pending/approved/rejected states
7. **Homepage** — Hero, live stats, how-it-works, benefits, CTA
8. **Donor dashboard** — Eligibility countdown, donation count, recent events, reward ledger, received feedback
9. **Donation event logging** — Form with date, hospital, notes, proof image upload (UploadThing)
10. **Admin donation review** — Approve/reject with notes; triggers eligibility update, donation count increment, reward transaction creation, audit log
11. **Admin feedback moderation** — Approve/reject feedback; triggers reputation score recalculation
12. **Feedback submission** — 1–5 stars + message, Zod-validated
13. **Profile editing** — Name, phone, area, bio, bKash number
14. **Platform donations** — bKash reference submission, admin verification, public donor wall display
15. **Testimonials (Thoughts)** — Public submission, admin approval, public display
16. **Contact form** — Nodemailer email to admin
17. **About, Donors Wall, Thoughts pages** — Fully rendered

---

## 9. Features Partially Implemented

1. **Admin dashboard** — All review actions work through `AdminDashboardClient.tsx`, but individual sub-pages (`/admin/users`, `/admin/donations`, `/admin/feedback`, `/admin/payouts`) are **empty directories with no page files** — only the unified `/admin` page exists
2. **Donor rewards page** — `RewardTransaction` records are created correctly, but `/donor/rewards` has no page file (the dashboard shows a summary inline)
3. **Recipient search** — `/recipient/search` directory exists but has no page file (recipients use the public `/search` page)
4. **Feedback page for recipients** — `/recipient/feedback` and `/feedback` directories exist but have no page files; recipients may not have a functional route to submit feedback
5. **Donation events list** — No standalone `/donor/donation-events` list page; recent events shown only in dashboard

---

## 10. Features Missing / Not Implemented

1. **bKash payment API integration** — Reward payouts are queued (PENDING) but never actually sent; no bKash API calls exist in the codebase; env vars exist but unused
2. **Password reset flow** — `/forgot-password` directory exists but is empty; no API route for reset
3. **Email notifications** — No transactional emails for registration confirmation, donation approval/rejection, reward sent
4. **Admin user management pages** — `/admin/users` has no page file; ban/verify UI is missing
5. **Admin sub-pages** — `/admin/donations`, `/admin/feedback`, `/admin/payouts` all have empty directories
6. **Recipient feedback route** — `/feedback` and `/recipient/feedback` have no page files
7. **Privacy policy / Terms of Service pages** — Not created
8. **Recipients API** — `/api/recipients` directory exists but has no route file
9. **Error boundaries** — No React error boundaries on any client component
10. **Tests** — Zero unit, integration, or E2E tests

---

## 11. Broken Code / Critical Issues

### CRITICAL — Security

#### 1. Rogue Registration Page (`app/register/page.jsx`)
**Severity: CRITICAL**

A `.jsx` file (not `.tsx`) exists at `app/register/page.jsx` that:
- Inserts directly into Supabase tables using the **anon key** (client-side) — bypasses the proper API route and all server-side validation
- Sets `passwordHash: 'temp123'` — a hardcoded plaintext string stored as a hash
- Creates `User` records with no actual authentication — users created this way cannot log in
- Has no password field at all — the Supabase Auth user is never created, so no session is possible
- Has `console.error` calls that leak error details in the browser

This page is functional enough to submit data and corrupt the database but will not produce working accounts.

#### 2. `.env.local` Contains Real Production Secrets
**Severity: CRITICAL**

The file `.env.local` is present in the project directory and contains:
- Supabase project URL and anon key
- Supabase service role key (bypasses all Row-Level Security)
- PostgreSQL connection strings with plaintext password
- Gmail app password (for contact form email)

If this file is committed to any version control repository, all credentials should be rotated immediately.

#### 3. `User.passwordHash` Set to a Redundant Value
**Severity: HIGH**

The Prisma schema requires `passwordHash: String` (non-nullable). Registration routes populate this with a bcrypt hash of the user's password, but Supabase Auth fully owns authentication — this field is never read for login. It creates a false sense of security and a maintenance burden (the hash could diverge from the Supabase Auth password if a user resets their password via Supabase).

### HIGH — Missing Pages Cause 404 Errors

The following routes are referenced in the Blueprint and reachable via UI navigation, but their directories have no `page.tsx` file. Navigating to them will return a Next.js 404:

| Route | Impact |
|-------|--------|
| `/forgot-password` | Users who forget password have no recovery path |
| `/donor/rewards` | Donors cannot view their full reward history |
| `/recipient/feedback` or `/feedback` | Recipients cannot submit feedback via UI (API exists) |
| `/admin/users` | Admin cannot ban/verify users via UI |
| `/admin/donations` | Admin has no dedicated donation review page |
| `/admin/feedback` | Admin has no dedicated feedback moderation page |
| `/admin/payouts` | Admin cannot manage reward payouts via UI |

### MEDIUM — Code Quality

#### 4. Widespread Use of `any` Type
Multiple client components (`AdminDashboardClient.tsx`, `DonorDashboardClient.tsx`, `DonateClient.tsx`) use `any` types for mapped data, losing TypeScript safety.

#### 5. Empty Stub Files
- `lib/auth.ts` — empty file, presumably a NextAuth remnant
- `types/next-auth.d.ts` — empty type declaration stub
- `app/api/auth/[...nextauth]/route.ts` — always returns 404
- `app/api/recipients/` — empty directory, no route file

These are dead code and should be removed.

#### 6. `Session` Model is Dead Code
The `Session` Prisma model is defined for JWT session tracking, but Supabase Auth manages all sessions. This table is never written to or read from anywhere in the codebase.

#### 7. Missing `globals.css` import check
`app/layout.tsx` imports `./globals.css` — this file should exist. Confirmed present.

#### 8. `register/page.jsx` is `.jsx` not `.tsx`
The only non-TypeScript React file in the project. Also bypasses password validation entirely (see Critical #1).

---

## 12. Build Issues

No build has been run as part of this audit. Potential build-breaking issues:

1. **Empty route directories** — Next.js App Router silently ignores directories without `page.tsx`. These will not cause build failures but will 404 at runtime.
2. **`any` types with `strict: true`** — TypeScript strict mode is enabled. The `any` casts in component files will suppress type errors but won't cause build failures.
3. **`UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`** — Not present in `.env.local` (only shown in `.env.example`). If UploadThing keys are missing, file upload functionality will fail at runtime but likely not at build time.
4. **`GMAIL_APP_PASSWORD`** — Not confirmed present in `.env.local`. Contact form will silently fail if missing.
5. **`REWARD_AMOUNT_BDT`** — Referenced in comments; default of 30 is hardcoded in Prisma schema default. No confirmed runtime reference.

---

## 13. Runtime Issues (Identifiable Without Running)

1. **`/forgot-password`** — 404 (no page file)
2. **`/donor/rewards`** — 404 (no page file)
3. **`/feedback`** and **`/recipient/feedback`** — 404 (no page files); recipients cannot submit feedback through the UI
4. **All `/admin/*` sub-pages** — 404 (no page files); admin must use only the unified dashboard
5. **`/register`** — Shows the rogue `.jsx` page; users who land here get a broken registration experience (accounts created have no auth and hardcoded passwords)
6. **bKash payouts** — `RewardTransaction` records pile up as PENDING indefinitely; no actual payout ever occurs
7. **File uploads** — Will fail if `UPLOADTHING_SECRET` is not set in the active environment
8. **Contact form** — Will fail if `GMAIL_USER` / `GMAIL_APP_PASSWORD` are not set
9. **Supabase Auth ↔ Prisma sync risk** — If a user resets their Supabase Auth password, `User.passwordHash` in Prisma will not be updated, creating divergence (low impact since `passwordHash` is never read for auth)
10. **`/api/recipients`** — 404 (empty directory, no route file)

---

## 14. Summary

**Project**: Fowzia Bloodline — Blood donor network platform for Bangladesh  
**Purpose**: Connects verified blood donors with recipients; rewards donors via bKash  
**Stack**: Next.js 14 + Supabase Auth + Prisma + PostgreSQL + Tailwind CSS  
**Overall Status**: Core platform is feature-complete and functional. Key gaps are in admin sub-pages, the reward payout flow, recipient feedback UI, and password reset — plus a critical rogue registration page.

### By-the-Numbers

| Category | Count |
|----------|-------|
| Fully implemented pages | 15 |
| Missing page files (404 at runtime) | 7 |
| Implemented API routes | 14 |
| Empty/stub API directories | 2 |
| Critical security issues | 2 |
| High-severity issues | 1 |
| Medium-severity issues | 5 |
| TODO/FIXME comments in source | 0 |
| Tests | 0 |

### Priority Action List

| Priority | Action |
|----------|--------|
| 🔴 CRITICAL | Audit whether `.env.local` is tracked in git; rotate all Supabase and DB credentials if so |
| 🔴 CRITICAL | Remove or fix `app/register/page.jsx` — it creates corrupt accounts with no auth |
| 🔴 HIGH | Build the 7 missing page files (admin sub-pages, rewards, feedback, forgot-password) |
| 🟡 MEDIUM | Implement bKash payout API in `/admin/payouts` |
| 🟡 MEDIUM | Implement password reset flow (`/forgot-password` + Supabase Auth email) |
| 🟡 MEDIUM | Add transactional email notifications (donation approved/rejected, reward sent) |
| 🟢 LOW | Remove dead code: `lib/auth.ts`, `types/next-auth.d.ts`, `[...nextauth]/route.ts`, `Session` model |
| 🟢 LOW | Replace `any` types with proper TypeScript interfaces in client components |
| 🟢 LOW | Add React error boundaries to client components |
| 🟢 LOW | Add at least smoke-level tests for critical API routes |

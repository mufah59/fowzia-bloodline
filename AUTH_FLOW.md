# Authentication Flow — Detailed Inspection

> Inspected: 2026-07-04  
> Scope: registration pages, API routes, Supabase Auth integration, Prisma writes, login  
> No files were modified.

---

## Question 1 — Is there any registration page besides `/register/donor` and `/register/recipient`?

**Yes. There is a third registration page at `/register`.**

| URL | File | Type | Status |
|-----|------|------|--------|
| `/register/donor` | `app/(auth)/register/donor/page.tsx` | TypeScript, proper flow | ✅ Functional |
| `/register/recipient` | `app/(auth)/register/recipient/page.tsx` | TypeScript, proper flow | ✅ Functional |
| `/register` | `app/register/page.jsx` | JavaScript (not TSX), direct DB writes | ⚠️ Broken |

**Why these are three distinct routes:**  
Next.js App Router uses directory names as URL segments. The `(auth)` prefix is a *route group* — the parentheses tell Next.js to use the directory for layout/organisation purposes only, not to include it in the URL. So:
- `app/(auth)/register/donor/page.tsx` → serves `/register/donor`
- `app/register/page.jsx` → serves `/register` (a separate URL, no conflict)

---

## Question 2 — Is `app/register/page.jsx` still reachable by routing?

**Yes, unconditionally.**

The file exists and follows the App Router naming convention (`page.jsx` at a valid directory path). Next.js will serve it at `/register` regardless of whether it is linked from anywhere else.

**No page links to it** — the login page and both legitimate registration pages cross-link only to `/register/donor` and `/register/recipient`. But any user who types `/register` directly, finds the URL in a search result, or is sent an old link will land on this page.

**Middleware does not protect it** — `middleware.ts` only guards `/admin/:path*`, `/donor/:path*`, and `/recipient/:path*`. The `/register` route is fully public.

---

## Question 3 — Could it create users that cannot log in?

**Yes. Users created via `/register` cannot log in. Ever.**

Here is exactly why:

### What `/register` (the rogue page) does

```
app/register/page.jsx
```

```
Step 1: Collects name, email, phone (no password field)
Step 2: Collects bloodGroup, gender, district, area, bkashNumber

On submit:
  const userId = crypto.randomUUID()          // random UUID, not from Supabase Auth

  supabase.from('User').insert([{             // supabase = browser client (ANON key)
    id:           userId,
    name, email, phone,
    passwordHash: 'temp123',                  // hardcoded literal string, not a hash
    role:         'DONOR',
  }])

  supabase.from('DonorProfile').insert([{
    id:     crypto.randomUUID(),
    userId: userId,                           // points to the User above, not to any auth user
    bloodGroup, district, area, bkashNumber, gender
  }])

  // ← supabase.auth.signUp() is NEVER called
  // ← No Supabase Auth user is created
```

### What the login page requires

```
app/(auth)/login/page.tsx
```

```typescript
supabase.auth.signInWithPassword({ email, password })
```

Supabase Auth's `signInWithPassword` looks up the user in Supabase's internal `auth.users` table. Because the rogue page never called `supabase.auth.signUp()` or `supabase.auth.admin.createUser()`, there is no row in `auth.users` for this email. The call returns an error and the login is rejected with "Invalid email or password" — permanently.

### Summary of what goes wrong

| Step | Expected | Rogue page reality |
|------|----------|--------------------|
| Supabase Auth user | Created via `admin.createUser()` | **Never created** |
| `User.id` | Set to Supabase Auth user UUID (so sessions can look them up) | Random UUID with no Auth counterpart |
| `User.passwordHash` | Empty string `''` (auth handled by Supabase) | Literal string `'temp123'` |
| Login | Works — auth session found in `auth.users` | **Fails forever** — no row in `auth.users` |
| Password field | Collected from user, hashed by Supabase | **No password field in the form** |

### Secondary failure: inserts may also be rejected by Supabase RLS

The rogue page uses the **anon key** browser client to INSERT directly into `User` and `DonorProfile`. By Supabase's default, the `anon` role has no INSERT privileges on custom tables unless explicit RLS policies grant it. If RLS is properly configured, the inserts will fail silently (the page shows an error), meaning no records are written at all. Either way, no working account is produced.

---

## Question 4 — Complete flow trace

### Flow A: Legitimate Donor Registration → Login

```
Browser                   Page Component                  API Route                Supabase Auth         Prisma/Postgres
  │                           │                               │                          │                     │
  ├── GET /register/donor ──► │ app/(auth)/register/donor/    │                          │                     │
  │                           │   page.tsx renders            │                          │                     │
  │                           │   2-step form:                │                          │                     │
  │                           │   Step 1: name, email,        │                          │                     │
  │                           │     phone, password,          │                          │                     │
  │                           │     confirmPassword           │                          │                     │
  │                           │   Step 2: bloodGroup,         │                          │                     │
  │                           │     district, area, gender,   │                          │                     │
  │                           │     bkashNumber               │                          │                     │
  │                           │                               │                          │                     │
  ├── Submit step 2 ─────────►│ validateStep2() (client-side) │                          │                     │
  │                           │ fetch POST /api/auth/          │                          │                     │
  │                           │   register/donor ────────────►│                          │                     │
  │                           │                               │ Zod schema.safeParse()   │                     │
  │                           │                               │ (server-side validation) │                     │
  │                           │                               │                          │                     │
  │                           │                               │ Check phone uniqueness:  │                     │
  │                           │                               │ supabase (SERVICE_ROLE)  │                     │
  │                           │                               │ .from('User')            │                     │
  │                           │                               │ .select('id')            │                     │
  │                           │                               │ .eq('phone', phone) ─────┼────────────────────►│
  │                           │                               │                          │                     │ SELECT id FROM "User"
  │                           │                               │ ◄─ phone free / 409 ─────┼─────────────────────│
  │                           │                               │                          │                     │
  │                           │                               │ supabase.auth.admin      │                     │
  │                           │                               │ .createUser({            │                     │
  │                           │                               │   email, password,       │                     │
  │                           │                               │   email_confirm: true,   │                     │
  │                           │                               │   user_metadata: {       │                     │
  │                           │                               │     role: 'DONOR',       │                     │
  │                           │                               │     name, phone          │                     │
  │                           │                               │   }                      │                     │
  │                           │                               │ }) ─────────────────────►│                     │
  │                           │                               │                          │ Creates row in      │
  │                           │                               │                          │ auth.users with:    │
  │                           │                               │                          │ - UUID (auto)       │
  │                           │                               │                          │ - email             │
  │                           │                               │                          │ - bcrypt(password)  │
  │                           │                               │                          │ - user_metadata     │
  │                           │                               │                          │ - email_confirmed=T │
  │                           │                               │ ◄── data.user.id ────────│                     │
  │                           │                               │    (UUID from auth.users)│                     │
  │                           │                               │                          │                     │
  │                           │                               │ supabase (SERVICE_ROLE)  │                     │
  │                           │                               │ .from('User').insert({   │                     │
  │                           │                               │   id: data.user.id,  ←─ same UUID as auth     │
  │                           │                               │   name, email, phone,    │                     │
  │                           │                               │   role: 'DONOR',         │                     │
  │                           │                               │   passwordHash: '',  ←─ empty (unused)        │
  │                           │                               │   updatedAt: now         │                     │
  │                           │                               │ }) ──────────────────────┼────────────────────►│
  │                           │                               │                          │                     │ INSERT INTO "User"
  │                           │                               │ supabase (SERVICE_ROLE)  │                     │
  │                           │                               │ .from('DonorProfile')    │                     │
  │                           │                               │ .insert({                │                     │
  │                           │                               │   id: randomUUID(),      │                     │
  │                           │                               │   userId: data.user.id,  │                     │
  │                           │                               │   bloodGroup, district,  │                     │
  │                           │                               │   area, bkashNumber,     │                     │
  │                           │                               │   gender, updatedAt: now │                     │
  │                           │                               │ }) ──────────────────────┼────────────────────►│
  │                           │                               │                          │                     │ INSERT INTO "DonorProfile"
  │                           │                               │                          │                     │
  │                           │                               │ return { success: true } │                     │
  │                           │                               │    HTTP 201 ─────────────│                     │
  │                           │◄── 201 ─────────────────────  │                          │                     │
  │                           │ toast "Account created!"      │                          │                     │
  │◄── redirect /login?registered=1 ─────────────────────────│                          │                     │

--- Login ---

  ├── GET /login ────────────►│ app/(auth)/login/page.tsx     │                          │                     │
  │                           │ Renders email + password form │                          │                     │
  │                           │ Shows "Account created!" banner if ?registered=1        │                     │
  │                           │                               │                          │                     │
  ├── Submit ─────────────────►│                              │                          │                     │
  │                           │ supabase.auth (ANON_KEY)      │                          │                     │
  │                           │ .signInWithPassword({         │                          │                     │
  │                           │   email, password             │                          │                     │
  │                           │ }) ─────────────────────────────────────────────────────►│ Validates email +   │
  │                           │                               │                          │ bcrypt(password)    │
  │                           │                               │                          │ against auth.users  │
  │                           │                               │                          │                     │
  │                           │◄── data.user (with            │                          │                     │
  │                           │    user_metadata.role = 'DONOR') ──────────────────────│                     │
  │                           │                               │                          │                     │
  │                           │ Supabase sets session cookie  │                          │                     │
  │                           │ router.push('/donor/dashboard')│                          │                     │
  │◄── redirect /donor/dashboard ─────────────────────────────│                          │                     │

--- Middleware (every subsequent protected request) ---

  ├── GET /donor/dashboard ─── middleware.ts intercepts       │                          │                     │
  │                           createServerClient (ANON_KEY)   │                          │                     │
  │                           supabase.auth.getUser() ─────────────────────────────────►│ Validates session   │
  │                           │                               │                          │ cookie              │
  │                           │◄── { user } ─────────────────────────────────────────── │                     │
  │                           │                               │                          │                     │
  │                           user.user_metadata.role === 'DONOR' → allow               │                     │
  │                           │                               │                          │                     │
  ├── page renders ──────────►│ app/(dashboard)/donor/dashboard/page.tsx                │                     │
```

---

### Flow B: Legitimate Recipient Registration → Login

Identical to Flow A with these differences:

- Form is single-step (no blood group or bKash fields)
- API route is `POST /api/auth/register/recipient`
- `auth.admin.createUser` sets `user_metadata.role = 'RECIPIENT'`
- `User.role = 'RECIPIENT'`
- Inserts `RecipientProfile` (district, area) instead of `DonorProfile`
- Login redirects to `/recipient/dashboard`
- Middleware allows access to `/recipient/*`

---

### Flow C: Rogue Page `/register` (broken)

```
Browser                   Rogue Page               Supabase (anon key)      auth.users       Prisma DB
  │                           │                          │                       │                │
  ├── GET /register ─────────►│ app/register/page.jsx    │                       │                │
  │                           │ Renders 2-step form:     │                       │                │
  │                           │   Step 1: name, email,   │                       │                │
  │                           │     phone (no password!) │                       │                │
  │                           │   Step 2: bloodGroup,    │                       │                │
  │                           │     gender, district,    │                       │                │
  │                           │     area, bkashNumber    │                       │                │
  │                           │                          │                       │                │
  ├── Submit ─────────────────►│                         │                       │                │
  │                           │ userId = randomUUID()    │                       │                │
  │                           │                          │                       │                │
  │                           │ supabase (ANON KEY)      │                       │                │
  │                           │ .from('User').insert({   │                       │                │
  │                           │   id: userId,            │                       │                │
  │                           │   passwordHash:'temp123',│                       │                │
  │                           │   role: 'DONOR'          │                       │                │
  │                           │ }) ─────────────────────►│                       │                │
  │                           │                          │ Likely rejected by    │                │
  │                           │                          │ Supabase (anon role   │                │
  │                           │                          │ has no INSERT grant   │                │
  │                           │                          │ on User table)        │                │
  │                           │                          │                       │                │
  │                           │ IF insert succeeds:      │                       │                │
  │                           │ .from('DonorProfile')    │                       │                │
  │                           │ .insert({userId})        │                       │                │
  │                           │                          │   ← auth.users is NEVER written to ─  │
  │                           │                          │                       │                │
  │                           │ Shows success message    │                       │                │
  │◄──────────────────────────│                          │                       │                │

  ├── User attempts login ────►│ /login page             │                       │                │
  │                           │                          │                       │                │
  │                           │ supabase.auth            │                       │                │
  │                           │ .signInWithPassword({    │                       │                │
  │                           │   email, password        │                       │                │
  │                           │ }) ─────────────────────►│ Looks up email        │                │
  │                           │                          │ in auth.users ───────►│                │
  │                           │                          │                       │ NOT FOUND      │
  │                           │◄── error: "Invalid       │◄──────────────────────│                │
  │                           │    login credentials"    │                       │                │
  │◄── "Invalid email or ─────│                          │                       │                │
  │     password" toast        │                          │                       │                │
  │                           │                          │                       │                │
  │   ← login fails permanently, regardless of what was inserted into Prisma DB ─────────────── │
```

---

## Structural Problems in the Registration API Routes

Even the *legitimate* API routes have two noteworthy structural issues:

### 1. No atomic transaction — partial record creation is possible

Each API route performs three sequential writes:

```
1. supabase.auth.admin.createUser()     → writes to auth.users
2. supabase.from('User').insert()       → writes to public.User
3. supabase.from('DonorProfile/RecipientProfile').insert()  → writes to profile table
```

If step 2 fails after step 1 succeeds, a Supabase Auth user exists with no corresponding `User` row. That user can authenticate (session is valid) but will have no Prisma record — any page that queries the `User` table for this user will find nothing, causing runtime errors.

If step 3 fails after steps 1 and 2 succeed, the user can log in but has no donor/recipient profile, so their dashboard will fail to load.

There is no rollback or compensation logic.

### 2. API routes do not use Prisma — they use the Supabase client directly

The registration API routes create a bare `createClient(URL, SERVICE_ROLE_KEY)` instance and call `supabase.from('User').insert(...)`. They do not use the Prisma client (`lib/db.ts`). This means:

- Prisma's type safety and schema validation do not apply
- The insert omits fields that have Prisma defaults (`isVerified`, `isBanned`, `createdAt`, `donationCount`, etc.) — these must be covered by PostgreSQL column defaults, which they are, but the inconsistency is fragile
- `passwordHash` is stored as an empty string `''`, satisfying the `String` type but making the field permanently meaningless

---

## Key Facts Summary

| Question | Answer |
|----------|--------|
| Registration pages total | **3** — `/register/donor`, `/register/recipient`, `/register` |
| Is `/register` (rogue) reachable? | **Yes** — live URL, no redirect, no protection |
| Can rogue page create working accounts? | **No** — Supabase Auth user is never created; login will always fail |
| Can rogue inserts even land in the DB? | **Unlikely** — anon key likely blocked by Supabase default permissions; even if they land, accounts are unloggable |
| Auth method at login | `supabase.auth.signInWithPassword()` against `auth.users` only |
| Role source at login | `data.user.user_metadata.role` (written by API during registration) |
| Middleware role check | `user.user_metadata.role` from `supabase.auth.getUser()` — no Prisma query |
| Is `User.passwordHash` used for login? | **No** — it is written as `''` by the API and never read |
| Partial-record failure risk? | **Yes** — no transaction; auth user can exist without a Prisma User row |

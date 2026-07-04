# Fowzia Bloodline — Hosting & Admin Guide
> Complete step-by-step guide to go live + how to use the admin panel

---

## PART 1 — GOING LIVE ON HOSTINGER (Try This First)

Hostinger is best used with their **VPS** plan (KVM 1 or KVM 2) since this is a Node.js app with a database. Their shared hosting does not support Node.js properly.

---

### Step 1 — Buy Hostinger VPS

1. Go to **hostinger.com** → Hosting → VPS Hosting
2. Choose **KVM 1** (minimum): 1 vCPU, 4GB RAM, 50GB SSD — around $5–7/month
3. Choose OS: **Ubuntu 22.04 LTS**
4. Set a strong root password, note your server IP address

---

### Step 2 — Buy a Domain (Hostinger or Namecheap)

1. On Hostinger: Domains → search for your domain (e.g. `fowziabloodline.com`)
2. Purchase it — usually $10–15/year
3. Go to your domain DNS settings (Hostinger panel → Domains → Manage → DNS Zone)
4. Add an **A Record**:
   - Name: `@`
   - Points to: `YOUR_SERVER_IP`
   - TTL: 3600
5. Also add:
   - Name: `www`
   - Points to: `YOUR_SERVER_IP`
   - TTL: 3600
6. DNS changes take 1–24 hours to propagate

---

### Step 3 — Connect to Your VPS

Open your computer terminal (or use Hostinger's browser terminal):

```bash
ssh root@YOUR_SERVER_IP
```

Enter your root password when prompted.

---

### Step 4 — Install Node.js, PM2, Nginx, PostgreSQL

Run these commands one by one:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version   # should say v20.x.x
npm --version

# Install PM2 (keeps your app running 24/7)
npm install -g pm2

# Install Nginx (web server / reverse proxy)
apt install -y nginx

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql
```

---

### Step 5 — Set Up the Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql, run these commands:
CREATE DATABASE fowzia_bloodline;
CREATE USER fowzia_user WITH PASSWORD 'CHOOSE_A_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE fowzia_bloodline TO fowzia_user;
\q
```

Note your database password — you will need it soon.

---

### Step 6 — Upload Your Project to the Server

**Option A — Git (recommended):**

1. Push your project to a private GitHub repository
2. On the server:

```bash
# Install git
apt install -y git

# Create app directory
mkdir -p /var/www/fowzia-bloodline
cd /var/www/fowzia-bloodline

# Clone your repo (use your actual repo URL)
git clone https://github.com/YOUR_USERNAME/fowzia-bloodline.git .
```

**Option B — Upload via SFTP (FileZilla):**

1. Download FileZilla (free)
2. Connect: Host = `YOUR_SERVER_IP`, Username = `root`, Password = your VPS password, Port = 22
3. Upload your entire project folder to `/var/www/fowzia-bloodline/`

---

### Step 7 — Configure Environment Variables

```bash
cd /var/www/fowzia-bloodline
cp .env.example .env
nano .env
```

Fill in these values:

```env
DATABASE_URL="postgresql://fowzia_user:YOUR_DB_PASSWORD@localhost:5432/fowzia_bloodline"
NEXTAUTH_SECRET="generate-a-random-32-char-string-here"
NEXTAUTH_URL="https://fowziabloodline.com"
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
ADMIN_EMAIL="your@email.com"
NEXT_PUBLIC_APP_URL="https://fowziabloodline.com"
REWARD_AMOUNT_BDT=120
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as your NEXTAUTH_SECRET.

Press `Ctrl+X`, then `Y`, then `Enter` to save and exit nano.

---

### Step 8 — Build and Run the App

```bash
cd /var/www/fowzia-bloodline

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# Seed the database (creates admin account)
npm run db:seed

# Build the production app
npm run build

# Start with PM2 (keeps it running forever)
pm2 start npm --name "fowzia-bloodline" -- start
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

Your app is now running on port 3000.

---

### Step 9 — Configure Nginx as Reverse Proxy

```bash
nano /etc/nginx/sites-available/fowzia-bloodline
```

Paste this entire block (replace `fowziabloodline.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name fowziabloodline.com www.fowziabloodline.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size limit for proof images
    client_max_body_size 10M;
}
```

Save and exit (`Ctrl+X`, `Y`, `Enter`), then:

```bash
# Enable the site
ln -s /etc/nginx/sites-available/fowzia-bloodline /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

### Step 10 — Add Free SSL (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d fowziabloodline.com -d www.fowziabloodline.com

# Follow prompts — enter your email, agree to terms, choose option 2 (redirect HTTP to HTTPS)
```

Certbot auto-renews every 90 days. Your site is now live at `https://fowziabloodline.com`.

---

### Step 11 — Set Up UploadThing for File Uploads

1. Go to **uploadthing.com** → Sign up (free)
2. Create a new app called "Fowzia Bloodline"
3. Copy your `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`
4. Edit your `.env` file:

```bash
nano /var/www/fowzia-bloodline/.env
```

Add the values, then restart the app:

```bash
pm2 restart fowzia-bloodline
```

---

### Useful Hostinger Commands (Day-to-Day)

```bash
# View live app logs
pm2 logs fowzia-bloodline

# Restart app after changes
pm2 restart fowzia-bloodline

# Pull latest code from GitHub and redeploy
cd /var/www/fowzia-bloodline
git pull
npm install
npm run build
pm2 restart fowzia-bloodline

# Check app is running
pm2 status

# Check Nginx
systemctl status nginx
```

---

---

## PART 2 — GOING LIVE ON VERCEL (Easier, Recommended Backup)

Vercel is much simpler — no server management. Best for getting live fast.

---

### Step 1 — Push Code to GitHub

1. Create a free account at **github.com**
2. Create a new **private** repository called `fowzia-bloodline`
3. On your computer, open terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit — Fowzia Bloodline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fowzia-bloodline.git
git push -u origin main
```

---

### Step 2 — Create a Free PostgreSQL Database

Use **Neon** (free PostgreSQL, works perfectly with Vercel):

1. Go to **neon.tech** → Sign up for free
2. Create a new project → name it "Fowzia Bloodline"
3. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this — it is your `DATABASE_URL`

---

### Step 3 — Deploy to Vercel

1. Go to **vercel.com** → Sign up with your GitHub account
2. Click **"Add New Project"**
3. Import your `fowzia-bloodline` repository
4. Vercel will detect it is a Next.js app automatically
5. Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | your Neon connection string |
| `NEXTAUTH_SECRET` | a random 32-char string (use: `openssl rand -base64 32` in terminal) |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` (update after deployment) |
| `UPLOADTHING_SECRET` | from uploadthing.com |
| `UPLOADTHING_APP_ID` | from uploadthing.com |
| `ADMIN_EMAIL` | your admin email |
| `NEXT_PUBLIC_APP_URL` | `https://your-project-name.vercel.app` |
| `REWARD_AMOUNT_BDT` | `120` |

6. Click **Deploy** — Vercel builds and deploys automatically
7. Your app will be live at `https://fowzia-bloodline.vercel.app`

---

### Step 4 — Initialize the Database (Vercel)

After deployment, you need to run the database setup. The easiest way:

1. Install Vercel CLI on your computer:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. Link your project:
   ```bash
   cd fowzia-bloodline
   vercel link
   ```

3. Pull environment variables locally:
   ```bash
   vercel env pull .env.local
   ```

4. Now run the database setup locally (it connects to your Neon database):
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

### Step 5 — Add a Custom Domain to Vercel

1. In Vercel dashboard → your project → Settings → Domains
2. Click **Add Domain** → type `fowziabloodline.com`
3. Vercel will show you DNS records to add
4. Go to your domain registrar (Namecheap, Hostinger, GoDaddy) → DNS settings
5. Add the records Vercel shows you (usually an A record or CNAME)
6. Wait 1–24 hours for DNS to propagate
7. Vercel handles SSL automatically

---

### Redeploying After Changes (Vercel)

Every time you push to GitHub, Vercel auto-deploys:

```bash
git add .
git commit -m "describe your change"
git push
```

Vercel picks it up automatically and deploys in ~2 minutes.

---

---

## PART 3 — ADMIN PANEL USER GUIDE

### How to Log In as Admin

1. Go to `https://fowziabloodline.com/login`
2. Email: `admin@fowziabloodline.com` (or whatever you set as `ADMIN_EMAIL`)
3. Password: `admin123456`
4. **Change this password immediately** after first login

---

### Admin Panel Overview (`/admin`)

The admin panel has 5 tabs:

| Tab | What It Does |
|-----|-------------|
| **Overview** | Platform stats, recent admin actions |
| **Blood Donations** | Review blood donation event proof from donors |
| **Feedback** | Moderate recipient feedback before it goes public |
| **Rewards** | View pending bKash reward payouts |
| **Support Donations** | Verify platform donation payments, publish to Donor Wall |

---

### How to Review a Blood Donation Event

When a donor logs a donation, it appears here for review.

**Your job:**
1. Click **"View Proof Document"** — this opens their uploaded image/PDF
2. Check: Does it look like a real hospital receipt or donation document?
3. Does the date match what they entered?
4. If yes → click **"Approve & Queue Reward"**
5. If no → write a reason in the notes box → click **"Reject"**

**What happens on approval (automatic):**
- Donor's `lastDonationDate` updates to the donation date
- Donor becomes ineligible for 90 days
- A reward transaction of ৳120 (one coconut) is created and queued
- The event appears in the donor's history as "Approved"

---

### How to Process bKash Reward Payouts

Currently the rewards are queued manually. For each pending reward:

1. Go to the **Rewards** tab
2. Open your bKash app
3. Send ৳120 to the donor's bKash number listed
4. Note the transaction reference
5. In the database (via Prisma Studio or a future UI), update the reward status to "SENT"

**To access Prisma Studio (database viewer):**

On Hostinger:
```bash
cd /var/www/fowzia-bloodline
npx prisma studio
```
Then open `http://YOUR_SERVER_IP:5555` in your browser (only while you have it running).

On Vercel/local:
```bash
npm run db:studio
```
Opens at `http://localhost:5555` — update `RewardTransaction` records there.

> Tip: In a future update, connect bKash Merchant API to automate this entirely.

---

### How to Moderate Feedback

When a recipient submits feedback for a donor, it goes to the **Feedback** tab.

**Check for:**
- Inappropriate language or personal attacks
- Fake or spammy messages
- False claims

If clean → **Approve** → feedback appears on the donor's public profile
If problematic → **Reject** → feedback stays hidden, donor score unaffected

---

### How to Verify Support Donations (Platform Donations)

When someone donates to support the platform, they appear in the **Support Donations** tab.

**Your verification steps:**
1. Open your personal bKash app
2. Go to Transaction History → check for an incoming Send Money from the listed bKash number
3. Confirm the amount matches and the reference contains "Bloodline"
4. If confirmed → click **"Verify & Publish to Donor Wall"**
5. Their name, profession, and amount will now appear on `/donors-wall`
6. If you cannot find the transaction or it looks fake → click **"Hide"**

---

### How to Ban a User

Currently done via database. Using Prisma Studio:

1. Run `npm run db:studio` (or connect to your Neon database)
2. Find the user in the `User` table
3. Set `isBanned = true`
4. The user will see "Account suspended" on next login

---

### How to Make Someone an Admin

Via Prisma Studio or direct SQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'newadmin@example.com';
```

Or in Prisma Studio: find the user → change `role` from DONOR/RECIPIENT to ADMIN.

---

### How to Reset a User's Password

Via Prisma Studio:
1. Generate a new bcrypt hash:
   ```bash
   node -e "const b=require('bcryptjs'); b.hash('newpassword123',12).then(console.log)"
   ```
2. Copy the output (starts with `$2b$`)
3. In Prisma Studio → User → paste as `passwordHash`
4. Tell the user their temporary password and ask them to change it

---

### Daily Admin Checklist

1. Check **Blood Donations** tab — review any pending proof submissions
2. Check **Support Donations** tab — verify bKash payments and publish to Donor Wall
3. Check **Feedback** tab — moderate any new messages
4. Check **Rewards** tab — manually send any pending bKash rewards
5. Scan Overview → Recent Admin Actions to confirm everything is logged correctly

---

### Security Reminders

- Change the default admin password immediately after first login
- Never share your `.env` file — it contains secret keys
- Keep your server updated: `apt update && apt upgrade -y` (Hostinger) monthly
- Vercel handles security updates automatically
- Back up your database weekly:
  ```bash
  pg_dump -U fowzia_user fowzia_bloodline > backup_$(date +%Y%m%d).sql
  ```

---

### Common Issues and Fixes

| Problem | Fix |
|---------|-----|
| App not loading after server restart | `pm2 resurrect` or `pm2 start fowzia-bloodline` |
| "Cannot connect to database" | Check `DATABASE_URL` in `.env`, check PostgreSQL is running: `systemctl status postgresql` |
| File uploads not working | Check `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` are correct in `.env` |
| "NEXTAUTH_URL mismatch" error | Make sure `NEXTAUTH_URL` in `.env` exactly matches your live domain including `https://` |
| Prisma schema changes not applied | Run `npm run db:push` then `pm2 restart fowzia-bloodline` |
| SSL certificate expired | `certbot renew` (Hostinger) — or Vercel handles it automatically |

---

### Support and Development

This platform was built by **Autolinium**.  
For development support, feature additions, or technical help: visit **autolinium.com**

---

*Fowzia Bloodline — Every drop counts. Every life matters.*

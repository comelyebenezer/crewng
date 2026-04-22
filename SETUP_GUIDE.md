# CrewNG — Complete Setup Guide
## Nigeria's #1 Event Staffing Platform

---

## WHAT YOU HAVE

```
crewng/
├── frontend/          ← React + Vite UI (everything you see)
│   ├── src/
│   │   ├── App.jsx    ← Main app (all pages & components)
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/   ← Auth context
│   │   └── utils/     ← API helper
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/           ← Node.js + Express API
│   ├── server.js      ← Main server (start here)
│   ├── prisma/
│   │   ├── schema.prisma   ← Database tables
│   │   └── seed.js         ← Creates super admin
│   ├── src/
│   │   ├── routes/    ← auth, bookings, profiles, wallet, admin
│   │   ├── middleware/ ← JWT auth guard
│   │   └── utils/     ← encrypt, email helpers
│   └── package.json
│
├── package.json       ← Root (run both together)
└── SETUP_GUIDE.md     ← This file
```

---

## STEP 1 — INSTALL PREREQUISITES

Install these first (skip any you already have):

### Node.js (v18 or newer)
Download from: https://nodejs.org
After install, confirm:
```
node --version   → should say v18+
npm --version    → should say 9+
```

### PostgreSQL (v14 or newer)
Download from: https://www.postgresql.org/download/
During install, set a password for the `postgres` user — remember it.
After install, confirm:
```
psql --version   → should say 14+
```

### VS Code Extensions (recommended)
Install these in VS Code:
- **Prisma** (by Prisma) — schema highlighting
- **ESLint** — code quality
- **Prettier** — formatting
- **Thunder Client** — test your API

---

## STEP 2 — CREATE THE DATABASE

Open your terminal (or the VS Code terminal):

```bash
# Connect to PostgreSQL
psql -U postgres

# Run these 3 commands inside psql:
CREATE DATABASE crewng_db;
CREATE USER crewng_user WITH PASSWORD 'crewng_pass123';
GRANT ALL PRIVILEGES ON DATABASE crewng_db TO crewng_user;

# Exit psql
\q
```

If `psql` command is not found on Windows, find PostgreSQL in your Start Menu and open **SQL Shell (psql)**.

---

## STEP 3 — CONFIGURE ENVIRONMENT VARIABLES

### Backend (.env)
Open `backend/.env` and fill in your values:

```
DATABASE_URL="postgresql://crewng_user:crewng_pass123@localhost:5432/crewng_db"
```
This line uses the database and user you just created. Leave as-is if you used the same password.

```
JWT_SECRET="replace_this_with_64_char_random_hex_string_very_important_do_not_share"
```
Generate a proper secret by running this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as JWT_SECRET.

```
ENCRYPTION_KEY="replace_with_32_character_string"
```
Must be exactly 32 characters. Example: `MySecretKey2026CrewNG!@#$%^&*()`

The other values (Paystack, Cloudinary, Email) are optional for local testing — the app works without them. You only need them when you're ready to go live.

### Frontend (.env)
The frontend `.env` is already set correctly for local development:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
No changes needed.

---

## STEP 4 — INSTALL PACKAGES

Open your terminal in the `crewng` root folder and run:

```bash
# Install root dependencies
npm install

# Install backend packages
cd backend
npm install
cd ..

# Install frontend packages
cd frontend
npm install
cd ..
```

Or install everything in one command from the root:
```bash
npm run install:all
```

---

## STEP 5 — SET UP THE DATABASE

From the `backend` folder:

```bash
cd backend

# Create all database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Create the Super Admin account
node prisma/seed.js
```

You should see:
```
✅ Super Admin created: admin@crewng.com
   Password: Admin@2026!
🎉 Database seeded successfully!
```

---

## STEP 6 — START THE APP

### Option A — Start both together (easiest)
From the root `crewng` folder:
```bash
npm run dev
```
This starts both backend and frontend at the same time.

### Option B — Start separately (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see:
```
🚀 CrewNG Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
You should see:
```
VITE ready at http://localhost:5173
```

### Open the app
Go to: **http://localhost:5173**

---

## STEP 7 — TEST THE APP

### Login as Super Admin
- Email: `admin@crewng.com`
- Password: `Admin@2026!`

### Test Registration
1. Click **Join the Crew**
2. Select a role
3. Fill in details (use any test data)
4. The face capture step needs a camera — click **Skip** if no camera

### Test Booking
1. Browse any category (no login needed)
2. Click **Book Now** on any profile card
3. Select dates and fill in event details
4. Complete the booking flow

### View Database (optional but helpful)
```bash
cd backend
npx prisma studio
```
Opens a visual database browser at http://localhost:5555

---

## ACCOUNTS FOR TESTING

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@crewng.com | Admin@2026! |
| Any user | any@email.com | Password@1 |

---

## API ACCOUNTS TO GET WHEN GOING LIVE

| Service | Purpose | URL | Cost |
|---------|---------|-----|------|
| **Paystack** | Accept payments | paystack.com | Free (1.5% fee) |
| **Cloudinary** | Store photos & videos | cloudinary.com | Free (25GB) |
| **Gmail App Password** | Send emails | myaccount.google.com | Free |
| **Railway** | Host the backend | railway.app | ~$5/month |
| **Vercel** | Host the frontend | vercel.com | Free |

---

## GOING LIVE (Deployment)

### Deploy Backend to Railway
```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```
In Railway dashboard → Variables → add all your `.env` values.

### Deploy Frontend to Vercel
```bash
npm install -g vercel
cd frontend
vercel
```
Set `VITE_API_URL` to your Railway backend URL.

---

## FEATURES BUILT

### For Public (No Login Needed)
- Browse all 10 professional categories
- Filter by state, skin tone, rating, availability
- View full profiles with photos, 360° video, skills
- See live availability calendar on profiles
- Multi-role professionals appear in all relevant searches

### For Users (Registered Crew)
- Register with NIN verification + live face capture (5-step liveness: center/left/right/up/down)
- Multi-role selection (role compatibility rules enforced)
- Dashboard: update profile, manage roles, view wallet, track bookings
- Password change with strength enforcement (uppercase + number + special char)
- Wallet: see balance, transaction history, withdraw to bank

### In-App Booking System
- Select single or multiple dates from calendar
- Date conflict checking (workers blocked on booked dates)
- Fill event details: name, type, venue, time, dress code, notes
- Payment method: Card / Bank Transfer / USSD
- Booking confirmation with reference number
- Coordinator-only cancellations
- 3-cancellation-in-30-days warning system

### Rating & Payment Release
- Both parties must rate before payment releases (1–5 stars + comment)
- Payment goes directly to worker's wallet
- Wallet balance reflects only paid/released amounts

### Admin Panel
- Super Admin: full access to all tabs + settings
- Sub Admin: verification queue + user management
- Verification queue: review face video + NIN, approve/reject
- Price range controls per category
- Booking tracker with full details
- Create sub admins with different permission levels
- Audit log for all admin actions

### Real-Time (Socket.io)
- Live notifications (booking, payment, rating)
- In-app messaging
- WebRTC voice & video call signaling
- Group chat per event (coordinators + crew)

### Security
- bcrypt (12 rounds) for passwords
- NIN stored as one-way bcrypt hash — never retrievable
- Bank details AES-256-CBC encrypted
- JWT tokens with 7-day expiry
- Rate limiting: 10 auth attempts / 15 min per IP
- CORS: only your domain allowed
- Helmet.js: secure HTTP headers
- SQL injection proof: Prisma parameterized queries
- Password rules: 8+ chars, uppercase, number, special character

---

## TROUBLESHOOTING

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `backend/.env`
- On Mac/Linux: `brew services start postgresql` or `sudo service postgresql start`
- On Windows: Start → Services → PostgreSQL → Start

### "Port 5000 already in use"
```bash
# Mac/Linux
kill -9 $(lsof -ti:5000)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "Module not found" errors
Make sure you ran `npm install` in both `backend/` and `frontend/` folders.

### Prisma errors
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### Still stuck?
Open the VS Code terminal and share the exact error message — every error has a fix.

---

## CHANGING THE NAME & LOGO

1. In `frontend/src/App.jsx`, search for `CrewNG` and replace with your new name
2. Search for the `C` logo letter and replace with your initial
3. The gold color (`#f5c842`) is the brand color — search and replace to change it
4. Update `frontend/index.html` title tag

---

*Built for Nigeria's event industry. Ready to launch.*

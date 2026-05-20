# VShield — Background Verification Platform

VShield is a full-stack web application for managing and verifying candidate backgrounds. It provides an intuitive dashboard, real-time Aadhaar & PAN verification against mock APIs, professional PDF report generation, and secure role-based authentication.

---

## Features

- **Secure Authentication** — Register / Login with JWT, password strength indicator, Remember Me (localStorage vs sessionStorage), logout confirmation popover.
- **Dashboard** — At-a-glance stat cards (Total, Verified, Pending, Failed) and a recent candidates table.
- **Candidate Management** — Add candidates with validated Aadhaar (12-digit) and PAN (ABCDE1234F) fields, search & filter by name/email/status, paginated list (10 per page), and delete functionality.
- **Identity Verification** — One-click Aadhaar + PAN mock verification with a full-screen loading overlay and automatic status resolution (VERIFIED / PARTIAL / FAILED).
- **Candidate Detail View** — Personal details card with masked Aadhaar (XXXX-XXXX-1234), PAN, DOB, address, overall status badge, and a vertical verification timeline with timestamps.
- **PDF Reports** — Client-side PDF generation (jsPDF) with navy header, candidate details, verification results, and a diagonal "CONFIDENTIAL" watermark. Filename: `BGV_Report_<Name>_<Date>.pdf`.
- **Responsive UI** — Mobile-first design: table becomes card list on small screens, hamburger menu in navbar.
- **Toast Notifications** — Global top-right toasts (green/yellow/red) auto-dismiss after 3 seconds.
- **Skeleton Loaders** — Shimmer loading states instead of blank screens.

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS    |
| State      | Zustand                                     |
| Forms      | React Hook Form + Zod                       |
| Icons      | Lucide React                                |
| PDF        | jsPDF                                       |
| Backend    | Node.js, Express, TypeScript                |
| Database   | PostgreSQL / Neon (via Prisma ORM)           |
| Auth       | JSON Web Tokens (JWT), bcrypt               |
| HTTP       | Axios                                       |

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL instance (local or [Neon](https://neon.tech))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vshield
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=5001
```

Generate the Prisma client and start the dev server:

```bash
npx prisma generate
npm run dev
```

The backend will start on **http://localhost:5001**.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173** and proxy API calls to `localhost:5001`.

---

## Environment Variables

| Variable          | Location  | Description                          |
|-------------------|-----------|--------------------------------------|
| `DATABASE_URL`    | backend   | PostgreSQL connection string          |
| `JWT_SECRET`      | backend   | Secret key for signing JWT tokens    |
| `PORT`            | backend   | Server port (default: 5001)          |
| `AADHAAR_API_URL` | backend   | URL for Aadhaar verification API      |
| `PAN_API_URL`     | backend   | URL for PAN verification API          |
| `AWS_BUCKET_NAME` | backend   | S3 Bucket Name for reports            |

AWS S3 integration ready — set AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env to enable cloud storage for reports.

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description          | Auth |
|--------|----------------------|----------------------|------|
| POST   | `/api/auth/register` | Register a new user  | No   |
| POST   | `/api/auth/login`    | Login, returns JWT   | No   |

### Candidates

| Method | Endpoint                        | Description                   | Auth |
|--------|---------------------------------|-------------------------------|------|
| GET    | `/api/candidates`               | List all candidates           | Yes  |
| POST   | `/api/candidates`               | Create a new candidate        | Yes  |
| GET    | `/api/candidates/:id`           | Get candidate by ID           | Yes  |
| POST   | `/api/candidates/:id/verify`    | Run Aadhaar + PAN verification| Yes  |
| GET    | `/api/candidates/:id/report`    | Download PDF report           | Yes  |
| DELETE | `/api/candidates/:id`           | Delete a candidate            | Yes  |

### Mock Verification APIs

| Method | Endpoint                        | Description                   |
|--------|---------------------------------|-------------------------------|
| POST   | `/mock-api/aadhaar/verify`      | Mock Aadhaar verification     |
| POST   | `/mock-api/pan/verify`          | Mock PAN verification         |

---

## Project Structure

```
vshield/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL schema (User, Candidate, VerificationLog)
│   └── src/
│       ├── controllers/          # Auth & Candidate logic
│       ├── middleware/            # JWT auth middleware
│       ├── routes/                # Express routes
│       ├── services/              # PDF generation service
│       └── index.ts               # Express app entry point
├── frontend/
│   └── src/
│       ├── components/            # ToastContainer
│       ├── layouts/               # DashboardLayout (navbar, hamburger)
│       ├── pages/                 # Login, Register, Dashboard, Candidates, CandidateDetails
│       ├── services/              # Axios API config
│       ├── store/                 # Zustand stores (auth, toast)
│       └── utils/                 # PDF generator utility
└── README.md
```

---

## Screenshots

> Screenshots can be captured by running the app locally and navigating through the pages.

| Page               | Description                                              |
|--------------------|----------------------------------------------------------|
| Login              | Centered card with email/password validation, Remember Me|
| Register           | Full Name, Email, Password with strength bar, Confirm    |
| Dashboard          | Stat cards + recent candidates table                     |
| Candidates List    | Search, status filter, pagination, action buttons        |
| Candidate Details  | Personal info, masked Aadhaar, verification timeline     |
| PDF Report         | Navy header, candidate details, CONFIDENTIAL watermark   |

---

## License

This project is part of a background verification assignment.

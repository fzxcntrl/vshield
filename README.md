# Background Verification Platform

A secure and scalable platform for organizations and recruiters to perform identity checks on candidates. 
Built as a full-stack solution featuring a clean enterprise React dashboard and a robust Node.js backend.

## Features

- **Authentication Module**: Secure JWT-based registration and login system with bcrypt password hashing.
- **Candidate Management**: Complete CRUD operations for candidates with search and filtering.
- **Identity Verification**: Automated verification for Aadhaar and PAN numbers using mock REST APIs.
- **Professional PDF Reports**: Generate and download comprehensive background verification reports using Puppeteer.
- **Responsive Dashboard**: Built with React, Tailwind CSS, and Lucide icons for a premium, enterprise-grade user experience.

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: Node.js + Express.js (TypeScript)
- **Database**: SQLite (via Prisma ORM, easily interchangeable to PostgreSQL)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **PDF Generation**: Puppeteer
- **Validation**: Zod

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the repository (or navigate to directory)
```bash
cd vshield
```

### 2. Backend Setup
```bash
cd backend
npm install
# Initialize Prisma and SQLite database
npx prisma db push
npx prisma generate
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file in the `backend` directory (one is already provided with defaults for local dev):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="supersecretkey123"
PORT=5000
```
> **Note on Database**: The project currently defaults to SQLite for immediate local testing without needing a PostgreSQL server setup. To use PostgreSQL (e.g. Neon, Supabase, RDS), change the provider in `backend/prisma/schema.prisma` from `sqlite` to `postgresql`, set `DATABASE_URL` to your PostgreSQL connection string, and run `npx prisma db push`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get JWT

### Candidates
- `GET /api/candidates` - Get all candidates for the authenticated user
- `POST /api/candidates` - Create a new candidate
- `GET /api/candidates/:id` - Get specific candidate details
- `POST /api/candidates/:id/verify` - Trigger Aadhaar and PAN verification
- `GET /api/candidates/:id/report` - Download PDF verification report

### Mock Verification APIs
- `POST /mock-api/aadhaar/verify`
- `POST /mock-api/pan/verify`

## Database Setup

The schema uses the Prisma ORM. Currently configured with:
- **User** table
- **Candidate** table (1:N relation with User)
- **VerificationLog** table (1:N relation with Candidate)

To inspect the database locally:
```bash
cd backend
npx prisma studio
```

## Deployment

- **Frontend**: Ready to be deployed on Vercel. Ensure `API_URL` is set to your production backend.
- **Backend**: Ready for Render, Railway, or AWS. Set the necessary environment variables and switch to a cloud PostgreSQL instance.
- **Database**: Recommended providers include Neon, Supabase, or AWS RDS.

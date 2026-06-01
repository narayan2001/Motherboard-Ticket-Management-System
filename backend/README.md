# Motherboard Ticket Management System - Backend

Backend API for the Motherboard Repair Ticket Management System.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database (Supabase recommended)
- **JWT** - Authentication
- **Twilio** - WhatsApp notifications

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Your PostgreSQL connection string (get from Supabase)
- `JWT_SECRET` - Random secret string for JWT tokens
- `TWILIO_ACCOUNT_SID` - From Twilio dashboard
- `TWILIO_AUTH_TOKEN` - From Twilio dashboard
- `TWILIO_WHATSAPP_NUMBER` - Your Twilio WhatsApp number

### 3. Setup Database

Generate Prisma client:
```bash
npm run prisma:generate
```

Run database migrations:
```bash
npm run prisma:migrate
```

### 4. Create Initial Admin User

You can use Prisma Studio to create the first admin user:
```bash
npm run prisma:studio
```

Or use the register endpoint with role: "SUPER_ADMIN"

### 5. Start Development Server

```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tickets
- `GET /api/tickets` - Get all tickets (with filters)
- `POST /api/tickets` - Create ticket (with image upload)
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id/assign` - Assign ticket to employee
- `PUT /api/tickets/:id/status` - Update ticket status
- `POST /api/tickets/:id/diagnosis` - Submit diagnosis
- `PUT /api/tickets/:id/approval` - Update approval status
- `POST /api/tickets/:id/payment` - Submit payment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/reports` - Get reports

### Motherboards
- `GET /api/motherboards` - Get all motherboard types
- `POST /api/motherboards` - Create motherboard type
- `PUT /api/motherboards/:id` - Update motherboard type
- `DELETE /api/motherboards/:id` - Delete motherboard type

## Database Schema

See `prisma/schema.prisma` for complete database schema.

Main tables:
- users
- tickets
- ticket_diagnoses
- ticket_approvals
- payments
- ticket_history
- notifications
- motherboard_types

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

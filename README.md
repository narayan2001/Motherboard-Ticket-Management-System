# Motherboard Ticket Management System

A complete web-based ticket management system for motherboard repair shops with role-based access, WhatsApp notifications, and comprehensive validation.

![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)
![Status](https://img.shields.io/badge/Status-Production_Ready-green)

## 🚀 Features

- **User Management**: 3 roles (Super Admin, Employee, Receptionist)
- **Ticket Lifecycle**: Complete workflow from intake to payment
- **Phone Validation**: Indian format validation with auto-formatting
- **Revenue Dashboard**: Admin-only revenue tracking
- **WhatsApp Integration**: Automated customer notifications via Twilio
- **Form Validation**: Comprehensive frontend + backend validation
- **Role-Based Access**: Secure access control for all features
- **Payment Tracking**: Multiple payment methods with receipts

## 📋 Tech Stack

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL (production) / SQLite (development)
- JWT Authentication
- Twilio WhatsApp API

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios
- Context API

## 🛠️ Local Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Seed database with demo users
node seed.js

# Start development server
npm run dev
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on: http://localhost:3000

## 🔐 Demo Credentials

### Super Admin (Full Access + Revenue)
- Email: `admin@example.com`
- Password: `admin123`

### Employee
- Email: `employee@example.com`
- Password: `employee123`

### Receptionist
- Email: `receptionist@example.com`
- Password: `receptionist123`

## 🌐 Production Deployment

### Backend (Render.com)

1. **Create PostgreSQL Database**
   - New → PostgreSQL → Free tier
   - Copy Internal Database URL

2. **Deploy Backend Service**
   - New → Web Service
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgresql-url>
   JWT_SECRET=<generate-random-32-char-string>
   JWT_EXPIRE=24h
   TWILIO_ACCOUNT_SID=<your-sid>
   TWILIO_AUTH_TOKEN=<your-token>
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   FRONTEND_URL=<your-vercel-url>
   ```

4. **Seed Database**: Run `node seed.js` in Render Shell

### Frontend (Vercel)

1. **Deploy**
   - Import repository
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variable**
   ```
   VITE_API_URL=<your-render-backend-url>/api
   ```

See `PRODUCTION_DEPLOYMENT.md` for detailed instructions.

## 📱 Key Features

### Phone Number Validation
- Validates Indian phone numbers (10 digits)
- Auto-formats to +91 prefix
- Works in frontend and backend
- Example: `9876543210` → `+919876543210`

### Revenue Dashboard
- Only visible to Super Admin role
- Backend filters revenue by user role
- Frontend conditionally renders revenue card
- Real-time revenue tracking from payments

### WhatsApp Notifications
- Diagnosis notification with cost estimate
- Thank you message after payment
- Demo mode (console logging) + Production mode (Twilio)
- All notifications logged in database

### Form Validation
- Customer name (min 2 characters)
- Phone number (Indian format)
- Email (valid format)
- Motherboard brand and model (required)
- Issue description (min 10 characters)
- Real-time error messages with red borders

## 📊 Project Structure

```
motherboard-ticket-system/
├── backend/
│   ├── controllers/       # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   ├── prisma/            # Database schema & migrations
│   ├── utils/             # WhatsApp, file upload
│   ├── config/            # Database config
│   ├── .env.example       # Environment template
│   └── server.js          # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # Auth context
│   │   ├── services/      # API services
│   │   └── utils/         # Constants
│   ├── vercel.json        # Vercel config
│   └── vite.config.js     # Vite config
│
└── README.md              # This file
```

## 🔒 Security Features

- JWT authentication with bcrypt password hashing
- Role-based access control (RBAC)
- Frontend + backend input validation
- CORS configuration
- Environment variable protection
- SQL injection protection via Prisma ORM

## 💰 Cost

### Free Tier
- Vercel: FREE (100GB bandwidth/month)
- Render Backend: FREE (sleeps after 15 min inactivity)
- Render Database: FREE (1GB storage)
- **Total**: $0/month

### Paid Tier (Recommended for Production)
- Render Backend: $7/month (24/7 uptime)
- Render Database: $7/month (backups, more storage)
- **Total**: $14/month

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - List tickets (with filters)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id/assign` - Assign ticket
- `POST /api/tickets/:id/diagnosis` - Submit diagnosis
- `POST /api/tickets/:id/payment` - Record payment

### Dashboard
- `GET /api/dashboard/stats` - Get statistics (revenue filtered by role)

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)

## 🐛 Troubleshooting

### Backend won't start
- Check DATABASE_URL format
- Verify Prisma migrations: `npm run prisma:migrate`
- Check environment variables

### Frontend can't connect to backend
- Verify VITE_API_URL in frontend
- Check CORS settings (FRONTEND_URL in backend)
- Ensure backend is running

### WhatsApp not working
- Verify Twilio credentials
- Check phone number format (+91...)
- See notification logs in ticket details
- For production: verify Twilio sandbox settings

## 📖 Documentation

- `README.md` - This file (setup & overview)
- `PRODUCTION_DEPLOYMENT.md` - Detailed deployment guide
- `backend/.env.example` - Backend environment variables
- `frontend/.env.production.example` - Frontend environment variables

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/narayan2001/Motherboard-Ticket-Management-System.git
cd Motherboard-Ticket-Management-System

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run prisma:generate
npm run prisma:migrate
node seed.js
npm run dev

# Setup frontend (new terminal)
cd frontend
npm install
npm run dev

# Open http://localhost:3000
# Login: admin@example.com / admin123
```

## 📄 License

Private Project - All rights reserved

## 👨‍💻 Developer

Created for motherboard repair shop ticket management

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: June 2026

---

**Ready to deploy!** Follow `PRODUCTION_DEPLOYMENT.md` for step-by-step deployment instructions.

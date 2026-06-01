# Motherboard Ticket Management System

A comprehensive web-based ticket management system for motherboard repair shops. Built with React, Node.js, Express, and PostgreSQL.

![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)
![Status](https://img.shields.io/badge/Status-Development-green)

## Overview

This system streamlines the complete motherboard repair workflow from customer intake through diagnosis, approval, repair, and payment collection. It includes WhatsApp integration for automated customer notifications.

### Key Features

✅ **User Management** - Role-based access (Super Admin, Employee, Receptionist)  
✅ **Ticket Management** - Complete ticket lifecycle with status tracking  
✅ **Diagnosis & Estimation** - Cost calculator with parts and labor breakdown  
✅ **WhatsApp Integration** - Automated customer notifications via Twilio  
✅ **Payment Tracking** - Multiple payment methods with receipt generation  
✅ **Dashboard & Analytics** - Real-time statistics and reports  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

## Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **Prisma ORM** - Database management
- **PostgreSQL** - Database (Supabase recommended)
- **JWT** - Authentication
- **Twilio** - WhatsApp API
- **Multer** - File uploads

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## Project Structure

```
motherboard-ticket-system/
├── backend/          # Node.js + Express API
│   ├── controllers/  # Business logic
│   ├── routes/       # API routes
│   ├── middleware/   # Auth & validation
│   ├── prisma/       # Database schema
│   └── utils/        # Helper functions
│
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── services/    # API services
│   └── public/
│
└── PROJECT_STRUCTURE.md  # Detailed documentation
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL database (or Supabase account)
- Twilio account (for WhatsApp)

### Installation

1. **Clone and navigate to project:**
   ```bash
   cd /Users/narayan.jha_qpl/Documents/motherboard-ticket-system
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

3. **Setup Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Environment Variables

Create `backend/.env` with:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret-key"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
FRONTEND_URL="http://localhost:3000"
```

## User Roles

### Super Admin
- Full system access
- User management
- Assign tickets to employees
- View all reports

### Employee (Technician)
- View assigned tickets
- Submit diagnosis and estimates
- Send WhatsApp notifications
- Process payments

### Receptionist
- Create new tickets
- View all tickets
- Update customer information

## Workflow

1. **Customer Intake** → Receptionist creates ticket
2. **Assignment** → Admin assigns to employee
3. **Diagnosis** → Employee diagnoses and creates estimate
4. **Approval** → WhatsApp sent to customer for approval
5. **Repair** → Employee completes repair
6. **Payment** → Payment collected and ticket closed
7. **Notification** → Thank you WhatsApp sent

## API Documentation

### Authentication
```
POST   /api/auth/login        # Login
POST   /api/auth/register     # Register
GET    /api/auth/me           # Get current user
```

### Tickets
```
GET    /api/tickets           # List all tickets
POST   /api/tickets           # Create ticket
GET    /api/tickets/:id       # Get ticket details
PUT    /api/tickets/:id/assign         # Assign ticket
POST   /api/tickets/:id/diagnosis      # Submit diagnosis
POST   /api/tickets/:id/payment        # Record payment
```

See `PROJECT_STRUCTURE.md` for complete API documentation.

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run prisma:studio    # Open database GUI
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
```

## Database Schema

Main tables:
- `users` - System users
- `tickets` - Repair tickets
- `ticket_diagnoses` - Diagnosis and estimates
- `ticket_approvals` - Customer approvals
- `payments` - Payment records
- `notifications` - WhatsApp logs
- `motherboard_types` - Motherboard catalog

## Deployment

### Recommended Stack
- **Frontend:** Vercel / Netlify
- **Backend:** Render.com / Railway
- **Database:** Supabase (free tier)

### Build Commands
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm run build
```

## Screenshots & Demo

(Add screenshots of your application here)

## Roadmap

- [ ] Email notification backup
- [ ] Payment gateway integration (Razorpay)
- [ ] Customer portal
- [ ] Mobile app
- [ ] Inventory management
- [ ] Advanced analytics

## Contributing

This is a private freelance project. For questions or issues, contact the developer.

## License

Private Project - All rights reserved

## Support

For setup issues or questions:
1. Check `PROJECT_STRUCTURE.md` for detailed documentation
2. Review error logs (backend console / browser console)
3. Verify environment variables are set correctly

---

**Developer:** Created for motherboard repair shop ticket management  
**Version:** 1.0.0  
**Last Updated:** May 2026

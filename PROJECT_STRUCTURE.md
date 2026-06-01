# Motherboard Ticket Management System - Complete Project Structure

## Project Location
`/Users/narayan.jha_qpl/Documents/motherboard-ticket-system`

## Technology Stack

### Backend
- **Node.js** + **Express.js** - API Server
- **Prisma ORM** - Database management
- **PostgreSQL** (Supabase) - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Twilio** - WhatsApp integration
- **Multer** - File uploads

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Project Structure

```
motherboard-ticket-system/
│
├── backend/
│   ├── config/
│   │   └── database.js                 # Prisma client configuration
│   │
│   ├── controllers/
│   │   ├── auth.controller.js          # Authentication logic
│   │   ├── ticket.controller.js        # Ticket CRUD operations
│   │   ├── user.controller.js          # User management
│   │   ├── dashboard.controller.js     # Dashboard stats
│   │   └── motherboard.controller.js   # Motherboard types
│   │
│   ├── middleware/
│   │   └── auth.middleware.js          # JWT verification & authorization
│   │
│   ├── models/                         # (Prisma schema defines models)
│   │
│   ├── routes/
│   │   ├── auth.routes.js              # /api/auth/*
│   │   ├── user.routes.js              # /api/users/*
│   │   ├── ticket.routes.js            # /api/tickets/*
│   │   ├── dashboard.routes.js         # /api/dashboard/*
│   │   └── motherboard.routes.js       # /api/motherboards/*
│   │
│   ├── utils/
│   │   ├── whatsapp.js                 # WhatsApp notification sender
│   │   └── fileUpload.js               # Multer configuration
│   │
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   │
│   ├── uploads/                        # Uploaded motherboard images
│   ├── server.js                       # Express app entry point
│   ├── package.json                    # Backend dependencies
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore
│   └── README.md                       # Backend setup instructions
│
├── frontend/
│   ├── public/                         # Static assets
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx              # Main layout with sidebar
│   │   │   ├── StatusBadge.jsx         # Status & priority badges
│   │   │   └── LoadingSpinner.jsx      # Loading indicator
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx         # Authentication context
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Login page
│   │   │   ├── Dashboard.jsx           # Dashboard with stats
│   │   │   ├── Tickets.jsx             # Ticket list
│   │   │   ├── TicketDetails.jsx       # Single ticket view
│   │   │   ├── CreateTicket.jsx        # Create new ticket
│   │   │   ├── Users.jsx               # User management (admin)
│   │   │   ├── Profile.jsx             # User profile
│   │   │   └── Motherboards.jsx        # Motherboard types (admin)
│   │   │
│   │   ├── services/
│   │   │   └── api.js                  # API service layer
│   │   │
│   │   ├── utils/
│   │   │   └── constants.js            # App constants
│   │   │
│   │   ├── App.jsx                     # Main app component
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   │
│   ├── index.html                      # HTML template
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── postcss.config.js               # PostCSS config
│   └── .gitignore
│
└── PROJECT_STRUCTURE.md               # This file
```

## Database Schema

### Tables Created by Prisma:
1. **users** - System users (Admin, Employee, Receptionist)
2. **tickets** - Main ticket records
3. **ticket_diagnoses** - Diagnosis details and cost estimates
4. **ticket_approvals** - Customer approval tracking
5. **payments** - Payment records
6. **ticket_history** - Audit trail
7. **notifications** - WhatsApp notification logs
8. **motherboard_types** - Master motherboard data

## API Endpoints

### Authentication (`/api/auth`)
- POST `/register` - Register new user
- POST `/login` - Login
- GET `/me` - Get current user
- PUT `/update-password` - Change password

### Users (`/api/users`) - Admin only
- GET `/` - List all users
- POST `/` - Create user
- GET `/:id` - Get user
- PUT `/:id` - Update user
- DELETE `/:id` - Delete user

### Tickets (`/api/tickets`)
- GET `/` - List tickets (with filters)
- POST `/` - Create ticket (with image)
- GET `/:id` - Get ticket details
- PUT `/:id/assign` - Assign to employee
- PUT `/:id/status` - Update status
- POST `/:id/diagnosis` - Submit diagnosis
- PUT `/:id/approval` - Update approval
- POST `/:id/payment` - Submit payment

### Dashboard (`/api/dashboard`)
- GET `/stats` - Get statistics
- GET `/reports` - Get reports

### Motherboards (`/api/motherboards`)
- GET `/` - List motherboard types
- POST `/` - Create type
- PUT `/:id` - Update type
- DELETE `/:id` - Delete type

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   TWILIO_ACCOUNT_SID="..."
   TWILIO_AUTH_TOKEN="..."
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   ```

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

7. (Optional) Open Prisma Studio to add initial admin user:
   ```bash
   npm run prisma:studio
   ```

8. Start development server:
   ```bash
   npm run dev
   ```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `.env` file if you want custom API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run on http://localhost:3000

## User Roles & Permissions

### Super Admin
- Full system access
- Manage users (create/edit/delete)
- Assign tickets to employees
- View all tickets and reports
- Manage motherboard types
- Access dashboard analytics

### Employee (Technician)
- View assigned tickets
- Update ticket status
- Submit diagnosis and estimates
- Send WhatsApp notifications
- Process payments
- Close tickets

### Receptionist
- Create new tickets
- View all tickets
- Update customer information
- Cannot assign or diagnose tickets

## Ticket Workflow

1. **Creation** (Receptionist)
   - Customer brings motherboard
   - Receptionist creates ticket with details
   - Unique ticket ID generated (MB-YYYY-XXXX)

2. **Assignment** (Admin)
   - Admin assigns ticket to available employee

3. **Diagnosis** (Employee)
   - Employee diagnoses the issue
   - Submits cost estimate and timeline

4. **Approval** (Automatic WhatsApp)
   - System sends WhatsApp to customer
   - Employee/Admin updates approval status manually

5. **Repair** (Employee)
   - If approved, employee starts repair
   - Updates status to IN_PROGRESS
   - Marks as RESOLVED when done
   - WhatsApp sent to customer for pickup

6. **Payment & Closure** (Employee)
   - Customer verifies and pays
   - Employee records payment
   - Ticket closed
   - Thank you WhatsApp sent

## Key Features Implemented

### Authentication & Security
✅ JWT-based authentication
✅ Role-based access control
✅ Password hashing with bcrypt
✅ Protected API routes
✅ Session management

### Ticket Management
✅ Create tickets with image upload
✅ Unique ticket number generation
✅ Search and filter tickets
✅ Status tracking
✅ Priority levels
✅ Assignment to employees
✅ Complete audit history

### Diagnosis & Estimation
✅ Detailed diagnosis form
✅ Parts and labor cost calculator
✅ Customer approval workflow
✅ Estimate history tracking

### WhatsApp Integration
✅ Twilio API integration
✅ Automated notifications:
  - Diagnosis complete with estimate
  - Repair complete for pickup
  - Thank you after payment
✅ Notification delivery tracking
✅ Failed notification logging

### Dashboard & Reporting
✅ Real-time statistics
✅ Ticket count by status
✅ Revenue tracking
✅ Recent tickets list
✅ Employee workload view
✅ Date range filtering
✅ CSV export capability

### User Management
✅ Create/edit/delete users
✅ Role assignment
✅ Active/inactive status
✅ User profile management

## Development Commands

### Backend
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Production Deployment

### Backend Deployment (Render.com recommended)
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build frontend: `npm run build`
2. Deploy `dist` folder
3. Configure API_URL environment variable

### Database (Supabase)
1. Create Supabase project (free tier)
2. Get PostgreSQL connection string
3. Update DATABASE_URL in backend

## Testing Credentials

After setting up, create an admin user via Prisma Studio or register endpoint:
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Super Admin",
  "role": "SUPER_ADMIN"
}
```

## Troubleshooting

### Common Issues:

1. **Prisma Client not generated**
   ```bash
   cd backend && npm run prisma:generate
   ```

2. **Database connection failed**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check firewall settings

3. **WhatsApp not sending**
   - Verify Twilio credentials
   - Check phone number format (+91XXXXXXXXXX)
   - Ensure templates are approved

4. **CORS errors**
   - Check FRONTEND_URL in backend .env
   - Verify proxy settings in vite.config.js

## Next Steps / Future Enhancements

- [ ] Email notifications backup
- [ ] SMS notifications
- [ ] Payment gateway integration (Razorpay)
- [ ] Inventory management
- [ ] Customer portal
- [ ] Mobile app (React Native)
- [ ] Barcode/QR scanning
- [ ] Advanced analytics
- [ ] Multi-location support
- [ ] Customer feedback system

## Support & Maintenance

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check browser console (frontend)
4. Check server logs (backend)

## License

Private project - All rights reserved

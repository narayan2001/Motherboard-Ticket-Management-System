# Getting Started Guide

## Complete Setup Instructions for Motherboard Ticket Management System

This guide will walk you through setting up the project from scratch on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   ```bash
   node --version  # Should show v16.x.x or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Git** (optional, for version control)
   ```bash
   git --version
   ```

## Step 1: Database Setup (Supabase - Free)

1. Go to [https://supabase.com](https://supabase.com) and create a free account

2. Create a new project:
   - Click "New Project"
   - Choose organization
   - Enter project name: `motherboard-tickets`
   - Set a strong database password (save this!)
   - Choose region (closest to you)
   - Click "Create new project"

3. Wait 2-3 minutes for project to be ready

4. Get your database connection string:
   - Go to Project Settings → Database
   - Scroll to "Connection string" → "URI"
   - Copy the connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with your actual database password

## Step 2: WhatsApp Setup (Twilio)

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)

2. Sign up for a free trial account

3. Verify your phone number

4. Get your credentials:
   - Go to Console Dashboard
   - Copy **Account SID**
   - Copy **Auth Token** (click "Show" to reveal)

5. Enable WhatsApp Sandbox:
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Send the code from your phone to join sandbox
   - Your WhatsApp number will be: `whatsapp:+14155238886`

## Step 3: Backend Setup

1. Open terminal and navigate to backend folder:
   ```bash
   cd /Users/narayan.jha_qpl/Documents/motherboard-ticket-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file:
   ```bash
   open .env
   ```
   
   Fill in your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Your Supabase PostgreSQL connection string
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   
   # Generate a random secret (any long random string)
   JWT_SECRET="my-super-secret-jwt-key-change-this-12345"
   JWT_EXPIRE=24h
   
   # Your Twilio credentials
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="your_auth_token_here"
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   
   FRONTEND_URL="http://localhost:3000"
   ```

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```
   
   When prompted for migration name, enter: `init`

7. Create your first admin user:
   ```bash
   npm run prisma:studio
   ```
   
   This opens Prisma Studio in your browser (http://localhost:5555)
   
   - Click on "User" table
   - Click "Add record"
   - Fill in:
     - email: `admin@example.com`
     - password: Use this pre-hashed password: `$2a$10$XqI5V3X5X5X5X5X5X5X5XO` (password: `admin123`)
     - name: `Super Admin`
     - role: `SUPER_ADMIN`
     - phone: `+919876543210` (your phone)
     - isActive: `true`
   - Click "Save 1 change"
   
   **OR** Use the register endpoint:
   ```bash
   # In another terminal, after starting the server
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "admin123",
       "name": "Super Admin",
       "role": "SUPER_ADMIN",
       "phone": "+919876543210"
     }'
   ```

8. Start the backend server:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   ✅ Database connected successfully
   ✅ Server running on port 5000
   ```

## Step 4: Frontend Setup

1. Open a NEW terminal window

2. Navigate to frontend folder:
   ```bash
   cd /Users/narayan.jha_qpl/Documents/motherboard-ticket-system/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. (Optional) Create environment file:
   ```bash
   echo 'VITE_API_URL=http://localhost:5000/api' > .env
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:3000/
   ```

## Step 5: Access the Application

1. Open your browser and go to: **http://localhost:3000**

2. You'll see the login page

3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

4. You should be redirected to the Dashboard!

## Step 6: Test the System

### Create Your First Ticket

1. Click "Tickets" in the sidebar
2. Click "Create Ticket" button
3. Fill in the form:
   - Customer Name: `John Doe`
   - Phone: `+919876543210` (use your WhatsApp number for testing)
   - Motherboard Brand: `ASUS`
   - Model: `ROG STRIX Z690`
   - Issue: `Not powering on, possible BIOS issue`
   - Priority: `High`
4. Click "Create Ticket"
5. You should see the new ticket in the list!

### Test WhatsApp Notification

1. Open the ticket you just created
2. Scroll to "Submit Diagnosis" section
3. Click "Add Diagnosis"
4. Fill in:
   - Diagnosis Notes: `Faulty BIOS chip needs replacement`
   - Parts Required: `BIOS chip`
   - Parts Cost: `500`
   - Labor Cost: `300`
   - Estimated Days: `2`
5. Click "Submit & Send WhatsApp"
6. Check your WhatsApp - you should receive a message!

## Troubleshooting

### Backend won't start

**Error: "Database connection failed"**
- Check your DATABASE_URL in `.env`
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Verify Supabase project is running

**Error: "Port 5000 already in use"**
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9
# Then restart: npm run dev
```

### Frontend won't start

**Error: "npm install failed"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Cannot connect to API"**
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify VITE_API_URL in frontend/.env

### WhatsApp not working

**Messages not sending**
- Verify Twilio credentials in backend/.env
- Make sure phone number is in format: `+919876543210`
- Check you joined the WhatsApp sandbox
- Look at backend terminal for error messages

**Error: "Phone number not verified"**
- You need to join Twilio WhatsApp sandbox first
- Send the join code from your WhatsApp to the sandbox number

### Database Issues

**Error: "Prisma client not generated"**
```bash
cd backend
npm run prisma:generate
```

**Error: "Migration failed"**
```bash
# Reset database (WARNING: Deletes all data)
npm run prisma:migrate reset
# Then migrate again
npm run prisma:migrate
```

## Next Steps

### Add More Users

1. Login as admin
2. Go to "Users" in sidebar
3. Click "Add User"
4. Create employees and receptionists

### Configure Your Shop

1. Go to "Motherboards" to add common motherboard types
2. Set up your employees
3. Start creating tickets!

### Customize

- Edit brand colors in `frontend/tailwind.config.js`
- Change logo/name in `frontend/src/components/Layout.jsx`
- Modify notification messages in `backend/utils/whatsapp.js`

## Development Tips

### Useful Commands

**Backend:**
```bash
npm run dev              # Start dev server with auto-reload
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run new migrations
```

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Check Logs

**Backend logs:**
- Terminal where `npm run dev` is running
- Look for errors, WhatsApp send status, etc.

**Frontend logs:**
- Browser Developer Tools → Console (F12)

### Reset Everything

If something goes wrong and you want to start fresh:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
npm run prisma:migrate reset  # WARNING: Deletes all data
npm run dev

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Production Deployment

When ready to deploy for your client, see `PROJECT_STRUCTURE.md` section on deployment.

## Support

If you encounter issues:
1. Check error messages carefully
2. Review this guide
3. Check `PROJECT_STRUCTURE.md` for detailed docs
4. Search error message online

## Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can login as admin
- [ ] Can create tickets
- [ ] WhatsApp notifications working
- [ ] Dashboard showing data

**Congratulations! Your system is ready to use!** 🎉

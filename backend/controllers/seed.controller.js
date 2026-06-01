const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

exports.seedDatabase = async (req, res) => {
  try {
    const { secret } = req.body;
    
    if (secret !== process.env.SEED_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Invalid seed secret'
      });
    }

    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        phone: '+919876543210',
        isActive: true
      }
    });

    console.log('✅ Admin user created:', admin.email);

    // Create an employee
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employee = await prisma.user.upsert({
      where: { email: 'employee@example.com' },
      update: {},
      create: {
        email: 'employee@example.com',
        password: employeePassword,
        name: 'John Technician',
        role: 'EMPLOYEE',
        phone: '+919876543211',
        isActive: true
      }
    });

    console.log('✅ Employee created:', employee.email);

    // Create a receptionist
    const receptionistPassword = await bcrypt.hash('receptionist123', 10);
    const receptionist = await prisma.user.upsert({
      where: { email: 'receptionist@example.com' },
      update: {},
      create: {
        email: 'receptionist@example.com',
        password: receptionistPassword,
        name: 'Jane Receptionist',
        role: 'RECEPTIONIST',
        phone: '+919876543212',
        isActive: true
      }
    });

    console.log('✅ Receptionist created:', receptionist.email);

    // Add some motherboard types
    const motherboards = [
      { brandName: 'ASUS', modelSeries: 'ROG STRIX', category: 'Gaming' },
      { brandName: 'MSI', modelSeries: 'Gaming X', category: 'Gaming' },
      { brandName: 'Gigabyte', modelSeries: 'AORUS', category: 'Gaming' },
      { brandName: 'ASRock', modelSeries: 'Phantom Gaming', category: 'Gaming' },
    ];

    for (const mb of motherboards) {
      await prisma.motherboardType.upsert({
        where: { brandName_modelSeries: { brandName: mb.brandName, modelSeries: mb.modelSeries } },
        update: {},
        create: mb
      });
    }

    console.log('✅ Motherboard types added');

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      users: {
        admin: { email: 'admin@example.com', password: 'admin123' },
        employee: { email: 'employee@example.com', password: 'employee123' },
        receptionist: { email: 'receptionist@example.com', password: 'receptionist123' }
      }
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
};

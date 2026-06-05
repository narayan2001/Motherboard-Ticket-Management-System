const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Receptionist: receptionist@example.com / receptionist123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

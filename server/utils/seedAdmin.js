const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: 'admin@pms.com' });
    if (existing) {
      console.log('⚠️  Admin user already exists. Skipping.');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@pms.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: admin@pms.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   ID: ${admin._id}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // One-time migration: add academicVerified fields to old student docs
    const Student = require('../models/Student');
    const result = await Student.updateMany(
      { academicVerified: { $exists: false } },
      { $set: {
          academicVerified: false,
          academicVerifiedBy: null,
          academicVerifiedAt: null
        }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Migration: added academicVerified to ${result.modifiedCount} student(s)`);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

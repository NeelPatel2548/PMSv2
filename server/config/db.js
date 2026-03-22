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

    // One-time migration: remove invalid skills not in SKILLS_LIST
    const { SKILLS_LIST } = require('../utils/constants');
    const cleanedCount = await Student.updateMany(
      { skills: { $exists: true, $ne: [] } },
      [{
        $set: {
          skills: {
            $filter: {
              input: '$skills',
              cond: { $in: ['$$this', SKILLS_LIST] }
            }
          }
        }
      }]
    );
    if (cleanedCount.modifiedCount > 0) {
      console.log(`Skills migration: cleaned ${cleanedCount.modifiedCount} student(s)`);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

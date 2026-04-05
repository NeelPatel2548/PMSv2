const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// autoIndex strategy
// ---------------------------------------------------------------------------
// In development: Mongoose recreates indexes on every server restart.
//   → Convenient — schema changes take effect immediately.
// In production: autoIndex is OFF. Indexes must be built explicitly via
//   `node server/scripts/buildIndexes.js` after deployment.
//   → Prevents accidental index builds that block collections under load.
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

const connectDB = async () => {
  try {
    const options = {
      // Maximum number of sockets in the connection pool.
      // 10 is a safe default for a college PMS; increase if you see
      // MongoServerSelectionError under heavy concurrent load.
      maxPoolSize: 10,

      // How long (ms) the driver waits to find an available server
      // before throwing a MongoServerSelectionError.
      serverSelectionTimeoutMS: 5000,

      // How long (ms) a socket stays idle before the driver closes it.
      socketTimeoutMS: 45000,

      // Force IPv4. Without this, Node.js may try IPv6 first on some
      // cloud platforms (Render, Railway) and time out before falling back.
      family: 4,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`   Database  : ${conn.connection.name}`);
    console.log(`   Auto-index: ${process.env.NODE_ENV !== 'production'} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);

    // ---------------------------------------------------------------------------
    // One-time data migrations
    // ---------------------------------------------------------------------------
    // These are idempotent: they check before modifying, so safe to re-run.

    // Migration 1: add academicVerified fields to legacy student documents
    const Student = require('../models/Student');
    const migrationResult = await Student.updateMany(
      { academicVerified: { $exists: false } },
      {
        $set: {
          academicVerified: false,
          academicVerifiedBy: null,
          academicVerifiedAt: null
        }
      }
    );
    if (migrationResult.modifiedCount > 0) {
      console.log(`   Migration : added academicVerified to ${migrationResult.modifiedCount} student(s)`);
    }

    // Migration 2: remove invalid skills not present in the SKILLS_LIST enum
    const { SKILLS_LIST } = require('../utils/constants');
    const skillsResult = await Student.updateMany(
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
    if (skillsResult.modifiedCount > 0) {
      console.log(`   Migration : cleaned skills for ${skillsResult.modifiedCount} student(s)`);
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

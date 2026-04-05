/**
 * buildIndexes.js
 * ---------------
 * One-time script to build all Mongoose schema indexes on the production
 * MongoDB Atlas database.
 *
 * WHY NEEDED:
 *   In production, autoIndex is disabled (see db.js) to prevent accidental
 *   long-running index builds that can block collection access under load.
 *   Run this script ONCE manually after each production deployment that adds
 *   new indexes to any model.
 *
 * USAGE:
 *   node server/scripts/buildIndexes.js
 *
 * SAFE TO RE-RUN: syncIndexes() is idempotent — it creates missing indexes
 * and drops any indexes that exist in the DB but are not defined in the schema.
 * WARNING: The "drop unknown indexes" behavior means if you have any custom
 * indexes created directly in Atlas (not via Mongoose), they will be removed.
 *
 * ESTIMATED TIME: 1–30 seconds per collection depending on document count.
 * Atlas M0 free tier may be slower on first run.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');

// Import all models so Mongoose registers their schemas
const User         = require('../models/User');
const Student      = require('../models/Student');
const Company      = require('../models/Company');
const Job          = require('../models/Job');
const Application  = require('../models/Application');
const Interview    = require('../models/Interview');
const Notification = require('../models/Notification');

const MODELS = [
  { name: 'User',         model: User         },
  { name: 'Student',      model: Student      },
  { name: 'Company',      model: Company      },
  { name: 'Job',          model: Job          },
  { name: 'Application',  model: Application  },
  { name: 'Interview',    model: Interview    },
  { name: 'Notification', model: Notification },
];

async function buildIndexes() {
  console.log('='.repeat(60));
  console.log('  PMS — MongoDB Index Builder');
  console.log('='.repeat(60));
  console.log(`  NODE_ENV : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Connecting to Atlas...`);

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      family: 4,
      // IMPORTANT: force autoIndex ON for this script regardless of NODE_ENV
      // because the whole point is to build indexes.
      autoIndex: true,
    });

    console.log(`  ✅ Connected: ${mongoose.connection.host}`);
    console.log(`  Database  : ${mongoose.connection.name}`);
    console.log('-'.repeat(60));

    for (const { name, model } of MODELS) {
      process.stdout.write(`  Syncing indexes on ${name.padEnd(15)} ... `);
      const start = Date.now();
      await model.syncIndexes();
      const elapsed = Date.now() - start;
      console.log(`done (${elapsed}ms)`);
    }

    console.log('-'.repeat(60));
    console.log('  ✅ All indexes synced successfully.');
    console.log('='.repeat(60));

  } catch (err) {
    console.error('\n  ❌ Index build failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('  Disconnected from MongoDB.');
  }
}

buildIndexes();

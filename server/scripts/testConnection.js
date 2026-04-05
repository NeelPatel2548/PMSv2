/**
 * testConnection.js
 * -----------------
 * Diagnostic script to verify MongoDB Atlas connectivity and inspect the
 * database state. Safe to run at any time — read-only queries only.
 *
 * USAGE:
 *   node server/scripts/testConnection.js
 *
 * OUTPUT:
 *   - Connection status and host
 *   - Database name
 *   - All collections found
 *   - Document count for each collection
 *   - Index list for each collection
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');

async function testConnection() {
  console.log('='.repeat(60));
  console.log('  PMS — MongoDB Connection Diagnostic');
  console.log('='.repeat(60));
  console.log(`  NODE_ENV : ${process.env.NODE_ENV || 'development'}`);

  // Mask password in URI for safe logging
  const safeUri = (process.env.MONGO_URI || '').replace(
    /\/\/([^:]+):([^@]+)@/,
    '//$1:****@'
  );
  console.log(`  MONGO_URI: ${safeUri}`);
  console.log('-'.repeat(60));

  const startTime = Date.now();

  try {
    console.log('  Connecting...');
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      family: 4,
      autoIndex: false,
    });

    const elapsed = Date.now() - startTime;
    console.log(`  ✅ Connected in ${elapsed}ms`);
    console.log(`  Host     : ${mongoose.connection.host}`);
    console.log(`  Database : ${mongoose.connection.name}`);
    console.log('-'.repeat(60));

    // List all collections and their document counts
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('  ⚠️  No collections found. Database may be empty.');
    } else {
      console.log(`  Collections found: ${collections.length}`);
      console.log('');

      // Collect counts in parallel for speed
      const collectionStats = await Promise.all(
        collections.map(async (col) => {
          const count = await db.collection(col.name).countDocuments();
          const indexes = await db.collection(col.name).indexes();
          return { name: col.name, count, indexCount: indexes.length };
        })
      );

      // Sort alphabetically for readable output
      collectionStats.sort((a, b) => a.name.localeCompare(b.name));

      const nameWidth  = Math.max(...collectionStats.map(s => s.name.length), 12);
      const countWidth = 10;
      const idxWidth   = 8;

      console.log(
        `  ${'Collection'.padEnd(nameWidth)}  ${'Documents'.padStart(countWidth)}  ${'Indexes'.padStart(idxWidth)}`
      );
      console.log(`  ${'-'.repeat(nameWidth + countWidth + idxWidth + 4)}`);

      for (const { name, count, indexCount } of collectionStats) {
        console.log(
          `  ${name.padEnd(nameWidth)}  ${count.toString().padStart(countWidth)}  ${indexCount.toString().padStart(idxWidth)}`
        );
      }
    }

    console.log('-'.repeat(60));
    console.log('  ✅ Connection test passed. Database is reachable.');

  } catch (err) {
    console.error('\n  ❌ Connection FAILED');
    console.error(`  Error: ${err.message}`);
    console.error('');
    console.error('  Troubleshooting checklist:');
    console.error('  1. Check MONGO_URI in your .env file');
    console.error('  2. Atlas Network Access → IP Allowlist → 0.0.0.0/0');
    console.error('  3. Atlas database user has readWriteAnyDatabase role');
    console.error('  4. Cluster is not paused (free M0 clusters auto-pause)');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('  Disconnected from MongoDB.');
    console.log('='.repeat(60));
  }
}

testConnection();

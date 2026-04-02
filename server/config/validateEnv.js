/**
 * Validate that all required environment variables are set.
 * Must be called at the very top of server.js AFTER dotenv.config().
 * Hard-stops the server if any required var is missing.
 */
const validateEnv = () => {
  const required = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'EMAIL_USER',
    'EMAIL_PASS',
    'CLIENT_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n========================================');
    console.error('  FATAL: Missing environment variables');
    console.error('========================================');
    missing.forEach(key => {
      console.error(`  MISSING ENV: ${key}`);
    });
    console.error('\nServer cannot start without these variables.');
    console.error('Check your .env file or hosting platform config.\n');
    process.exit(1);
  }

  console.log('✓ All required environment variables are set.');
};

module.exports = validateEnv;

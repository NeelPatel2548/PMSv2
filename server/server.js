const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load env vars FIRST — before anything else reads process.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Validate all required env vars — hard-stop if any are missing
const validateEnv = require('./config/validateEnv');
validateEnv();

const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// ---------------------------------------------------------------------------
// MongoDB connection lifecycle events
// These fire after the initial connection is established and are critical
// for diagnosing intermittent Atlas connectivity issues on cloud platforms.
// ---------------------------------------------------------------------------
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

const app = express();
const httpServer = http.createServer(app);

// Socket.IO — real-time notifications
const { initSocket } = require('./services/socketService');
initSocket(httpServer);

// Interview reminder scheduler — checks every 30 minutes
const { startInterviewReminders } = require('./services/interviewReminder');
startInterviewReminders();

// Security middleware
app.use(helmet());

// CORS — locked to the CLIENT_URL from env (no wildcard, no fallback)
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('CORS origin:', process.env.CLIENT_URL);

app.use(mongoSanitize());
app.use(xss());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PMS API is running' });
});

// ---------------------------------------------------------------------------
// PDF proxy — Task 1 fix
// Cloudinary serves raw-uploaded PDFs with Content-Type: application/octet-stream
// which causes browsers to download instead of display inline. This proxy
// re-fetches the Cloudinary URL and serves with proper PDF headers.
// ---------------------------------------------------------------------------
app.get('/api/pdf-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL required' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch PDF' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': buffer.length,
    });

    return res.send(buffer);
  } catch (err) {
    console.error('PDF proxy error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch PDF', error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    errors: null
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errors: null });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, httpServer };

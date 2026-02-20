// ============================================================
// FocusFlow — Express + MongoDB Backend
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const trackingRoutes = require('./routes/tracking');
const settingsRoutes = require('./routes/settings');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use((req, res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); next(); });

// MongoDB — no deprecated options needed in Mongoose 7+
// Connect with retry so the dev server doesn't exit immediately on network/DNS issues
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('Retrying MongoDB connection in 5s...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/tracking', trackingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => res.status(500).json({ error: 'Internal server error', message: err.message }));

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║  ⚡ FocusFlow API Server Running      ║
║  📍 http://localhost:${PORT}           ║
║  🗄  MongoDB: connecting...           ║
╚══════════════════════════════════════╝
  `);
});

module.exports = app;

/**
 * Express Server
 *
 * Main entry point for the backend API.
 * Handles CORS, JSON parsing, and routes.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const generateRoute = require('./routes/generate');
const { createRateLimiter } = require('./middleware/request-guard');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map(origin => origin.trim())
    : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '16kb' }));

// Routes
app.use('/api', createRateLimiter(), generateRoute);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`API endpoint: POST http://localhost:${PORT}/api/generate`);
});

import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Root Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Karmix Helper Civic API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiEngine: config.geminiApiKey ? 'Gemini 2.0 (Live)' : 'Contextual Civic Intelligence (Offline Verified)',
  });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Karmix Helper Backend API Server`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`⚡ Environment: ${config.nodeEnv}`);
  console.log(`🤖 AI Engine: ${config.geminiApiKey ? 'Gemini 2.0' : 'Offline Civic Knowledge Engine'}`);
  console.log(`=========================================`);
});

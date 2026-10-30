import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import diagnosticRoutes from './routes/diagnosticRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import readinessRoutes from './routes/readinessRoutes.js';
import personalizedRoadmapRoutes from './routes/personalizedRoadmapRoutes.js';
import weeklyQuizRoutes from './routes/weeklyQuizRoutes.js';
import aiTutorRoutes from './routes/aiTutorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Set trust proxy for reverse proxies (Render, AWS, NGINX)
// Ensures correct client IP identification for express-rate-limit
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting credentials from frontend origin (strictly disallow wildcards)
const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
if (clientOrigin === '*') {
  throw new Error("CORS wildcard origin '*' is strictly prohibited when credentials are enabled.");
}

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsing with strict payload size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// NoSQL Injection sanitization middleware (blocks keys with '$' or '.')
app.use(mongoSanitize);

// Cookie parsing for httpOnly JWT handling
app.use(cookieParser());

// Response compression
app.use(compression());

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// General rate limiter for all /api endpoints
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/user', userRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/roadmap', roadmapRoutes);

// AI-Powered Personalized Learning & Adaptive Assessment Routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/personalized-roadmap', personalizedRoadmapRoutes);
app.use('/api/weekly-quiz', weeklyQuizRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Route Catch-all
app.use(notFound);

// Central Error Handler
app.use(errorHandler);

export default app;

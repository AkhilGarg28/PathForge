const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: () => env.NODE_ENV === 'test',
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/user', userRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Catch unknown routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

module.exports = app;

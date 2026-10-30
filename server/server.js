import { validateEnv, config } from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

// 1. Fail fast on missing critical environment variables
validateEnv();

// 2. Connect to MongoDB database
await connectDB(config.mongoUri);

// 3. Start listening for incoming requests
const server = app.listen(config.port, () => {
  console.log(`[SERVER] PathForge API running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Graceful process termination handling
const handleShutdown = (signal) => {
  console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[SERVER] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;

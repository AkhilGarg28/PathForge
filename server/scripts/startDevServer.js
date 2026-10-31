import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'super_strong_production_jwt_secret_key_at_least_32_chars!';
process.env.DISABLE_RATE_LIMIT = 'true';

async function start() {
  const mongoose = (await import('mongoose')).default;
  const app = (await import('../app.js')).default;
  const { seedDatabase } = await import('./seed.js');

  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pathforge';
  let mongoServer = null;

  // Try configured MongoDB (Local 127.0.0.1:27017 for Compass or Atlas)
  try {
    console.log(`[DevServer] Connecting to MongoDB: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[DevServer] Connected to MongoDB at ${mongoose.connection.host}! Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[DevServer] Could not connect to ${uri} (${err.message}). Starting in-memory database...`);
  }

  // Graceful fallback if local MongoDB service was paused
  if (mongoose.connection.readyState !== 1) {
    console.log('[DevServer] Starting in-memory MongoDB fallback...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`[DevServer] In-memory MongoDB running at ${uri}`);
  }

  console.log('[DevServer] Seeding initial roles, questions and checkpoints...');
  try {
    await seedDatabase();
    console.log('[DevServer] Database seed completed successfully.');
  } catch (err) {
    console.warn('[DevServer] Seeding notice:', err.message);
  }

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 PathForge Backend Server: http://localhost:${PORT}`);
    console.log(`🌐 PathForge Frontend Client: http://localhost:5173`);
    console.log(`🗄️  MongoDB Compass URI:     mongodb://localhost:27017`);
    console.log(`======================================================\n`);
  });

  const cleanup = async () => {
    console.log('\n[DevServer] Shutting down...');
    server.close();
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start().catch((err) => {
  console.error('[DevServer] Failed to start:', err);
  process.exit(1);
});

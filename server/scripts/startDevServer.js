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
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongoose = (await import('mongoose')).default;
  const app = (await import('../app.js')).default;
  const { seedDatabase } = await import('./seed.js');

  console.log('[DevServer] Starting in-memory MongoDB instance...');
  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.29'
    }
  });
  const uri = mongoServer.getUri();
  console.log(`[DevServer] In-memory MongoDB running at ${uri}`);

  await mongoose.connect(uri);
  console.log('[DevServer] Connected to MongoDB. Seeding initial data...');
  await seedDatabase();
  console.log('[DevServer] Database seed completed successfully.');

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`[DevServer] PathForge API server listening on http://localhost:${PORT}`);
  });

  const cleanup = async () => {
    console.log('\n[DevServer] Shutting down...');
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start().catch((err) => {
  console.error('[DevServer] Failed to start:', err);
  process.exit(1);
});

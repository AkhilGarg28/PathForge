import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb+srv://akhilgarg064:Akh%40281205@cluster0.1icpvzh.mongodb.net/pathforge?retryWrites=true&w=majority';

console.log('Testing Atlas URI:', uri.replace(/:([^:@]+)@/, ':****@'));
const start = Date.now();

try {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const latency = Date.now() - start;
  console.log(`[SUCCESS] Connected to MongoDB Atlas host: ${conn.connection.host} in ${latency}ms`);
  console.log(`[SUCCESS] Database name: ${conn.connection.name}`);
  const collections = await conn.connection.db.listCollections().toArray();
  console.log(`[INFO] Existing collections in '${conn.connection.name}':`, collections.map(c => c.name));
  await mongoose.disconnect();
  console.log('[SUCCESS] Atlas connection test passed.');
  process.exit(0);
} catch (err) {
  console.error(`[FAILURE] Connection failed: ${err.message}`);
  process.exit(1);
}

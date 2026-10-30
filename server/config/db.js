import mongoose from 'mongoose';

const connectDB = async (uri = process.env.MONGODB_URI) => {
  if (!uri) {
    console.error('[FATAL] MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[FATAL] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

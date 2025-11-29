// backend/config/database.js - نسخه بهبود یافته
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

class Database {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
  }

  async connectWithRetry() {
    try {
      console.log('🔄 Attempting MongoDB connection...');
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });

      this.isConnected = true;
      this.retryCount = 0;
      
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      console.log(`🎯 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

      return conn;
    } catch (error) {
      this.isConnected = false;
      this.retryCount++;

      console.error(`❌ MongoDB connection attempt ${this.retryCount} failed:`, error.message);

      if (this.retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
        setTimeout(() => this.connectWithRetry(), RETRY_DELAY);
      } else {
        console.error('💥 Max retries reached. Exiting application.');
        process.exit(1);
      }
    }
  }
}

const database = new Database();

// هندل کردن events connection
mongoose.connection.on('connected', () => {
  console.log('🎯 Mongoose connected to MongoDB');
  database.isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  database.isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
  database.isConnected = false;
});

// هندل کردن process events
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

const connectDB = async () => {
  return await database.connectWithRetry();
};

export default connectDB;
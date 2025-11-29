// backend/test-connection.js
import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    await connectDB();
    console.log('🎉 Connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
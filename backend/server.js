// backend/server.js - آپدیت شده
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import musicRoutes from './routes/music.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/uploads.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5222;

// Connect to MongoDB با هندلینگ خطا
const startServer = async () => {
  try {
    console.log('🚀 Starting WE Music Backend Server...');
    
    await connectDB();
    
    // Middleware
    app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }));
    app.use(express.json());

    // Request logging
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/music', musicRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/uploads', uploadRoutes); 

    // Health check extended
    app.get('/api/health', (req, res) => {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      res.json({
        success: true,
        message: '🚀 WE Backend Server is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: dbStatus,
        uptime: process.uptime()
      });
    });

    // Database health check
    app.get('/api/health/db', (req, res) => {
      const dbState = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      };
      
      res.json({
        database: {
          state: states[dbState],
          readyState: dbState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    });

    // Error handler
    app.use((error, req, res, next) => {
      console.error('💥 Server Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });

    app.listen(PORT, () => {
      console.log(`\n🎧 WE Music Backend Server Started!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🚀 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📊 DB Health: http://localhost:${PORT}/api/health/db\n`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
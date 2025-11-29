// backend/middleware/dbHealth.js
import mongoose from 'mongoose';

export const checkDBHealth = (req, res, next) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database connection unavailable',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// استفاده در server.js
app.use('/api', checkDBHealth);
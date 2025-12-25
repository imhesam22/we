// backend/middleware/cache.js - جدید
import { cache } from '../services/cacheService.js';

export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // فقط GET requests رو cache کن
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      // چک کردن cache
      const cachedData = await cache.get(key);
      
      if (cachedData) {
        console.log('⚡ Cache hit:', key);
        return res.json(cachedData);
      }

      // اگر cache نبود، ادامه بده و result رو cache کن
      const originalSend = res.json;
      res.json = function(data) {
        // فقط success responses رو cache کن
        if (data.success !== false) {
          cache.set(key, data, duration).catch(console.error);
        }
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
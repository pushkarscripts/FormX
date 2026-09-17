import express from 'express';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint returning server status and timestamp.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'FormX API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;

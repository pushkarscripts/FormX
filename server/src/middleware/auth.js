import jwt from 'jsonwebtoken';

export default function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const header = req.get('authorization');

  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  }
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(header.slice(7), secret);
    if (!payload.sub) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    req.adminId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

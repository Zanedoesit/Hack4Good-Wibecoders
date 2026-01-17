const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.user_type) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!roles.includes(req.user.user_type)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = { authMiddleware, requireRole };

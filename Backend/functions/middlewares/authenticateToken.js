const jwt = require('jsonwebtoken');

const JWT_SECRET = '12345';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Kein Token bereitgestellt' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.error('Token-Verifizierung fehlgeschlagen:', err);
    return res.status(403).json({ error: 'Ungültiges Token' });
  }
};

module.exports = authenticateToken;

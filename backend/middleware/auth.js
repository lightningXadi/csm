const jwt     = require('jsonwebtoken');
const Faculty = require('../models/Faculty');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised — please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.faculty = await Faculty.findById(decoded.id).select('-password');
    if (!req.faculty) {
      return res.status(401).json({ success: false, message: 'Faculty account not found.' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

module.exports = { protect };

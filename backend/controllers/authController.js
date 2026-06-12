const jwt     = require('jsonwebtoken');
const Faculty = require('../models/Faculty');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, username, password, subject } = req.body;

    if (!name || !username || !password || !subject) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const exists = await Faculty.findOne({ username: username.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Username already taken.' });
    }

    const faculty = await Faculty.create({ name, username, password, subject });
    const token   = signToken(faculty._id);

    res.status(201).json({
      success: true,
      token,
      faculty: { id: faculty._id, name: faculty.name, username: faculty.username, subject: faculty.subject },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    }

    const faculty = await Faculty.findOne({ username: username.toLowerCase() }).select('+password');
    if (!faculty || !(await faculty.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = signToken(faculty._id);

    res.json({
      success: true,
      token,
      faculty: { id: faculty._id, name: faculty.name, username: faculty.username, subject: faculty.subject },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me  (requires token)
const getMe = (req, res) => {
  res.json({ success: true, faculty: req.faculty });
};

module.exports = { signup, login, getMe };

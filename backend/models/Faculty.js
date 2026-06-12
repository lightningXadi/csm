const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9._]+$/, 'Username can only contain letters, numbers, dots, underscores'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // never return password by default
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['java', 'ngdb', 'testing', 'cyber', 'erp'],
  },
  semester: {
    type: Number,
    default: 5,
    // Future: 1–6
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before save
facultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: compare passwords
facultySchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Faculty', facultySchema);

const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  // Hierarchy: semester → subject → category
  semester: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
    max: 6,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['java', 'ngdb', 'testing', 'cyber', 'erp'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Notes', 'PPTs', 'Assignments'],
  },

  // File info
  title: {
    type: String,
    required: [true, 'File title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  originalName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,    // Cloudinary public_id – needed for deletion
    required: true,
  },
  fileSize: {
    type: Number,    // bytes
    default: 0,
  },
  fileType: {
    type: String,    // mime type
  },
  extension: {
    type: String,    // pdf | docx | pptx | zip ...
  },

  // Uploader info (denormalised for display speed)
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  facultyName: {
    type: String,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update updatedAt
materialSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Text search index (title + subject + category)
materialSchema.index({ title: 'text', subject: 'text', category: 'text', facultyName: 'text' });

module.exports = mongoose.model('Material', materialSchema);

const Material    = require('../models/Material');
const { cloudinary } = require('../config/cloudinary');
const path        = require('path');

// ─── helpers ────────────────────────────────────────────────────────────────

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

// ─── PUBLIC routes ──────────────────────────────────────────────────────────

// GET /api/materials
// Query params: semester, subject, category, search, page, limit
const getAllMaterials = async (req, res) => {
  try {
    const { semester = 5, subject, category, search, page = 1, limit = 50 } = req.query;
    const filter = { semester: Number(semester) };

    if (subject)  filter.subject  = subject;
    if (category) filter.category = category;
    if (search)   filter.$text    = { $search: search };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Material.countDocuments(filter);
    const items = await Material.find(filter)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: items.map((m) => ({ ...m, formattedSize: formatSize(m.fileSize) })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/materials/recent   (latest 5 across all subjects)
const getRecentMaterials = async (req, res) => {
  try {
    const semester = Number(req.query.semester || 5);
    const items = await Material.find({ semester })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: items.map((m) => ({ ...m, formattedSize: formatSize(m.fileSize) })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/materials/:id
const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).lean();
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }
    res.json({ success: true, data: { ...material, formattedSize: formatSize(material.fileSize) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FACULTY-PROTECTED routes ────────────────────────────────────────────────

// POST /api/materials  (multipart/form-data)
const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { title, subject, category, semester = 5 } = req.body;
    if (!title || !subject || !category) {
      return res.status(400).json({ success: false, message: 'title, subject and category are required.' });
    }

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

    const material = await Material.create({
      semester:     Number(semester),
      subject,
      category,
      title,
      originalName: req.file.originalname,
      fileUrl:      req.file.path,           // Cloudinary URL
      publicId:     req.file.filename,       // Cloudinary public_id
      fileSize:     req.file.size || 0,
      fileType:     req.file.mimetype,
      extension:    ext,
      uploadedBy:   req.faculty._id,
      facultyName:  req.faculty.name,
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/materials/:id  (update title / category only — no file re-upload here)
const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    // Only the uploader can edit
    if (material.uploadedBy.toString() !== req.faculty._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this material.' });
    }

    const { title, category } = req.body;
    if (title)    material.title    = title;
    if (category) material.category = category;
    await material.save();

    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    if (material.uploadedBy.toString() !== req.faculty._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this material.' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(material.publicId, { resource_type: 'raw' });

    await material.deleteOne();

    res.json({ success: true, message: 'Material deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/materials/faculty/mine   — materials uploaded by logged-in faculty
const getMyMaterials = async (req, res) => {
  try {
    const items = await Material.find({ uploadedBy: req.faculty._id })
      .sort({ uploadedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: items.map((m) => ({ ...m, formattedSize: formatSize(m.fileSize) })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllMaterials,
  getRecentMaterials,
  getMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  getMyMaterials,
};

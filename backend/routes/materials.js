const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const { upload }  = require('../config/cloudinary');
const {
  getAllMaterials,
  getRecentMaterials,
  getMaterial,
  downloadMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  getMyMaterials,
} = require('../controllers/materialsController');

// Public
router.get('/',         getAllMaterials);
router.get('/recent',   getRecentMaterials);
router.get('/:id',      getMaterial);
router.get('/:id/download', downloadMaterial);

// Protected (faculty)
router.get('/faculty/mine',      protect, getMyMaterials);
router.post('/',                 protect, upload.single('file'), uploadMaterial);
router.put('/:id',               protect, updateMaterial);
router.delete('/:id',            protect, deleteMaterial);

module.exports = router;

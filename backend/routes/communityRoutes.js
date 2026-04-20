const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

const fs = require('fs');
const path = require('path');

// Configure multer for disk storage with dynamic user directories
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Rely on protecting middleware injection for user ID
    const userId = req.user ? req.user._id.toString() : 'public';
    const dir = path.join(__dirname, '../public/docs', userId);
    
    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique name
    cb(null, `doc-${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`);
  }
});
const upload = multer({ storage: storage });

router.get('/', protect, communityController.getCommunities);
router.post('/', protect, upload.single('document'), communityController.createCommunity);
router.get('/:id/documents', protect, communityController.getCommunityDocuments);
router.post('/:id/documents', protect, upload.single('document'), communityController.uploadPersonalDocument);
router.get('/institutions', protect, communityController.getInstitutions);
router.post('/enroll', protect, communityController.enrollCommunity);
router.post('/unenroll', protect, communityController.unenrollCommunity);

module.exports = router;

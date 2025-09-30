const express = require('express');
const { getUsers, getMentors, getMentees, updateUser, deleteUser, getUserById, uploadAvatar } = require('../controllers/userController.js');
const protect = require('../middleware/auth.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// --- Multer Setup for Avatar Uploads ---
const avatarUploadDir = 'backend/uploads/avatars/';
fs.mkdirSync(avatarUploadDir, { recursive: true });

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Prefix with user ID to associate files with users easily
        cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const avatarUpload = multer({ storage: avatarStorage });


router.route('/')
  .get(protect, getUsers);

router.route('/mentors')
    .get(protect, getMentors);

router.route('/mentees')
    .get(protect, getMentees);

router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, deleteUser);

module.exports = router;
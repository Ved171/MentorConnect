const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resourceController.js');
const protect = require('../middleware/auth.js');

const router = express.Router();

// --- Multer Setup for File Uploads ---
const uploadDir = 'backend/uploads/';
fs.mkdirSync(uploadDir, { recursive: true }); // Ensure upload directory exists

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// --- Resource Routes ---
router.route('/')
    .get(protect, getResources)
    .post(protect, createResource);

router.route('/:id')
    .put(protect, updateResource)
    .delete(protect, deleteResource);

// --- File Upload Route ---
router.post('/upload', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Return the publicly accessible path to the file
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
});


module.exports = router;

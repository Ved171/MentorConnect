const express = require('express');
const { suggestMentorsController } = require('../controllers/mentorController.js');
const protect = require('../middleware/auth.js');

const router = express.Router();

// This route is specifically for the AI suggestions
router.post('/suggest', protect, suggestMentorsController);

module.exports = router;

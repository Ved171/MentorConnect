const express = require('express');
const { getMessages, sendMessage, markMessagesAsRead } = require('../controllers/messageController.js');
const protect = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
    .get(protect, getMessages);

router.route('/send/:receiverId')
    .post(protect, sendMessage);

router.route('/read/:senderId')
    .post(protect, markMessagesAsRead);

module.exports = router;

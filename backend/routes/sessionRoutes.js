const express = require('express');
const { getSessionsForUser, requestSession, updateSessionStatus } = require('../controllers/sessionController.js');
const protect = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
    .get(protect, getSessionsForUser)
    .post(protect, requestSession);

router.route('/:id/status')
    .put(protect, updateSessionStatus);

module.exports = router;

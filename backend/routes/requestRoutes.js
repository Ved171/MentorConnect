const express = require('express');
const { getRequests, updateRequestStatus, createRequest } = require('../controllers/requestController.js');
const protect = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
    .get(protect, getRequests)
    .post(protect, createRequest);

router.route('/:id')
    .put(protect, updateRequestStatus);

module.exports = router;

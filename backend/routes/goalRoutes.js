const express = require('express');
const { getGoalsForMentee, addGoal, updateGoal, deleteGoal } = require('../controllers/goalController.js');
const protect = require('../middleware/auth.js');

const router = express.Router();

router.route('/mentee/:menteeId')
    .get(protect, getGoalsForMentee);

router.route('/')
    .post(protect, addGoal);

router.route('/:id')
    .put(protect, updateGoal)
    .delete(protect, deleteGoal);


module.exports = router;

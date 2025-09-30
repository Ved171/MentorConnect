const Goal = require('../models/goalModel.js');

// @desc    Get goals for a specific mentee
// @route   GET /api/goals/mentee/:menteeId
// @access  Private
const getGoalsForMentee = async (req, res) => {
    const menteeId = req.params.menteeId;
    const isOwner = req.user.id === menteeId;
    const isTheirMentor = req.user.menteeIds && req.user.menteeIds.includes(menteeId);

    if (!isOwner && !isTheirMentor) {
        return res.status(403).json({ message: 'Not authorized to view these goals' });
    }

    try {
        const goals = await Goal.find({ menteeId }).sort({ isCompleted: 1, createdAt: -1 });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new goal
// @route   POST /api/goals
// @access  Private (Mentee only)
const addGoal = async (req, res) => {
    const { text, menteeId } = req.body;

    if (req.user.id !== menteeId) {
        return res.status(403).json({ message: 'You can only add goals for yourself.' });
    }

    try {
        const newGoal = new Goal({
            menteeId,
            text,
        });
        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    } catch (error) {
        res.status(400).json({ message: 'Invalid goal data' });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.menteeId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this goal' });
        }
        
        goal.isCompleted = req.body.isCompleted;
        goal.text = req.body.text || goal.text;

        const updatedGoal = await goal.save();
        res.json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.menteeId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this goal' });
        }

        await goal.deleteOne();
        res.json({ message: 'Goal removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getGoalsForMentee,
    addGoal,
    updateGoal,
    deleteGoal,
};

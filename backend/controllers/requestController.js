const MentorshipRequest = require('../models/requestModel.js');
const User = require('../models/userModel.js');

// @desc    Get all requests for the logged-in user (incoming or outgoing)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await MentorshipRequest.find({
            $or: [{ fromId: userId }, { toId: userId }]
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new mentorship request
// @route   POST /api/requests
// @access  Private (Mentee only)
const createRequest = async (req, res) => {
    const { toId, message } = req.body;
    const fromId = req.user.id;

    if (req.user.role !== 'Mentee') {
        return res.status(403).json({ message: 'Only mentees can send mentorship requests.' });
    }

    try {
        const newRequest = new MentorshipRequest({
            fromId,
            toId,
            message,
            status: 'Pending'
        });
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(400).json({ message: 'Invalid request data', error: error.message });
    }
};


// @desc    Update the status of a mentorship request
// @route   PUT /api/requests/:id
// @access  Private (Mentor only)
const updateRequestStatus = async (req, res) => {
    const { status } = req.body; // 'Accepted' or 'Declined'
    const requestId = req.params.id;
    const mentorId = req.user.id;

    try {
        const request = await MentorshipRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Ensure the logged-in user is the recipient of the request
        if (request.toId.toString() !== mentorId) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        request.status = status;
        await request.save();

        if (status === 'Accepted') {
            // Use { new: true } to get the updated document
            const updatedMentor = await User.findByIdAndUpdate(
                request.toId,
                { $addToSet: { menteeIds: request.fromId } },
                { new: true }
            ).select('-password');

            await User.findByIdAndUpdate(
                request.fromId,
                { $addToSet: { mentorIds: request.toId } }
            );

            res.json({ request, updatedMentor });
        } else { // Declined
            res.json({ request });
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getRequests,
    createRequest,
    updateRequestStatus,
};
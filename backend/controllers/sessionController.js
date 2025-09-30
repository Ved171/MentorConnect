const Session = require('../models/sessionModel.js');

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions
// @access  Private
const getSessionsForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.find({
            $or: [{ mentorId: userId }, { menteeId: userId }]
        }).sort({ startTime: 1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request a new session
// @route   POST /api/sessions
// @access  Private
const requestSession = async (req, res) => {
    const { mentorId, menteeId, startTime, topic } = req.body;
    const requester = req.user;
    
    if (requester.id !== mentorId && requester.id !== menteeId) {
        return res.status(403).json({ message: 'Not authorized to create this session' });
    }

    try {
        const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000); // Default to 1 hour session
        
        // If a mentor schedules, it's auto-confirmed. If a mentee requests, it's pending.
        const status = requester.role === 'Mentor' ? 'Confirmed' : 'Pending';

        const newSession = new Session({
            mentorId,
            menteeId,
            startTime,
            endTime,
            topic,
            status,
            requestedBy: requester.id,
        });

        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (error) {
        res.status(400).json({ message: 'Invalid session data', error: error.message });
    }
};

// @desc    Update the status of a session
// @route   PUT /api/sessions/:id/status
// @access  Private
const updateSessionStatus = async (req, res) => {
    const { status } = req.body; // 'Confirmed', 'Declined', 'Cancelled'
    const sessionId = req.params.id;
    const currentUser = req.user;

    try {
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Logic for different status transitions
        if (session.status === 'Pending' && (status === 'Confirmed' || status === 'Declined')) {
            // Mentor can Confirm or Decline a PENDING request from a Mentee.
            if (session.mentorId.toString() === currentUser.id.toString() && session.requestedBy.toString() !== currentUser.id.toString()) {
                session.status = status;
                const updatedSession = await session.save();
                return res.json(updatedSession);
            } else {
                return res.status(403).json({ message: 'Not authorized to confirm or decline this session.' });
            }
        }
        
        if (status === 'Cancelled') {
            const isParticipant = session.mentorId.toString() === currentUser.id.toString() || session.menteeId.toString() === currentUser.id.toString();
            if (isParticipant) {
                session.status = status;
                const updatedSession = await session.save();
                return res.json(updatedSession);
            } else {
                return res.status(403).json({ message: 'Only a participant can cancel the session.' });
            }
        }

        return res.status(400).json({ message: `Invalid status transition from ${session.status} to ${status}.` });

    } catch (error) {
        console.error('Error updating session status:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getSessionsForUser,
    requestSession,
    updateSessionStatus,
};
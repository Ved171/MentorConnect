const Message = require('../models/messageModel.js');
const { getRecipientSocketId } = require('../socket/socketHandler.js');

// @desc    Get all messages for the logged-in user
// @route   GET /api/messages
// @access  Private
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a new message
// @route   POST /api/messages/send/:receiverId
// @access  Private
const sendMessage = async (req, res) => {
    const { receiverId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    try {
        const newMessage = new Message({
            senderId,
            receiverId,
            text
        });

        const savedMessage = await newMessage.save();
        const messageObject = savedMessage.toObject();

        // Emit the new message to both the sender (for UI sync) and recipient
        const recipientSocketId = getRecipientSocketId(receiverId);
        const senderSocketId = getRecipientSocketId(senderId);
        const io = req.app.get('io');
        
        if (recipientSocketId) {
             io.to(recipientSocketId).emit('newMessage', messageObject);
        }
        // Emit to sender to confirm and update their UI
        if (senderSocketId) {
             io.to(senderSocketId).emit('newMessage', messageObject);
        }

        res.status(201).json(messageObject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark messages from a sender as read
// @route   POST /api/messages/read/:senderId
// @access  Private
const markMessagesAsRead = async (req, res) => {
    const { senderId } = req.params;
    const readerId = req.user.id; // The logged-in user is the one reading the messages

    try {
        const result = await Message.updateMany(
            { senderId: senderId, receiverId: readerId, isRead: false },
            { $set: { isRead: true } }
        );

        // Only emit if messages were actually updated
        if (result.modifiedCount > 0) {
            const io = req.app.get('io');
            const senderSocketId = getRecipientSocketId(senderId);
            const readerSocketId = getRecipientSocketId(readerId);
            
            const receiptData = { readerId, senderId };

            // Notify the sender that their messages have been read
            if (senderSocketId) {
                io.to(senderSocketId).emit('readReceipt', receiptData);
            }
            // Also notify the reader to update their own UI
            if (readerSocketId) {
                 io.to(readerSocketId).emit('readReceipt', receiptData);
            }
        }
        
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    markMessagesAsRead,
};

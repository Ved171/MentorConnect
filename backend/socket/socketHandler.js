const userSocketMap = {}; // Maps userId to socketId

const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId];
}

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        }

        socket.on('typing', ({ recipientId, isTyping }) => {
            const recipientSocketId = getRecipientSocketId(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('typing', { userId, isTyping });
            }
        });

        socket.on('disconnect', () => {
            // Remove user from the map on disconnect
            for (const id in userSocketMap) {
                if (userSocketMap[id] === socket.id) {
                    delete userSocketMap[id];
                    console.log(`User disconnected: ${id}`);
                    break;
                }
            }
        });
    });
};

module.exports = { initializeSocket, userSocketMap, getRecipientSocketId };

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const resourceRoutes = require('./routes/resourceRoutes.js');
const requestRoutes = require('./routes/requestRoutes.js');
const goalRoutes = require('./routes/goalRoutes.js');
const sessionRoutes = require('./routes/sessionRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const mentorRoutes = require('./routes/mentorRoutes.js');
const { initializeSocket } = require('./socket/socketHandler.js');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, './.env')});

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser for JSON

// Health check
app.get('/health', (req, res) => res.status(200).send('ok'));

// Setup file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Setup HTTP and Socket.IO Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development, restrict in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io instance available to controllers via app.set
app.set('io', io);

// Initialize Socket.IO logic
initializeSocket(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/mentors', mentorRoutes);

// Serve frontend build (Vite output in ../dist)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback to index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

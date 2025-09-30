const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const { UserRole, AvailabilityStatus } = require('../utils/userConstants.js');

// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const formatUserResponse = (user) => {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const userData = {
    name,
    email,
    password,
    role,
    department: 'Undeclared',
    skills: [],
    interests: [],
    ...(role === UserRole.MENTEE 
        ? { mentorIds: [] } 
        : { menteeIds: [], availability: AvailabilityStatus.AVAILABLE, bio: 'Newly joined mentor! Bio is not updated yet.', rating: 0, position: 'New Mentor' }),
  };

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      user: formatUserResponse(user),
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: formatUserResponse(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
     res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
    registerUser,
    loginUser,
};
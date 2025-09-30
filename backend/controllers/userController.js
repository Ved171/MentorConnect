const User = require('../models/userModel.js');
const { UserRole } = require('../utils/userConstants.js');
const fs = require('fs');
const path = require('path');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all mentors
// @route   GET /api/users/mentors
// @access  Private
const getMentors = async (req, res) => {
    try {
        const mentors = await User.find({ role: UserRole.MENTOR }).select('-password');
        res.json(mentors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all mentees
// @route   GET /api/users/mentees
// @access  Private
const getMentees = async (req, res) => {
    try {
        const mentees = await User.find({ role: UserRole.MENTEE }).select('-password');
        res.json(mentees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
    // Ensure users can only update their own profile, unless they are an admin
    if (req.user.role !== 'Admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'User not authorized to update this profile' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Update fields from request body, but don't allow changing the password this way
            const { password, ...updateData } = req.body;
            Object.assign(user, updateData);
            
            const updatedUser = await user.save();
            
            // Return user object without password
            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            res.json(userResponse);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    if (req.user.role !== 'Admin') {
         return res.status(403).json({ message: 'User not authorized to delete users' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old avatar file if it exists
        if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '..', user.avatarUrl);
            try {
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            } catch (unlinkErr) {
                console.error("Failed to delete old avatar:", unlinkErr);
                // Non-fatal error, so we continue
            }
        }

        user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const updatedUser = await user.save();
        
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Server error during avatar upload.' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    getMentors,
    getMentees,
    updateUser,
    deleteUser,
    uploadAvatar,
};
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Mentee', 'Mentor', 'Admin'], required: true },
  avatarUrl: { type: String, default: '' },
  department: { type: String },
  year: { type: Number }, // For students
  position: { type: String }, // For faculty
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  
  // Mentor-specific fields
  bio: { type: String },
  availability: { type: String, enum: ['Available', 'Busy', 'Not Accepting New Mentees'] },
  rating: { type: Number },
  menteeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  availabilitySlots: [{
      day: String,
      times: [String]
  }],

  // Mentee-specific fields
  mentorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
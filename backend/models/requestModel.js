const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
}, {
  timestamps: { createdAt: 'timestamp' }, // Use 'timestamp' to match frontend type
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

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);

module.exports = MentorshipRequest;

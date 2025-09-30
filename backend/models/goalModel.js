const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt
  toJSON: {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt;
        delete ret._id;
        delete ret.__v;
    }
  },
  toObject: {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt;
        delete ret._id;
        delete ret.__v;
    }
  }
});

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;

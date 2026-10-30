import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    context: {
      topic: { type: String, default: '' },
      weekNumber: { type: Number, default: null },
      skill: { type: String, default: '' }
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'AI Learning Mentorship'
    },
    messages: {
      type: [chatMessageSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;

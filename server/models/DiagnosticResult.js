import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: [true, 'questionId is required']
    },
    selectedIndex: {
      type: Number,
      required: [true, 'selectedIndex is required'],
      min: [0, 'selectedIndex cannot be less than 0'],
      max: [3, 'selectedIndex cannot be greater than 3']
    }
  },
  { _id: false }
);

const diagnosticResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    roleId: {
      type: String,
      required: [true, 'roleId is required'],
      trim: true
    },
    answers: {
      type: [answerSchema],
      required: [true, 'Answers array is required']
    },
    dimensionScores: {
      type: Map,
      of: Number,
      required: [true, 'dimensionScores map is required']
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

const DiagnosticResult = mongoose.model('DiagnosticResult', diagnosticResultSchema);

export default DiagnosticResult;

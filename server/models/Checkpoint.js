import mongoose from 'mongoose';

const checkpointQuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Checkpoint question id is required'],
      trim: true
    },
    question: {
      type: String,
      required: [true, 'Checkpoint question prompt is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Checkpoint question options are required'],
      validate: {
        validator: function (opts) {
          return Array.isArray(opts) && opts.length === 4;
        },
        message: 'A checkpoint question must provide exactly 4 options'
      }
    },
    correctIndex: {
      type: Number,
      required: [true, 'correctIndex is required'],
      min: [0, 'correctIndex cannot be less than 0'],
      max: [3, 'correctIndex cannot be greater than 3'],
      validate: {
        validator: Number.isInteger,
        message: 'correctIndex must be an integer between 0 and 3'
      }
    },
    explanation: {
      type: String,
      required: [true, 'Checkpoint explanation is required'],
      trim: true
    }
  },
  { _id: false }
);

const checkpointSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, 'Checkpoint moduleId is required'],
      unique: true,
      trim: true,
      index: true
    },
    roleId: {
      type: String,
      required: [true, 'Checkpoint roleId is required'],
      trim: true,
      index: true
    },
    dimension: {
      type: String,
      required: [true, 'Checkpoint dimension is required'],
      trim: true
    },
    questions: {
      type: [checkpointQuestionSchema],
      required: true,
      validate: {
        validator: function (qs) {
          return Array.isArray(qs) && qs.length === 4;
        },
        message: 'Checkpoint must contain exactly 4 questions'
      }
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

const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);

export default Checkpoint;

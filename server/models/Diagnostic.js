import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Question id is required'],
      trim: true
    },
    dimension: {
      type: String,
      required: [true, 'Question dimension is required'],
      trim: true
    },
    question: {
      type: String,
      required: [true, 'Question prompt is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Question options are required'],
      validate: {
        validator: function (opts) {
          return Array.isArray(opts) && opts.length === 4;
        },
        message: 'A question must provide exactly 4 options'
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
    }
  },
  { _id: false }
);

const diagnosticSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      required: [true, 'Diagnostic roleId is required'],
      trim: true,
      index: true
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (qs) {
          return Array.isArray(qs) && qs.length > 0;
        },
        message: 'Diagnostic must contain questions'
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

const Diagnostic = mongoose.model('Diagnostic', diagnosticSchema);

export default Diagnostic;

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
    },
    type: {
      type: String,
      default: 'article',
    },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, 'Module ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    resourceTags: {
      type: [String],
      default: [],
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['locked', 'active', 'complete'],
        message: '{VALUE} is not a valid status',
      },
      default: 'locked',
    },
    checkpointScore: {
      type: Number,
      default: null,
      min: [0, 'Checkpoint score cannot be less than 0'],
      max: [100, 'Checkpoint score cannot exceed 100'],
    },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    event: {
      type: String,
      required: [true, 'History event is required'],
    },
    readinessScore: {
      type: Number,
      min: [0, 'Readiness score cannot be less than 0'],
      max: [100, 'Readiness score cannot exceed 100'],
    },
    reason: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role ID is required'],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: [0, 'Readiness score cannot be less than 0'],
      max: [100, 'Readiness score cannot exceed 100'],
    },
    modules: {
      type: [moduleSchema],
      default: [],
    },
    history: {
      type: [historySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ userId: 1, isArchived: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;

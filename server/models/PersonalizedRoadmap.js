import mongoose from 'mongoose';

const resourceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['docs', 'video', 'article', 'interactive'],
      default: 'docs'
    }
  },
  { _id: false }
);

const dailyTaskSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true }, // 1 to 7
    title: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 90 },
    objectives: { type: [String], default: [] },
    explanation: { type: String, default: '' },
    codeSnippet: { type: String, default: '' },
    practicalExercise: { type: String, default: '' },
    resources: { type: [resourceItemSchema], default: [] },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: true }
);

const roadmapWeekSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    phase: { type: Number, default: 1 },
    title: { type: String, required: true },
    focusSkills: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Remedial'],
      default: 'Beginner'
    },
    status: {
      type: String,
      enum: ['locked', 'active', 'completed'],
      default: 'locked'
    },
    learningObjectives: { type: [String], default: [] },
    dailyTasks: { type: [dailyTaskSchema], default: [] },
    weeklyProject: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      completed: { type: Boolean, default: false }
    },
    weeklyQuizScore: { type: Number, default: null },
    isRemedial: { type: Boolean, default: false },
    remedialReason: { type: String, default: '' }
  },
  { _id: true }
);

const roadmapPhaseSchema = new mongoose.Schema(
  {
    phaseNumber: { type: Number, required: true },
    title: { type: String, required: true },
    startWeek: { type: Number, required: true },
    endWeek: { type: Number, required: true },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const changeHistoryItemSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    version: { type: Number, required: true },
    triggerWeek: { type: Number, required: true },
    action: {
      type: String,
      enum: [
        'INITIAL_GENERATION',
        'ADVANCED_DIFFICULTY',
        'REMEDIAL_LESSONS_INSERTED',
        'TOPIC_REINFORCEMENT',
        'CLAIM_DISCREPANCY_ADJUSTMENT',
        'USER_ROLE_CHANGE'
      ],
      required: true
    },
    reason: { type: String, required: true },
    score: { type: Number, default: null }
  },
  { _id: false }
);

const personalizedRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetRole: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      default: 1
    },
    totalWeeks: {
      type: Number,
      default: 12
    },
    currentWeek: {
      type: Number,
      default: 1
    },
    readinessScore: {
      type: Number,
      default: 25
    },
    phases: {
      type: [roadmapPhaseSchema],
      default: []
    },
    weeks: {
      type: [roadmapWeekSchema],
      default: []
    },
    changeHistory: {
      type: [changeHistoryItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const PersonalizedRoadmap = mongoose.model('PersonalizedRoadmap', personalizedRoadmapSchema);
export default PersonalizedRoadmap;

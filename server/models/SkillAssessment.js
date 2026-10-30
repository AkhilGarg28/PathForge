import mongoose from 'mongoose';

const questionItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    skill: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    type: {
      type: String,
      enum: ['mcq', 'output_prediction', 'find_error', 'code_problem', 'debugging', 'practical_scenario', 'conceptual'],
      default: 'mcq'
    },
    question: { type: String, required: true },
    codeSnippet: { type: String, default: '' },
    options: {
      type: [String],
      required: true
    },
    correctIndex: {
      type: Number,
      required: true
    },
    explanation: { type: String, default: '' },
    userSelectedIndex: { type: Number, default: null },
    isCorrect: { type: Boolean, default: null }
  },
  { _id: false }
);

const claimVerificationSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    claimedLevel: { type: String, required: true },
    demonstratedLevel: { type: String, required: true },
    scorePercent: { type: Number, required: true },
    isDiscrepancy: { type: Boolean, default: false },
    discrepancyMessage: { type: String, default: '' },
    topicsCorrect: { type: [String], default: [] },
    topicsIncorrect: { type: [String], default: [] },
    conceptsToImprove: { type: [String], default: [] },
    recommendedStartingLevel: {
      type: String,
      enum: ['Foundational Remediation', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    }
  },
  { _id: false }
);

const skillAssessmentSchema = new mongoose.Schema(
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
    questions: {
      type: [questionItemSchema],
      default: []
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswersCount: {
      type: Number,
      default: 0
    },
    overallScorePercent: {
      type: Number,
      default: 0
    },
    readinessScore: {
      type: Number,
      default: 0
    },
    claimVerifications: {
      type: [claimVerificationSchema],
      default: []
    },
    strongAreas: {
      type: [String],
      default: []
    },
    weakAreas: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    recommendedLearningPriorities: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const SkillAssessment = mongoose.model('SkillAssessment', skillAssessmentSchema);
export default SkillAssessment;

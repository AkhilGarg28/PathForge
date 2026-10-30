import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'output_prediction', 'debugging', 'code_problem', 'practical_scenario'],
      default: 'mcq'
    },
    codeSnippet: { type: String, default: '' },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    skill: { type: String, default: '' },
    topic: { type: String, default: '' }
  },
  { _id: false }
);

const attemptAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    userSelectedIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    attemptNumber: { type: Number, default: 1 },
    submittedAt: { type: Date, default: Date.now },
    answers: { type: [attemptAnswerSchema], default: [] },
    scorePercent: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    performanceCategory: {
      type: String,
      enum: ['Mastery (90-100%)', 'Competent (75-89%)', 'Needs Practice (50-74%)', 'Remedial Required (<50%)'],
      required: true
    },
    weakTopics: { type: [String], default: [] },
    strongTopics: { type: [String], default: [] },
    feedbackMessage: { type: String, default: '' },
    roadmapActionTaken: { type: String, default: '' }
  },
  { _id: false }
);

const weeklyQuizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalizedRoadmap',
      default: null
    },
    weekNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Remedial'],
      default: 'Intermediate'
    },
    questions: {
      type: [quizQuestionSchema],
      default: []
    },
    attempts: {
      type: [quizAttemptSchema],
      default: []
    },
    latestScore: {
      type: Number,
      default: null
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

weeklyQuizSchema.index({ userId: 1, weekNumber: 1 });

const WeeklyQuiz = mongoose.model('WeeklyQuiz', weeklyQuizSchema);
export default WeeklyQuiz;

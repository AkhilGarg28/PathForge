import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    language: { type: String, default: 'Unknown' },
    description: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    topics: { type: [String], default: [] },
    url: { type: String, default: '' }
  },
  { _id: false }
);

const demonstratedSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    evidenceLevel: {
      type: String,
      enum: ['Strong evidence', 'Moderate evidence', 'Basic evidence', 'No sufficient evidence'],
      default: 'Moderate evidence'
    },
    details: { type: String, default: '' }
  },
  { _id: false }
);

const gitHubAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    username: {
      type: String,
      default: ''
    },
    profileUrl: {
      type: String,
      default: ''
    },
    publicReposCount: {
      type: Number,
      default: 0
    },
    repos: {
      type: [repoSchema],
      default: []
    },
    detectedLanguages: {
      type: [String],
      default: []
    },
    detectedFrameworks: {
      type: [String],
      default: []
    },
    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 65
    },
    complexityLevel: {
      type: String,
      enum: ['Basic', 'Moderate', 'High'],
      default: 'Moderate'
    },
    demonstratedSkills: {
      type: [demonstratedSkillSchema],
      default: []
    },
    strengths: {
      type: [String],
      default: []
    },
    analysisSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const GitHubAnalysis = mongoose.model('GitHubAnalysis', gitHubAnalysisSchema);
export default GitHubAnalysis;

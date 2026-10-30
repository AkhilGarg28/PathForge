import mongoose from 'mongoose';

const skillItemSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    category: {
      type: String,
      enum: ['Language', 'Framework', 'Database', 'Tool', 'Architecture', 'Other'],
      default: 'Other'
    },
    claimedLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Unspecified'],
      default: 'Intermediate'
    },
    context: { type: String, default: '' }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    extractedSkills: {
      type: [skillItemSchema],
      default: []
    },
    programmingLanguages: {
      type: [String],
      default: []
    },
    frameworks: {
      type: [String],
      default: []
    },
    tools: {
      type: [String],
      default: []
    },
    databases: {
      type: [String],
      default: []
    },
    projectsIdentified: {
      type: [projectSchema],
      default: []
    },
    missingSkillsForTarget: {
      type: [String],
      default: []
    },
    overallExperienceClaim: {
      type: String,
      default: 'Junior'
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

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
export default ResumeAnalysis;

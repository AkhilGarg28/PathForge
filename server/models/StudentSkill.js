import mongoose from 'mongoose';

const skillHistoryItemSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    proficiencyScore: { type: Number, required: true },
    source: {
      type: String,
      enum: ['Initial Assessment', 'Weekly Quiz', 'Task Completion', 'Adaptive Replan'],
      default: 'Initial Assessment'
    },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const studentSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    skill: {
      type: String,
      required: true,
      trim: true
    },
    resumeClaim: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'None', 'Unspecified'],
      default: 'Unspecified'
    },
    githubEvidence: {
      type: String,
      enum: ['Strong evidence', 'Moderate evidence', 'Basic evidence', 'No sufficient evidence'],
      default: 'No sufficient evidence'
    },
    verifiedLevel: {
      type: String,
      enum: ['To be tested', 'Needs Remediation', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'To be tested'
    },
    proficiencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    history: {
      type: [skillHistoryItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

studentSkillSchema.index({ userId: 1, skill: 1 }, { unique: true });

const StudentSkill = mongoose.model('StudentSkill', studentSkillSchema);
export default StudentSkill;

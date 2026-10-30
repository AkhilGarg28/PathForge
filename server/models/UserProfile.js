import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    educationStatus: {
      type: String,
      enum: ['College Student', 'Recent Graduate', 'Working Professional', 'Self-Taught', 'Career Switcher', 'Other'],
      default: 'College Student'
    },
    targetRole: {
      type: String,
      required: [true, 'Target career or job role is required'],
      trim: true,
      default: 'Full Stack MERN Developer'
    },
    technicalLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    desiredSkills: {
      type: [String],
      default: []
    },
    dailyTimeHours: {
      type: Number,
      min: [0.5, 'Minimum daily learning time is 30 minutes'],
      max: [16, 'Maximum daily learning time is 16 hours'],
      default: 2
    },
    targetTimelineWeeks: {
      type: Number,
      min: [4, 'Minimum roadmap duration is 4 weeks'],
      max: [52, 'Maximum roadmap duration is 52 weeks'],
      default: 12
    },
    githubUrl: {
      type: String,
      trim: true,
      default: ''
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: ''
    },
    resumeFileName: {
      type: String,
      default: ''
    },
    resumeRawText: {
      type: String,
      default: ''
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false
    },
    hasCompletedReadiness: {
      type: Boolean,
      default: false
    },
    activeRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalizedRoadmap',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;

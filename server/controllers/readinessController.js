/**
 * PathForge AI Readiness Test & Resume Claim Verification Controller
 * Manages Phase 2 adaptive multi-level diagnostic questions,
 * evaluates candidate performance, flags discrepancies vs claimed resume skills,
 * and sets an authentic baseline.
 */

import SkillAssessment from '../models/SkillAssessment.js';
import UserProfile from '../models/UserProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import GitHubAnalysis from '../models/GitHubAnalysis.js';
import StudentSkill from '../models/StudentSkill.js';
import {
  generateReadinessQuestions,
  evaluateAssessmentAndVerifyClaims
} from '../services/assessmentService.js';

export const getReadinessQuestions = async (req, res) => {
  const userId = req.user._id;

  const profile = await UserProfile.findOne({ userId });
  const resume = await ResumeAnalysis.findOne({ userId });

  const targetRole = profile?.targetRole || 'Full Stack MERN Developer';
  const claimedSkills = resume?.extractedSkills?.map((s) => s.skill) || [];

  const questions = await generateReadinessQuestions({
    targetRole,
    claimedSkills
  });

  // Store active/pending assessment in db
  await SkillAssessment.findOneAndUpdate(
    { userId, status: 'pending' },
    {
      userId,
      targetRole,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        difficulty: q.difficulty,
        skill: q.skill,
        topic: q.topic,
        codeSnippet: q.codeSnippet || '',
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      })),
      totalQuestions: questions.length,
      status: 'pending'
    },
    { upsert: true, new: true }
  );

  // SANITIZE: Never leak correctIndex or explanation to client prior to submission!
  const sanitized = questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    difficulty: q.difficulty,
    skill: q.skill,
    topic: q.topic,
    codeSnippet: q.codeSnippet || '',
    options: q.options
  }));

  return res.status(200).json({
    success: true,
    data: {
      targetRole,
      totalQuestions: sanitized.length,
      questions: sanitized
    }
  });
};

export const submitReadinessAssessment = async (req, res) => {
  const userId = req.user._id;
  const { answers } = req.body; // { 'q-1': 1, 'q-2': 0, ... }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Assessment answers payload is required'
    });
  }

  // Find the pending assessment to retrieve original questions with correct indices
  let assessment = await SkillAssessment.findOne({ userId, status: 'pending' });

  let questions = assessment?.questions;
  if (!questions || questions.length === 0) {
    const profile = await UserProfile.findOne({ userId });
    questions = await generateReadinessQuestions({ targetRole: profile?.targetRole || 'MERN Developer' });
  }

  const resume = await ResumeAnalysis.findOne({ userId });
  const resumeSkills = resume?.extractedSkills || [];

  // Evaluate candidate answers & perform Resume Claim Verification
  const evaluation = evaluateAssessmentAndVerifyClaims({
    questions,
    userAnswers: answers,
    resumeSkills
  });

  // Save completed assessment record
  const completedAssessment = await SkillAssessment.create({
    userId,
    targetRole: assessment?.targetRole || 'Full Stack MERN Developer',
    questions: evaluation.evaluatedQuestions,
    totalQuestions: evaluation.totalQuestions,
    correctAnswersCount: evaluation.correctAnswersCount,
    overallScorePercent: evaluation.overallScorePercent,
    readinessScore: evaluation.readinessScore,
    claimVerifications: evaluation.claimVerifications,
    strongAreas: evaluation.strongAreas,
    weakAreas: evaluation.weakAreas,
    recommendedLearningPriorities: evaluation.recommendedLearningPriorities,
    status: 'completed',
    completedAt: new Date()
  });

  // Clean up pending assessment
  await SkillAssessment.deleteMany({ userId, status: 'pending' });

  // Update StudentSkill records with verified assessment levels
  for (const claim of evaluation.claimVerifications) {
    await StudentSkill.findOneAndUpdate(
      { userId, skill: claim.skill },
      {
        verifiedLevel: claim.demonstratedLevel,
        proficiencyScore: claim.scorePercent,
        $push: {
          history: {
            proficiencyScore: claim.scorePercent,
            source: 'Initial Assessment',
            note: claim.isDiscrepancy ? 'Discrepancy flagged: foundational reinforcement needed' : 'Verified via readiness test'
          }
        }
      },
      { upsert: true }
    );
  }

  // Mark readiness completed on UserProfile
  await UserProfile.findOneAndUpdate(
    { userId },
    { hasCompletedReadiness: true }
  );

  return res.status(200).json({
    success: true,
    message: 'Assessment completed and claims verified successfully',
    data: {
      assessment: completedAssessment,
      overallScore: completedAssessment.overallScorePercent,
      overallScorePercent: completedAssessment.overallScorePercent,
      claimDiscrepancies: completedAssessment.claimVerifications.filter((c) => c.isDiscrepancy),
      claimVerifications: completedAssessment.claimVerifications,
      strongAreas: completedAssessment.strongAreas,
      weakAreas: completedAssessment.weakAreas,
      recommendation: completedAssessment.recommendedLearningPriorities
    }
  });
};

export const getReadinessReport = async (req, res) => {
  const userId = req.user._id;

  const assessment = await SkillAssessment.findOne({ userId, status: 'completed' })
    .sort({ completedAt: -1 });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'No completed readiness assessment found. Please complete the assessment first.'
    });
  }

  const skills = await StudentSkill.find({ userId });
  const profile = await UserProfile.findOne({ userId });
  const github = await GitHubAnalysis.findOne({ userId });

  return res.status(200).json({
    success: true,
    data: {
      assessment,
      overallScore: assessment.overallScorePercent,
      claimDiscrepancies: assessment.claimVerifications?.filter((c) => c.isDiscrepancy) || [],
      strongSkills: assessment.strongAreas || [],
      weakSkills: assessment.weakAreas || [],
      recommendation: assessment.recommendedLearningPriorities || '',
      verifiedSkills: skills,
      studentProfile: profile,
      githubSummary: github
    }
  });
};

export default {
  getReadinessQuestions,
  submitReadinessAssessment,
  getReadinessReport
};

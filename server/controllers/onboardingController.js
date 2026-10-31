import fs from 'fs';
import path from 'path';
/**
 * PathForge Personalized Student Onboarding Controller
 * Handles Phase 1 student info, resume AI parsing, GitHub code inspection,
 * and initial baseline Skill Matrix generation.
 */

import UserProfile from '../models/UserProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import GitHubAnalysis from '../models/GitHubAnalysis.js';
import StudentSkill from '../models/StudentSkill.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { analyzeResumeWithAI } from '../services/resumeService.js';
import { analyzeGitHubProfile } from '../services/githubService.js';

export const saveStudentProfile = async (req, res) => {
  const userId = req.user._id;
  const {
    name,
    educationStatus,
    targetRole,
    technicalLevel,
    desiredSkills,
    dailyTimeHours,
    targetTimelineWeeks,
    githubUrl,
    portfolioUrl
  } = req.body;

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    {
      userId,
      name: name || req.user.name,
      email: req.user.email,
      educationStatus: educationStatus || 'College Student',
      targetRole: targetRole || 'Full Stack MERN Developer',
      technicalLevel: technicalLevel || 'Beginner',
      desiredSkills: Array.isArray(desiredSkills) ? desiredSkills : [],
      dailyTimeHours: Number(dailyTimeHours) || 2,
      targetTimelineWeeks: Number(targetTimelineWeeks) || 12,
      githubUrl: githubUrl || '',
      portfolioUrl: portfolioUrl || '',
      isOnboardingComplete: true
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  
  // Synchronize user role with selected program
  const normRole = (targetRole || '').toLowerCase();
  const roleSlug = normRole.includes('data') || normRole.includes('analyst') ? 'data-analyst' : 'mern-developer';
  const matchedRole = await Role.findOne({ slug: roleSlug });
  if (matchedRole) {
    await User.findByIdAndUpdate(userId, { roleId: matchedRole._id });
  }

  return res.status(200).json({
    success: true,
    message: 'Student profile saved successfully',
    data: { profile }
  });
};

export const analyzeResume = async (req, res) => {
  const userId = req.user._id;
  const { resumeText, targetRole } = req.body;

  const activeRole = targetRole || 'Full Stack MERN Developer';
  const analysis = await analyzeResumeWithAI({ resumeText, targetRole: activeRole });

  // Persist resume analysis
  const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
    { userId },
    {
      userId,
      ...analysis
    },
    { new: true, upsert: true }
  );

  // Sync initial skill claims into StudentSkill table
  if (Array.isArray(analysis.extractedSkills)) {
    for (const item of analysis.extractedSkills) {
      await StudentSkill.findOneAndUpdate(
        { userId, skill: item.skill },
        {
          userId,
          skill: item.skill,
          resumeClaim: item.claimedLevel || 'Intermediate',
          verifiedLevel: 'To be tested',
          proficiencyScore: item.claimedLevel === 'Advanced' ? 50 : 35
        },
        { upsert: true, new: true }
      );
    }
  }

  // Update UserProfile with raw text snippet
  await UserProfile.findOneAndUpdate(
    { userId },
    { resumeRawText: (resumeText || '').slice(0, 1000) }
  );

  return res.status(200).json({
    success: true,
    message: 'Resume analyzed successfully',
    data: {
      analysis: savedAnalysis,
      skills: savedAnalysis.extractedSkills,
      summary: savedAnalysis.analysisSummary || 'Resume analyzed successfully',
      analysisSummary: savedAnalysis.analysisSummary,
      missingSkillsForTarget: savedAnalysis.missingSkillsForTarget
    }
  });
};

export const analyzeGitHub = async (req, res) => {
  const userId = req.user._id;
  const { githubUrl } = req.body;

  const analysis = await analyzeGitHubProfile(githubUrl);

  const savedAnalysis = await GitHubAnalysis.findOneAndUpdate(
    { userId },
    {
      userId,
      ...analysis
    },
    { new: true, upsert: true }
  );

  // Merge GitHub evidence into StudentSkill table
  if (Array.isArray(analysis.demonstratedSkills)) {
    for (const item of analysis.demonstratedSkills) {
      const existing = await StudentSkill.findOne({ userId, skill: item.skill });
      if (existing) {
        existing.githubEvidence = item.evidenceLevel;
        await existing.save();
      } else {
        await StudentSkill.create({
          userId,
          skill: item.skill,
          resumeClaim: 'None',
          githubEvidence: item.evidenceLevel,
          verifiedLevel: 'To be tested',
          proficiencyScore: item.evidenceLevel === 'Strong evidence' ? 45 : 30
        });
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: 'GitHub profile analyzed successfully',
    data: {
      analysis: savedAnalysis,
      username: savedAnalysis.username,
      codeQualityScore: savedAnalysis.codeQualityScore,
      languages: savedAnalysis.languages,
      demonstratedSkills: savedAnalysis.demonstratedSkills
    }
  });
};

export const getSkillMatrix = async (req, res) => {
  const userId = req.user._id;
  let skills = await StudentSkill.find({ userId }).sort({ skill: 1 });

  // If no skills recorded yet, initialize baseline defaults for MERN
  if (skills.length === 0) {
    const defaults = [
      { skill: 'JavaScript', resumeClaim: 'Advanced', githubEvidence: 'Moderate evidence', verifiedLevel: 'To be tested', proficiencyScore: 40 },
      { skill: 'React', resumeClaim: 'Intermediate', githubEvidence: 'Strong evidence', verifiedLevel: 'To be tested', proficiencyScore: 35 },
      { skill: 'Node.js', resumeClaim: 'Advanced', githubEvidence: 'Basic evidence', verifiedLevel: 'To be tested', proficiencyScore: 30 },
      { skill: 'MongoDB', resumeClaim: 'Intermediate', githubEvidence: 'Moderate evidence', verifiedLevel: 'To be tested', proficiencyScore: 25 },
      { skill: 'Data Structures & Algorithms', resumeClaim: 'Advanced', githubEvidence: 'No sufficient evidence', verifiedLevel: 'To be tested', proficiencyScore: 20 }
    ];

    for (const def of defaults) {
      await StudentSkill.create({ userId, ...def });
    }
    skills = await StudentSkill.find({ userId }).sort({ skill: 1 });
  }

  const profile = await UserProfile.findOne({ userId });
  const resume = await ResumeAnalysis.findOne({ userId });
  const github = await GitHubAnalysis.findOne({ userId });

  return res.status(200).json({
    success: true,
    data: {
      skillMatrix: skills,
      skills,
      profile,
      resumeAnalysis: resume,
      githubAnalysis: github
    }
  });
};

export default {
  saveStudentProfile,
  analyzeResume,
  analyzeGitHub,
  getSkillMatrix
};


/**
 * Direct file upload handler: saves physical file locally to disk (server/uploads/resumes/)
 * and indexes metadata into MongoDB.
 */
export const uploadResumeFile = async (req, res) => {
  const userId = req.user._id;
  const { fileName, fileType, fileData, resumeText, targetRole } = req.body;

  // 1. Ensure local uploads directory exists
  const uploadDir = path.resolve('server/uploads/resumes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 2. Save physical file to disk locally
  let localFilePath = '';
  const safeFileName = (fileName || 'resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const storedFileName = `${Date.now()}_${safeFileName}`;
  const targetPath = path.join(uploadDir, storedFileName);

  if (fileData) {
    const base64Content = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
    fs.writeFileSync(targetPath, Buffer.from(base64Content, 'base64'));
    localFilePath = targetPath;
  } else if (resumeText) {
    fs.writeFileSync(targetPath, resumeText, 'utf8');
    localFilePath = targetPath;
  }

  // 3. Extract text from the resume if not provided
  let extractedText = resumeText || '';
  if (!extractedText && localFilePath && fs.existsSync(localFilePath)) {
    try {
      const buffer = fs.readFileSync(localFilePath);
      let ascii = '';
      for (let i = 0; i < Math.min(buffer.length, 50000); i++) {
        const b = buffer[i];
        if ((b >= 32 && b <= 126) || b === 10 || b === 13) ascii += String.fromCharCode(b);
      }
      extractedText = ascii.replace(/[^\w\s.,;:()/@-]/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (err) {}
  }
  if (!extractedText) {
    extractedText = `Resume: ${safeFileName} uploaded by user. Skills in modern software engineering, web development, APIs, and databases.`;
  }

  // 4. Run AI / Deterministic Skill Analysis
  const activeRole = targetRole || 'Full Stack MERN Developer';
  const analysis = await analyzeResumeWithAI({ resumeText: extractedText, targetRole: activeRole });

  // 5. Persist to MongoDB (ResumeAnalysis & UserProfile)
  const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
    { userId },
    {
      userId,
      fileName: safeFileName,
      fileLocalPath: localFilePath,
      ...analysis
    },
    { new: true, upsert: true }
  );

  // Sync initial skill claims into StudentSkill table
  if (Array.isArray(analysis.extractedSkills)) {
    for (const item of analysis.extractedSkills) {
      await StudentSkill.findOneAndUpdate(
        { userId, skill: item.skill },
        {
          userId,
          skill: item.skill,
          resumeClaim: item.claimedLevel || 'Intermediate',
          verifiedLevel: 'To be tested',
          proficiencyScore: item.claimedLevel === 'Advanced' ? 50 : 35
        },
        { upsert: true, new: true }
      );
    }
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    {
      resumeFileName: safeFileName,
      resumeRawText: extractedText.slice(0, 2000)
    },
    { upsert: true }
  );

  console.log(`[ResumeUpload] Successfully saved resume locally: ${targetPath} and indexed in MongoDB!`);

  return res.status(200).json({
    success: true,
    message: 'Resume successfully uploaded and saved locally!',
    data: {
      fileName: safeFileName,
      savedLocallyPath: localFilePath,
      analysis: savedAnalysis,
      skills: savedAnalysis.extractedSkills,
      summary: savedAnalysis.analysisSummary || 'Resume processed successfully'
    }
  });
};

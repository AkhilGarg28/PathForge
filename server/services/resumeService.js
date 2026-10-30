/**
 * PathForge AI Resume Analysis Service
 * Extracts technical skills, claimed levels, frameworks, tools, and missing skills for target career.
 */

import { GeminiProvider } from './llmService.js';

// Common technical skill dictionary for deterministic fallback
const TECH_DICTIONARY = {
  languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'sql', 'html', 'css'],
  frameworks: ['react', 'node.js', 'nodejs', 'express', 'next.js', 'vue', 'angular', 'django', 'fastapi', 'spring', 'flask', 'tailwind'],
  databases: ['mongodb', 'postgresql', 'postgres', 'mysql', 'redis', 'sqlite', 'dynamodb', 'firebase'],
  tools: ['git', 'github', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'linux', 'postman', 'jest', 'vite', 'webpack']
};

/**
 * Deterministic keyword-based parser fallback if Gemini API is unreachable
 */
export function deterministicResumeParse(resumeText = '', targetRole = 'Full Stack Developer') {
  const lower = resumeText.toLowerCase();
  const extractedSkills = [];
  const foundLanguages = [];
  const foundFrameworks = [];
  const foundDatabases = [];
  const foundTools = [];

  // Detect languages
  TECH_DICTIONARY.languages.forEach((lang) => {
    if (lower.includes(lang)) {
      const proper = lang === 'javascript' ? 'JavaScript' : lang === 'typescript' ? 'TypeScript' : lang.toUpperCase();
      foundLanguages.push(proper);
      let level = 'Intermediate';
      if (lower.includes(`advanced ${lang}`) || lower.includes(`proficient in ${lang}`) || lower.includes(`expert in ${lang}`)) {
        level = 'Advanced';
      } else if (lower.includes(`basic ${lang}`) || lower.includes(`beginner ${lang}`) || lower.includes(`learning ${lang}`)) {
        level = 'Beginner';
      }
      extractedSkills.push({
        skill: proper,
        category: 'Language',
        claimedLevel: level,
        context: `Mentioned in resume profile`
      });
    }
  });

  // Detect frameworks
  TECH_DICTIONARY.frameworks.forEach((fw) => {
    if (lower.includes(fw)) {
      const proper = fw === 'react' ? 'React' : fw === 'node.js' || fw === 'nodejs' ? 'Node.js' : fw === 'express' ? 'Express.js' : fw;
      if (!foundFrameworks.includes(proper)) foundFrameworks.push(proper);
      extractedSkills.push({
        skill: proper,
        category: 'Framework',
        claimedLevel: lower.includes('advanced') ? 'Advanced' : 'Intermediate',
        context: `Identified in technical projects`
      });
    }
  });

  // Detect databases
  TECH_DICTIONARY.databases.forEach((db) => {
    if (lower.includes(db)) {
      const proper = db === 'mongodb' ? 'MongoDB' : db === 'postgresql' || db === 'postgres' ? 'PostgreSQL' : db.toUpperCase();
      foundDatabases.push(proper);
      extractedSkills.push({
        skill: proper,
        category: 'Database',
        claimedLevel: 'Intermediate',
        context: `Database stack experience`
      });
    }
  });

  // Detect tools
  TECH_DICTIONARY.tools.forEach((t) => {
    if (lower.includes(t)) {
      const proper = t === 'git' ? 'Git' : t === 'github' ? 'GitHub' : t === 'docker' ? 'Docker' : t === 'aws' ? 'AWS' : t;
      foundTools.push(proper);
      extractedSkills.push({
        skill: proper,
        category: 'Tool',
        claimedLevel: 'Intermediate',
        context: `Tooling & workflow`
      });
    }
  });

  // Identify target role skill gaps
  const roleGaps = [];
  if (targetRole.toLowerCase().includes('mern') || targetRole.toLowerCase().includes('full stack')) {
    if (!foundFrameworks.some((f) => f.includes('React'))) roleGaps.push('React');
    if (!foundFrameworks.some((f) => f.includes('Node'))) roleGaps.push('Node.js');
    if (!foundDatabases.some((d) => d.includes('Mongo'))) roleGaps.push('MongoDB');
    if (!foundLanguages.some((l) => l.includes('TypeScript'))) roleGaps.push('TypeScript');
  } else if (targetRole.toLowerCase().includes('data')) {
    if (!foundLanguages.some((l) => l.includes('Python'))) roleGaps.push('Python');
    if (!foundLanguages.some((l) => l.includes('SQL'))) roleGaps.push('SQL');
    if (!foundTools.some((t) => t.includes('Tableau') || t.includes('Pandas'))) roleGaps.push('Pandas & Data Wrangling');
  }

  return {
    extractedSkills,
    programmingLanguages: foundLanguages,
    frameworks: foundFrameworks,
    databases: foundDatabases,
    tools: foundTools,
    projectsIdentified: [
      {
        name: 'Technical Portfolio Projects',
        technologies: [...foundLanguages.slice(0, 2), ...foundFrameworks.slice(0, 2)],
        description: 'Projects listed in candidate resume demonstrating practical development experience.'
      }
    ],
    missingSkillsForTarget: roleGaps,
    overallExperienceClaim: extractedSkills.some((s) => s.claimedLevel === 'Advanced') ? 'Mid-Senior' : 'Junior',
    analysisSummary: `Resume analysis extracted ${extractedSkills.length} key competencies across ${foundLanguages.length} programming languages, ${foundFrameworks.length} frameworks, and ${foundDatabases.length} databases.`
  };
}

/**
 * Analyzes resume using Gemini AI with fallback
 */
export async function analyzeResumeWithAI({ resumeText, targetRole = 'Full Stack Developer' }) {
  if (!resumeText || resumeText.trim().length === 0) {
    return deterministicResumeParse('', targetRole);
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const provider = new GeminiProvider();
      const prompt = `You are an elite technical talent evaluator and curriculum analyst.
Analyze the following candidate resume text for someone targeting the career role of "${targetRole}".

RESUME TEXT:
"""
${resumeText.slice(0, 4000)}
"""

Extract and return ONLY a valid JSON object matching this schema:
{
  "extractedSkills": [
    {
      "skill": "string (name of skill, e.g. JavaScript, React, Docker)",
      "category": "Language" | "Framework" | "Database" | "Tool" | "Architecture" | "Other",
      "claimedLevel": "Beginner" | "Intermediate" | "Advanced",
      "context": "string (brief evidence/line from resume where claimed)"
    }
  ],
  "programmingLanguages": ["string"],
  "frameworks": ["string"],
  "databases": ["string"],
  "tools": ["string"],
  "projectsIdentified": [
    {
      "name": "string",
      "technologies": ["string"],
      "description": "string"
    }
  ],
  "missingSkillsForTarget": ["string (critical skills required for ${targetRole} that are absent from this resume)"],
  "overallExperienceClaim": "Junior" | "Mid-Level" | "Senior",
  "analysisSummary": "string (2-3 concise sentences analyzing resume technical depth and career readiness)"
}`;

      const raw = await provider.generateContent({ prompt, jsonMode: true, timeoutMs: 12000 });
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.extractedSkills)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[ResumeService] AI analysis failed (${err.message}). Using deterministic parser fallback.`);
  }

  return deterministicResumeParse(resumeText, targetRole);
}

export default {
  analyzeResumeWithAI,
  deterministicResumeParse
};

/**
 * PathForge Mock Resume Analysis Data & Rule-Based Analyzer
 * Provides comprehensive, deterministic resume parsing and mock analysis profiles
 * for both MERN Developer and Data Analyst tracks.
 */

export const mernResumeProfiles = {
  beginner: {
    extractedSkills: [
      { skill: 'HTML', category: 'Language', claimedLevel: 'Intermediate', context: 'Built responsive web pages using HTML5' },
      { skill: 'CSS', category: 'Language', claimedLevel: 'Intermediate', context: 'Styled websites with CSS3 and Flexbox' },
      { skill: 'JavaScript', category: 'Language', claimedLevel: 'Beginner', context: 'Basic scripts for interactive UI elements' },
      { skill: 'Git', category: 'Tool', claimedLevel: 'Beginner', context: 'Version control on personal projects' }
    ],
    programmingLanguages: ['HTML', 'CSS', 'JavaScript'],
    frameworks: [],
    databases: [],
    tools: ['Git', 'VS Code'],
    projectsIdentified: [
      { name: 'Personal Portfolio Website', technologies: ['HTML5', 'CSS3', 'JavaScript'], description: 'Responsive portfolio showcasing projects with interactive mobile menu.' }
    ],
    missingSkillsForTarget: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'JWT Authentication'],
    overallExperienceClaim: 'Junior',
    analysisSummary: 'Candidate possesses foundational frontend markup skills but lacks demonstrated full-stack framework experience (React, Node, Express, MongoDB) required for a MERN Developer.'
  },
  intermediate: {
    extractedSkills: [
      { skill: 'JavaScript', category: 'Language', claimedLevel: 'Intermediate', context: 'ES6+ asynchronous programming and DOM manipulation' },
      { skill: 'React', category: 'Framework', claimedLevel: 'Intermediate', context: 'Built single-page applications with hooks and React Router' },
      { skill: 'Node.js', category: 'Framework', claimedLevel: 'Beginner', context: 'Created basic Express REST endpoints' },
      { skill: 'MongoDB', category: 'Database', claimedLevel: 'Beginner', context: 'Connected Mongoose models for CRUD operations' },
      { skill: 'Git', category: 'Tool', claimedLevel: 'Intermediate', context: 'Branching and pull request workflows on GitHub' }
    ],
    programmingLanguages: ['JavaScript', 'HTML5', 'CSS3'],
    frameworks: ['React', 'Node.js', 'Express', 'Tailwind CSS'],
    databases: ['MongoDB'],
    tools: ['Git', 'Postman', 'npm'],
    projectsIdentified: [
      { name: 'Task Management Web App', technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind'], description: 'Full-stack task organizer with user signup and task status filtering.' }
    ],
    missingSkillsForTarget: ['Advanced State Management (Redux/Zustand)', 'Database Indexing & Aggregations', 'JWT httpOnly Security', 'Docker & CI/CD'],
    overallExperienceClaim: 'Mid-Level',
    analysisSummary: 'Solid full-stack baseline demonstrating practical React and basic Express competence. Priority growth areas include backend security, database optimization, and architectural testing.'
  }
};

export const dataAnalystResumeProfiles = {
  beginner: {
    extractedSkills: [
      { skill: 'Excel', category: 'Tool', claimedLevel: 'Intermediate', context: 'VLOOKUP, Pivot Tables, conditional formatting' },
      { skill: 'SQL', category: 'Language', claimedLevel: 'Beginner', context: 'Basic SELECT queries and filtering' },
      { skill: 'PowerPoint', category: 'Tool', claimedLevel: 'Advanced', context: 'Executive slide deck design and presentation' }
    ],
    programmingLanguages: ['SQL (Basic)'],
    frameworks: [],
    databases: ['MySQL'],
    tools: ['Excel', 'Google Sheets', 'PowerPoint'],
    projectsIdentified: [
      { name: 'Quarterly Sales Summary Model', technologies: ['Excel', 'Pivot Tables'], description: 'Created monthly revenue breakdowns and margin analysis sheets.' }
    ],
    missingSkillsForTarget: ['Advanced SQL (Window Functions & CTEs)', 'Power BI / Tableau Data Modeling', 'Python (Pandas, NumPy)', 'Hypothesis Testing', 'Statistical Inference'],
    overallExperienceClaim: 'Junior',
    analysisSummary: 'Candidate has strong spreadsheet fundamentals and presentation skills. Critical gaps include relational SQL depth, BI dashboard tooling, and Python data wrangling.'
  },
  intermediate: {
    extractedSkills: [
      { skill: 'Excel', category: 'Tool', claimedLevel: 'Advanced', context: 'Power Query, advanced XLOOKUP, dynamic array modeling' },
      { skill: 'SQL', category: 'Language', claimedLevel: 'Intermediate', context: 'Multi-table joins, subqueries, aggregations, views' },
      { skill: 'Power BI', category: 'Tool', claimedLevel: 'Intermediate', context: 'Data modeling, DAX measures, interactive reporting' },
      { skill: 'Python', category: 'Language', claimedLevel: 'Beginner', context: 'Pandas data cleaning and basic Matplotlib plotting' }
    ],
    programmingLanguages: ['SQL', 'Python'],
    frameworks: ['Pandas'],
    databases: ['PostgreSQL', 'SQL Server'],
    tools: ['Excel', 'Power BI', 'Jupyter Notebooks', 'Git'],
    projectsIdentified: [
      { name: 'Retail Customer Segmentation Report', technologies: ['SQL', 'Power BI', 'Excel'], description: 'Analyzed 100k customer transactions to segment high-value buyers.' }
    ],
    missingSkillsForTarget: ['SQL Window Functions (LAG, LEAD, RANK)', 'Advanced DAX (CALCULATE context transitions)', 'Statistical Hypothesis Testing', 'Cohort Analysis'],
    overallExperienceClaim: 'Mid-Level',
    analysisSummary: 'Proficient analyst with practical SQL and Power BI experience. Ready to level up to advanced analytical statistical testing, window functions, and business cohort modeling.'
  }
};

/**
 * Intelligent deterministic resume analyzer
 */
export function analyzeResumeMock(resumeText = '', targetRole = 'MERN Developer') {
  const isDataAnalyst = targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst');
  const lower = (resumeText || '').toLowerCase();

  // If text is provided, perform realistic keyword extraction
  if (lower.trim().length > 20) {
    const extractedSkills = [];
    const foundLanguages = [];
    const foundFrameworks = [];
    const foundDatabases = [];
    const foundTools = [];

    const keywords = isDataAnalyst
      ? {
          languages: ['sql', 'python', 'r'],
          frameworks: ['pandas', 'numpy', 'scipy', 'seaborn', 'matplotlib'],
          databases: ['postgresql', 'mysql', 'sql server', 'sqlite', 'snowflake', 'bigquery'],
          tools: ['excel', 'power bi', 'tableau', 'power query', 'jupyter', 'git']
        }
      : {
          languages: ['javascript', 'typescript', 'html', 'css'],
          frameworks: ['react', 'node.js', 'nodejs', 'express', 'next.js', 'redux', 'tailwind'],
          databases: ['mongodb', 'mongoose', 'redis', 'postgresql'],
          tools: ['git', 'docker', 'postman', 'jest', 'vite', 'npm']
        };

    keywords.languages.forEach((lang) => {
      if (lower.includes(lang)) {
        const proper = lang.toUpperCase() === 'SQL' ? 'SQL' : lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1);
        foundLanguages.push(proper);
        extractedSkills.push({ skill: proper, category: 'Language', claimedLevel: lower.includes('advanced ' + lang) ? 'Advanced' : 'Intermediate', context: `Mentioned in technical experience` });
      }
    });

    keywords.frameworks.forEach((fw) => {
      if (lower.includes(fw)) {
        const proper = fw === 'react' ? 'React' : fw === 'pandas' ? 'Pandas' : fw.charAt(0).toUpperCase() + fw.slice(1);
        foundFrameworks.push(proper);
        extractedSkills.push({ skill: proper, category: 'Framework', claimedLevel: 'Intermediate', context: `Identified in practical projects` });
      }
    });

    keywords.databases.forEach((db) => {
      if (lower.includes(db)) {
        const proper = db === 'mongodb' ? 'MongoDB' : db.toUpperCase();
        foundDatabases.push(proper);
        extractedSkills.push({ skill: proper, category: 'Database', claimedLevel: 'Intermediate', context: `Database architecture experience` });
      }
    });

    keywords.tools.forEach((t) => {
      if (lower.includes(t)) {
        const proper = t === 'power bi' ? 'Power BI' : t.charAt(0).toUpperCase() + t.slice(1);
        foundTools.push(proper);
        extractedSkills.push({ skill: proper, category: 'Tool', claimedLevel: 'Intermediate', context: `Tooling & analytics environment` });
      }
    });

    const gaps = isDataAnalyst
      ? ['Advanced SQL Window Functions', 'Statistical Hypothesis Testing', 'Cohort Analysis', 'DAX Context Transitions'].filter((g) => !lower.includes(g.toLowerCase()))
      : ['React State Architecture', 'MongoDB Compound Indexing', 'JWT Cookie Security', 'Docker Containerization'].filter((g) => !lower.includes(g.toLowerCase()));

    return {
      extractedSkills: extractedSkills.length > 0 ? extractedSkills : (isDataAnalyst ? dataAnalystResumeProfiles.beginner.extractedSkills : mernResumeProfiles.beginner.extractedSkills),
      programmingLanguages: foundLanguages.length > 0 ? foundLanguages : (isDataAnalyst ? ['SQL (Basic)'] : ['JavaScript']),
      frameworks: foundFrameworks,
      databases: foundDatabases,
      tools: foundTools.length > 0 ? foundTools : ['Git'],
      projectsIdentified: [
        {
          name: isDataAnalyst ? 'Business Intelligence Analysis Portfolio' : 'Full-Stack Web Portfolio',
          technologies: [...foundLanguages.slice(0, 2), ...foundFrameworks.slice(0, 2)],
          description: `Practical work demonstrating ${isDataAnalyst ? 'analytics and reporting' : 'web application development'} competence.`
        }
      ],
      missingSkillsForTarget: gaps.slice(0, 4),
      overallExperienceClaim: extractedSkills.some((s) => s.claimedLevel === 'Advanced') ? 'Mid-Senior' : 'Junior',
      analysisSummary: `Analysis extracted ${extractedSkills.length} key competencies across ${foundLanguages.length} languages and ${foundFrameworks.length} frameworks. Identified target role prerequisites.`
    };
  }

  // Fallback to default intermediate profile
  return isDataAnalyst ? dataAnalystResumeProfiles.intermediate : mernResumeProfiles.intermediate;
}

export default {
  mernResumeProfiles,
  dataAnalystResumeProfiles,
  analyzeResumeMock
};

/**
 * PathForge Mock GitHub Analysis Engine
 * Inspects GitHub profile/repository URLs deterministically or provides realistic analysis profiles
 * for both MERN Developer and Data Analyst tracks.
 */

export const mockGithubProfiles = {
  'mern-developer': {
    repositoriesAnalyzed: [
      {
        name: 'task-flow-app',
        description: 'Collaborative task management application built with React and Express',
        languages: ['JavaScript', 'HTML', 'CSS'],
        stars: 3,
        forks: 1,
        qualityScore: 78,
        insights: 'Good component modularity. Missing comprehensive unit tests. Direct localStorage token storage detected.'
      },
      {
        name: 'ecommerce-api-service',
        description: 'RESTful API for product catalog and order processing with MongoDB',
        languages: ['JavaScript'],
        stars: 5,
        forks: 2,
        qualityScore: 82,
        insights: 'Clean MVC directory structure. Uses Mongoose models. Indexes missing on foreign keys.'
      }
    ],
    primaryLanguages: ['JavaScript (82%)', 'HTML (10%)', 'CSS (8%)'],
    verifiedSkills: [
      { skill: 'JavaScript', evidence: 'Strong evidence across 4 active repositories with consistent commit history.' },
      { skill: 'React', evidence: 'Functional components with hooks found in frontend repositories.' },
      { skill: 'Express', evidence: 'RESTful route definitions and middleware handling observed.' },
      { skill: 'MongoDB', evidence: 'Mongoose schemas defined with basic CRUD operations.' }
    ],
    codeQualitySummary: {
      documentationScore: 'B+ (README present with local setup instructions)',
      testingCoverage: 'C (Unit test coverage below 30%)',
      architectureHygiene: 'A- (Separation of concerns between routes and controllers)'
    },
    recommendations: [
      'Introduce automated unit test suites using Jest and React Testing Library.',
      'Transition authentication from localStorage to httpOnly secure cookies.',
      'Add Docker Compose configuration for local multi-container development.'
    ]
  },
  'data-analyst': {
    repositoriesAnalyzed: [
      {
        name: 'e-commerce-sales-analysis',
        description: 'Exploratory data analysis of 50k transactions using Python and Pandas',
        languages: ['Jupyter Notebook', 'Python'],
        stars: 6,
        forks: 2,
        qualityScore: 84,
        insights: 'Thorough distribution and correlation visualizations with Seaborn. Well-documented markdown notes.'
      },
      {
        name: 'sql-retail-data-mart',
        description: 'PostgreSQL analytical queries and dimensional modeling scripts for retail analytics',
        languages: ['SQL'],
        stars: 4,
        forks: 0,
        qualityScore: 80,
        insights: 'Demonstrates solid JOIN and GROUP BY mechanics. Window functions utilized in customer growth analysis.'
      }
    ],
    primaryLanguages: ['Python (65%)', 'SQL (25%)', 'Jupyter Notebook (10%)'],
    verifiedSkills: [
      { skill: 'SQL', evidence: 'Multi-table queries, subqueries, and aggregation scripts verified.' },
      { skill: 'Python', evidence: 'Pandas DataFrames and Matplotlib visualizations implemented in notebooks.' },
      { skill: 'Data Cleaning', evidence: 'Missing value imputation and outlier clipping routines observed.' }
    ],
    codeQualitySummary: {
      documentationScore: 'A (Detailed step-by-step methodology and business insights documented)',
      testingCoverage: 'N/A (Data analysis notebook workflows)',
      architectureHygiene: 'B+ (Structured modular SQL queries with clear comments)'
    },
    recommendations: [
      'Package Python data cleaning scripts into reusable modular .py utility libraries.',
      'Incorporate formal statistical hypothesis testing (t-tests, Chi-Square) to validate findings.',
      'Add Power BI (.pbix) templates or Tableau Public links to showcase interactive BI dashboards.'
    ]
  }
};

/**
 * Deterministic GitHub analyzer
 */
export function analyzeGithubMock({ githubUsername = '', targetRole = 'MERN Developer' }) {
  const isDataAnalyst = targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst');
  const baseProfile = isDataAnalyst ? mockGithubProfiles['data-analyst'] : mockGithubProfiles['mern-developer'];

  const cleanUser = String(githubUsername || 'student-dev').replace(/https?:\/\/github\.com\/?/i, '').trim() || 'student-dev';

  return {
    username: cleanUser,
    targetRole,
    ...baseProfile
  };
}

export default {
  mockGithubProfiles,
  analyzeGithubMock
};

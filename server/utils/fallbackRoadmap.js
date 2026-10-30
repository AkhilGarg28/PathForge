import { mapRoadmapResources } from '../services/resourceMapper.js';

/**
 * Hand-authored 6-module curriculum templates for MERN Developer and Data Analyst.
 * MERN moduleIds strictly correspond to checkpoint definitions in data/checkpoints.json.
 */

export const MERN_FALLBACK_MODULES = [
  {
    moduleId: 'mern-mod-1',
    dimension: 'javascript',
    title: 'Modern JavaScript & Asynchronous Foundations',
    description:
      'Master closures, event loops, promises, async/await, and modern ES6+ functional programming constructs for robust web applications.',
    resourceTags: ['javascript'],
    estimatedHours: 10
  },
  {
    moduleId: 'mern-mod-2',
    dimension: 'react',
    title: 'React Architecture & State Management',
    description:
      'Build modular component trees with functional hooks, custom lifecycle management, context-driven shared state, and reconciliation optimization.',
    resourceTags: ['react'],
    estimatedHours: 12
  },
  {
    moduleId: 'mern-mod-3',
    dimension: 'node-express',
    title: 'Node.js & Express RESTful API Design',
    description:
      'Architect scalable backend microservices, resilient routing middleware, request validation, and centralized HTTP error handling.',
    resourceTags: ['node', 'express'],
    estimatedHours: 14
  },
  {
    moduleId: 'mern-mod-4',
    dimension: 'databases-git',
    title: 'MongoDB Data Modeling & Aggregation Pipelines',
    description:
      'Design normalized and embedded document schemas using Mongoose, execute multi-stage aggregations, and optimize database indexing strategies.',
    resourceTags: ['mongodb'],
    estimatedHours: 12
  },
  {
    moduleId: 'mern-mod-5',
    dimension: 'node-express',
    title: 'Full-Stack Security, Authentication & JWT Sessions',
    description:
      'Implement defense-in-depth security with bcrypt password hashing, httpOnly JWT cookies, CORS configurations, and rate-limiting middleware.',
    resourceTags: ['node', 'express'],
    estimatedHours: 10
  },
  {
    moduleId: 'mern-mod-6',
    dimension: 'databases-git',
    title: 'Cloud Deployment, CI/CD & Git Branching Workflows',
    description:
      'Manage version control with Git feature branches, configure automated continuous integration, and deploy secure containerized web servers.',
    resourceTags: ['git'],
    estimatedHours: 8
  }
];

export const DATA_ANALYST_FALLBACK_MODULES = [
  {
    moduleId: 'da-mod-1',
    dimension: 'excel-sql',
    title: 'Advanced Excel & Analytical Spreadsheet Modeling',
    description:
      'Manipulate complex tabular datasets with advanced lookup functions, pivot tables, data normalization, and dynamic calculation models.',
    resourceTags: ['excel'],
    estimatedHours: 8
  },
  {
    moduleId: 'da-mod-2',
    dimension: 'excel-sql',
    title: 'Relational Database Querying & SQL Analytics',
    description:
      'Execute multi-table relational joins, group aggregations, filtering subqueries, and window functions for structured data extraction.',
    resourceTags: ['sql'],
    estimatedHours: 12
  },
  {
    moduleId: 'da-mod-3',
    dimension: 'python',
    title: 'Python for Data Wrangling & pandas Manipulation',
    description:
      'Clean messy datasets, handle missing values, transform data types, and manipulate time series using Python and pandas dataframes.',
    resourceTags: ['python', 'pandas'],
    estimatedHours: 15
  },
  {
    moduleId: 'da-mod-4',
    dimension: 'statistics',
    title: 'Applied Statistical Analysis & Hypothesis Testing',
    description:
      'Apply inferential statistics, probability distributions, confidence intervals, and hypothesis testing to validate quantitative patterns.',
    resourceTags: ['statistics'],
    estimatedHours: 14
  },
  {
    moduleId: 'da-mod-5',
    dimension: 'data-visualization',
    title: 'Exploratory Data Analysis & Matplotlib Visuals',
    description:
      'Generate clear, statistically informative charts, correlation heatmaps, and distribution plots using Matplotlib and Python data tools.',
    resourceTags: ['matplotlib'],
    estimatedHours: 10
  },
  {
    moduleId: 'da-mod-6',
    dimension: 'data-visualization',
    title: 'Business Intelligence Dashboards with Power BI & Tableau',
    description:
      'Design interactive enterprise KPI dashboards, visual storytelling narratives, and automated executive reports in Power BI and Tableau.',
    resourceTags: ['powerbi', 'tableau'],
    estimatedHours: 12
  }
];

/**
 * Generates a deterministic fallback roadmap for a role, ordered from weakest to strongest dimension,
 * with resources bound from the resource library.
 *
 * @param {Object} params
 * @param {string} params.roleSlug - Role identifier ("mern-developer" | "data-analyst")
 * @param {Record<string, number>} [params.dimensionScores={}] - Evaluated diagnostic scores
 * @param {Array<Object>} [params.resourceLibrary=[]] - Verified resource library
 * @returns {Array<Object>} Completed 6-module roadmap with status, resources, and checkpointScore
 */
export function getFallbackRoadmap({
  roleSlug = 'mern-developer',
  dimensionScores = {},
  resourceLibrary = []
}) {
  const isDataAnalyst = roleSlug === 'data-analyst';
  const baseTemplates = isDataAnalyst ? DATA_ANALYST_FALLBACK_MODULES : MERN_FALLBACK_MODULES;

  // Determine weakest dimension from scores
  let weakestDimension = '';
  let minScore = Infinity;

  const scoreEntries = Object.entries(dimensionScores);
  if (scoreEntries.length > 0) {
    for (const [dim, score] of scoreEntries) {
      const numScore = Number(score) || 0;
      if (numScore < minScore) {
        minScore = numScore;
        weakestDimension = dim;
      }
    }
  }

  // Clone modules and sort based on dimensionScores (lowest dimension score first)
  const sortedModules = [...baseTemplates].sort((a, b) => {
    const scoreA = Number(dimensionScores[a.dimension] ?? 5);
    const scoreB = Number(dimensionScores[b.dimension] ?? 5);
    return scoreA - scoreB;
  });

  // Map resources onto sorted modules
  const withResources = mapRoadmapResources(sortedModules, resourceLibrary, weakestDimension);

  // Apply post-processing progression statuses: first is active, rest locked
  return withResources.map((mod, index) => ({
    moduleId: mod.moduleId,
    title: mod.title,
    description: mod.description,
    resourceTags: [...mod.resourceTags],
    resources: mod.resources || [],
    estimatedHours: mod.estimatedHours,
    status: index === 0 ? 'active' : 'locked',
    checkpointScore: null
  }));
}

export default {
  MERN_FALLBACK_MODULES,
  DATA_ANALYST_FALLBACK_MODULES,
  getFallbackRoadmap
};

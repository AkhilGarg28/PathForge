/**
 * PathForge Curated Mock Resources Library
 * Provides rich, verified educational resources tagged by skill and topic for both tracks.
 */

export const mockResources = [
  // JavaScript & React
  {
    id: 'res-js-mdn',
    title: 'MDN Web Docs: JavaScript Fundamentals',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    type: 'docs',
    tag: 'javascript',
    description: 'The definitive reference documentation for JavaScript language semantics and Web APIs.'
  },
  {
    id: 'res-js-info',
    title: 'The Modern JavaScript Tutorial',
    url: 'https://javascript.info',
    type: 'article',
    tag: 'javascript',
    description: 'In-depth tutorial covering closures, event loop, promises, and modern ES6+ features.'
  },
  {
    id: 'res-react-docs',
    title: 'React.dev: Official Documentation & Hooks Guide',
    url: 'https://react.dev',
    type: 'docs',
    tag: 'react',
    description: 'Official interactive documentation for modern functional React, hooks, and component thinking.'
  },
  {
    id: 'res-react-router',
    title: 'React Router v6 Official Documentation',
    url: 'https://reactrouter.com',
    type: 'docs',
    tag: 'react-router',
    description: 'Declarative routing, nested layouts, loaders, and protected auth routes in React SPAs.'
  },
  // Node, Express & MongoDB
  {
    id: 'res-node-docs',
    title: 'Node.js Official Documentation & API Reference',
    url: 'https://nodejs.org/en/docs',
    type: 'docs',
    tag: 'node',
    description: 'Core runtime architecture, streams, buffers, file system, and cluster guides.'
  },
  {
    id: 'res-express-guide',
    title: 'Express.js Routing, Middleware & Security Guide',
    url: 'https://expressjs.com',
    type: 'docs',
    tag: 'express',
    description: 'RESTful API construction, middleware composition, and error handling patterns.'
  },
  {
    id: 'res-mongo-university',
    title: 'MongoDB University: Data Modeling & Aggregation',
    url: 'https://learn.mongodb.com',
    type: 'course',
    tag: 'mongodb',
    description: 'Free comprehensive curriculum on document schema modeling, indexing, and aggregation pipelines.'
  },
  {
    id: 'res-mongoose-docs',
    title: 'Mongoose ODM Documentation',
    url: 'https://mongoosejs.com/docs/guide.html',
    type: 'docs',
    tag: 'mongoose',
    description: 'Schema definitions, validation rules, query middleware, and populate references.'
  },
  // Data Analyst Track: SQL, Excel, Python & BI
  {
    id: 'res-sql-mode',
    title: 'Mode Analytics: The SQL Tutorial for Data Analysis',
    url: 'https://mode.com/sql-tutorial',
    type: 'course',
    tag: 'sql',
    description: 'Practical business SQL curriculum covering aggregations, joins, subqueries, and window functions.'
  },
  {
    id: 'res-pandas-docs',
    title: 'Pandas Official User Guide & API Reference',
    url: 'https://pandas.pydata.org/docs/user_guide/index.html',
    type: 'docs',
    tag: 'pandas',
    description: 'Comprehensive guide to Series, DataFrames, indexing, grouping, and reshaping.'
  },
  {
    id: 'res-powerbi-learn',
    title: 'Microsoft Learn: Power BI Data Modeling & DAX',
    url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    type: 'course',
    tag: 'power-bi',
    description: 'Official Microsoft training on dimensional modeling, DAX measures, and report visual design.'
  },
  {
    id: 'res-tableau-public',
    title: 'Tableau Public Visual Gallery & Free Training Videos',
    url: 'https://public.tableau.com',
    type: 'article',
    tag: 'tableau',
    description: 'Interactive dashboard inspirations and step-by-step calculated field walkthroughs.'
  },
  {
    id: 'res-scipy-stats',
    title: 'SciPy Statistical Functions & Hypothesis Testing',
    url: 'https://docs.scipy.org/doc/scipy/reference/stats.html',
    type: 'docs',
    tag: 'statistics',
    description: 'Reference documentation for continuous distributions, t-tests, and ANOVA in Python.'
  }
];

export function getResourcesByTag(tag) {
  if (!tag) return mockResources;
  const lowerTag = String(tag).toLowerCase().trim();
  return mockResources.filter((r) => r.tag.toLowerCase().includes(lowerTag) || r.title.toLowerCase().includes(lowerTag));
}

export default {
  mockResources,
  getResourcesByTag
};

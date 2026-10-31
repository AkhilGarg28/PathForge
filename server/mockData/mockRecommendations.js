/**
 * PathForge Mock Career & Learning Recommendations
 * Tailored suggestions for resume improvement, interview prep, and career readiness.
 */

export const mockRecommendations = {
  'mern-developer': {
    resumeImprovements: [
      {
        section: 'Technical Skills',
        currentCritique: 'Skills listed as flat comma-separated text without category grouping or proficiency levels.',
        suggestion: 'Organize skills into Languages, Frontend Frameworks, Backend & Databases, and DevOps & Tooling.'
      },
      {
        section: 'Project Bullet Points',
        currentCritique: 'Bullet points describe what features were built, but lack measurable impact metrics.',
        suggestion: 'Utilize the XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]" (e.g. "Reduced database query latency by 45% by introducing compound indexes on MongoDB collections").'
      },
      {
        section: 'Production Deployment',
        currentCritique: 'No live URLs or CI/CD mention.',
        suggestion: 'Include active deployment links (Vercel, Render) and emphasize automated GitHub Actions pipelines.'
      }
    ],
    interviewPrepQuestions: [
      {
        type: 'Technical Concept',
        question: 'Explain the difference between SQL and NoSQL. When would you choose MongoDB over PostgreSQL in a production MERN app?',
        talkingPoints: [
          'MongoDB offers flexible schema design, nested documents, and rapid iteration for content or unstructured data.',
          'PostgreSQL guarantees strict relational schemas, ACID transactions, and complex joins.',
          'Trade-offs include data integrity vs horizontal sharding agility.'
        ]
      },
      {
        type: 'System Design',
        question: 'How would you architect an Express + MongoDB application to handle 50,000 active concurrent WebSocket users?',
        talkingPoints: [
          'Stateless Node.js app cluster behind NGINX or AWS ALB with sticky sessions or Redis adapter.',
          'Redis Pub/Sub to synchronize broadcast messages across clustered server instances.',
          'Connection pooling, rate limiting, and event loop monitoring to prevent bottlenecks.'
        ]
      },
      {
        type: 'Live Coding / Debugging',
        question: 'Identify the bug: A React component has an infinite re-render loop when fetching user data inside useEffect.',
        talkingPoints: [
          'Missing dependency array causes effect to fire after every render.',
          'Calling setState inside effect triggers another render, creating an infinite cycle.',
          'Solution: Provide explicit dependencies [userId] and cleanup cancellation flag.'
        ]
      }
    ],
    nextSteps: [
      'Complete Phase 3: Scalable Backend APIs & Database Modeling on your PathForge roadmap.',
      'Deploy your capstone project with automated CI/CD and custom domain SSL.',
      'Contribute to an open-source repository or build a public npm utility package.'
    ]
  },
  'data-analyst': {
    resumeImprovements: [
      {
        section: 'Business Impact Focus',
        currentCritique: 'Projects list tools used (SQL, Excel) without stating the business decision influenced.',
        suggestion: 'Quantify financial impact: "Identified $120,000 in inventory inefficiencies by constructing an automated SQL cohort retention pipeline."'
      },
      {
        section: 'Portfolio Links',
        currentCritique: 'No visual evidence of dashboard design.',
        suggestion: 'Include clickable links to Tableau Public, Power BI web reports, or hosted Streamlit dashboards.'
      },
      {
        section: 'Statistical Depth',
        currentCritique: 'Lacks mention of statistical validation or experiment testing.',
        suggestion: 'Highlight applied statistics: "Designed A/B experiment evaluation framework measuring conversion lift with 95% confidence intervals."'
      }
    ],
    interviewPrepQuestions: [
      {
        type: 'SQL Technical Challenge',
        question: 'Write a SQL query to find the top 2 customers with the highest total spend in each geographic region.',
        talkingPoints: [
          'Use Common Table Expression (CTE) combined with DENSE_RANK() or ROW_NUMBER().',
          'Partition by region, order by total spend descending.',
          'Filter WHERE rank <= 2 in outer query.'
        ]
      },
      {
        type: 'Product Analytics & Metrics',
        question: 'If our daily active users (DAU) dropped by 15% this week, how would you systematically investigate the root cause?',
        talkingPoints: [
          'Verify telemetry/logging integrity (was an analytics tag broken in the latest app release?).',
          'Segment the drop: by platform (iOS vs Android), geography, new vs existing users, app version.',
          'Check external factors (holidays, competitors, server downtime).'
        ]
      },
      {
        type: 'Experimentation & A/B Testing',
        question: 'What is the risk of stopping an A/B test early as soon as the p-value dips below 0.05?',
        talkingPoints: [
          'Known as the "peeking problem" or data dredging, which vastly inflates the Type I error rate (false positives).',
          'Sample sizes must be calculated upfront using statistical power calculations (alpha=0.05, power=0.80) and run to completion.'
        ]
      }
    ],
    nextSteps: [
      'Master SQL Window Functions (LAG, LEAD, DENSE_RANK) on your PathForge roadmap.',
      'Publish a comprehensive end-to-end business case study on your GitHub with Power BI visuals.',
      'Practice product case analytics interviews with metric tree decomposition.'
    ]
  }
};

export function getRecommendationsMock(targetRole = 'MERN Developer') {
  const isDataAnalyst = targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst');
  return isDataAnalyst ? mockRecommendations['data-analyst'] : mockRecommendations['mern-developer'];
}

export default {
  mockRecommendations,
  getRecommendationsMock
};

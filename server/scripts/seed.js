import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { Role, Diagnostic, Checkpoint } from '../models/index.js';
import { validateAllData } from './validateData.js';
import cache from '../utils/cache.js';
import { mernQuestions as mernBank } from '../mockData/mernQuestions.js';
import { dataAnalystQuestions as daBank } from '../mockData/dataAnalystQuestions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
const questionsPath = path.resolve(__dirname, '../../data/questions.json');
const checkpointsPath = path.resolve(__dirname, '../../data/checkpoints.json');

export const ROLES_SEED = [
  {
    name: 'MERN Developer',
    slug: 'mern-developer',
    description: 'Full-stack development specializing in MongoDB, Express, React, and Node.js.',
    dimensions: [
      { id: 'javascript', name: 'JavaScript' },
      { id: 'react', name: 'React' },
      { id: 'node-express', name: 'Node & Express' },
      { id: 'databases-git', name: 'Databases & Git' }
    ]
  },
  {
    name: 'Data Analyst',
    slug: 'data-analyst',
    description:
      'Data wrangling, SQL analytics, statistical exploration, and dashboard storytelling.',
    dimensions: [
      { id: 'excel-sql', name: 'Excel & SQL' },
      { id: 'python', name: 'Python' },
      { id: 'statistics', name: 'Statistics' },
      { id: 'data-visualization', name: 'Data Visualization' }
    ]
  }
];

function mapMernDimension(q) {
  if (q.dimension) return q.dimension;
  const s = (q.skill || '').toLowerCase();
  if (s.includes('react')) return 'react';
  if (s.includes('node') || s.includes('express') || s.includes('auth') || s.includes('security')) return 'node-express';
  if (s.includes('mongo') || s.includes('mongoose') || s.includes('git') || s.includes('devops') || s.includes('system')) return 'databases-git';
  return 'javascript';
}

function mapDaDimension(q) {
  if (q.dimension) return q.dimension;
  const s = (q.skill || '').toLowerCase();
  if (s.includes('excel') || s.includes('sql') || s.includes('model')) return 'excel-sql';
  if (s.includes('python') || s.includes('clean')) return 'python';
  if (s.includes('stat') || s.includes('business') || s.includes('prob')) return 'statistics';
  if (s.includes('power') || s.includes('tableau') || s.includes('vis')) return 'data-visualization';
  return 'statistics';
}

/**
 * Validates content data and idempotently seeds Role and Diagnostic collections.
 */
export async function seedDatabase() {
  // Clear in-memory caches upon database seeding
  cache.clear();

  // 1. Validate data integrity
  const validation = validateAllData({ quiet: true });
  if (!validation.valid) {
    throw new Error(`Data validation failed before seed: ${validation.errors.join('; ')}`);
  }

  // 2. Read questions from data/questions.json
  const questionsRaw = fs.readFileSync(questionsPath, 'utf-8');
  const questions = JSON.parse(questionsRaw);

  // 3. Idempotently upsert Roles
  const rolesUpserted = [];
  for (const roleData of ROLES_SEED) {
    const role = await Role.findOneAndUpdate({ slug: roleData.slug }, roleData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    rolesUpserted.push(role);
  }

  // 4. Idempotently upsert Comprehensive Diagnostic question banks (60+ per track)
  const baseMern = questions.filter((q) => q.roleId === 'mern-developer');
  const fullMern = [
    ...baseMern,
    ...mernBank.map((q) => ({
      id: q.id,
      dimension: mapMernDimension(q),
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || ''
    }))
  ];
  const uniqueMern = Array.from(new Map(fullMern.map((q) => [q.id, q])).values());

  const baseDa = questions.filter((q) => q.roleId === 'data-analyst');
  const fullDa = [
    ...baseDa,
    ...daBank.map((q) => ({
      id: q.id,
      dimension: mapDaDimension(q),
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || ''
    }))
  ];
  const uniqueDa = Array.from(new Map(fullDa.map((q) => [q.id, q])).values());

  const mernDiag = await Diagnostic.findOneAndUpdate(
    { roleId: 'mern-developer' },
    { roleId: 'mern-developer', questions: uniqueMern },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const daDiag = await Diagnostic.findOneAndUpdate(
    { roleId: 'data-analyst' },
    { roleId: 'data-analyst', questions: uniqueDa },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 5. Idempotently upsert Checkpoints from data/checkpoints.json
  const checkpointsUpserted = [];
  if (fs.existsSync(checkpointsPath)) {
    const checkpointsRaw = fs.readFileSync(checkpointsPath, 'utf-8');
    const checkpoints = JSON.parse(checkpointsRaw);
    for (const cp of checkpoints) {
      const upserted = await Checkpoint.findOneAndUpdate({ moduleId: cp.moduleId }, cp, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      });
      checkpointsUpserted.push(upserted);
    }
  }

  return {
    roles: rolesUpserted,
    diagnostics: [mernDiag, daDiag],
    checkpoints: checkpointsUpserted
  };
}

// Standalone CLI execution
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  (async () => {
    try {
      await connectDB();
      const result = await seedDatabase();
      console.log(
        `[SEED SUCCESS] Idempotently seeded ${result.roles.length} roles, ${result.diagnostics.length} diagnostics (${result.diagnostics[0]?.questions?.length} MERN / ${result.diagnostics[1]?.questions?.length} DA), and ${result.checkpoints?.length || 0} checkpoints.`
      );
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error(`[SEED ERROR] ${err.message}`);
      process.exit(1);
    }
  })();
}

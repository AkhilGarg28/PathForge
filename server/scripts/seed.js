import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { Role, Diagnostic, Checkpoint } from '../models/index.js';
import { validateAllData } from './validateData.js';
import cache from '../utils/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

  // 4. Idempotently upsert Diagnostic question banks
  const mernQuestions = questions.filter((q) => q.roleId === 'mern-developer');
  const daQuestions = questions.filter((q) => q.roleId === 'data-analyst');

  const mernDiag = await Diagnostic.findOneAndUpdate(
    { roleId: 'mern-developer' },
    { roleId: 'mern-developer', questions: mernQuestions },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const daDiag = await Diagnostic.findOneAndUpdate(
    { roleId: 'data-analyst' },
    { roleId: 'data-analyst', questions: daQuestions },
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
        `[SEED SUCCESS] Idempotently seeded ${result.roles.length} roles, ${result.diagnostics.length} diagnostics, and ${result.checkpoints?.length || 0} checkpoints.`
      );
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error(`[SEED ERROR] ${err.message}`);
      process.exit(1);
    }
  })();
}

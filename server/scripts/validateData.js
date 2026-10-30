import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve data directory relative to this script
const dataDir = path.resolve(__dirname, '../../data');

const CANONICAL_ROLES = ['mern-developer', 'data-analyst'];

const CANONICAL_DIMENSIONS = {
  'mern-developer': ['javascript', 'react', 'node-express', 'databases-git'],
  'data-analyst': ['excel-sql', 'python', 'statistics', 'data-visualization']
};

const ALL_DIMENSIONS = new Set([
  ...CANONICAL_DIMENSIONS['mern-developer'],
  ...CANONICAL_DIMENSIONS['data-analyst']
]);

const EXPECTED_MERN_MODULES = [
  'mern-mod-1',
  'mern-mod-2',
  'mern-mod-3',
  'mern-mod-4',
  'mern-mod-5',
  'mern-mod-6'
];

export function validateAllData({ quiet = false } = {}) {
  const errors = [];
  const logPass = (msg) => !quiet && console.log(`  [PASS] ${msg}`);
  const logFail = (msg) => {
    !quiet && console.error(`  [FAIL] ${msg}`);
    errors.push(msg);
  };

  function readJsonFile(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      logFail(`File missing: ${filePath}`);
      return null;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      logFail(`Failed to parse JSON from ${filename}: ${err.message}`);
      return null;
    }
  }

  function isValidUrl(stringUrl) {
    try {
      const parsed = new URL(stringUrl);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  !quiet && console.log('=== Validating PathForge Content Files in data/ ===\n');

  // 1. Validate questions.json
  !quiet && console.log('1. Validating questions.json...');
  const questions = readJsonFile('questions.json');
  if (questions) {
    if (!Array.isArray(questions)) {
      logFail('questions.json must contain an array of question objects');
    } else {
      if (questions.length !== 24) {
        logFail(`Expected exactly 24 questions, found ${questions.length}`);
      } else {
        logPass('Contains exactly 24 questions');
      }

      const seenQIds = new Set();
      const roleCounts = { 'mern-developer': 0, 'data-analyst': 0 };
      const dimensionCounts = {};
      ALL_DIMENSIONS.forEach((dim) => {
        dimensionCounts[dim] = 0;
      });

      questions.forEach((q, idx) => {
        const qPrefix = `Question #${idx + 1} (${q.id || 'missing ID'})`;

        if (!q.id || typeof q.id !== 'string') {
          logFail(`${qPrefix}: id is missing or not a string`);
        } else if (seenQIds.has(q.id)) {
          logFail(`${qPrefix}: Duplicate question ID '${q.id}'`);
        } else {
          seenQIds.add(q.id);
        }

        if (!CANONICAL_ROLES.includes(q.roleId)) {
          logFail(`${qPrefix}: Invalid roleId '${q.roleId}'`);
        } else {
          roleCounts[q.roleId] = (roleCounts[q.roleId] || 0) + 1;
        }

        if (!ALL_DIMENSIONS.has(q.dimension)) {
          logFail(`${qPrefix}: Unknown dimension '${q.dimension}'`);
        } else {
          dimensionCounts[q.dimension] = (dimensionCounts[q.dimension] || 0) + 1;
        }

        if (typeof q.question !== 'string' || q.question.trim().length === 0) {
          logFail(`${qPrefix}: 'question' text must be a non-empty string`);
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
          logFail(`${qPrefix}: 'options' must be an array of exactly 4 strings`);
        } else {
          q.options.forEach((opt, optIdx) => {
            if (typeof opt !== 'string' || opt.trim().length === 0) {
              logFail(`${qPrefix}: option[${optIdx}] must be a non-empty string`);
            }
          });
        }

        if (
          typeof q.correctIndex !== 'number' ||
          !Number.isInteger(q.correctIndex) ||
          q.correctIndex < 0 ||
          q.correctIndex > 3
        ) {
          logFail(`${qPrefix}: 'correctIndex' must be an integer between 0 and 3`);
        }

        if (typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
          logFail(`${qPrefix}: 'explanation' must be a non-empty string`);
        }
      });

      if (roleCounts['mern-developer'] === 12 && roleCounts['data-analyst'] === 12) {
        logPass('Role distribution: exactly 12 questions per role');
      } else {
        logFail(
          `Imbalanced roles: mern=${roleCounts['mern-developer']}, data-analyst=${roleCounts['data-analyst']}`
        );
      }

      let allDimensionsHave3 = true;
      for (const [dim, count] of Object.entries(dimensionCounts)) {
        if (count !== 3) {
          allDimensionsHave3 = false;
          logFail(`Dimension '${dim}' has ${count} questions (expected 3)`);
        }
      }
      if (allDimensionsHave3) {
        logPass(
          'Dimension distribution: exactly 3 questions per dimension across all 8 dimensions'
        );
      }
    }
  }

  // 2. Validate resources.json
  !quiet && console.log('\n2. Validating resources.json...');
  const resources = readJsonFile('resources.json');
  if (resources) {
    if (!Array.isArray(resources)) {
      logFail('resources.json must contain an array of resource objects');
    } else {
      if (resources.length !== 24) {
        logFail(`Expected exactly 24 resources, found ${resources.length}`);
      } else {
        logPass('Contains exactly 24 resources');
      }

      const seenResIds = new Set();
      const resDimensionCounts = {};
      ALL_DIMENSIONS.forEach((dim) => {
        resDimensionCounts[dim] = 0;
      });

      resources.forEach((r, idx) => {
        const rPrefix = `Resource #${idx + 1} (${r.id || 'missing ID'})`;

        if (!r.id || typeof r.id !== 'string') {
          logFail(`${rPrefix}: id is missing or not a string`);
        } else if (seenResIds.has(r.id)) {
          logFail(`${rPrefix}: Duplicate resource ID '${r.id}'`);
        } else {
          seenResIds.add(r.id);
        }

        if (typeof r.title !== 'string' || r.title.trim().length === 0) {
          logFail(`${rPrefix}: 'title' must be a non-empty string`);
        }

        if (!isValidUrl(r.url)) {
          logFail(`${rPrefix}: Invalid URL format '${r.url}'`);
        }

        if (!['docs', 'article', 'video'].includes(r.type)) {
          logFail(`${rPrefix}: 'type' must be 'docs', 'article', or 'video'`);
        }

        if (!ALL_DIMENSIONS.has(r.dimension)) {
          logFail(`${rPrefix}: Unknown dimension '${r.dimension}'`);
        } else {
          resDimensionCounts[r.dimension] = (resDimensionCounts[r.dimension] || 0) + 1;
        }

        if (
          typeof r.tag !== 'string' ||
          r.tag.trim().length === 0 ||
          r.tag !== r.tag.toLowerCase()
        ) {
          logFail(`${rPrefix}: 'tag' must be a non-empty lowercase string`);
        }
      });

      let allResDimensionsHave3 = true;
      for (const [dim, count] of Object.entries(resDimensionCounts)) {
        if (count !== 3) {
          allResDimensionsHave3 = false;
          logFail(`Resource dimension '${dim}' has ${count} resources (expected 3)`);
        }
      }
      if (allResDimensionsHave3) {
        logPass('Resource distribution: exactly 3 resources per dimension across all 8 dimensions');
        logPass('All resource URLs have valid http/https format and supported types');
      }
    }
  }

  // 3. Validate checkpoints.json
  !quiet && console.log('\n3. Validating checkpoints.json...');
  const checkpoints = readJsonFile('checkpoints.json');
  if (checkpoints) {
    if (!Array.isArray(checkpoints)) {
      logFail('checkpoints.json must contain an array of module checkpoint objects');
    } else {
      if (checkpoints.length !== 6) {
        logFail(`Expected exactly 6 module checkpoints, found ${checkpoints.length}`);
      } else {
        logPass('Contains exactly 6 module checkpoints');
      }

      const seenModuleIds = new Set();
      const seenCpQIds = new Set();

      checkpoints.forEach((cp, idx) => {
        const cpPrefix = `Checkpoint #${idx + 1} (${cp.moduleId || 'missing moduleId'})`;

        if (!cp.moduleId || !EXPECTED_MERN_MODULES.includes(cp.moduleId)) {
          logFail(`${cpPrefix}: moduleId must be one of ${EXPECTED_MERN_MODULES.join(', ')}`);
        } else if (seenModuleIds.has(cp.moduleId)) {
          logFail(`${cpPrefix}: Duplicate checkpoint for moduleId '${cp.moduleId}'`);
        } else {
          seenModuleIds.add(cp.moduleId);
        }

        if (cp.roleId !== 'mern-developer') {
          logFail(`${cpPrefix}: roleId must be 'mern-developer'`);
        }

        if (!ALL_DIMENSIONS.has(cp.dimension)) {
          logFail(`${cpPrefix}: Unknown dimension '${cp.dimension}'`);
        }

        if (!Array.isArray(cp.questions) || cp.questions.length !== 4) {
          logFail(`${cpPrefix}: Must contain exactly 4 questions, found ${cp.questions?.length}`);
        } else {
          cp.questions.forEach((q, qIdx) => {
            const qSub = `${cpPrefix} Question #${qIdx + 1} (${q.id || 'missing ID'})`;

            if (!q.id || typeof q.id !== 'string') {
              logFail(`${qSub}: id is missing or not a string`);
            } else if (seenCpQIds.has(q.id)) {
              logFail(`${qSub}: Duplicate question ID '${q.id}'`);
            } else {
              seenCpQIds.add(q.id);
            }

            if (typeof q.question !== 'string' || q.question.trim().length === 0) {
              logFail(`${qSub}: 'question' text must be a non-empty string`);
            }

            if (!Array.isArray(q.options) || q.options.length !== 4) {
              logFail(`${qSub}: 'options' must be an array of exactly 4 strings`);
            }

            if (
              typeof q.correctIndex !== 'number' ||
              !Number.isInteger(q.correctIndex) ||
              q.correctIndex < 0 ||
              q.correctIndex > 3
            ) {
              logFail(`${qSub}: 'correctIndex' must be an integer between 0 and 3`);
            }

            if (typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
              logFail(`${qSub}: 'explanation' must be a non-empty string`);
            }
          });
        }
      });

      if (seenModuleIds.size === 6) {
        logPass('All 6 MERN fallback modules covered with 4 MCQs each (24 MCQs total)');
      }
    }
  }

  // 4. Validate sampleRoadmap.json
  !quiet && console.log('\n4. Validating sampleRoadmap.json...');
  const sampleRoadmap = readJsonFile('sampleRoadmap.json');
  if (sampleRoadmap) {
    if (
      typeof sampleRoadmap !== 'object' ||
      sampleRoadmap === null ||
      Array.isArray(sampleRoadmap)
    ) {
      logFail('sampleRoadmap.json must be a JSON object');
    } else {
      if (!sampleRoadmap.id || typeof sampleRoadmap.id !== 'string') {
        logFail('sampleRoadmap: missing or invalid id');
      }
      if (!sampleRoadmap.userId || typeof sampleRoadmap.userId !== 'string') {
        logFail('sampleRoadmap: missing or invalid userId');
      }
      if (sampleRoadmap.roleId !== 'mern-developer') {
        logFail("sampleRoadmap: roleId must be 'mern-developer'");
      }
      if (sampleRoadmap.generatedBy !== 'fallback') {
        logFail("sampleRoadmap: generatedBy must be 'fallback'");
      }

      if (!Array.isArray(sampleRoadmap.modules) || sampleRoadmap.modules.length !== 6) {
        logFail(
          `sampleRoadmap: modules must be an array of 6 items, found ${sampleRoadmap.modules?.length}`
        );
      } else {
        let totalHours = 0;
        let completedHours = 0;

        sampleRoadmap.modules.forEach((mod, idx) => {
          const mPrefix = `sampleRoadmap module #${idx + 1} (${mod.moduleId})`;

          if (mod.moduleId !== EXPECTED_MERN_MODULES[idx]) {
            logFail(`${mPrefix}: expected moduleId '${EXPECTED_MERN_MODULES[idx]}'`);
          }

          if (idx === 0) {
            if (mod.status !== 'active') {
              logFail(`${mPrefix}: First module status must be 'active', got '${mod.status}'`);
            }
          } else {
            if (mod.status !== 'locked') {
              logFail(`${mPrefix}: Module status must be 'locked', got '${mod.status}'`);
            }
          }

          if (typeof mod.estimatedHours !== 'number' || mod.estimatedHours <= 0) {
            logFail(`${mPrefix}: estimatedHours must be a positive number`);
          } else {
            totalHours += mod.estimatedHours;
            if (mod.status === 'complete') {
              completedHours += mod.estimatedHours;
            }
          }

          if (!Array.isArray(mod.resources) || mod.resources.length === 0) {
            logFail(`${mPrefix}: resources must be a non-empty array`);
          } else {
            mod.resources.forEach((res, rIdx) => {
              if (!isValidUrl(res.url)) {
                logFail(`${mPrefix} resource[${rIdx}]: invalid URL '${res.url}'`);
              }
              if (!['video', 'article', 'docs'].includes(res.type)) {
                logFail(`${mPrefix} resource[${rIdx}]: invalid type '${res.type}'`);
              }
            });
          }
        });

        // Verify Readiness formula
        const dimScores = Object.values(sampleRoadmap.dimensionScores || {});
        const avgDimensionScore =
          dimScores.reduce((sum, val) => sum + val, 0) / (dimScores.length || 1);

        const expectedReadiness = Math.round(
          0.4 * ((avgDimensionScore / 5) * 100) +
            0.6 * (totalHours > 0 ? (completedHours / totalHours) * 100 : 0)
        );

        if (sampleRoadmap.readinessScore !== expectedReadiness) {
          logFail(
            `sampleRoadmap: readinessScore (${sampleRoadmap.readinessScore}) does not match formula (${expectedReadiness})`
          );
        } else {
          logPass(`Readiness score ${sampleRoadmap.readinessScore}% verified by standard formula`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// Direct execution entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const result = validateAllData({ quiet: false });
  console.log('\n=== Validation Summary ===');
  if (result.valid) {
    console.log('[SUCCESS] All content files passed strict contract validation without errors.\n');
    process.exit(0);
  } else {
    console.error(`[FAILURE] Encountered ${result.errors.length} validation errors:`);
    result.errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    console.error('\nPlease fix the errors above.\n');
    process.exit(1);
  }
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRoadmapModules } from '../services/llmService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('=====================================================');
    console.log('       PathForge LLM Service Standalone Test         ');
    console.log('=====================================================');
    console.log('[INFO] GEMINI_API_KEY is not configured in server/.env');
    console.log('\nTo test live roadmap generation with Google Gemini:');
    console.log(
      '1. Obtain an API key from Google AI Studio: https://aistudio.google.com/app/apikey'
    );
    console.log('2. In server/.env, set:');
    console.log('   GEMINI_API_KEY="your-real-gemini-api-key"');
    console.log('   GEMINI_MODEL="gemini-1.5-flash"');
    console.log('   LLM_TIMEOUT_MS=15000');
    console.log('3. Run the script:');
    console.log('   node scripts/testLlm.js\n');
    console.log('[NOTE] When GEMINI_API_KEY is not set, PathForge gracefully falls back');
    console.log('to its deterministic curriculum templates in production.');
    process.exit(0);
  }

  console.log('=====================================================');
  console.log('       PathForge LLM Service Live Generation         ');
  console.log('=====================================================');
  console.log('Model Target :', process.env.GEMINI_MODEL || 'gemini-1.5-flash');
  console.log('Target Role  : MERN Developer');
  console.log('Diagnostic Profile:');
  console.log('  - React          : 1.5 / 5.0 (Priority Gap)');
  console.log('  - Node & Express : 2.0 / 5.0 (Priority Gap)');
  console.log('  - JavaScript     : 3.0 / 5.0 (Competent)');
  console.log('  - Databases & Git: 4.0 / 5.0 (Competent)');

  const samplePayload = {
    roleName: 'MERN Developer',
    dimensionScores: {
      react: 1.5,
      'node-express': 2.0,
      javascript: 3.0,
      'databases-git': 4.0
    },
    allowedTags: ['javascript', 'react', 'node', 'express', 'mongodb', 'git']
  };

  try {
    const startTime = Date.now();
    console.log('\nContacting Gemini API...');
    const result = await generateRoadmapModules(samplePayload);
    const duration = Date.now() - startTime;

    console.log(`\n[SUCCESS] Generated ${result.modules.length} modules in ${duration}ms:\n`);
    result.modules.forEach((mod, index) => {
      console.log(`Module ${index + 1}: [${mod.moduleId}] (${mod.estimatedHours} hours)`);
      console.log(`  Title: ${mod.title}`);
      console.log(`  Desc : ${mod.description}`);
      console.log(`  Tags : ${mod.resourceTags.join(', ')}`);
      console.log('-----------------------------------------------------');
    });
  } catch (err) {
    console.error(`\n[ERROR] LLM Generation Failed: [${err.name}] ${err.message}`);
    process.exit(1);
  }
}

run();

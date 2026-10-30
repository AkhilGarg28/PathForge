const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const dataDir = path.resolve(__dirname, '../../data');

const questionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  roleName: z.string().min(1, 'Role name is required'),
  dimension: z.string().min(1, 'Dimension is required'),
  question: z.string().min(1, 'Question text is required'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .length(4, 'Must provide exactly 4 options'),
  correctIndex: z
    .number()
    .int('Index must be an integer')
    .min(0, 'Index must be between 0 and 3')
    .max(3, 'Index must be between 0 and 3'),
});

const checkpointSchema = z.object({
  id: z.string().min(1, 'Checkpoint ID is required'),
  roleName: z.string().min(1, 'Role name is required'),
  dimension: z.string().min(1, 'Dimension is required'),
  question: z.string().min(1, 'Question text is required'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .length(4, 'Must provide exactly 4 options'),
  correctIndex: z
    .number()
    .int('Index must be an integer')
    .min(0, 'Index must be between 0 and 3')
    .max(3, 'Index must be between 0 and 3'),
});

const resourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required'),
  url: z.string().url('Resource URL must be a valid URL'),
  type: z.enum(['video', 'article', 'docs'], {
    errorMap: () => ({ message: "Type must be 'video', 'article', or 'docs'" }),
  }),
  dimension: z.string().min(1, 'Dimension is required'),
  roleName: z.string().optional(),
});

const validateFile = (fileName, schema) => {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`\n[DATA ERROR] Missing file: ${filePath}`);
    process.exit(1);
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`\n[DATA ERROR] Invalid JSON syntax in ${fileName}: ${err.message}`);
    process.exit(1);
  }

  const result = z.array(schema).safeParse(raw);
  if (!result.success) {
    console.error(`\n[DATA VALIDATION FAILED] in ${fileName}:`);
    result.error.issues.forEach((issue) => {
      console.error(`  - Path: [${issue.path.join('.')}] -> ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
};

const validateAllData = () => {
  const questions = validateFile('questions.json', questionSchema);
  const checkpoints = validateFile('checkpoints.json', checkpointSchema);
  const resources = validateFile('resources.json', resourceSchema);

  return { questions, checkpoints, resources };
};

if (require.main === module) {
  try {
    const { questions, checkpoints, resources } = validateAllData();
    console.log(
      `Data validation successful!\n- Questions: ${questions.length}\n- Checkpoints: ${checkpoints.length}\n- Resources: ${resources.length}`
    );
  } catch (err) {
    console.error(`Unexpected error during data validation: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  validateAllData,
  questionSchema,
  checkpointSchema,
  resourceSchema,
};

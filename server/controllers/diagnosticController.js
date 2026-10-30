const mongoose = require('mongoose');
const { z } = require('zod');
const Role = require('../models/Role');
const Diagnostic = require('../models/Diagnostic');
const Roadmap = require('../models/Roadmap');
const questionService = require('../services/questionService');
const { scoreDiagnostic } = require('../services/scoringService');
const { calculateReadiness } = require('../services/readinessService');
const { generateWithFallback } = require('../services/llmService');

const roleIdParamSchema = z.object({
  roleId: z
    .string({ required_error: 'roleId is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid role ID format'),
});

const submitDiagnosticSchema = z.object({
  roleId: z
    .string({ required_error: 'roleId is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid role ID format'),
  answers: z
    .array(
      z.object({
        questionId: z.string({ required_error: 'questionId is required' }).min(1),
        selectedIndex: z
          .number({ required_error: 'selectedIndex is required' })
          .int('selectedIndex must be an integer')
          .min(0, 'selectedIndex must be between 0 and 3')
          .max(3, 'selectedIndex must be between 0 and 3'),
      })
    )
    .min(1, 'Answers array cannot be empty'),
});

const getDiagnosticQuestions = async (req, res, next) => {
  try {
    const parseResult = roleIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Invalid role ID',
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { roleId } = parseResult.data;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const questions = questionService.getQuestionsByRole(role.name);

    // Sanitize questions: NEVER expose correctIndex
    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      roleName: q.roleName,
      dimension: q.dimension,
      question: q.question,
      options: q.options,
    }));

    return res.status(200).json({
      roleId: role._id.toString(),
      roleName: role.name,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    return next(error);
  }
};

const submitDiagnostic = async (req, res, next) => {
  try {
    const parseResult = submitDiagnosticSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Invalid submission payload',
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { roleId, answers } = parseResult.data;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role does not exist' });
    }

    const roleQuestions = questionService.getQuestionsByRole(role.name);
    if (!roleQuestions || roleQuestions.length === 0) {
      return res.status(400).json({ message: `No questions found for role ${role.name}` });
    }

    // Validate that every question of the role is answered exactly once
    if (answers.length !== roleQuestions.length) {
      return res.status(400).json({
        message: `Expected answers for all ${roleQuestions.length} questions, but received ${answers.length}`,
      });
    }

    const validQuestionMap = new Map();
    roleQuestions.forEach((q) => {
      validQuestionMap.set(q.id, q);
    });

    const answeredIds = new Set();
    for (const ans of answers) {
      if (!validQuestionMap.has(ans.questionId)) {
        return res.status(400).json({
          message: `Question '${ans.questionId}' does not belong to role '${role.name}'`,
        });
      }

      if (answeredIds.has(ans.questionId)) {
        return res.status(400).json({
          message: `Duplicate answer submitted for question '${ans.questionId}'`,
        });
      }
      answeredIds.add(ans.questionId);

      const questionObj = validQuestionMap.get(ans.questionId);
      if (
        ans.selectedIndex < 0 ||
        ans.selectedIndex >= questionObj.options.length
      ) {
        return res.status(400).json({
          message: `selectedIndex ${ans.selectedIndex} is out of range for question '${ans.questionId}'`,
        });
      }
    }

    // 1. Score the submitted diagnostic answers
    const dimensionScores = scoreDiagnostic(roleQuestions, answers);

    // 2. Save diagnostic document
    await Diagnostic.create({
      userId: req.user._id,
      roleId: role._id,
      dimensionScores,
      takenAt: new Date(),
    });

    // 3. Archive any existing active roadmap
    await Roadmap.updateMany(
      { userId: req.user._id, isArchived: false },
      { isArchived: true }
    );

    // 4. Generate roadmap (with AI LLM and guaranteed local fallback)
    const modules = await generateWithFallback(role.name, dimensionScores);

    // 5. Calculate readinessScore from calculateReadiness
    const readinessScore = calculateReadiness(modules);

    // 6. Save new Roadmap with history entry { event: "roadmap_created" }
    const roadmap = await Roadmap.create({
      userId: req.user._id,
      roleId: role._id,
      isArchived: false,
      readinessScore,
      modules,
      history: [
        {
          date: new Date(),
          event: 'roadmap_created',
          readinessScore,
        },
      ],
    });

    // Return dimensionScores, readinessScore, and roadmap
    return res.status(200).json({
      dimensionScores,
      readinessScore,
      roadmap,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDiagnosticQuestions,
  submitDiagnostic,
};

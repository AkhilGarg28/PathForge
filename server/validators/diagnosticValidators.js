import { z } from 'zod';

export const submitDiagnosticSchema = z.object({
  roleId: z
    .string({ required_error: 'roleId is required' })
    .trim()
    .min(1, 'roleId cannot be empty'),
  answers: z
    .array(
      z.object({
        questionId: z
          .string({ required_error: 'questionId is required' })
          .trim()
          .min(1, 'questionId cannot be empty'),
        selectedIndex: z
          .number({ required_error: 'selectedIndex is required' })
          .int('selectedIndex must be an integer')
          .min(0, 'selectedIndex cannot be negative')
          .max(3, 'selectedIndex cannot exceed 3')
      })
    )
    .min(1, 'answers array cannot be empty')
});

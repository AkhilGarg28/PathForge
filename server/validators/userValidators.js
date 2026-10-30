import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'New password must contain at least one letter')
    .regex(/[0-9]/, 'New password must contain at least one number')
});

export const deleteUserSchema = z.object({
  password: z
    .string({ required_error: 'Password confirmation is required' })
    .min(1, 'Password confirmation is required')
});

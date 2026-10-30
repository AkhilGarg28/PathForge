const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Diagnostic = require('../models/Diagnostic');
const env = require('../config/env');
const { setUserRole } = require('./roleController');

const COOKIE_NAME = 'token';

const profileSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
});

const passwordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      'New password must contain at least one letter and one number'
    ),
});

const deleteUserSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required to confirm deletion'),
});

const formatUserResponse = (user) => ({
  id: user._id ? user._id.toString() : user.id,
  name: user.name,
  email: user.email,
  targetRole: user.targetRole ?? null,
});

const updateProfile = async (req, res, next) => {
  try {
    const parseResult = profileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Validation error',
        errors: parseResult.error.errors,
      });
    }

    const { name } = parseResult.data;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    await user.save();

    return res.status(200).json({
      user: formatUserResponse(user),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const parseResult = passwordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Validation error',
        errors: parseResult.error.errors,
      });
    }

    const { currentPassword, newPassword } = parseResult.data;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const parseResult = deleteUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Password is required',
        errors: parseResult.error.errors,
      });
    }

    const { password } = parseResult.data;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Delete user, roadmaps, and diagnostic results
    await Roadmap.deleteMany({ userId: user._id });
    await Diagnostic.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    // Clear authentication cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      message: 'User account and all related data deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  setUserRole,
  updateProfile,
  updatePassword,
  deleteAccount,
};

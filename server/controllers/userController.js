import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Role from '../models/Role.js';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import DiagnosticResult from '../models/DiagnosticResult.js';
import { getCookieOptions, COOKIE_NAME } from '../utils/jwt.js';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Assign targeted career role to authenticated user
 * POST /api/user/role
 */
export const updateUserRole = async (req, res) => {
  const { roleId } = req.body;

  // Validate ObjectId format
  if (!roleId || typeof roleId !== 'string' || !mongoose.Types.ObjectId.isValid(roleId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID format'
    });
  }

  // Validate existence of role in database
  const role = await Role.findById(roleId);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found'
    });
  }

  // Assign role to user without wiping existing roadmaps
  req.user.roleId = role._id;
  await req.user.save();

  return res.status(200).json({
    success: true,
    message: 'Role selection updated',
    data: {
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        roleId: req.user.roleId.toString()
      }
    }
  });
};

/**
 * Update authenticated user's display name
 * PATCH /api/user/profile
 */
export const updateUserProfile = async (req, res) => {
  const { name } = req.body;

  req.user.name = name.trim();
  await req.user.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        roleId: req.user.roleId ? req.user.roleId.toString() : null
      }
    }
  });
};

/**
 * Update authenticated user's password
 * PATCH /api/user/password
 */
export const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Retrieve user with passwordHash
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password does not match'
    });
  }

  // Prevent reusing identical password
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password cannot be identical to current password'
    });
  }

  // Re-hash new password with 12 salt rounds
  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
};

/**
 * Permanently delete authenticated user and all associated data
 * DELETE /api/user
 */
export const deleteUserAccount = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password confirmation is required to delete account'
    });
  }

  // Verify password before destructive cascade delete
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password'
    });
  }

  // Cascade deletion of user data
  await Roadmap.deleteMany({ userId: req.user._id });
  await DiagnosticResult.deleteMany({ userId: req.user._id });
  await User.findByIdAndDelete(req.user._id);

  // Invalidate authentication session cookie
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0
  });

  return res.status(200).json({
    success: true,
    message: 'User account and all associated data deleted successfully'
  });
};

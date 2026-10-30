import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, getCookieOptions, COOKIE_NAME } from '../utils/jwt.js';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Register a new user account
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  // Check if account already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists'
    });
  }

  // Hash password using 12 salt rounds
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    roleId: null
  });

  // Generate authentication JWT
  const token = signToken({ id: user._id });

  // Attach token as httpOnly secure cookie
  res.cookie(COOKIE_NAME, token, getCookieOptions());

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roleId: user.roleId
      }
    }
  });
};

/**
 * Authenticate existing credentials
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  // Retrieve user with passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  // Generic rejection message to prevent user enumeration
  const invalidCredentialsResponse = () =>
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  if (!user) {
    return invalidCredentialsResponse();
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    return invalidCredentialsResponse();
  }

  // Generate authentication JWT
  const token = signToken({ id: user._id });

  // Attach token as httpOnly secure cookie
  res.cookie(COOKIE_NAME, token, getCookieOptions());

  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roleId: user.roleId
      }
    }
  });
};

/**
 * Invalidate session and clear auth cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Retrieve authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        roleId: req.user.roleId,
        createdAt: req.user.createdAt
      }
    }
  });
};

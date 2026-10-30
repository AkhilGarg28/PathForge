const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  setUserRole,
  updateProfile,
  updatePassword,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// All user routes are protected
router.use(authMiddleware);

// POST /api/user/role - select/switch target role
router.post('/role', setUserRole);

// PATCH /api/user/profile - update display name
router.patch('/profile', updateProfile);

// PATCH /api/user/password - change password
router.patch('/password', updatePassword);

// DELETE /api/user - delete account and associated data
router.delete('/', deleteAccount);

module.exports = router;

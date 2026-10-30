const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { setUserRole } = require('../controllers/roleController');

const router = express.Router();

// POST /api/user/role - protected
router.post('/role', authMiddleware, setUserRole);

module.exports = router;

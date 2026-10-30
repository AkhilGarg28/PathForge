const express = require('express');
const { getRoles } = require('../controllers/roleController');

const router = express.Router();

// GET /api/roles - public
router.get('/', getRoles);

module.exports = router;

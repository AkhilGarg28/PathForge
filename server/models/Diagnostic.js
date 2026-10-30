const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role ID is required'],
  },
  dimensionScores: {
    type: Map,
    of: {
      type: Number,
      min: [0, 'Dimension score must be at least 0'],
      max: [5, 'Dimension score cannot exceed 5'],
    },
    default: () => new Map(),
  },
  takenAt: {
    type: Date,
    default: Date.now,
  },
});

const Diagnostic = mongoose.model('Diagnostic', diagnosticSchema);

module.exports = Diagnostic;

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  dimensions: {
    type: [String],
    required: [true, 'Dimensions are required'],
    validate: {
      validator: function (val) {
        return Array.isArray(val) && val.length > 0;
      },
      message: 'At least one dimension is required',
    },
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;

const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');

const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().select('name description dimensions');
    return res.status(200).json({
      roles: roles.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        description: r.description,
        dimensions: r.dimensions,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const setUserRole = async (req, res, next) => {
  try {
    const { roleId } = req.body;

    if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role does not exist' });
    }

    // Update user target role
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { targetRole: role.name },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Archive current active roadmap if one exists
    await Roadmap.updateMany(
      { userId: req.user._id, isArchived: false },
      { isArchived: true }
    );

    return res.status(200).json({
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        targetRole: updatedUser.targetRole,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRoles,
  setUserRole,
};

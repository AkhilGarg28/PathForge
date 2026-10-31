const mongoose = require('mongoose');
const { User, Role, Diagnostic, Roadmap } = require('../models');

describe('Mongoose Models Unit Tests', () => {
  describe('User Model', () => {
    it('should fail validation when required fields are missing', async () => {
      const user = new User({});
      let err;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.passwordHash).toBeDefined();
    });

    it('should have unique, lowercase, and trimmed email schema options', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.unique).toBe(true);
      expect(emailPath.options.lowercase).toBe(true);
      expect(emailPath.options.trim).toBe(true);
    });

    it('should validate successfully with valid fields', async () => {
      const user = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        passwordHash: 'hashed_password_sample',
        targetRole: 'Full Stack Engineer',
      });
      const err = user.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('Role Model', () => {
    it('should fail validation when required fields are missing', () => {
      const role = new Role({});
      const err = role.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.dimensions).toBeDefined();
    });

    it('should reject empty dimensions array', () => {
      const role = new Role({
        name: 'Backend Dev',
        dimensions: [],
      });
      const err = role.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.dimensions).toBeDefined();
    });
  });

  describe('Diagnostic Model', () => {
    it('should fail validation when userId or roleId is missing', () => {
      const diagnostic = new Diagnostic({});
      const err = diagnostic.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.userId).toBeDefined();
      expect(err.errors.roleId).toBeDefined();
    });

    it('should reject dimension scores outside 0 to 5 range', () => {
      const diagnostic = new Diagnostic({
        userId: new mongoose.Types.ObjectId(),
        roleId: new mongoose.Types.ObjectId(),
        dimensionScores: {
          JavaScript: 6,
        },
      });
      const err = diagnostic.validateSync();
      expect(err).toBeDefined();
    });
  });

  describe('Roadmap Model', () => {
    it('should reject invalid module status', () => {
      const roadmap = new Roadmap({
        userId: new mongoose.Types.ObjectId(),
        roleId: new mongoose.Types.ObjectId(),
        modules: [
          {
            moduleId: 'mod-1',
            title: 'Intro',
            status: 'in-progress', // invalid enum (must be locked, active, or complete)
          },
        ],
      });
      const err = roadmap.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['modules.0.status']).toBeDefined();
    });

    it('should accept valid module statuses', () => {
      ['locked', 'active', 'complete'].forEach((status) => {
        const roadmap = new Roadmap({
          userId: new mongoose.Types.ObjectId(),
          roleId: new mongoose.Types.ObjectId(),
          modules: [
            {
              moduleId: 'mod-1',
              title: 'Module Title',
              status,
            },
          ],
        });
        const err = roadmap.validateSync();
        expect(err).toBeUndefined();
      });
    });

    it('should have compound index on userId and isArchived', () => {
      const indexes = Roadmap.schema.indexes();
      const hasCompoundIndex = indexes.some(
        ([fields]) => fields.userId === 1 && fields.isArchived === 1
      );
      expect(hasCompoundIndex).toBe(true);
    });
  });
});

const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../../data');

class QuestionService {
  constructor() {
    this.questions = [];
    this.checkpoints = [];
    this.resources = [];
    this.loadCache();
  }

  loadCache() {
    try {
      const questionsPath = path.join(dataDir, 'questions.json');
      const checkpointsPath = path.join(dataDir, 'checkpoints.json');
      const resourcesPath = path.join(dataDir, 'resources.json');

      if (fs.existsSync(questionsPath)) {
        this.questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
      }
      if (fs.existsSync(checkpointsPath)) {
        this.checkpoints = JSON.parse(fs.readFileSync(checkpointsPath, 'utf-8'));
      }
      if (fs.existsSync(resourcesPath)) {
        this.resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf-8'));
      }
    } catch (err) {
      console.error(`Failed to load question cache: ${err.message}`);
    }
  }

  getAllQuestions() {
    return this.questions;
  }

  getQuestionsByRole(roleName) {
    return this.questions.filter(
      (q) => q.roleName.toLowerCase() === roleName.toLowerCase()
    );
  }

  getQuestionsByDimension(roleName, dimension) {
    return this.questions.filter(
      (q) =>
        q.roleName.toLowerCase() === roleName.toLowerCase() &&
        q.dimension.toLowerCase() === dimension.toLowerCase()
    );
  }

  getQuestionById(id) {
    return this.questions.find((q) => q.id === id);
  }

  getAllCheckpoints() {
    return this.checkpoints;
  }

  getCheckpointsByRole(roleName) {
    return this.checkpoints.filter(
      (c) => c.roleName.toLowerCase() === roleName.toLowerCase()
    );
  }

  getCheckpointsByDimension(dimension) {
    return this.checkpoints.filter(
      (c) => c.dimension.toLowerCase() === dimension.toLowerCase()
    );
  }

  getResourcesByDimension(dimension, roleName) {
    return this.resources.filter((r) => {
      const matchDim = r.dimension.toLowerCase() === dimension.toLowerCase();
      if (!matchDim) return false;
      if (roleName && r.roleName) {
        return r.roleName.toLowerCase() === roleName.toLowerCase();
      }
      return true;
    });
  }

  getAllResources() {
    return this.resources;
  }

  reload() {
    this.loadCache();
  }
}

// Singleton instance cached in memory
const questionService = new QuestionService();

module.exports = questionService;

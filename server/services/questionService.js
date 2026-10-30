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

  getCheckpointsForModule(moduleObj, roleName) {
    if (!moduleObj) return [];

    const tags = Array.isArray(moduleObj.resourceTags) ? moduleObj.resourceTags : [];
    const title = (moduleObj.title || '').toLowerCase();
    const resources = Array.isArray(moduleObj.resources) ? moduleObj.resources : [];

    // Filter checkpoints by role if roleName provided
    let candidateCheckpoints = this.checkpoints;
    if (roleName) {
      const roleMatches = candidateCheckpoints.filter(
        (c) => c.roleName.toLowerCase() === roleName.toLowerCase()
      );
      if (roleMatches.length > 0) {
        candidateCheckpoints = roleMatches;
      }
    }

    // 1. Try matching tags against dimension
    for (const tag of tags) {
      const match = candidateCheckpoints.filter(
        (c) => c.dimension.toLowerCase() === tag.toLowerCase()
      );
      if (match.length > 0) return match;
    }

    // 2. Try matching resource dimensions
    for (const res of resources) {
      if (res.dimension) {
        const match = candidateCheckpoints.filter(
          (c) => c.dimension.toLowerCase() === res.dimension.toLowerCase()
        );
        if (match.length > 0) return match;
      }
    }

    // 3. Try matching title with dimension name
    for (const c of candidateCheckpoints) {
      if (title.includes(c.dimension.toLowerCase()) || c.dimension.toLowerCase().includes(title)) {
        return candidateCheckpoints.filter(
          (item) => item.dimension.toLowerCase() === c.dimension.toLowerCase()
        );
      }
    }

    return [];
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

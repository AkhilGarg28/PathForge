const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Role = require('../models/Role');
const { validateAllData } = require('./validateData');

const roleDescriptions = {
  'MERN Developer':
    'Full-stack JavaScript engineer specializing in MongoDB, Express, React, and Node.js to design, build, and deploy production-grade web applications.',
  'Data Analyst':
    'Analytics specialist focused on SQL, Python, data visualization, and statistical modeling to translate raw data into actionable business intelligence.',
};

const seedRoles = async () => {
  try {
    console.log('Validating data files...');
    const { questions, checkpoints, resources } = validateAllData();

    console.log('Connecting to database...');
    await connectDB();

    // Map roleName -> Set of dimensions
    const roleMap = new Map();

    const addDimensions = (items) => {
      items.forEach((item) => {
        if (!item.roleName || !item.dimension) return;
        if (!roleMap.has(item.roleName)) {
          roleMap.set(item.roleName, new Set());
        }
        roleMap.get(item.roleName).add(item.dimension);
      });
    };

    addDimensions(questions);
    addDimensions(checkpoints);
    addDimensions(resources);

    for (const [roleName, dimensionSet] of roleMap.entries()) {
      const dimensions = Array.from(dimensionSet);
      const description =
        roleDescriptions[roleName] ||
        `Curated learning roadmap for ${roleName} professionals.`;

      const updatedRole = await Role.findOneAndUpdate(
        { name: roleName },
        {
          name: roleName,
          description,
          dimensions,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(
        `✓ Upserted role: "${updatedRole.name}" with ${updatedRole.dimensions.length} dimensions`
      );
    }

    console.log('Role seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

if (require.main === module) {
  seedRoles();
}

module.exports = seedRoles;

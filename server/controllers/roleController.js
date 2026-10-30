import Role from '../models/Role.js';
import cache from '../utils/cache.js';

/**
 * Retrieve all career roles and their evaluated dimensions
 * GET /api/roles
 */
export const getRoles = async (req, res) => {
  // Check in-memory cache first
  const cachedRoles = cache.getRoles();
  if (cachedRoles) {
    return res.status(200).json({
      success: true,
      data: {
        roles: cachedRoles
      }
    });
  }

  // Use lean() and field selection for optimized query performance
  const roles = await Role.find({})
    .select('name slug description dimensions')
    .sort({ name: 1 })
    .lean();

  const formattedRoles = roles.map((role) => ({
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    description: role.description,
    dimensions: role.dimensions
  }));

  // Store in cache
  cache.setRoles(formattedRoles);

  return res.status(200).json({
    success: true,
    data: {
      roles: formattedRoles
    }
  });
};

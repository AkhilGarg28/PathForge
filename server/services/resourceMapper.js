/**
 * Resource Mapper Service
 * Deterministically binds verified educational resources from the resource library
 * to roadmap modules based on whitelisted tags.
 * Ensures max 3 unique resources per module, with fallback to the student's weakest dimension.
 */

/**
 * Normalizes a raw resource into the contract Resource shape: { title, url, type }.
 */
function toContractResource(r) {
  return {
    title: r.title,
    url: r.url,
    type: r.type
  };
}

/**
 * Maps resource tags on a single module to verified resources in the library.
 *
 * @param {Object} module - Single roadmap module
 * @param {Array<Object>} resourceLibrary - Curated resources list (from resources.json)
 * @param {string} [weakestDimension] - Identifier of the student's lowest-scoring dimension
 * @returns {Array<Object>} Array of up to 3 verified contract resources
 */
export function mapModuleResources(module, resourceLibrary = [], weakestDimension = '') {
  if (!Array.isArray(resourceLibrary) || resourceLibrary.length === 0) {
    return [];
  }

  const tags = Array.isArray(module?.resourceTags)
    ? module.resourceTags.map((t) => String(t).toLowerCase().trim())
    : [];

  const matchedResources = [];
  const seenUrls = new Set();

  // 1. Find matching resources matching the module's resourceTags
  for (const tag of tags) {
    for (const res of resourceLibrary) {
      if (res.tag && res.tag.toLowerCase().trim() === tag) {
        if (!seenUrls.has(res.url)) {
          seenUrls.add(res.url);
          matchedResources.push(toContractResource(res));
          if (matchedResources.length >= 3) break;
        }
      }
    }
    if (matchedResources.length >= 3) break;
  }

  // 2. Fallback: If no tags matched, retrieve top resources from the weakest dimension
  if (matchedResources.length === 0 && weakestDimension) {
    const dimNormalized = String(weakestDimension).toLowerCase().trim();
    for (const res of resourceLibrary) {
      if (res.dimension && res.dimension.toLowerCase().trim() === dimNormalized) {
        if (!seenUrls.has(res.url)) {
          seenUrls.add(res.url);
          matchedResources.push(toContractResource(res));
          if (matchedResources.length >= 3) break;
        }
      }
    }
  }

  // 3. Fallback: If still empty, supply the first available library resources
  if (matchedResources.length === 0) {
    for (const res of resourceLibrary) {
      if (!seenUrls.has(res.url)) {
        seenUrls.add(res.url);
        matchedResources.push(toContractResource(res));
        if (matchedResources.length >= 3) break;
      }
    }
  }

  return matchedResources.slice(0, 3);
}

/**
 * Maps resources across an entire roadmap array of modules.
 *
 * @param {Array<Object>} modules - Array of validated roadmap modules
 * @param {Array<Object>} resourceLibrary - List of curated resources
 * @param {string} [weakestDimension=''] - Student's weakest dimension
 * @returns {Array<Object>} Modules with resources attached
 */
export function mapRoadmapResources(modules = [], resourceLibrary = [], weakestDimension = '') {
  if (!Array.isArray(modules)) return [];

  return modules.map((mod) => ({
    ...mod,
    resources: mapModuleResources(mod, resourceLibrary, weakestDimension)
  }));
}

export default {
  mapModuleResources,
  mapRoadmapResources
};

/**
 * PathForge Utility Helpers & Formatters
 */

export function capitalize(str = '') {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDimension(dimension = '') {
  return dimension.split('-').map(capitalize).join(' & ');
}

export function formatHours(hours = 0) {
  return `${hours} hr${hours === 1 ? '' : 's'}`;
}

export function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

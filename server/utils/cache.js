/**
 * In-memory cache for static/semi-static data (Roles and Diagnostic Question Banks)
 * Eliminates redundant database roundtrips for frequent reads.
 * Automatically invalidated when seedDatabase runs.
 */

class MemoryCache {
  constructor() {
    this.roles = null;
    this.diagnostics = new Map();
  }

  getRoles() {
    return this.roles;
  }

  setRoles(roles) {
    this.roles = roles;
  }

  getDiagnostic(roleId) {
    return this.diagnostics.get(roleId) || null;
  }

  setDiagnostic(roleId, data) {
    this.diagnostics.set(roleId, data);
  }

  clear() {
    this.roles = null;
    this.diagnostics.clear();
  }
}

export const cache = new MemoryCache();
export default cache;

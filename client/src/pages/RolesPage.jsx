import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { user, updateUserState } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/roles');
      const loadedRoles = response.data?.roles || [];
      setRoles(loadedRoles);

      // Pre-select if user already has a target role
      if (user?.targetRole) {
        const matchingRole = loadedRoles.find((r) => r.name === user.targetRole);
        if (matchingRole) {
          setSelectedRoleId(matchingRole.id);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load roles. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user?.targetRole]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = roles.filter((role) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = role.name?.toLowerCase().includes(query);
    const descMatch = role.description?.toLowerCase().includes(query);
    const dimMatch = role.dimensions?.some((dim) => dim.toLowerCase().includes(query));
    return nameMatch || descMatch || dimMatch;
  });

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const handleContinue = async () => {
    if (!selectedRoleId || submitting) return;

    if (!user) {
      addToast('Please log in or create an account to choose your role.', 'info');
      navigate('/login', { state: { from: '/roles' } });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/user/role', { roleId: selectedRoleId });
      if (response.data && response.data.user) {
        updateUserState(response.data.user);
      }
      addToast(`Selected role: ${selectedRole?.name || 'Target Role'}`, 'success');
      navigate('/diagnostic', { state: { roleId: selectedRoleId } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to set target role. Please try again.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container roles-page">
      <div className="page-header">
        <h1 className="page-title">Choose Your Target Career Role</h1>
        <p className="page-subtitle">
          Select a technical role to assess your baseline competency across its core skill dimensions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="roles-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="form-input search-input"
            placeholder="Search roles by title, description or skill dimension (e.g. React, SQL, MERN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search roles"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="page-center-container" style={{ minHeight: '300px' }}>
          <Spinner size="lg" label="Loading available career roles..." />
        </div>
      )}

      {/* Error State with Retry Button */}
      {!loading && error && (
        <div style={{ maxWidth: '600px', margin: '32px auto' }}>
          <ErrorMessage
            message={error}
            onRetry={fetchRoles}
          />
        </div>
      )}

      {/* Empty States */}
      {!loading && !error && roles.length === 0 && (
        <div className="empty-state-card text-center">
          <h3>No roles available</h3>
          <p>Please check back later or seed roles into the system.</p>
          <Button variant="secondary" onClick={fetchRoles} style={{ marginTop: '16px' }}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && roles.length > 0 && filteredRoles.length === 0 && (
        <div className="empty-state-card text-center">
          <h3>No roles match "{searchQuery}"</h3>
          <p>Try searching for a different keyword or reset your filter.</p>
          <Button variant="secondary" onClick={() => setSearchQuery('')} style={{ marginTop: '16px' }}>
            Clear Search Filter
          </Button>
        </div>
      )}

      {/* Searchable Grid of Role Cards */}
      {!loading && !error && filteredRoles.length > 0 && (
        <div className="roles-grid">
          {filteredRoles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <div
                key={role.id}
                className={`role-selection-card ${isSelected ? 'role-card-selected' : ''}`}
                onClick={() => setSelectedRoleId(role.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRoleId(role.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                <div className="role-card-header">
                  <div className="role-card-titles">
                    <h2 className="role-name">{role.name}</h2>
                    <span className="dimension-count-badge">
                      {role.dimensions?.length || 0} Dimensions
                    </span>
                  </div>
                  <div className={`selection-radio-circle ${isSelected ? 'selected' : ''}`}>
                    {isSelected && <span className="selection-check">✓</span>}
                  </div>
                </div>

                <p className="role-description">{role.description}</p>

                <div className="role-dimensions-section">
                  <span className="dimensions-label">Core Dimensions:</span>
                  <div className="dimension-chips-wrapper">
                    {role.dimensions?.map((dim, idx) => (
                      <span key={idx} className="dimension-chip">
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating / Bottom Action Bar */}
      {!loading && !error && roles.length > 0 && (
        <div className="roles-action-bar">
          <div className="roles-action-content">
            <div className="selected-role-info">
              {selectedRole ? (
                <span>
                  Selected: <strong>{selectedRole.name}</strong>
                </span>
              ) : (
                <span className="unselected-prompt">
                  Please click on a role card to select it.
                </span>
              )}
            </div>
            <Button
              variant="primary"
              disabled={!selectedRoleId || submitting}
              loading={submitting}
              onClick={handleContinue}
              className="btn-continue-roles"
            >
              Continue to Diagnostic &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;

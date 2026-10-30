import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

export function RoleSelectionPage() {
  usePageTitle('Select Career Role');
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRoles();
      const rolesList = res?.data?.roles || [];
      setRoles(rolesList);
      if (user?.roleId) {
        setSelectedRoleId(user.roleId);
      } else if (rolesList.length > 0) {
        setSelectedRoleId(rolesList[0]._id || rolesList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load career roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleKeyDownCard = (e, roleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedRoleId(roleId);
    }
  };

  const handleConfirmRole = async () => {
    if (!selectedRoleId) {
      toast.warning('Please select a career role to continue');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.setUserRole({ roleId: selectedRoleId });
      if (res?.data?.user) {
        setUser(res.data.user);
      }
      toast.success('Career path confirmed! Initializing diagnostic assessment...');
      navigate('/diagnostic');
    } catch (err) {
      toast.error(err.message || 'Failed to assign career role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout maxWidth="860px">
      <div style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-primary-700)',
              backgroundColor: 'var(--color-primary-50)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-primary-200)'
            }}
          >
            Step 1 of 3: Target Role
          </span>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              marginTop: 'var(--space-1)',
              marginBottom: 'var(--space-1)'
            }}
          >
            Choose Your Career Trajectory
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '580px', margin: '0 auto' }}>
            Select the technical role you want to prepare for. PathForge will assess your baseline
            skills across 4 key dimensions and generate an adaptive curriculum.
          </p>
        </div>

        {/* Skeleton Loading State */}
        {loading ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
              }}
            >
              {[1, 2].map((i) => (
                <Card
                  key={i}
                  style={{
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Skeleton variant="text" width="55%" height="1.5rem" />
                    <Skeleton variant="circle" width="20px" height="20px" />
                  </div>
                  <Skeleton variant="rect" width="100%" height="48px" />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height="0.875rem"
                    style={{ marginTop: 'var(--space-2)' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Skeleton variant="text" width="80px" height="24px" />
                    <Skeleton variant="text" width="70px" height="24px" />
                    <Skeleton variant="text" width="90px" height="24px" />
                    <Skeleton variant="text" width="75px" height="24px" />
                  </div>
                </Card>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Skeleton variant="rect" width="240px" height="44px" />
            </div>
          </div>
        ) : error ? (
          /* Error State with Retry */
          <ErrorState title="Failed to Load Career Roles" message={error} onRetry={fetchRoles} />
        ) : roles.length === 0 ? (
          /* Empty Database State */
          <EmptyState
            title="No Career Roles Available"
            description="No roles are currently configured in the database. Please check back later."
          />
        ) : (
          /* Role Cards Grid */
          <div>
            <div
              role="radiogroup"
              aria-label="Target Career Roles"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
              }}
            >
              {roles.map((role) => {
                const roleId = role._id || role.id;
                const isSelected = selectedRoleId === roleId;

                return (
                  <div
                    key={roleId}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={role.name}
                    tabIndex={0}
                    onClick={() => setSelectedRoleId(roleId)}
                    onKeyDown={(e) => handleKeyDownCard(e, roleId)}
                    style={{
                      border: isSelected
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isSelected
                        ? 'var(--color-primary-50)'
                        : 'var(--color-surface)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '260px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 'var(--space-1)'
                        }}
                      >
                        <h2
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: 'var(--color-neutral-900)'
                          }}
                        >
                          {role.name}
                        </h2>

                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected
                              ? '6px solid var(--color-primary)'
                              : '2px solid var(--color-neutral-300)',
                            backgroundColor: 'var(--color-surface)',
                            transition: 'border 0.15s ease'
                          }}
                        />
                      </div>

                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-body)',
                          marginBottom: 'var(--space-3)',
                          lineHeight: 1.5
                        }}
                      >
                        {role.description}
                      </p>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--color-text-muted)',
                          display: 'block',
                          marginBottom: 'var(--space-1)'
                        }}
                      >
                        Evaluated Skill Dimensions
                      </span>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(role.dimensions || []).map((dim) => {
                          const dimId = typeof dim === 'object' ? dim.id || dim.name : dim;
                          const dimName = typeof dim === 'object' ? dim.name || dim.id : dim;

                          return (
                            <span
                              key={dimId}
                              style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isSelected
                                  ? 'var(--color-primary-100)'
                                  : 'var(--color-surface-subtle)',
                                color: isSelected
                                  ? 'var(--color-primary-900)'
                                  : 'var(--color-neutral-700)',
                                fontWeight: 600,
                                border: `1px solid ${
                                  isSelected ? 'var(--color-primary-200)' : 'var(--color-border)'
                                }`
                              }}
                            >
                              {dimName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <Button
                variant="primary"
                size="lg"
                loading={submitting}
                onClick={handleConfirmRole}
                disabled={!selectedRoleId || submitting}
              >
                Confirm & Continue to Diagnostic →
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RoleSelectionPage;

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Button from './Button';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'info');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">PathForge</span>
        </Link>

        <nav className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/roles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Roles
          </NavLink>
          {user && (
            <>
              <NavLink to="/diagnostic" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Diagnostic
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Settings
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar-auth">
          {loading ? (
            <span className="user-welcome">Checking session...</span>
          ) : user ? (
            <div className="user-profile-summary">
              <span className="user-welcome">
                Hello, <strong>{user.name}</strong>
              </span>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="btn-logout nav-btn"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary nav-btn">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary nav-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

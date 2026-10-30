import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from './Button.jsx';
import './Navbar.css';

/**
 * Main application navigation bar.
 * Adapts dynamically between authenticated and guest views with mobile drawer support.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  // Close mobile menu on Escape key and on window resize > 768px
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="pf-navbar">
      <div className="pf-navbar__container">
        {/* Brand */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="pf-navbar__brand"
          onClick={closeMenu}
        >
          <span className="pf-navbar__brand-logo" aria-hidden="true">
            ⚡
          </span>
          <span>PathForge</span>
        </Link>

        {/* Desktop Links */}
        <nav className="pf-navbar__links-desktop" aria-label="Main Navigation">
          <Link to="/styleguide" className="pf-navbar__link">
            Styleguide
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="pf-navbar__link">
                Dashboard
              </Link>
              <Link to="/settings" className="pf-navbar__link">
                Settings
              </Link>
              <span className="pf-navbar__user-tag" title={user.email}>
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="pf-navbar__link">
                Log in
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          ref={hamburgerRef}
          type="button"
          className="pf-navbar__hamburger"
          aria-expanded={mobileMenuOpen}
          aria-controls="pf-navbar-mobile-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span aria-hidden="true">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        id="pf-navbar-mobile-menu"
        role="region"
        aria-label="Mobile Navigation"
        className={`pf-navbar__mobile-menu ${mobileMenuOpen ? 'pf-navbar__mobile-menu--open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <Link to="/styleguide" className="pf-navbar__link" onClick={closeMenu}>
          Styleguide
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" className="pf-navbar__link" onClick={closeMenu}>
              Dashboard
            </Link>
            <Link to="/settings" className="pf-navbar__link" onClick={closeMenu}>
              Settings
            </Link>
            <div style={{ padding: 'var(--space-1) 0' }}>
              <Button
                variant="ghost"
                size="md"
                onClick={handleLogout}
                style={{ width: '100%' }}
              >
                Log out ({user.name})
              </Button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="pf-navbar__link" onClick={closeMenu}>
              Log in
            </Link>
            <Link to="/signup" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md" style={{ width: '100%' }}>
                Get started
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

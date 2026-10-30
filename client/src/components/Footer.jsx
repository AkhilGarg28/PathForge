import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Standard global footer.
 */
export default function Footer() {
  return (
    <footer className="pf-footer">
      <div className="pf-footer__container">
        <div>
          <span className="pf-footer__brand">PathForge</span> — AI-Powered Skill Roadmaps
          for Employability
        </div>

        <div className="pf-footer__links">
          <span>&copy; {CURRENT_YEAR} PathForge</span>
          <span aria-hidden="true">•</span>
          <a href="#privacy" className="pf-footer__link">
            Privacy
          </a>
          <span aria-hidden="true">•</span>
          <a href="#terms" className="pf-footer__link">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

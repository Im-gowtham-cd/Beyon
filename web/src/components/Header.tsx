import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && (mobileOpen || menuOpen)) {
        setMobileOpen(false);
        setMenuOpen(false);
        document.body.style.overflow = '';
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [mobileOpen, menuOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  }

  function toggleMenu() {
    setMobileOpen(prev => {
      const next = !prev;
      document.body.style.overflow = next ? 'hidden' : '';
      return next;
    });
  }

  function closeMobile() {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }

  const dashboardPath = user ? `/${user.role.toLowerCase()}/home` : '/';

  const publicLinks = [
    { label: 'Home', href: '/' },
    { label: 'Practice', href: '/practice' },
    { label: 'Skills', href: '/student/skills' },
    { label: 'Assessment', href: '/assessment' },
    { label: 'Opportunities', href: '/opportunities' },
  ];

  const studentLinks = [
    { label: 'Dashboard', href: '/student/home' },
    { label: 'Practice', href: '/practice' },
    { label: 'Skills', href: '/student/skills' },
    { label: 'Challenges', href: '/daily-challenge' },
    { label: 'Opportunities', href: '/opportunities' },
  ];

  const companyLinks = [
    { label: 'Dashboard', href: '/company/home' },
    { label: 'Assessments', href: '/company/assessments' },
    { label: 'Drives', href: '/drives' },
    { label: 'Candidates', href: '/candidates' },
  ];

  const institutionLinks = [
    { label: 'Dashboard', href: '/institution/home' },
    { label: 'Analytics', href: '/institution/analytics' },
    { label: 'Students', href: '/institution/dashboard' },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/home' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Feedback', href: '/admin/feedback' },
  ];

  const navLinks = !authenticated
    ? publicLinks
    : user?.role === 'STUDENT'
    ? studentLinks
    : user?.role === 'COMPANY'
    ? companyLinks
    : user?.role === 'INSTITUTION'
    ? institutionLinks
    : user?.role === 'ADMIN'
    ? adminLinks
    : publicLinks;

  return (
    <header className={styles.appNavbar}>
      {/* Utility Bar */}
      <div className={styles.utilityBar}>
        <span className={styles.utilityInstitution}>
          <i className="bx bx-chip" /> HPC COE — High Performance Computing for Innovative Intelligent Solutions
        </span>
        <span className={styles.utilityLinks}>
          <a href="mailto:support@hpc.edu.in" aria-label="Email Support">
            <i className="bx bx-envelope" /> support@hpc.edu.in
          </a>
          <span className={styles.utilityDivider}>|</span>
          <Link to="/verify">
            <i className="bx bx-badge-check" /> Verify Credentials
          </Link>
        </span>
      </div>

      {/* Main Bar */}
      <div className={styles.mainBar}>
        <Link to="/" className={styles.navTitle} onClick={closeMobile}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandText}>HPC COE</span>
          <span className={styles.brandSub}>Centre of Excellence</span>
        </Link>

        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <span /><span /><span />
        </button>

        <div
          className={`${styles.navOverlay} ${mobileOpen ? styles.active : ''}`}
          onClick={closeMobile}
        />

        <nav
          className={`${styles.navLinks} ${mobileOpen ? styles.active : ''}`}
          id="mobile-nav"
          aria-label="Primary"
        >
          <span className={styles.navPrimaryLinks}>
            {navLinks.map(item => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
                end={item.href === '/' || item.href === dashboardPath}
                onClick={closeMobile}
              >
                {item.label}
              </NavLink>
            ))}
          </span>

          <span className={styles.navActions}>
            {authenticated ? (
              <>
                <Link
                  to="/notifications"
                  className={styles.iconBtn}
                  aria-label="Notifications"
                  onClick={closeMobile}
                >
                  <i className="bx bx-bell" />
                </Link>

                <div className={styles.menuContainer} ref={menuRef}>
                  <button
                    type="button"
                    className={styles.avatarBtn}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                  >
                    <span className={styles.avatar}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    <span className={styles.userName}>{user?.name}</span>
                    <i className="bx bx-chevron-down" />
                  </button>

                  {menuOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownName}>{user?.name}</span>
                        <span className={styles.dropdownRole}>{user?.role}</span>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link
                        to="/student/profile"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="bx bx-user" /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="bx bx-cog" /> Settings
                      </Link>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={handleLogout}
                      >
                        <i className="bx bx-log-out" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn} onClick={closeMobile}>
                  Sign In
                </Link>
                <Link to="/register" className={styles.registerBtn} onClick={closeMobile}>
                  <i className="bx bx-rocket" /> Get Started
                </Link>
              </>
            )}
          </span>
        </nav>
      </div>
    </header>
  );
}

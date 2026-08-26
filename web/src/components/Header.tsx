import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();
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
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        document.body.style.overflow = '';
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [mobileOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  }

  function toggleMenu() {
    setMobileOpen(!mobileOpen);
    document.body.style.overflow = !mobileOpen ? 'hidden' : '';
  }

  function closeMobile() {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }

  const dashboardPath = user ? `/${user.role.toLowerCase()}/home` : '/';

  const studentLinks = [
    { label: 'Practice', href: '/practice' },
    { label: 'Skills', href: '/student/skills' },
    { label: 'Challenges', href: '/daily-challenge' },
    { label: 'Opportunities', href: '/opportunities' },
  ];

  const companyLinks = [
    { label: 'Dashboard', href: '/company/home' },
    { label: 'Assessments', href: '/company/assessments' },
    { label: 'Drives', href: '/drives' },
  ];

  const institutionLinks = [
    { label: 'Dashboard', href: '/institution/home' },
    { label: 'Analytics', href: '/institution/analytics' },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/home' },
    { label: 'Reports', href: '/admin/reports' },
  ];

  const navLinks = user?.role === 'STUDENT' ? studentLinks
    : user?.role === 'COMPANY' ? companyLinks
    : user?.role === 'INSTITUTION' ? institutionLinks
    : user?.role === 'ADMIN' ? adminLinks
    : [];

  return (
    <header className={styles.header}>
      {/* Utility Bar */}
      <div className={styles.utilityBar}>
        <span className={styles.utilityInstitution}>
          <i className="bx bx-rocket" /> Beyon — AI Skill Development Platform
        </span>
        <span className={styles.utilityLinks}>
          <Link to="/login">
            <i className="bx bx-log-in" /> Sign In
          </Link>
          <Link to="/register">
            <i className="bx bx-user-plus" /> Get Started
          </Link>
        </span>
      </div>

      {/* Main Bar */}
      <div className={styles.mainBar}>
        <Link to="/" className={styles.brandMark}>
          <span className={styles.brandAccent} />
          <span className={styles.brandText}>Beyon</span>
          <span className={styles.brandSub}>AI Skill Platform</span>
        </Link>

        {/* Mobile Hamburger */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>

        {/* Overlay */}
        <div
          className={`${styles.overlay} ${mobileOpen ? styles.active : ''}`}
          onClick={closeMobile}
        />

        {/* Nav Links */}
        <nav className={`${styles.navLinks} ${mobileOpen ? styles.active : ''}`}>
          {authenticated ? (
            <>
              <span className={styles.navPrimary}>
                <Link to={dashboardPath} className={styles.navLink}>Dashboard</Link>
                {navLinks.map(item => (
                  <Link key={item.href} to={item.href} className={styles.navLink} onClick={closeMobile}>
                    {item.label}
                  </Link>
                ))}
              </span>
              <span className={styles.navActions}>
                <Link to="/notifications" className={styles.navLink}>
                  <i className="bx bx-bell" />
                </Link>
                <div className={styles.menuContainer} ref={menuRef}>
                  <button className={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                    <span className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</span>
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
                      <Link to="/settings" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <i className="bx bx-cog" /> Settings
                      </Link>
                      <Link to="/student/profile" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <i className="bx bx-user" /> Profile
                      </Link>
                      <button className={styles.dropdownItem} onClick={handleLogout}>
                        <i className="bx bx-log-out" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </span>
            </>
          ) : (
            <>
              <span className={styles.navPrimary}>
                <Link to="/" className={styles.navLink}>Home</Link>
                <Link to="/login" className={styles.navLink}>Sign In</Link>
              </span>
              <span className={styles.navActions}>
                <Link to="/register" className={styles.registerBtn}>
                  <i className="bx bx-rocket" /> Get Started
                </Link>
              </span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

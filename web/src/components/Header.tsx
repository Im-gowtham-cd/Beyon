import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
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

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/login');
  }

  const dashboardPath = user ? `/${user.role.toLowerCase()}/home` : '/';

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>B</span>
        <span className={styles.logoText}>Beyon</span>
      </Link>
      <nav className={styles.nav}>
        {authenticated ? (
          <>
            <Link to={dashboardPath} className={styles.navLink}>Dashboard</Link>
            {user?.role === 'STUDENT' && <Link to="/student/profile" className={styles.navLink}>Profile</Link>}
            {user?.role === 'STUDENT' && <Link to="/student/skills" className={styles.navLink}>Skills</Link>}
            <div className={styles.menuContainer} ref={menuRef}>
              <button className={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</span>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.chevron}>▾</span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user?.name}</span>
                    <span className={styles.dropdownRole}>{user?.role}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/settings" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>Settings</Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>Sign in</Link>
            <Link to="/register" className={styles.registerBtn}>Get started</Link>
          </>
        )}
      </nav>
    </header>
  );
}

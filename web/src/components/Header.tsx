import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
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
            <span className={styles.userName}>{user?.name}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>Sign out</button>
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

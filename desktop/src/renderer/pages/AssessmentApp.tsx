import { useState, useEffect } from 'react';
import styles from './AssessmentApp.module.css';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  interface Window {
    beyon?: {
      platform: string;
      auth?: {
        getToken: () => Promise<string | null>;
        setToken: (token: string) => Promise<void>;
        clearToken: () => Promise<void>;
      };
    };
  }
}

export function AssessmentApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await window.beyon?.auth?.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:8080/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setUser(json.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <p className={styles.placeholder}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.logo}>B</span>
          <h1 className={styles.title}>Beyon Assessment</h1>
        </header>
        <main className={styles.main}>
          <p className={styles.placeholder}>Please sign in through the web app to access assessments.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>B</span>
        <h1 className={styles.title}>Beyon Assessment</h1>
      </header>
      <main className={styles.main}>
        <p className={styles.placeholder}>
          Welcome, {user.name}. Assessment environment — ready for future phases.
        </p>
      </main>
    </div>
  );
}

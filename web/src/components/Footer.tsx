import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  const brand = {
    heading: 'Beyon',
    description:
      'AI-powered skill development, adaptive learning, proctored assessments, and intelligent candidate matching connecting students, institutions, and enterprise recruitment.',
  };

  const social = [
    {
      icon: 'bxl-linkedin',
      label: 'LinkedIn',
      href: '#',
    },
    {
      icon: 'bxl-twitter',
      label: 'Twitter',
      href: '#',
    },
    {
      icon: 'bxl-github',
      label: 'GitHub',
      href: '#',
    },
    {
      icon: 'bx-globe',
      label: 'Website',
      href: '/',
    },
  ];

  const quickLinks = [
    { text: 'Home', href: '/' },
    { text: 'Skill Explorer', href: '/student/skills' },
    { text: 'Practice Arena', href: '/practice' },
    { text: 'Assessments', href: '/assessment' },
    { text: 'Career Opportunities', href: '/opportunities' },
  ];

  const portals = [
    { text: 'Student Dashboard', href: '/student/home' },
    { text: 'Institution Analytics', href: '/institution/home' },
    { text: 'Company Assessment Hub', href: '/company/home' },
    { text: 'Credential Verification', href: '/verify' },
  ];

  const resources = [
    { text: 'Skill Taxonomy', href: '/skill-taxonomy' },
    { text: 'Career Roadmap', href: '/career-roadmap' },
    { text: 'Privacy & Security', href: '/settings/privacy' },
    { text: 'System Diagnostics', href: '#' },
  ];

  const bottomLinks = [
    { text: 'Privacy Policy', href: '#' },
    { text: 'Terms of Service', href: '#' },
    { text: 'Security Compliance', href: '#' },
  ];

  return (
    <footer className={styles.appFooter}>
      <div className={styles.footerTop}>
        {/* Brand */}
        <div className={styles.footerBrand}>
          <h2>{brand.heading}</h2>
          <p>{brand.description}</p>
          <div className={styles.footerSocial}>
            {social.map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={`bx ${s.icon}`} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.footerCol}>
          <h3>Platform</h3>
          <ul>
            {quickLinks.map(link => (
              <li key={link.text}>
                <Link to={link.href}>
                  <i className="bx bx-chevron-right" />
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Portals */}
        <div className={styles.footerCol}>
          <h3>Portals</h3>
          <ul>
            {portals.map(link => (
              <li key={link.text}>
                <Link to={link.href}>
                  <i className="bx bx-chevron-right" />
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div className={styles.footerCol}>
          <h3>Resources</h3>
          <ul>
            {resources.map(link => (
              <li key={link.text}>
                <Link to={link.href}>
                  <i className="bx bx-chevron-right" />
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>&copy; 2026 Beyon. All rights reserved.</span>
        <div className={styles.footerBottomLinks}>
          {bottomLinks.map(link => (
            <a key={link.text} href={link.href}>
              {link.text}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

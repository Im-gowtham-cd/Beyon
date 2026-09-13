import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  MapPin,
  XCircle,
  Check,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import { CompanyVerificationDiagnosticCard } from '../../components/company/CompanyVerificationDiagnosticCard';
import styles from './AdminHome.module.css';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [dashRes, verifRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard/companies', { headers }).catch(() => null),
        fetch('/api/v1/admin/verifications/companies/verifications', { headers }).catch(() => null),
      ]);

      let dashboardList: any[] = [];
      let verifList: any[] = [];

      if (dashRes && dashRes.ok) {
        const d = await dashRes.json();
        dashboardList = Array.isArray(d.data) ? d.data : [];
      }
      if (verifRes && verifRes.ok) {
        const v = await verifRes.json();
        verifList = Array.isArray(v.data) ? v.data : [];
      }

      const verifMap = new Map<string, any>();
      for (const v of verifList) {
        if (v.userId) verifMap.set(v.userId, v);
      }

      const merged: any[] = dashboardList.map((comp) => {
        const v = verifMap.get(comp.userId) || {};
        const overallStatus = v.overallStatus || comp.status || 'PENDING';
        return {
          ...comp,
          ...v,
          id: comp.id || v.id,
          userId: comp.userId || v.userId,
          name: v.legalName || comp.name || 'Enterprise Employer',
          legalName: v.legalName || comp.name || 'Enterprise Employer',
          cin: v.cin || comp.cin || '',
          industry: comp.industry || 'Technology & Software',
          companyStatus: v.companyStatus || 'Active',
          status: overallStatus,
          overallStatus,
          isVerified: overallStatus === 'VERIFIED' || comp.status === 'ACTIVE',
          checks: v.checks || [],
          documents: v.documents || [],
          website: v.website || comp.website || '',
          websiteDomain: v.websiteDomain || '',
          corporateEmail: v.corporateEmail || comp.email || '',
          emailDomain: v.emailDomain || '',
          representativeName: v.representativeName || comp.representativeName || '',
          representativeDesignation: v.representativeDesignation || comp.designation || '',
          representativePhone: v.representativePhone || comp.phone || '',
          failureReasons: v.failureReasons,
        };
      });

      for (const v of verifList) {
        if (!merged.some((m) => m.userId === v.userId)) {
          const overallStatus = v.overallStatus || 'PENDING';
          merged.push({
            id: v.id,
            userId: v.userId,
            name: v.legalName || 'Enterprise Employer',
            legalName: v.legalName || 'Enterprise Employer',
            cin: v.cin || '',
            industry: 'Technology & Software',
            companyStatus: v.companyStatus || 'Active',
            status: overallStatus,
            overallStatus,
            isVerified: overallStatus === 'VERIFIED',
            checks: v.checks || [],
            documents: v.documents || [],
            website: v.website || '',
            websiteDomain: v.websiteDomain || '',
            corporateEmail: v.corporateEmail || '',
            emailDomain: v.emailDomain || '',
            representativeName: v.representativeName || '',
            representativeDesignation: v.representativeDesignation || '',
            representativePhone: v.representativePhone || '',
            failureReasons: v.failureReasons,
          });
        }
      }

      // Deduplicate companies by CIN (or lowercase name if CIN is empty)
      const deduplicatedMap = new Map<string, any>();
      for (const comp of merged) {
        const rawKey = comp.cin ? comp.cin.trim().toUpperCase() : (comp.name || comp.legalName || '').trim().toLowerCase();
        const key = rawKey || comp.userId || comp.id;
        if (!deduplicatedMap.has(key)) {
          deduplicatedMap.set(key, comp);
        } else {
          // Keep entry with highest status precedence: ACTIVE/VERIFIED > PENDING_SUPER_ADMIN > PENDING > REJECTED
          const existing = deduplicatedMap.get(key)!;
          const getRank = (c: any) => {
            const s = (c.status || c.overallStatus || '').toUpperCase();
            if (s === 'ACTIVE' || s === 'VERIFIED') return 4;
            if (s.includes('SUPER_ADMIN')) return 3;
            if (s.includes('PENDING')) return 2;
            return 1;
          };
          if (getRank(comp) > getRank(existing)) {
            deduplicatedMap.set(key, comp);
          }
        }
      }

      setCompanies(Array.from(deduplicatedMap.values()));
    } catch {

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleApprove = async (userId: string, name: string) => {
    if (!userId) return;
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/admin/verifications/company/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notes: 'Verified corporate employer credentials and authorized campus drives by Super Admin' }),
      });
      if (res.ok) {
        setMsg({ text: `Corporate partner "${name}" has been authorized and activated.` });
        await fetchCompanies();
      } else {
        setMsg({ text: `Failed to authorize "${name}".`, isError: true });
      }
    } catch {
      setMsg({ text: `Network error while approving "${name}".`, isError: true });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  const handleRequestDocs = async (userId: string, name: string) => {
    if (!userId) return;
    const notes = window.prompt(
      `Enter document request instructions for ${name}:`,
      'Please upload Certificate of Incorporation and Board Authorization Letter to verify official corporate authority.'
    );
    if (!notes) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/admin/verifications/company/${userId}/request-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setMsg({ text: `Document request sent to corporate contact at "${name}".` });
        await fetchCompanies();
      } else {
        setMsg({ text: `Failed to request documents from "${name}".`, isError: true });
      }
    } catch {
      setMsg({ text: `Network error while requesting documents.`, isError: true });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!userId) return;
    const reason = window.prompt(
      `Enter rejection reason for ${name}:`,
      'Corporate credentials and domain ownership did not satisfy verification criteria'
    );
    if (reason === null) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/admin/verifications/company/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setMsg({ text: `Corporate registration for "${name}" has been rejected.` });
        await fetchCompanies();
      } else {
        setMsg({ text: `Failed to reject "${name}".`, isError: true });
      }
    } catch {
      setMsg({ text: `Network error while rejecting "${name}".`, isError: true });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  const handleSuspend = async (userId: string, name: string) => {
    if (!userId) return;
    const reason = window.prompt(`Enter suspension reason for ${name}:`, 'Account suspended due to verification policy review.');
    if (!reason) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/admin/verifications/company/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setMsg({ text: `Corporate partner "${name}" has been suspended.` });
        await fetchCompanies();
      } else {
        setMsg({ text: `Failed to suspend "${name}".`, isError: true });
      }
    } catch {
      setMsg({ text: `Network error while suspending "${name}".`, isError: true });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  const toggleRow = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  const pendingCount = companies.filter(
    (c) =>
      c.status === 'PENDING_SUPER_ADMIN_APPROVAL' ||
      c.status === 'PENDING_SUPER_ADMIN_VERIFICATION' ||
      c.status === 'PENDING_VERIFICATION' ||
      c.status === 'PENDING' ||
      c.status === 'MANUAL_REVIEW' ||
      c.status === 'DOMAIN_MISMATCH' ||
      c.status === 'PUBLIC_EMAIL' ||
      c.status === 'CIN_INVALID' ||
      c.status === 'CIN_NOT_FOUND' ||
      c.status === 'MANUAL_REVIEW_DOCS_REQUESTED'
  ).length;

  const filtered = companies.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const ind = (c.industry || '').toLowerCase();
    const cin = (c.cin || '').toLowerCase();
    const email = (c.corporateEmail || c.email || '').toLowerCase();
    const status = (c.status || '').toUpperCase();
    const s = search.toLowerCase();
    const matchesSearch = !search || name.includes(s) || ind.includes(s) || cin.includes(s) || email.includes(s);

    if (!matchesSearch) return false;
    if (tab === 'PENDING') {
      return (
        status.includes('PENDING') ||
        status.includes('MANUAL_REVIEW') ||
        status.includes('MISMATCH') ||
        status.includes('PUBLIC_EMAIL') ||
        status.includes('CIN_')
      );
    }
    if (tab === 'ACTIVE') return status === 'ACTIVE' || status === 'VERIFIED';
    if (tab === 'REJECTED') return status === 'REJECTED' || status === 'SUSPENDED';
    return true;
  });

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Corporate Verification Command Center
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Super Admin inspection portal: Verify MCA legal standing, corporate email authenticity, domain match cross-checks, and representative authority.
          </p>
        </div>
        <button
          onClick={fetchCompanies}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? styles.spin : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: '12px 18px',
            background: msg.isError ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${msg.isError ? '#fecaca' : '#bbf7d0'}`,
            color: msg.isError ? '#b91c1c' : '#166534',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {msg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('ALL')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'ALL' ? '#1c2d81' : '#ffffff',
            color: tab === 'ALL' ? '#fed601' : '#475569',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
          }}
        >
          All Companies ({companies.length})
        </button>
        <button
          onClick={() => setTab('PENDING')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'PENDING' ? '#b45309' : '#fffbeb',
            color: tab === 'PENDING' ? '#ffffff' : '#92400e',
            border: '1px solid #fde68a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Pending / Manual Review Queue</span>
          <span style={{ background: tab === 'PENDING' ? '#ffffff' : '#b45309', color: tab === 'PENDING' ? '#b45309' : '#ffffff', padding: '1px 6px', fontSize: '0.74rem', borderRadius: '10px' }}>
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setTab('ACTIVE')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'ACTIVE' ? '#15803d' : '#ffffff',
            color: tab === 'ACTIVE' ? '#ffffff' : '#475569',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
          }}
        >
          Active Verified
        </button>
        <button
          onClick={() => setTab('REJECTED')}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: tab === 'REJECTED' ? '#b91c1c' : '#ffffff',
            color: tab === 'REJECTED' ? '#ffffff' : '#475569',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
          }}
        >
          Rejected / Suspended
        </button>
      </div>

      <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '440px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search by company name, CIN, domain, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
        />
      </div>

      <div className={styles.tableCard}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Entity &amp; Corporate CIN</th>
              <th>Applicant Representative</th>
              <th>Domain Ownership Match</th>
              <th>Verification Standing</th>
              <th>7-Check Diagnostic</th>
              <th>Admin Authorization</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No corporate profiles found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((comp) => {
                const isPending =
                  comp.status === 'PENDING' ||
                  comp.status === 'PENDING_SUPER_ADMIN_APPROVAL' ||
                  comp.status === 'PENDING_SUPER_ADMIN_VERIFICATION' ||
                  comp.status === 'MANUAL_REVIEW' ||
                  comp.status === 'DOMAIN_MISMATCH' ||
                  comp.status === 'PUBLIC_EMAIL' ||
                  comp.status === 'CIN_INVALID' ||
                  comp.status === 'CIN_NOT_FOUND' ||
                  comp.status === 'MANUAL_REVIEW_DOCS_REQUESTED';
                const isActive = comp.status === 'ACTIVE' || comp.status === 'VERIFIED';
                const isRejected = comp.status === 'REJECTED' || comp.status === 'SUSPENDED';

                const passCount = (comp.checks || []).filter((c: any) => c.status === 'PASS').length;
                const totalChecks = comp.checks && comp.checks.length > 0 ? comp.checks.length : 7;
                const isExpanded = expandedUserId === comp.userId;

                const webDom = comp.websiteDomain || (comp.website ? comp.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '');
                const emailDom = comp.emailDomain || (comp.corporateEmail ? comp.corporateEmail.split('@')[1] : '');
                const domainMatches = webDom && emailDom && webDom.toLowerCase() === emailDom.toLowerCase();

                return (
                  <>
                    <tr key={comp.userId || comp.id} style={{ background: isPending ? '#fffdf7' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1c2d81' }}>{comp.name || comp.legalName || 'Enterprise Entity'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '3px', fontFamily: 'monospace' }}>
                          CIN: {comp.cin || 'NOT RECORDED'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={11} />
                          <span>{comp.city || 'Headquarters'}, {comp.state || 'State'}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem' }}>
                          {comp.representativeName || 'Corporate Representative'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {comp.representativeDesignation || 'Talent Acquisition'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#1c2d81', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={11} />
                          <span>{comp.corporateEmail || comp.email || 'N/A'}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.74rem', color: '#334155' }}>
                          <strong>Web:</strong> {webDom || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '2px' }}>
                          <strong>Email:</strong> {emailDom || 'N/A'}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          {domainMatches ? (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                              DOMAINS MATCH
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                              DOMAIN MISMATCH
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {isActive && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                            ACTIVE VERIFIED
                          </span>
                        )}
                        {comp.status === 'DOMAIN_MISMATCH' && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                            REVIEW: DOMAIN MISMATCH
                          </span>
                        )}
                        {comp.status === 'PUBLIC_EMAIL' && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                            REVIEW: PUBLIC EMAIL
                          </span>
                        )}
                        {comp.status === 'MANUAL_REVIEW_DOCS_REQUESTED' && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            DOCS REQUESTED
                          </span>
                        )}
                        {comp.status === 'PENDING_SUPER_ADMIN_APPROVAL' && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            AWAITING ADMIN APPROVAL
                          </span>
                        )}
                        {isPending && !['PENDING_SUPER_ADMIN_APPROVAL', 'DOMAIN_MISMATCH', 'PUBLIC_EMAIL', 'MANUAL_REVIEW_DOCS_REQUESTED'].includes(comp.status) && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                            PENDING REVIEW
                          </span>
                        )}
                        {isRejected && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                            {comp.status || 'REJECTED'}
                          </span>
                        )}
                        {comp.documents && comp.documents.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
                            {comp.documents.length} Proof File(s) Uploaded
                          </div>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => toggleRow(comp.userId)}
                          style={{
                            padding: '4px 8px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#1c2d81',
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>{passCount}/{totalChecks} Checks</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {!isActive && (
                            <button
                              onClick={() => handleApprove(comp.userId, comp.name)}
                              disabled={actionLoading === comp.userId}
                              style={{
                                padding: '5px 10px',
                                background: '#15803d',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Check size={12} />
                              <span>Authorize</span>
                            </button>
                          )}

                          {isPending && (
                            <button
                              onClick={() => handleRequestDocs(comp.userId, comp.name)}
                              disabled={actionLoading === comp.userId}
                              style={{
                                padding: '5px 9px',
                                background: '#ffffff',
                                color: '#1c2d81',
                                border: '1px solid #1c2d81',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <FileText size={12} />
                              <span>Request Docs</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => handleReject(comp.userId, comp.name)}
                              disabled={actionLoading === comp.userId}
                              style={{
                                padding: '5px 10px',
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <XCircle size={12} />
                              <span>Reject</span>
                            </button>
                          )}

                          {isActive && (
                            <button
                              onClick={() => handleSuspend(comp.userId, comp.name)}
                              disabled={actionLoading === comp.userId}
                              style={{
                                padding: '4px 8px',
                                background: '#ffffff',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`expanded-${comp.userId || comp.id}`}>
                        <td colSpan={6} style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <CompanyVerificationDiagnosticCard
                            data={comp}
                            allowDocumentUpload={false}
                            showSummaryGrid={true}
                            adminView={true}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

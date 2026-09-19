import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  Check,
  X,
  Clock,
  ShieldCheck,
  Users,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  FileText,
  Key,
  Copy,
  Eye,
} from 'lucide-react';
import { institutionApi } from '../../institution/services/institutionApi';
import { StudentMonitoringModal } from './components/StudentMonitoringModal';
import styles from '../../assessment/pages/AssessmentBuilderPage.module.css';

interface StudentRecord {
  id: string;
  studentId: string;
  department: string;
  batch: string;
  placementStatus: string;
  verified: boolean;
  createdAt: string;
  email?: string;
  displayName?: string;
  registrationNumber?: string;
  cgpa?: number;
  degree?: string;
  phone?: string;
  completionPct?: number;
}

interface ParsedStudentRow {
  id: string;
  rollNumber: string;
  fullName: string;
  email: string;
  department: string;
  batchYear: string;
  cgpa: number | null;
  degree: string;
  phone: string;
  isValid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function validateStudentEntry(
  rollNumber: string,
  fullName: string,
  email: string,
  department: string,
  batchYear: string,
  cgpaVal?: string | number | null,
  degreeVal?: string,
  phoneVal?: string,
  idx: number = 0
): ParsedStudentRow {
  const errors: string[] = [];
  const roll = (rollNumber || '').trim();
  const name = (fullName || '').trim();
  const mail = (email || '').trim();
  const dept = (department || '').trim();
  const batch = (batchYear || '').trim();
  let cgpaNum: number | null = null;

  if (!roll) errors.push('Missing Roll/Reg Number');
  if (!name) errors.push('Missing Full Name');
  if (!mail) {
    errors.push('Missing Email Address');
  } else if (!EMAIL_REGEX.test(mail)) {
    errors.push('Invalid Email Format');
  }
  if (!dept) errors.push('Missing Department');
  if (!batch) errors.push('Missing Batch Year');

  if (cgpaVal !== undefined && cgpaVal !== null && cgpaVal !== '') {
    const num = typeof cgpaVal === 'number' ? cgpaVal : parseFloat(String(cgpaVal));
    if (isNaN(num) || num < 0 || num > 10) {
      errors.push('CGPA must be between 0.0 and 10.0');
    } else {
      cgpaNum = num;
    }
  }

  return {
    id: `import-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    rollNumber: roll,
    fullName: name,
    email: mail,
    department: dept,
    batchYear: batch,
    cgpa: cgpaNum,
    degree: (degreeVal || 'B.E').trim(),
    phone: (phoneVal || '').replace(/^[-\s]+/, '').trim(),
    isValid: errors.length === 0,
    errors,
  };
}

function parseRosterText(raw: string): ParsedStudentRow[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const json = JSON.parse(trimmed);
      if (Array.isArray(json)) {
        return json.map((item, i) =>
          validateStudentEntry(
            item.rollNumber || item.RollNumber || item.studentId || item.registrationNumber || '',
            item.fullName || item.name || item.FullName || item.Name || '',
            item.email || item.Email || '',
            item.department || item.Department || item.dept || '',
            String(item.batchYear || item.BatchYear || item.batch || ''),
            item.cgpa || item.CGPA || null,
            item.degree || item.Degree || 'B.Tech',
            item.phone || item.Phone || '',
            i
          )
        );
      }
    } catch {
      // Fall through to CSV parsing if JSON parse fails
    }
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headerValues = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const hasHeader = headerValues.some((h) =>
    ['rollnumber', 'roll', 'registrationnumber', 'name', 'fullname', 'email', 'department'].includes(h)
  );

  const colMap: Record<string, number> = {
    roll: 0,
    name: 1,
    email: 2,
    dept: 3,
    batch: 4,
    cgpa: 5,
    degree: 6,
    phone: 7,
  };

  const startIdx = hasHeader ? 1 : 0;
  if (hasHeader) {
    headerValues.forEach((h, idx) => {
      if (h.includes('roll') || h.includes('reg')) colMap.roll = idx;
      else if (h.includes('name')) colMap.name = idx;
      else if (h.includes('mail')) colMap.email = idx;
      else if (h.includes('dept') || h.includes('branch')) colMap.dept = idx;
      else if (h.includes('batch') || h.includes('year')) colMap.batch = idx;
      else if (h.includes('cgpa') || h.includes('gpa')) colMap.cgpa = idx;
      else if (h.includes('degree') || h.includes('program')) colMap.degree = idx;
      else if (h.includes('phone') || h.includes('mobile')) colMap.phone = idx;
    });
  }

  const rows: ParsedStudentRow[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length === 1 && !cols[0]) continue;
    const roll = cols[colMap.roll] || '';
    const name = cols[colMap.name] || '';
    const email = cols[colMap.email] || '';
    const dept = cols[colMap.dept] || '';
    const batch = cols[colMap.batch] || '';
    const cgpa = cols[colMap.cgpa] || '';
    const degree = cols[colMap.degree] || 'B.Tech';
    const phone = cols[colMap.phone] || '';

    rows.push(validateStudentEntry(roll, name, email, dept, batch, cgpa, degree, phone, i));
  }
  return rows;
}

const SAMPLE_CSV_TEMPLATE = `RollNumber,FullName,Email,Department,BatchYear,CGPA,Degree,Phone
CSE2026-001,Aarav Sharma,aarav.sharma@institution.edu,Computer Science,2026,8.92,B.Tech,+91-9876543210
ECE2026-042,Diya Patel,diya.patel@institution.edu,Electronics & Communication,2026,8.45,B.Tech,+91-9876543211
MECH2026-015,Rohan Verma,rohan.verma@institution.edu,Mechanical Engineering,2026,7.80,B.Tech,+91-9876543212
IT2026-089,Sneha Kulkarni,sneha.kulkarni@institution.edu,Information Technology,2026,9.15,B.Tech,+91-9876543213
CIVIL2026-022,Karthik Nair,karthik.nair@institution.edu,Civil Engineering,2026,8.10,B.Tech,+91-9876543214`;

export function InstitutionStudentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('all');
  const [pendingStudents, setPendingStudents] = useState<StudentRecord[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Bulk Importer State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importInputMode, setImportInputMode] = useState<'file' | 'paste'>('file');
  const [importRawText, setImportRawText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<ParsedStudentRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Bulk Credentials Receipt State
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<Array<{
    userId?: string;
    name: string;
    email: string;
    rollNumber: string;
    department: string;
    batch: string;
    tempPassword: string;
    status: string;
  }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        institutionApi.getPendingStudents().catch(() => []),
        institutionApi.getStudents().catch(() => []),
      ]);
      const pendingList = Array.isArray(pendingRes) ? pendingRes : (pendingRes as any)?.data || [];
      const allList = Array.isArray(allRes) ? allRes : (allRes as any)?.data || [];
      setPendingStudents(pendingList);
      setAllStudents(allList);
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to load students roster from server.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (studentId: string, approved: boolean) => {
    setVerifyingId(studentId);
    try {
      await institutionApi.verifyStudent(studentId, approved, approved ? 'Verified by Institution Authority' : 'Registration Rejected');
      setActionMessage({
        type: 'success',
        text: approved ? 'Student academic registration verified successfully!' : 'Student registration rejected.',
      });
      await loadData();
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to process student verification.' });
    } finally {
      setVerifyingId(null);
    }
  };

  const isDeptMatch = (dept: string, filter: string) => {
    if (filter === 'ALL') return true;
    const d = (dept || '').toLowerCase();
    const f = filter.toLowerCase();
    if (d.includes(f)) return true;
    if (f.includes('computer') && (d.includes('cse') || d.includes('computer'))) return true;
    if (f.includes('information') && (d.includes('it') || d.includes('information'))) return true;
    if (f.includes('artificial') && (d.includes('ai') || d.includes('data science') || d.includes('aids'))) return true;
    if (f.includes('electronic') && (d.includes('ece') || d.includes('electronic'))) return true;
    if (f.includes('electrical') && (d.includes('eee') || d.includes('electrical'))) return true;
    return false;
  };

  const matchesRecord = (s: any, q: string) => {
    if (!q) return true;
    const query = q.toLowerCase();
    const name = (s.displayName || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const regNo = (s.registrationNumber || s.rollNumber || '').toLowerCase();
    const dept = (s.department || '').toLowerCase();
    const studentId = (s.studentId || '').toLowerCase();
    return name.includes(query) || email.includes(query) || regNo.includes(query) || dept.includes(query) || studentId.includes(query);
  };

  const filteredPending = pendingStudents.filter((s) => {
    return matchesRecord(s, searchQuery) && isDeptMatch(s.department, deptFilter);
  });

  const filteredAll = allStudents.filter((s) => {
    return matchesRecord(s, searchQuery) && isDeptMatch(s.department, deptFilter);
  });

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'institutional_student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      setImportRawText(content);
      const parsed = parseRosterText(content);
      setParsedImportRows(parsed);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (val: string) => {
    setImportRawText(val);
    const parsed = parseRosterText(val);
    setParsedImportRows(parsed);
  };

  const handleCommitImport = async () => {
    const validRows = parsedImportRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    try {
      const payload = validRows.map((r) => ({
        rollNumber: r.rollNumber,
        fullName: r.fullName,
        email: r.email,
        department: r.department,
        batchYear: r.batchYear,
        cgpa: r.cgpa,
        degree: r.degree,
        phone: r.phone,
      }));

      const res = await institutionApi.bulkImportStudents(payload);
      const data = (res as any)?.data || res;
      const studentsList = data?.students || [];

      setShowImportModal(false);
      setParsedImportRows([]);
      setImportRawText('');

      if (studentsList.length > 0) {
        setGeneratedCredentials(studentsList);
        setShowCredentialsModal(true);
      }

      setActionMessage({
        type: 'success',
        text: data?.message || `Successfully imported and verified ${validRows.length} student records into the institutional cohort.`,
      });

      await loadData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Failed to completely save all student records to server.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadCredentialsCSV = () => {
    if (generatedCredentials.length === 0) return;
    const headers = 'RollNumber,FullName,Email,TemporaryPassword,Department,Batch,PlacementStatus\n';
    const rows = generatedCredentials
      .map(
        (c) =>
          `"${c.rollNumber}","${c.name}","${c.email}","${c.tempPassword}","${c.department}","${c.batch}","PLACEMENT_SEEKING"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student_credentials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyAllCredentials = () => {
    if (generatedCredentials.length === 0) return;
    const text = generatedCredentials
      .map(
        (c) =>
          `Name: ${c.name} | Roll: ${c.rollNumber} | Email: ${c.email} | Password: ${c.tempPassword}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  const totalEnrolled = allStudents.length;
  const verifiedCount = allStudents.filter((s) => s.verified).length;
  const pendingCount = pendingStudents.length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Student Cohort Roster &amp; Academic Verification</h1>
          <p className={styles.subtitle}>
            Review pending student registrations, authenticate academic records, and authorize campus placement eligibility in real-time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#1c2d81',
              border: '1px solid #1c2d81',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(28,45,129,0.15)',
            }}
          >
            <UploadCloud size={15} />
            <span>Bulk Import Roster</span>
          </button>
          <button
            onClick={loadData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: actionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${actionMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: actionMessage.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.875rem',
          }}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={16} color="#475569" />
            <span className={styles.statLabel}>Total Enrolled Cohort</span>
          </div>
          <span className={styles.statValue}>{totalEnrolled} Students</span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={16} color="#15803d" />
            <span className={styles.statLabel}>Verified Students</span>
          </div>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {verifiedCount} ({totalEnrolled > 0 ? Math.round((verifiedCount / totalEnrolled) * 100) : 0}%)
          </span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={16} color="#d97706" />
            <span className={styles.statLabel}>Pending Verification</span>
          </div>
          <span className={styles.statValue} style={{ color: '#d97706' }}>
            {pendingCount} Awaiting Review
          </span>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <GraduationCap size={16} color="#0284c7" />
            <span className={styles.statLabel}>Placement Seeking</span>
          </div>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {allStudents.filter((s) => s.placementStatus === 'PLACEMENT_SEEKING' || s.placementStatus === 'PLACED').length} Authorized
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #1c2d81' : '3px solid transparent',
            color: activeTab === 'pending' ? '#1c2d81' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} />
          <span>Pending Verification Queue</span>
          {pendingCount > 0 && (
            <span
              style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #1c2d81' : '3px solid transparent',
            color: activeTab === 'all' ? '#1c2d81' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} />
          <span>All Enrolled Students ({totalEnrolled})</span>
        </button>
      </div>

      <div className={styles.filterRow} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className={styles.searchInput}
              style={{ paddingLeft: '34px', minWidth: '280px' }}
              placeholder="Search by student name, roll number, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.searchInput}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Artificial Intelligence">AI &amp; Data Science</option>
            <option value="Electronics">Electronics &amp; Comm.</option>
            <option value="Electrical">Electrical &amp; Electronics</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', overflowX: 'auto' }}>
        {activeTab === 'pending' ? (
          filteredPending.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={36} color="#15803d" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                All Student Registrations Verified!
              </h3>
              <p style={{ fontSize: '0.875rem' }}>No pending student verification requests in the queue.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Roll / Reg No</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Student Name &amp; Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Department</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Batch</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>CGPA</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155', textAlign: 'center' }}>Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((s) => {
                  const sId = s.studentId || s.id;
                  return (
                    <tr
                      key={sId}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setSelectedStudentId(sId)}
                      title="Click to view student profile monitoring dashboard"
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                          {s.registrationNumber || sId?.slice(0, 8).toUpperCase() || 'N/A'}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.displayName || 'Student Candidate'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{s.department || 'General Engineering'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.batch || '2022-2026'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                        {s.cgpa ? Number(s.cgpa).toFixed(2) : '8.50'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '3px',
                            background: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                          }}
                        >
                          PENDING VERIFICATION
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentId(sId);
                            }}
                            style={{
                              padding: '5px 10px',
                              background: '#eff6ff',
                              color: '#1c2d81',
                              border: '1px solid #bfdbfe',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '3px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={13} />
                            <span>Monitor</span>
                          </button>
                          <button
                            disabled={verifyingId === s.studentId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(s.studentId, true);
                            }}
                            style={{
                              padding: '5px 10px',
                              background: '#15803d',
                              color: '#ffffff',
                              border: '1px solid #15803d',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '3px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            disabled={verifyingId === s.studentId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(s.studentId, false);
                            }}
                            style={{
                              padding: '5px 8px',
                              background: '#ffffff',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '3px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Roll / Reg No</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Student Name &amp; Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Department &amp; Degree</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Batch</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>CGPA</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Placement Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>Verification Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#334155', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAll.map((s) => {
                const sId = s.studentId || s.id;
                return (
                  <tr
                    key={sId}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setSelectedStudentId(sId)}
                    title="Click to inspect student profile monitoring dashboard"
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                        {s.registrationNumber || s.rollNumber || (sId ? sId.slice(0, 8).toUpperCase() : 'N/A')}
                      </code>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.displayName || 'Student Candidate'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1c2d81' }}>{s.department || 'CSE'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.degree || 'B.Tech'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.batch || '2026'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {s.cgpa ? Number(s.cgpa).toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={s.placementStatus || 'UNPLACED'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await institutionApi.updatePlacementStatus(s.studentId, newStatus);
                            setActionMessage({ type: 'success', text: `Updated student status to: ${newStatus}` });
                            await loadData();
                          } catch {
                            setActionMessage({ type: 'error', text: 'Failed to update student placement status.' });
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: s.placementStatus === 'PLACED' ? '#dcfce7' : '#eff6ff',
                          color: s.placementStatus === 'PLACED' ? '#15803d' : '#1d4ed8',
                          border: `1px solid ${s.placementStatus === 'PLACED' ? '#86efac' : '#bfdbfe'}`,
                        }}
                      >
                        <option value="UNPLACED">UNPLACED</option>
                        <option value="PLACEMENT_SEEKING">PLACEMENT_SEEKING</option>
                        <option value="PLACED">PLACED (Offer Certified)</option>
                        <option value="OPTED_OUT">OPTED_OUT</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: s.verified ? '#dcfce7' : '#fef3c7',
                          color: s.verified ? '#15803d' : '#b45309',
                          border: `1px solid ${s.verified ? '#bbf7d0' : '#fde68a'}`,
                        }}
                      >
                        {s.verified ? <ShieldCheck size={12} /> : <Clock size={12} />}
                        <span>{s.verified ? 'VERIFIED' : 'PENDING'}</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(sId);
                          }}
                          style={{
                            padding: '5px 10px',
                            background: '#eff6ff',
                            color: '#1c2d81',
                            border: '1px solid #bfdbfe',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '3px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} />
                          <span>Monitor</span>
                        </button>
                        {!s.verified && (
                          <button
                            disabled={verifyingId === s.studentId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(s.studentId, true);
                            }}
                            style={{
                              padding: '5px 10px',
                              background: '#15803d',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '3px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={12} />
                            <span>Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Bulk Roster Importer Modal */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '1000px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1c2d81',
                  }}
                >
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Bulk Student Cohort Onboarding
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                    Upload or paste batch student profiles for institutional academic authentication and placement authorization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setParsedImportRows([]);
                  setImportRawText('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                  borderRadius: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Import Mode Selector & Template Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
                  <button
                    onClick={() => setImportInputMode('file')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: 'none',
                      background: importInputMode === 'file' ? '#ffffff' : 'transparent',
                      color: importInputMode === 'file' ? '#1c2d81' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: importInputMode === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <UploadCloud size={14} />
                    <span>Upload CSV / JSON</span>
                  </button>
                  <button
                    onClick={() => setImportInputMode('paste')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: 'none',
                      background: importInputMode === 'paste' ? '#ffffff' : 'transparent',
                      color: importInputMode === 'paste' ? '#1c2d81' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: importInputMode === 'paste' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <FileText size={14} />
                    <span>Direct Data Paste</span>
                  </button>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1c2d81',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>Download Sample Template (CSV)</span>
                </button>
              </div>

              {/* Input Zone */}
              {importInputMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #94a3b8',
                      borderRadius: '8px',
                      padding: '28px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                  >
                    <UploadCloud size={32} color="#1c2d81" style={{ margin: '0 auto 10px' }} />
                    <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      Click to choose CSV or JSON file to upload
                    </p>
                    <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                      Supported formats: Comma-Separated Values (.csv) or JSON records array (.json) up to 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={6}
                    value={importRawText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder={`Paste CSV data or JSON array here...\nRollNumber,FullName,Email,Department,BatchYear,CGPA,Degree,Phone\nCSE2026-001,Aarav Sharma,aarav.sharma@institution.edu,Computer Science,2026,8.92,B.Tech,+91-9876543210`}
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Validation Metrics Summary */}
              {parsedImportRows.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Records Detected</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {parsedImportRows.length}
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Valid Profiles Ready</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                      {parsedImportRows.filter((r) => r.isValid).length}
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: parsedImportRows.some((r) => !r.isValid) ? '#fef2f2' : '#f8fafc', borderRadius: '6px', border: `1px solid ${parsedImportRows.some((r) => !r.isValid) ? '#fecaca' : '#e2e8f0'}` }}>
                    <div style={{ fontSize: '0.75rem', color: parsedImportRows.some((r) => !r.isValid) ? '#991b1b' : '#64748b', fontWeight: 600 }}>Validation Issues</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: parsedImportRows.some((r) => !r.isValid) ? '#dc2626' : '#64748b', marginTop: '2px' }}>
                      {parsedImportRows.filter((r) => !r.isValid).length}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {parsedImportRows.length > 0 && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                    Parsed Roster Preview (Showing first {Math.min(parsedImportRows.length, 10)} of {parsedImportRows.length})
                  </div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '8px 12px' }}>Status</th>
                          <th style={{ padding: '8px 12px' }}>Roll Number</th>
                          <th style={{ padding: '8px 12px' }}>Full Name</th>
                          <th style={{ padding: '8px 12px' }}>Email</th>
                          <th style={{ padding: '8px 12px' }}>Department</th>
                          <th style={{ padding: '8px 12px' }}>Batch</th>
                          <th style={{ padding: '8px 12px' }}>CGPA</th>
                          <th style={{ padding: '8px 12px' }}>Issues / Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedImportRows.slice(0, 15).map((row) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: row.isValid ? '#ffffff' : '#fff7ed' }}>
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: row.isValid ? '#dcfce7' : '#fee2e2',
                                  color: row.isValid ? '#15803d' : '#991b1b',
                                }}
                              >
                                {row.isValid ? <Check size={12} /> : <AlertTriangle size={12} />}
                                <span>{row.isValid ? 'VALID' : 'INVALID'}</span>
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.rollNumber || '-'}</td>
                            <td style={{ padding: '8px 12px' }}>{row.fullName || '-'}</td>
                            <td style={{ padding: '8px 12px' }}>{row.email || '-'}</td>
                            <td style={{ padding: '8px 12px' }}>{row.department || '-'}</td>
                            <td style={{ padding: '8px 12px' }}>{row.batchYear || '-'}</td>
                            <td style={{ padding: '8px 12px' }}>{row.cgpa !== null ? row.cgpa.toFixed(2) : '-'}</td>
                            <td style={{ padding: '8px 12px', color: '#dc2626' }}>
                              {row.errors.length > 0 ? row.errors.join(', ') : 'All fields verified'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: '#f8fafc',
              }}
            >
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setParsedImportRows([]);
                  setImportRawText('');
                }}
                style={{
                  padding: '8px 16px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                disabled={isImporting || parsedImportRows.filter((r) => r.isValid).length === 0}
                onClick={handleCommitImport}
                style={{
                  padding: '8px 20px',
                  background:
                    parsedImportRows.filter((r) => r.isValid).length > 0 && !isImporting ? '#1c2d81' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor:
                    parsedImportRows.filter((r) => r.isValid).length > 0 && !isImporting ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isImporting ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={16} />}
                <span>
                  Import {parsedImportRows.filter((r) => r.isValid).length} Verified Students
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Credentials Receipt Modal */}
      {showCredentialsModal && generatedCredentials.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803d',
                  }}
                >
                  <Key size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Student Login Credentials Generated
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                    Successfully created and verified {generatedCredentials.length} student account{generatedCredentials.length > 1 ? 's' : ''}. Download or distribute these credentials to students.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                  borderRadius: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  color: '#1e40af',
                  lineHeight: 1.5,
                }}
              >
                <strong>Initial Access Formula:</strong> Student accounts are activated with initial temporary password{' '}
                <code>Student@&lt;RollNumber&gt;!</code> (e.g. <code>Student@23CSR117!</code>). Students can log in at{' '}
                <a href="/login" target="_blank" rel="noreferrer" style={{ color: '#1c2d81', textDecoration: 'underline', fontWeight: 700 }}>
                  /login
                </a>{' '}
                using their college email and will be prompted to set a permanent password.
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px 14px' }}>Roll / Reg No</th>
                        <th style={{ padding: '10px 14px' }}>Student Name</th>
                        <th style={{ padding: '10px 14px' }}>Official Email</th>
                        <th style={{ padding: '10px 14px' }}>Temporary Password</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Copy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedCredentials.map((c, idx) => (
                        <tr key={c.rollNumber || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
                              {c.rollNumber}
                            </code>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{c.name}</td>
                          <td style={{ padding: '10px 14px', color: '#334155' }}>{c.email}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <code
                              style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                border: '1px solid #fde68a',
                                fontSize: '0.8rem',
                              }}
                            >
                              {c.tempPassword}
                            </code>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                              }}
                            >
                              VERIFIED &amp; ACTIVE
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Email: ${c.email}\nPassword: ${c.tempPassword}`);
                                setCopiedIndex(idx);
                                setTimeout(() => setCopiedIndex(null), 2000);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                background: copiedIndex === idx ? '#dcfce7' : '#ffffff',
                                border: `1px solid ${copiedIndex === idx ? '#86efac' : '#cbd5e1'}`,
                                color: copiedIndex === idx ? '#15803d' : '#475569',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDownloadCredentialsCSV}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#1c2d81',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>Download Credentials (CSV)</span>
                </button>
                <button
                  onClick={handleCopyAllCredentials}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: allCopied ? '#15803d' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {allCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{allCopied ? 'All Copied to Clipboard!' : 'Copy All'}</span>
                </button>
              </div>

              <button
                onClick={() => setShowCredentialsModal(false)}
                style={{
                  padding: '8px 20px',
                  background: '#1c2d81',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Done &amp; View Cohort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Monitoring Dashboard Modal */}
      {selectedStudentId && (
        <StudentMonitoringModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onStatusUpdated={loadData}
        />
      )}
    </div>
  );
}


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Building2,
  UserPlus,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
  createdAt: string;
}

interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  description?: string;
}

export function InstitutionHierarchyPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'PRINCIPAL';
  const isPrincipal = userRole === 'PRINCIPAL' || userRole === 'INSTITUTION_ADMIN';
  const isCoordinator = userRole === 'PLACEMENT_COORDINATOR' || isPrincipal;
  const isIncharge = userRole === 'DEPARTMENT_PLACEMENT_INCHARGE';

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Coordinator assignment modal
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordForm, setCoordForm] = useState({ name: '', email: '', phone: '', tempPassword: '' });
  const [createdCoordCreds, setCreatedCoordCreds] = useState<any>(null);

  // In-charge assignment modal
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [inchargeForm, setInchargeForm] = useState({ name: '', email: '', departmentCode: 'CSE', phone: '', tempPassword: '' });
  const [createdInchargeCreds, setCreatedInchargeCreds] = useState<any>(null);

  // Department creation modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ departmentCode: '', departmentName: '', description: '' });

  // Add Student modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({
    rollNumber: '',
    fullName: '',
    email: '',
    department: user?.departmentId || 'CSE',
    batchYear: '2026',
    degree: 'B.Tech',
    cgpa: '',
    phone: '',
    tempPassword: '',
  });
  const [createdStudentCreds, setCreatedStudentCreds] = useState<any[] | null>(null);

  // Bulk Import
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const loadHierarchyData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [staffRes, deptRes, studentsRes] = await Promise.all([
        fetch('/api/v1/institution/hierarchy/staff', { headers }).catch(() => null),
        fetch('/api/v1/institution/hierarchy/departments', { headers }).catch(() => null),
        isIncharge
          ? fetch(`/api/v1/institution/hierarchy/department-students?department=${encodeURIComponent(user?.departmentId || 'CSE')}`, { headers }).catch(() => null)
          : fetch('/api/v1/institution/hierarchy/all-students', { headers }).catch(() => null),
      ]);

      if (staffRes && staffRes.ok) {
        const s = await staffRes.json();
        setStaff(s.data || []);
      }
      if (deptRes && deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.data || []);
      }
      if (studentsRes && studentsRes.ok) {
        const st = await studentsRes.json();
        setStudents(st.data || []);
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to load institutional hierarchy data.' });
    } finally {
      setLoading(false);
    }
  }, [isIncharge, user?.departmentId]);

  useEffect(() => {
    loadHierarchyData();
  }, [loadHierarchyData]);

  const handleAssignCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/institution/hierarchy/placement-coordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(coordForm),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setCreatedCoordCreds(json.data);
        setActionMessage({ type: 'success', text: 'Placement Coordinator assigned successfully!' });
        loadHierarchyData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to assign Placement Coordinator.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error during coordinator assignment.' });
    }
  };

  const handleAssignIncharge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/institution/hierarchy/department-incharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(inchargeForm),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setCreatedInchargeCreds(json.data);
        setActionMessage({ type: 'success', text: `In-charge assigned for department ${inchargeForm.departmentCode}!` });
        loadHierarchyData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to assign Department In-Charge.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error during In-charge assignment.' });
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/institution/hierarchy/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(deptForm),
      });

      const json = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `Department ${deptForm.departmentCode} added!` });
        setShowDeptModal(false);
        setDeptForm({ departmentCode: '', departmentName: '', description: '' });
        loadHierarchyData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to create department.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error creating department.' });
    }
  };

  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const dept = user?.departmentId || studentForm.department;
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const payload = [
        {
          rollNumber: studentForm.rollNumber.trim(),
          fullName: studentForm.fullName.trim(),
          email: studentForm.email.trim(),
          department: dept,
          batchYear: studentForm.batchYear.trim(),
          degree: studentForm.degree,
          cgpa: studentForm.cgpa ? parseFloat(studentForm.cgpa) : null,
          phone: studentForm.phone.trim(),
          tempPassword: studentForm.tempPassword || undefined,
        },
      ];

      const res = await fetch(`/api/v1/institution/hierarchy/students?department=${encodeURIComponent(dept)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setCreatedStudentCreds(json.data.students || []);
        setActionMessage({ type: 'success', text: 'Student onboarded with temporary credentials!' });
        loadHierarchyData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to add student.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error adding student.' });
    }
  };

  const handleBulkUploadCommit = async () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const dept = user?.departmentId || 'CSE';
    const studentsToUpload: any[] = [];

    // Parse CSV
    const startIdx = lines[0].toLowerCase().includes('roll') || lines[0].toLowerCase().includes('email') ? 1 : 0;
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        studentsToUpload.push({
          rollNumber: parts[0],
          fullName: parts[1],
          email: parts[2],
          department: dept,
          batchYear: parts[3] || '2026',
          degree: parts[4] || 'B.Tech',
          cgpa: parts[5] ? parseFloat(parts[5]) : null,
          phone: parts[6] || '',
        });
      }
    }

    if (studentsToUpload.length === 0) {
      setActionMessage({ type: 'error', text: 'No valid student records found in CSV text.' });
      return;
    }

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/institution/hierarchy/students?department=${encodeURIComponent(dept)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(studentsToUpload),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        setCreatedStudentCreds(json.data.students || []);
        setShowBulkModal(false);
        setBulkText('');
        setActionMessage({ type: 'success', text: `Imported ${json.data.count} students with temporary login credentials!` });
        loadHierarchyData();
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to bulk import students.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error during bulk import.' });
    }
  };

  const handleVerifyStudentProfile = async (studentId: string, approved: boolean) => {
    const dept = user?.departmentId || 'CSE';
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/institution/hierarchy/students/${studentId}/verify?department=${encodeURIComponent(dept)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ approved, notes: approved ? 'Verified by Department In-Charge' : 'Profile flagged' }),
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: approved ? 'Student profile verified!' : 'Student profile rejected.' });
        loadHierarchyData();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update student verification status.' });
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (s.displayName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.registrationNumber || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Building2 size={26} color="#1c2d81" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Institutional Delegation &amp; Department Administration
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            {isPrincipal && 'Principal Portal: Oversee institutional staff delegation, campus departments, and placement coordination.'}
            {userRole === 'PLACEMENT_COORDINATOR' && 'Placement Coordinator Portal: Manage departments, assign Department In-charges, and coordinate campus drives.'}
            {isIncharge && `Department In-Charge Portal (${user?.departmentId || 'CSE'}): Strictly manage and onboard students for your department with temporary credentials.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isPrincipal && (
            <button
              type="button"
              onClick={() => { setShowCoordModal(true); setCreatedCoordCreds(null); }}
              style={{
                padding: '9px 16px',
                background: '#1c2d81',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={16} />
              <span>Assign Placement Coordinator</span>
            </button>
          )}

          {isCoordinator && (
            <>
              <button
                type="button"
                onClick={() => setShowDeptModal(true)}
                style={{
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Add Department</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowInchargeModal(true); setCreatedInchargeCreds(null); }}
                style={{
                  padding: '9px 16px',
                  background: '#1c2d81',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserPlus size={16} />
                <span>Assign Dept In-Charge</span>
              </button>
            </>
          )}

          {isIncharge && (
            <>
              <button
                type="button"
                onClick={() => { setShowAddStudentModal(true); setCreatedStudentCreds(null); }}
                style={{
                  padding: '9px 16px',
                  background: '#1c2d81',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserPlus size={16} />
                <span>Add Student</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                style={{
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UploadCloud size={16} />
                <span>Bulk CSV Import</span>
              </button>
            </>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            background: actionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${actionMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: actionMessage.type === 'success' ? '#166534' : '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
          }}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Roster / Delegation Section */}
      <div style={{ display: 'grid', gridTemplateColumns: isCoordinator ? '1fr 2fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {isCoordinator && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Staff Roster Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                Institutional Staff Roster
              </h3>
              {staff.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No staff members assigned yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {staff.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem' }}>{s.name}</span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: s.role === 'PRINCIPAL' ? '#e0e7ff' : s.role === 'PLACEMENT_COORDINATOR' ? '#fef3c7' : '#dcfce7',
                            color: s.role === 'PRINCIPAL' ? '#3730a3' : s.role === 'PLACEMENT_COORDINATOR' ? '#b45309' : '#15803d',
                          }}
                        >
                          {s.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {s.email} {s.departmentId && `\u2022 Dept: ${s.departmentId}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departments Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                Campus Departments
              </h3>
              {departments.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No departments registered.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {departments.map((d) => (
                    <div
                      key={d.id || d.departmentCode}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#1c2d81', fontSize: '0.85rem' }}>{d.departmentCode}</span>
                      <span style={{ color: '#475569', fontSize: '0.82rem' }}>{d.departmentName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Roster Card (Department Scoped or Campus Wide) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                {isIncharge ? `Department Cohort Roster (${user?.departmentId || 'CSE'})` : 'Campus-Wide Student Directory'}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Total Students: {students.length} &bull; Verified: {students.filter((s) => s.verified).length}
              </span>
            </div>

            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>
              Loading institution hierarchy and student data...
            </p>
          ) : filteredStudents.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>
              No student records found. Add students or bulk import a CSV cohort to generate temporary credentials.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 10px' }}>Student</th>
                    <th style={{ padding: '8px 10px' }}>Roll / Reg No</th>
                    <th style={{ padding: '8px 10px' }}>Dept</th>
                    <th style={{ padding: '8px 10px' }}>Batch</th>
                    <th style={{ padding: '8px 10px' }}>CGPA</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                    {isIncharge && <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id || st.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{st.displayName || 'Student'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{st.email}</div>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#334155' }}>
                        {st.registrationNumber || st.rollNumber || '-'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontWeight: 600, color: '#1c2d81' }}>{st.department}</span>
                      </td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{st.batch || '2026'}</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#0f172a' }}>{st.cgpa ? Number(st.cgpa).toFixed(2) : '-'}</td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: st.verified ? '#dcfce7' : '#fef3c7',
                            color: st.verified ? '#15803d' : '#b45309',
                          }}
                        >
                          {st.verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      {isIncharge && (
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleVerifyStudentProfile(st.studentId, !st.verified)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '4px',
                              border: 'none',
                              background: st.verified ? '#fee2e2' : '#dcfce7',
                              color: st.verified ? '#b91c1c' : '#15803d',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            {st.verified ? 'Revoke' : 'Verify'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Placement Coordinator Assignment */}
      {showCoordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1.75rem', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Assign Placement Coordinator
            </h3>
            {createdCoordCreds ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ marginBottom: '6px' }} />
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>Credentials Generated!</div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '6px' }}>
                  Email: <strong>{createdCoordCreds.email}</strong><br />
                  Temporary Password: <strong>{createdCoordCreds.tempPassword}</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', marginBottom: 0 }}>
                  The Placement Coordinator will be forced to change this password on their first login.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCoordModal(false)}
                  style={{ marginTop: '12px', padding: '8px 16px', background: '#1c2d81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignCoordinator}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" value={coordForm.name} onChange={(e) => setCoordForm({ ...coordForm, name: e.target.value })} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Official Email</label>
                  <input type="email" value={coordForm.email} onChange={(e) => setCoordForm({ ...coordForm, email: e.target.value })} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Phone</label>
                  <input type="tel" value={coordForm.phone} onChange={(e) => setCoordForm({ ...coordForm, phone: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Custom Temp Password (Optional)</label>
                  <input type="text" value={coordForm.tempPassword} onChange={(e) => setCoordForm({ ...coordForm, tempPassword: e.target.value })} placeholder="Default: Coord@2026!" style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowCoordModal(false)} style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 2, padding: '9px', borderRadius: '6px', border: 'none', background: '#1c2d81', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Assign Coordinator</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Department Placement In-Charge Assignment */}
      {showInchargeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1.75rem', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Assign Department Placement In-Charge
            </h3>
            {createdInchargeCreds ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ marginBottom: '6px' }} />
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>In-Charge Credentials Ready!</div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '6px' }}>
                  Department: <strong>{createdInchargeCreds.departmentCode}</strong><br />
                  Email: <strong>{createdInchargeCreds.email}</strong><br />
                  Temporary Password: <strong>{createdInchargeCreds.tempPassword}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInchargeModal(false)}
                  style={{ marginTop: '12px', padding: '8px 16px', background: '#1c2d81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignIncharge}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Department</label>
                  <select
                    value={inchargeForm.departmentCode}
                    onChange={(e) => setInchargeForm({ ...inchargeForm, departmentCode: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  >
                    {departments.map((d) => (
                      <option key={d.id || d.departmentCode} value={d.departmentCode}>
                        {d.departmentCode} - {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>In-Charge Full Name</label>
                  <input type="text" value={inchargeForm.name} onChange={(e) => setInchargeForm({ ...inchargeForm, name: e.target.value })} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Official College Email</label>
                  <input type="email" value={inchargeForm.email} onChange={(e) => setInchargeForm({ ...inchargeForm, email: e.target.value })} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Custom Temp Password (Optional)</label>
                  <input type="text" value={inchargeForm.tempPassword} onChange={(e) => setInchargeForm({ ...inchargeForm, tempPassword: e.target.value })} placeholder="Default: Incharge@2026!" style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowInchargeModal(false)} style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 2, padding: '9px', borderRadius: '6px', border: 'none', background: '#1c2d81', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Assign In-Charge</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Create Department */}
      {showDeptModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>Add Department</h3>
            <form onSubmit={handleCreateDepartment}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Code (e.g. AIDS, EEE)</label>
                <input type="text" value={deptForm.departmentCode} onChange={(e) => setDeptForm({ ...deptForm, departmentCode: e.target.value })} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                <input type="text" value={deptForm.departmentName} onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Description</label>
                <input type="text" value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowDeptModal(false)} style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '9px', borderRadius: '6px', border: 'none', background: '#1c2d81', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Student with Temporary Credentials */}
      {showAddStudentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1.75rem', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Add Student to Department ({user?.departmentId || 'CSE'})
            </h3>
            {createdStudentCreds && createdStudentCreds.length > 0 ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ marginBottom: '6px' }} />
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>Student Account Created!</div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '6px' }}>
                  Roll No: <strong>{createdStudentCreds[0].rollNumber}</strong><br />
                  Email: <strong>{createdStudentCreds[0].email}</strong><br />
                  Temporary Password: <strong>{createdStudentCreds[0].tempPassword}</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', marginBottom: 0 }}>
                  Share these credentials with the student. On their first login, they will be forced to set a new password and complete their profile.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  style={{ marginTop: '12px', padding: '8px 16px', background: '#1c2d81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddSingleStudent}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Roll / Reg Number</label>
                    <input type="text" value={studentForm.rollNumber} onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                    <input type="text" value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>College Email (Username)</label>
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Batch Year</label>
                    <input type="text" value={studentForm.batchYear} onChange={(e) => setStudentForm({ ...studentForm, batchYear: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>CGPA (Optional)</label>
                    <input type="number" step="0.01" value={studentForm.cgpa} onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })} placeholder="8.50" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Custom Temp Password (Optional)</label>
                  <input type="text" value={studentForm.tempPassword} onChange={(e) => setStudentForm({ ...studentForm, tempPassword: e.target.value })} placeholder="Default: Student@2026!" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowAddStudentModal(false)} style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 2, padding: '9px', borderRadius: '6px', border: 'none', background: '#1c2d81', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Student</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Bulk CSV Import */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1.75rem', maxWidth: '520px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Bulk Import Students ({user?.departmentId || 'CSE'})
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px 0' }}>
              Paste CSV records: <code>RollNumber, FullName, CollegeEmail, BatchYear, Degree, CGPA</code>
            </p>

            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`23CSE001,Aarav Kumar,aarav@kongu.edu,2026,B.Tech,8.9\n23CSE002,Divya Mohan,divya@kongu.edu,2026,B.Tech,8.4`}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowBulkModal(false)} style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleBulkUploadCommit} style={{ flex: 2, padding: '9px', borderRadius: '6px', border: 'none', background: '#1c2d81', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Process Cohort Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

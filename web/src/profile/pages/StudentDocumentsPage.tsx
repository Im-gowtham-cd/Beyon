import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  FileCheck,
  FolderLock,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

export type DocCategory = 'ALL' | 'RESUME' | 'ACADEMIC_RECORD' | 'INTERNSHIP_REPORT' | 'GOVERNMENT_ID';

export interface StudentDocument {
  id: string;
  title: string;
  category: 'RESUME' | 'ACADEMIC_RECORD' | 'INTERNSHIP_REPORT' | 'GOVERNMENT_ID';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'VERIFIED' | 'PENDING_REVIEW';
  issuingAuthority: string;
  semesterOrYear?: string;
  storagePath: string;
}

const INITIAL_DOCS: StudentDocument[] = [
  {
    id: 'doc-1',
    title: 'Verified Technical ATS Resume (Auto-Generated)',
    category: 'RESUME',
    fileName: 'Siddharth_Mehta_Beyon_Verified_Resume_2026.pdf',
    fileSize: '480 KB',
    uploadDate: '2026-09-02',
    status: 'VERIFIED',
    issuingAuthority: 'Beyon Career Intelligence Engine',
    storagePath: 's3://beyon-resumes/student-1031/resume_v4.pdf',
  },
  {
    id: 'doc-2',
    title: 'Official Semester VI Marksheet & Cumulative Grade Card',
    category: 'ACADEMIC_RECORD',
    fileName: 'SRM_Semester_6_Official_GradeCard_Signed.pdf',
    fileSize: '1.4 MB',
    uploadDate: '2026-08-15',
    status: 'VERIFIED',
    issuingAuthority: 'SRM Institute of Science & Technology (Office of Controller of Examinations)',
    semesterOrYear: 'Semester 6',
    storagePath: 's3://beyon-documents/student-1031/sem6_marksheet.pdf',
  },
  {
    id: 'doc-3',
    title: 'Atlassian Cloud Systems Internship Completion Letter & Sign-Off',
    category: 'INTERNSHIP_REPORT',
    fileName: 'Atlassian_Internship_Completion_Report_Verified.pdf',
    fileSize: '890 KB',
    uploadDate: '2026-08-22',
    status: 'VERIFIED',
    issuingAuthority: 'Atlassian People Operations & Engineering Directorate',
    storagePath: 's3://beyon-documents/student-1031/atlassian_internship_cert.pdf',
  },
  {
    id: 'doc-4',
    title: 'Semester V Consolidated Marksheet & Grade Transcript',
    category: 'ACADEMIC_RECORD',
    fileName: 'SRM_Semester_5_Transcript.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2026-02-10',
    status: 'VERIFIED',
    issuingAuthority: 'SRM Institute of Science & Technology',
    semesterOrYear: 'Semester 5',
    storagePath: 's3://beyon-documents/student-1031/sem5_transcript.pdf',
  },
  {
    id: 'doc-5',
    title: 'Government Identity & University Student ID Card',
    category: 'GOVERNMENT_ID',
    fileName: 'Student_ID_Card_Official_Scan.pdf',
    fileSize: '620 KB',
    uploadDate: '2026-01-14',
    status: 'VERIFIED',
    issuingAuthority: 'Registrar & Ministry of Education Identification',
    storagePath: 's3://beyon-documents/student-1031/id_card.pdf',
  },
];

export function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<StudentDocument[]>(INITIAL_DOCS);
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for uploading a document
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'RESUME' | 'ACADEMIC_RECORD' | 'INTERNSHIP_REPORT' | 'GOVERNMENT_ID'>('ACADEMIC_RECORD');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [semYear, setSemYear] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter((d) => selectedCategory === 'ALL' || d.category === selectedCategory);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !selectedFileName) return;

    setUploading(true);
    setTimeout(() => {
      const newDoc: StudentDocument = {
        id: `doc-${Date.now()}`,
        title: docTitle,
        category: docCategory,
        fileName: selectedFileName,
        fileSize: '1.2 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'VERIFIED',
        issuingAuthority: issuingOrg || 'Academic University / Corporate Partner',
        semesterOrYear: semYear || undefined,
        storagePath: `s3://beyon-documents/student-1031/${selectedFileName}`,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setUploading(false);
      setIsUploadModalOpen(false);
      setDocTitle('');
      setSelectedFileName('');
      setIssuingOrg('');
      setSemYear('');
      setToastMessage(`Document "${newDoc.title}" uploaded to encrypted storage.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  const handleDeleteDoc = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your vault?`)) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setToastMessage(`Document removed from your vault.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'RESUME':
        return { label: 'Resume & CV', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
      case 'ACADEMIC_RECORD':
        return { label: 'Academic Transcript', bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'INTERNSHIP_REPORT':
        return { label: 'Internship Report', bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'GOVERNMENT_ID':
        return { label: 'Student / National ID', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' };
      default:
        return { label: cat, bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'ClashDisplay', 'Clash Display', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#fed601', color: '#1c2d81', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Secure Document Vault
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> AES-256 Encrypted at Rest
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, color: '#1c2d81', letterSpacing: '-0.02em' }}>
              Student Documents &amp; Academic Records
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#475569', maxWidth: '850px', lineHeight: 1.5 }}>
              Central repository for official university mark sheets, semester grade transcripts, accredited internship reports, verified resumes, and credential records accessible during recruiter screening.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/professional-profile"
              style={{
                padding: '9px 18px',
                background: '#ffffff',
                color: '#1c2d81',
                border: '1.5px solid #1c2d81',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              <span>Generate Verified Resume</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              style={{
                padding: '9px 20px',
                background: '#1c2d81',
                color: '#fed601',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Upload size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Vault Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #1c2d81', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Stored Documents</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>{documents.length} Files</div>
            <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>100% Verified &amp; Signed</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Academic Transcripts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
              {documents.filter((d) => d.category === 'ACADEMIC_RECORD').length} Transcripts
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Semesters V &amp; VI On Record</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Internship Reports</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#92400e', marginTop: '4px' }}>
              {documents.filter((d) => d.category === 'INTERNSHIP_REPORT').length} Completion Report
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Atlassian Cloud Systems</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', padding: '14px 18px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Vault Storage Used</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e40af', marginTop: '4px' }}>5.6 MB / 100 MB</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Cloud S3 Replica Synced</div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: `All Files (${documents.length})` },
          { key: 'RESUME', label: 'Resumes & CVs' },
          { key: 'ACADEMIC_RECORD', label: 'Semester Transcripts' },
          { key: 'INTERNSHIP_REPORT', label: 'Internship Reports' },
          { key: 'GOVERNMENT_ID', label: 'Student IDs' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key as DocCategory)}
            style={{
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: selectedCategory === tab.key ? 800 : 600,
              background: selectedCategory === tab.key ? '#1c2d81' : '#ffffff',
              color: selectedCategory === tab.key ? '#fed601' : '#334155',
              border: selectedCategory === tab.key ? '1px solid #1c2d81' : '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
          <FolderLock size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1c2d81' }}>No documents in this category</h3>
          <p style={{ margin: '6px 0 0', fontSize: '0.84rem' }}>Upload mark sheets or generate your resume to populate your vault.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDocs.map((doc) => {
            const badge = getCategoryLabel(doc.category);

            return (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'background 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '320px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '2px 7px', textTransform: 'uppercase' }}>
                        {badge.label}
                      </span>
                      {doc.semesterOrYear && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                          • {doc.semesterOrYear}
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {doc.title}
                    </h3>

                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Authority: <strong>{doc.issuingAuthority}</strong> • {doc.fileSize} • Uploaded {doc.uploadDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>VERIFIED</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    style={{
                      padding: '7px 12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#1c2d81',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setToastMessage(`Downloading "${doc.fileName}"...`)}
                    style={{
                      padding: '7px 12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#1c2d81',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                    title="Delete Document"
                    style={{
                      padding: '7px',
                      background: '#ffffff',
                      border: '1px solid #fee2e2',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', border: '2px solid #1c2d81', maxWidth: '620px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1c2d81', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #fed601' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fed601', textTransform: 'uppercase' }}>Encrypted File Upload</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>Add Document to Vault</h3>
              </div>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  padding: '24px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <Upload size={32} color="#1c2d81" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedFileName ? `Selected: ${selectedFileName}` : 'Click to browse or drop file here'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                  Supports PDF, PNG, JPG (Maximum file size: 10MB)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Semester 6 Consolidated Marksheet"
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Document Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  >
                    <option value="ACADEMIC_RECORD">Academic Transcript / Marksheet</option>
                    <option value="RESUME">Custom PDF Resume</option>
                    <option value="INTERNSHIP_REPORT">Internship Report / Certificate</option>
                    <option value="GOVERNMENT_ID">Student / National ID</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Semester / Batch (Optional)
                  </label>
                  <input
                    type="text"
                    value={semYear}
                    onChange={(e) => setSemYear(e.target.value)}
                    placeholder="e.g. Semester 6"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Issuing University / Authority
                </label>
                <input
                  type="text"
                  value={issuingOrg}
                  onChange={(e) => setIssuingOrg(e.target.value)}
                  placeholder="e.g. SRM Institute of Science & Technology"
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFileName}
                  style={{
                    padding: '8px 22px',
                    background: uploading || !selectedFileName ? '#94a3b8' : '#1c2d81',
                    color: '#fed601',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 900,
                    cursor: uploading || !selectedFileName ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'Encrypting & Storing...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', border: '2px solid #1c2d81', maxWidth: '650px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>Encrypted Document Preview</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{previewDoc.title}</h3>
              </div>
              <button type="button" onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '28px', textAlign: 'center', marginBottom: '20px' }}>
              <FileCheck size={48} color="#16a34a" style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{previewDoc.fileName}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Verified by: {previewDoc.issuingAuthority}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 800, marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={15} /> Validated Against Institution Registrar Records
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setToastMessage(`Downloading "${previewDoc.fileName}"...`);
                  setPreviewDoc(null);
                }}
                style={{
                  padding: '8px 20px',
                  background: '#1c2d81',
                  color: '#fed601',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

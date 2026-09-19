import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, RefreshCw, Clock, User, Hash } from 'lucide-react';

interface DoltCommitItem {
  commit_hash: string;
  committer: string;
  email?: string;
  date: string;
  message: string;
}

interface DoltBranchItem {
  name: string;
  hash: string;
  latest_committer: string;
  latest_committer_date: string;
  latest_commit_message: string;
}

export const DoltGitTab: React.FC = () => {
  const [commits, setCommits] = useState<DoltCommitItem[]>([]);
  const [branches, setBranches] = useState<DoltBranchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'log' | 'branches'>('log');
  const [selectedCommit, setSelectedCommit] = useState<DoltCommitItem | null>(null);

  const loadGitData = async () => {
    setLoading(true);
    try {
      const [logRes, branchRes] = await Promise.all([
        window.workbenchApi.getDoltLog(),
        window.workbenchApi.getDoltBranches(),
      ]);

      if (logRes.success && logRes.commits) {
        setCommits(logRes.commits);
        if (logRes.commits.length > 0 && !selectedCommit) {
          setSelectedCommit(logRes.commits[0]);
        }
      }

      if (branchRes.success && branchRes.branches) {
        setBranches(branchRes.branches);
      }
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGitData();
  }, []);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Dolt Version Control History</h1>
          <p>Inspect database commits, cell-level version history, and branches on Dolt</p>
        </div>
        <div className="tab-header-actions">
          <button onClick={loadGitData} disabled={loading} className="action-btn">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh Git State</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`action-btn ${activeSubTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('log')}
          style={{
            backgroundColor: activeSubTab === 'log' ? 'var(--bg-card)' : 'transparent',
            borderColor: activeSubTab === 'log' ? 'var(--border-highlight)' : 'transparent',
          }}
        >
          <GitCommit size={14} />
          <span>Commit Log ({commits.length})</span>
        </button>

        <button
          className={`action-btn ${activeSubTab === 'branches' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('branches')}
          style={{
            backgroundColor: activeSubTab === 'branches' ? 'var(--bg-card)' : 'transparent',
            borderColor: activeSubTab === 'branches' ? 'var(--border-highlight)' : 'transparent',
          }}
        >
          <GitBranch size={14} />
          <span>Branches ({branches.length})</span>
        </button>
      </div>

      {activeSubTab === 'log' && (
        <div className="split-pane">
          {/* Left: Commit List */}
          <div className="pane-left" style={{ width: '380px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              COMMIT TIMELINE
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {commits.map((c) => (
                <div
                  key={c.commit_hash}
                  className={`list-item-btn ${selectedCommit?.commit_hash === c.commit_hash ? 'selected' : ''}`}
                  onClick={() => setSelectedCommit(c)}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '12px 14px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {c.message || 'Initial commit'}
                    </span>
                    <span className="badge badge-sky" style={{ fontSize: '10px' }}>
                      {c.commit_hash.slice(0, 7)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{c.committer}</span>
                    <span>{new Date(c.date).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {commits.length === 0 && !loading && (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No commits recorded in Dolt log
                </div>
              )}
            </div>
          </div>

          {/* Right: Commit Details */}
          <div className="pane-right">
            {selectedCommit ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedCommit.message}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hash size={13} />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedCommit.commit_hash}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} />
                      <span>{selectedCommit.committer}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span>{new Date(selectedCommit.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    DOLT METADATA INSPECTION
                  </div>
                  <div className="json-viewer">
                    {JSON.stringify(selectedCommit, null, 2)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a commit to view details
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'branches' && (
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <GitBranch size={16} />
              <span>Dolt Active Branches</span>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Head Commit Hash</th>
                  <th>Latest Committer</th>
                  <th>Latest Commit Date</th>
                  <th>Latest Commit Message</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.name}>
                    <td style={{ fontWeight: 600, color: 'var(--color-emerald)' }}>{b.name}</td>
                    <td>{b.hash.slice(0, 10)}...</td>
                    <td>{b.latest_committer || '-'}</td>
                    <td>{b.latest_committer_date ? new Date(b.latest_committer_date).toLocaleString() : '-'}</td>
                    <td>{b.latest_commit_message || '-'}</td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No branches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

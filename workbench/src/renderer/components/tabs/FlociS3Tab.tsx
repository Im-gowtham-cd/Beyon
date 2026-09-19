import React, { useState, useEffect } from 'react';
import { FolderArchive, FileText, RefreshCw, Search, HardDrive } from 'lucide-react';

interface S3BucketItem {
  Name: string;
  CreationDate: string;
}

interface S3ObjectItem {
  Key: string;
  LastModified: string;
  ETag: string;
  Size: number;
  StorageClass: string;
}

export const FlociS3Tab: React.FC = () => {
  const [buckets, setBuckets] = useState<S3BucketItem[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [objects, setObjects] = useState<S3ObjectItem[]>([]);
  const [objectFilter, setObjectFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingObjects, setLoadingObjects] = useState(false);

  const loadBuckets = async () => {
    setLoading(true);
    try {
      const res = await window.workbenchApi.listS3Buckets();
      if (res.success && res.buckets) {
        setBuckets(res.buckets);
        if (!selectedBucket && res.buckets.length > 0) {
          setSelectedBucket(res.buckets[0].Name);
        }
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const loadObjects = async (bucketName: string) => {
    if (!bucketName) return;
    setLoadingObjects(true);
    try {
      const res = await window.workbenchApi.listS3Objects(bucketName);
      if (res.success) {
        setObjects(res.objects || []);
      } else {
        setObjects([]);
      }
    } catch {
      setObjects([]);
    } finally {
      setLoadingObjects(false);
    }
  };

  useEffect(() => {
    loadBuckets();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      loadObjects(selectedBucket);
    }
  }, [selectedBucket]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredObjects = objects.filter((o) => o.Key.toLowerCase().includes(objectFilter.toLowerCase()));

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Floci S3 Object Storage</h1>
          <p>Local AWS S3 storage emulator on port 4566, bucket inspection, and object explorer</p>
        </div>
        <div className="tab-header-actions">
          <button onClick={loadBuckets} disabled={loading} className="action-btn">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh Buckets</span>
          </button>
        </div>
      </div>

      <div className="split-pane">
        {/* Left Pane: Buckets */}
        <div className="pane-left" style={{ width: '320px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            S3 BUCKETS ({buckets.length})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {buckets.map((b) => (
              <div
                key={b.Name}
                className={`list-item-btn ${selectedBucket === b.Name ? 'selected' : ''}`}
                onClick={() => setSelectedBucket(b.Name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderArchive size={14} style={{ color: 'var(--color-amber)' }} />
                  <span style={{ fontSize: '12px' }}>{b.Name}</span>
                </div>
              </div>
            ))}
            {buckets.length === 0 && !loading && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No S3 buckets configured in Floci
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Objects */}
        <div className="pane-right">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HardDrive size={16} style={{ color: 'var(--color-amber)' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                s3://{selectedBucket}
              </div>
              <span className="badge badge-amber">{objects.length} objects</span>
            </div>

            <div style={{ width: '240px' }}>
              <input
                type="text"
                placeholder="Filter keys..."
                value={objectFilter}
                onChange={(e) => setObjectFilter(e.target.value)}
                className="input-text"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Object Key</th>
                  <th>Size</th>
                  <th>Storage Class</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {filteredObjects.map((obj) => (
                  <tr key={obj.Key}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      <FileText size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{obj.Key}</span>
                    </td>
                    <td>{formatSize(obj.Size)}</td>
                    <td><span className="badge badge-sky">{obj.StorageClass || 'STANDARD'}</span></td>
                    <td>{new Date(obj.LastModified).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredObjects.length === 0 && !loadingObjects && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No objects found in this bucket
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

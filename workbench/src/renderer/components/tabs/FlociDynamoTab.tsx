import React, { useState, useEffect } from 'react';
import { TableProperties, RefreshCw, Key, Database, Layers } from 'lucide-react';

interface DynamoTableItem {
  TableName: string;
  ItemCount: number;
  TableSizeBytes: number;
  KeySchema: { AttributeName: string; KeyType: string }[];
  AttributeDefinitions: { AttributeName: string; AttributeType: string }[];
}

export const FlociDynamoTab: React.FC = () => {
  const [tables, setTables] = useState<DynamoTableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await window.workbenchApi.listDynamoTables();
      if (res.success && res.tables) {
        setTables(res.tables);
        if (!selectedTable && res.tables.length > 0) {
          setSelectedTable(res.tables[0].TableName);
        }
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const scanTable = async (tableName: string) => {
    if (!tableName) return;
    setScanning(true);
    try {
      const res = await window.workbenchApi.scanDynamoTable(tableName);
      if (res.success) {
        setItems(res.items || []);
        setScannedCount(res.scannedCount || 0);
      } else {
        setItems([]);
        setScannedCount(0);
      }
    } catch {
      setItems([]);
      setScannedCount(0);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      scanTable(selectedTable);
    }
  }, [selectedTable]);

  const selectedTableMeta = tables.find((t) => t.TableName === selectedTable);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Floci DynamoDB NoSQL Inspector</h1>
          <p>Key-value and document tables in Floci AWS emulation with live item scan</p>
        </div>
        <div className="tab-header-actions">
          <button onClick={loadTables} disabled={loading} className="action-btn">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh Tables</span>
          </button>
        </div>
      </div>

      <div className="split-pane">
        {/* Left: Tables List */}
        <div className="pane-left" style={{ width: '320px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            DYNAMODB TABLES ({tables.length})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {tables.map((t) => (
              <div
                key={t.TableName}
                className={`list-item-btn ${selectedTable === t.TableName ? 'selected' : ''}`}
                onClick={() => setSelectedTable(t.TableName)}
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '10px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TableProperties size={14} style={{ color: 'var(--color-emerald)' }} />
                    <span style={{ fontWeight: 600 }}>{t.TableName}</span>
                  </div>
                  <span className="badge badge-emerald">{t.ItemCount || 0}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {t.KeySchema?.map((k) => (
                    <span key={k.AttributeName} style={{ fontFamily: 'var(--font-mono)' }}>
                      {k.KeyType === 'HASH' ? 'PK' : 'SK'}: {k.AttributeName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {tables.length === 0 && !loading && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No DynamoDB tables found
              </div>
            )}
          </div>
        </div>

        {/* Right: Table Scan & Items */}
        <div className="pane-right">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={16} style={{ color: 'var(--color-emerald)' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                {selectedTable || 'Select a table'}
              </div>
              <span className="badge badge-emerald">{scannedCount} items scanned</span>
            </div>
            <button
              onClick={() => scanTable(selectedTable)}
              disabled={scanning}
              className="action-btn"
            >
              <RefreshCw size={13} className={scanning ? 'spin' : ''} />
              <span>Rescan</span>
            </button>
          </div>

          {/* Key Schema Card */}
          {selectedTableMeta && (
            <div style={{ padding: '12px 18px', backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Key size={13} />
                <span>Primary Key:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-sky)', fontWeight: 600 }}>
                  {selectedTableMeta.KeySchema?.find((k) => k.KeyType === 'HASH')?.AttributeName || 'None'}
                </span>
              </div>
              {selectedTableMeta.KeySchema?.some((k) => k.KeyType === 'RANGE') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Layers size={13} />
                  <span>Sort Key:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-amber)', fontWeight: 600 }}>
                    {selectedTableMeta.KeySchema.find((k) => k.KeyType === 'RANGE')?.AttributeName}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Items Viewer */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, idx) => (
                <div key={idx} className="panel-card" style={{ marginBottom: 0 }}>
                  <div className="panel-header" style={{ padding: '8px 14px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Item #{idx + 1}
                    </span>
                  </div>
                  <div className="panel-body" style={{ padding: '10px 14px' }}>
                    <div className="json-viewer" style={{ maxHeight: '200px' }}>
                      {JSON.stringify(item, null, 2)}
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && !scanning && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  Table is empty (0 items returned from scan)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

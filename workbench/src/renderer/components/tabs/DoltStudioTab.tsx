import React, { useState, useEffect } from 'react';
import { Database, Search, Play, Table, Code, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface DoltTableItem {
  name: string;
  type: string;
}

export const DoltStudioTab: React.FC = () => {
  const [tables, setTables] = useState<DoltTableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableFilter, setTableFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'data' | 'schema' | 'sql'>('data');

  // Data view state
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Schema state
  const [schemaFields, setSchemaFields] = useState<any[]>([]);

  // SQL Console state
  const [customSql, setCustomSql] = useState<string>('SELECT * FROM users LIMIT 25;');
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[]; count: number; durationMs: number } | null>(null);
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Load tables
  const loadTables = async () => {
    try {
      const res = await window.workbenchApi.getDoltTables();
      if (res.success && res.tables) {
        setTables(res.tables);
        if (!selectedTable && res.tables.length > 0) {
          setSelectedTable(res.tables[0].name);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Load rows when table changes or pagination changes
  const loadTableData = async (tableName: string, offset = 0, search = '') => {
    if (!tableName) return;
    setLoadingData(true);
    setErrorMsg(null);
    try {
      const res = await window.workbenchApi.getDoltRows({
        tableName,
        limit: 50,
        offset,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setRows(res.rows || []);
        setColumns(res.columns || []);
        setTotalRows(res.total || 0);
      } else {
        setErrorMsg(res.error || 'Failed to load table rows');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Load schema
  const loadTableSchema = async (tableName: string) => {
    if (!tableName) return;
    try {
      const res = await window.workbenchApi.getDoltSchema(tableName);
      if (res.success) {
        setSchemaFields(res.columns || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      setPage(0);
      setSearchQuery('');
      loadTableData(selectedTable, 0, '');
      loadTableSchema(selectedTable);
      setCustomSql(`SELECT * FROM ${selectedTable} LIMIT 25;`);
    }
  }, [selectedTable]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadTableData(selectedTable, newPage * 50, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadTableData(selectedTable, 0, searchQuery);
  };

  const executeSql = async () => {
    if (!customSql.trim()) return;
    setSqlRunning(true);
    setSqlError(null);
    try {
      const res = await window.workbenchApi.executeDoltQuery(customSql);
      if (res.success) {
        setSqlResult(res);
      } else {
        setSqlError(res.error || 'Query execution failed');
      }
    } catch (err: any) {
      setSqlError(err.message);
    } finally {
      setSqlRunning(false);
    }
  };

  const filteredTables = tables.filter((t) => t.name.toLowerCase().includes(tableFilter.toLowerCase()));

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Dolt SQL Studio</h1>
          <p>Direct relational inspection, data browsing, and query console over MySQL 3306</p>
        </div>
        <div className="tab-header-actions">
          <button onClick={loadTables} className="action-btn">
            <RefreshCw size={13} />
            <span>Reload Tables</span>
          </button>
        </div>
      </div>

      <div className="split-pane">
        {/* Left Pane: Table Browser */}
        <div className="pane-left">
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter tables..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="input-text"
                style={{ paddingLeft: '30px', fontSize: '12px' }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredTables.map((tbl) => (
              <div
                key={tbl.name}
                className={`list-item-btn ${selectedTable === tbl.name ? 'selected' : ''}`}
                onClick={() => setSelectedTable(tbl.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={13} style={{ color: 'var(--text-muted)' }} />
                  <span>{tbl.name}</span>
                </div>
              </div>
            ))}
            {filteredTables.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No tables found
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Table Details / Data Grid / Query Console */}
        <div className="pane-right">
          {/* Top Bar */}
          <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                {selectedTable || 'Select a table'}
              </div>
              {selectedTable && (
                <span className="badge badge-emerald">{totalRows} total rows</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`action-btn ${activeSubTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('data')}
                style={{
                  backgroundColor: activeSubTab === 'data' ? 'var(--bg-hover)' : 'transparent',
                  borderColor: activeSubTab === 'data' ? 'var(--border-highlight)' : 'transparent',
                }}
              >
                <Table size={13} />
                <span>Data Grid</span>
              </button>

              <button
                className={`action-btn ${activeSubTab === 'schema' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('schema')}
                style={{
                  backgroundColor: activeSubTab === 'schema' ? 'var(--bg-hover)' : 'transparent',
                  borderColor: activeSubTab === 'schema' ? 'var(--border-highlight)' : 'transparent',
                }}
              >
                <Database size={13} />
                <span>Schema</span>
              </button>

              <button
                className={`action-btn ${activeSubTab === 'sql' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('sql')}
                style={{
                  backgroundColor: activeSubTab === 'sql' ? 'var(--bg-hover)' : 'transparent',
                  borderColor: activeSubTab === 'sql' ? 'var(--border-highlight)' : 'transparent',
                }}
              >
                <Code size={13} />
                <span>SQL Query</span>
              </button>
            </div>
          </div>

          {/* SubTab: Data Grid */}
          {activeSubTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Search & Pagination Bar */}
              <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', width: '320px' }}>
                  <input
                    type="text"
                    placeholder="Search in table..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-text"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  />
                  <button type="submit" className="action-btn" style={{ padding: '5px 10px' }}>
                    <Search size={12} />
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Rows {rows.length > 0 ? page * 50 + 1 : 0} - {Math.min((page + 1) * 50, totalRows)} of {totalRows}
                  </span>
                  <button
                    disabled={page === 0 || loadingData}
                    onClick={() => handlePageChange(page - 1)}
                    className="action-btn"
                    style={{ padding: '4px 8px' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    disabled={(page + 1) * 50 >= totalRows || loadingData}
                    onClick={() => handlePageChange(page + 1)}
                    className="action-btn"
                    style={{ padding: '4px 8px' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-rose-bg)', color: 'var(--color-rose)', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Data Table */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((col) => (
                          <td key={col} style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row[col] === null ? (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span>
                            ) : typeof row[col] === 'object' ? (
                              JSON.stringify(row[col])
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 && !loadingData && (
                      <tr>
                        <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          No rows found in this table
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab: Schema */}
          {activeSubTab === 'schema' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Nullable</th>
                    <th>Key</th>
                    <th>Default</th>
                    <th>Extra</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaFields.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--color-sky)' }}>{f.Field}</td>
                      <td>{f.Type}</td>
                      <td>{f.Null === 'YES' ? <span className="badge badge-amber">YES</span> : 'NO'}</td>
                      <td>
                        {f.Key === 'PRI' ? (
                          <span className="badge badge-emerald">PRIMARY</span>
                        ) : f.Key ? (
                          <span className="badge badge-sky">{f.Key}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{f.Default !== null ? String(f.Default) : <span style={{ color: 'var(--text-muted)' }}>NULL</span>}</td>
                      <td>{f.Extra || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab: SQL Console */}
          {activeSubTab === 'sql' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px', gap: '14px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  className="code-editor"
                  placeholder="Enter SQL statement (e.g. SELECT * FROM users LIMIT 10;)"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Press button to run arbitrary SQL queries on local Dolt
                  </span>
                  <button onClick={executeSql} disabled={sqlRunning} className="action-btn" style={{ backgroundColor: 'var(--color-emerald)', color: '#ffffff', borderColor: 'transparent' }}>
                    <Play size={13} />
                    <span>{sqlRunning ? 'Executing...' : 'Run Query'}</span>
                  </button>
                </div>
              </div>

              {sqlError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-rose-bg)', color: 'var(--color-rose)', borderRadius: '6px', fontSize: '12px' }}>
                  {sqlError}
                </div>
              )}

              {sqlResult && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', gap: '12px' }}>
                    <span>Duration: <strong style={{ color: 'var(--color-emerald)' }}>{sqlResult.durationMs}ms</strong></span>
                    <span>Returned: <strong>{sqlResult.count} rows</strong></span>
                  </div>

                  <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          {sqlResult.columns.map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResult.rows.map((r, ri) => (
                          <tr key={ri}>
                            {sqlResult.columns.map((c) => (
                              <td key={c}>
                                {r[c] === null ? (
                                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span>
                                ) : typeof r[c] === 'object' ? (
                                  JSON.stringify(r[c])
                                ) : (
                                  String(r[c])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

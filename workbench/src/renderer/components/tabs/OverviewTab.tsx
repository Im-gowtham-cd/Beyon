import React from 'react';
import { Database, Cloud, Cpu, Server, Activity, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { ClusterHealthData } from '../Header';
import type { TabKey } from '../Sidebar';

interface OverviewTabProps {
  clusterHealth: ClusterHealthData | null;
  counts: {
    doltTables: number;
    s3Buckets: number;
    sqsQueues: number;
    dynamoTables: number;
  };
  onNavigate: (tab: TabKey) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  clusterHealth,
  counts,
  onNavigate,
}) => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Cluster Topology & Infrastructure</h1>
          <p>Real-time telemetry and state inspection for local Dolt, Floci AWS services, and AI runtimes</p>
        </div>
      </div>

      <div className="card-grid">
        {/* Dolt SQL */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Dolt SQL Server</span>
            <Database size={18} className="text-emerald" />
          </div>
          <div className="metric-value">{counts.doltTables} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>tables</span></div>
          <div className="metric-subtitle">Port 3306 | DB: beyon | Versioned SQL</div>
          <div style={{ marginTop: '12px' }}>
            <span className={`badge ${clusterHealth?.dolt.online ? 'badge-emerald' : 'badge-rose'}`}>
              {clusterHealth?.dolt.online ? `ONLINE (${clusterHealth.dolt.latencyMs}ms)` : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Floci AWS Cloud */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Floci AWS Cloud</span>
            <Cloud size={18} className="text-amber" />
          </div>
          <div className="metric-value">
            {counts.s3Buckets + counts.sqsQueues + counts.dynamoTables}{' '}
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>resources</span>
          </div>
          <div className="metric-subtitle">
            Port 4566 | S3 ({counts.s3Buckets}) | SQS ({counts.sqsQueues}) | Dynamo ({counts.dynamoTables})
          </div>
          <div style={{ marginTop: '12px' }}>
            <span className={`badge ${clusterHealth?.floci.online ? 'badge-amber' : 'badge-rose'}`}>
              {clusterHealth?.floci.online ? `ONLINE (${clusterHealth.floci.latencyMs}ms)` : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* AI Engine */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">AI Engine</span>
            <Cpu size={18} className="text-violet" />
          </div>
          <div className="metric-value">qwen3.5:4b</div>
          <div className="metric-subtitle">Port 8000 | Ollama Qwen 3.5 | Cognitive Synthesis</div>
          <div style={{ marginTop: '12px' }}>
            <span className={`badge ${clusterHealth?.ai.online ? 'badge-violet' : 'badge-rose'}`}>
              {clusterHealth?.ai.online ? `ONLINE (${clusterHealth.ai.latencyMs}ms)` : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Spring Boot API */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Backend API</span>
            <Server size={18} className="text-sky" />
          </div>
          <div className="metric-value">Spring Boot</div>
          <div className="metric-subtitle">Port 8085 | REST, Security & Proctor Engine</div>
          <div style={{ marginTop: '12px' }}>
            <span className={`badge ${clusterHealth?.backend.online ? 'badge-sky' : 'badge-rose'}`}>
              {clusterHealth?.backend.online ? `ONLINE (${clusterHealth.backend.latencyMs}ms)` : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Activity size={16} />
            <span>Active Cluster Endpoints</span>
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Port</th>
                  <th>Endpoint</th>
                  <th>Latency</th>
                  <th>Status</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Dolt SQL Engine</td>
                  <td>Version-Controlled Relational DB</td>
                  <td>3306</td>
                  <td>127.0.0.1:3306/beyon</td>
                  <td>{clusterHealth?.dolt.online ? `${clusterHealth.dolt.latencyMs} ms` : '-'}</td>
                  <td>
                    {clusterHealth?.dolt.online ? (
                      <span className="badge badge-emerald"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> ONLINE</span>
                    ) : (
                      <span className="badge badge-rose"><XCircle size={12} style={{ marginRight: '4px' }} /> UNREACHABLE</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => onNavigate('dolt-studio')} className="action-btn primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      Table Studio <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Floci AWS Services</td>
                  <td>Cloud Emulator (S3, SQS, DynamoDB)</td>
                  <td>4566</td>
                  <td>http://localhost:4566</td>
                  <td>{clusterHealth?.floci.online ? `${clusterHealth.floci.latencyMs} ms` : '-'}</td>
                  <td>
                    {clusterHealth?.floci.online ? (
                      <span className="badge badge-amber"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> ONLINE</span>
                    ) : (
                      <span className="badge badge-rose"><XCircle size={12} style={{ marginRight: '4px' }} /> UNREACHABLE</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => onNavigate('floci-s3')} className="action-btn primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      S3 Storage <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>FastAPI AI Service</td>
                  <td>Cognitive Qwen 3.5 & Scoring Engine</td>
                  <td>8000</td>
                  <td>http://localhost:8000</td>
                  <td>{clusterHealth?.ai.online ? `${clusterHealth.ai.latencyMs} ms` : '-'}</td>
                  <td>
                    {clusterHealth?.ai.online ? (
                      <span className="badge badge-violet"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> ONLINE</span>
                    ) : (
                      <span className="badge badge-rose"><XCircle size={12} style={{ marginRight: '4px' }} /> UNREACHABLE</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => onNavigate('ai-telemetry')} className="action-btn primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      AI Diagnostics <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Spring Boot Core API</td>
                  <td>Core Backend & Assessment Engine</td>
                  <td>8085</td>
                  <td>http://localhost:8085/api/v1</td>
                  <td>{clusterHealth?.backend.online ? `${clusterHealth.backend.latencyMs} ms` : '-'}</td>
                  <td>
                    {clusterHealth?.backend.online ? (
                      <span className="badge badge-sky"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> ONLINE</span>
                    ) : (
                      <span className="badge badge-rose"><XCircle size={12} style={{ marginRight: '4px' }} /> UNREACHABLE</span>
                    )}
                  </td>
                  <td>
                    <span className="text-muted" style={{ fontSize: '11px' }}>Core Gateway</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>MongoDB Telemetry Store</td>
                  <td>Unstructured Telemetry / Logs</td>
                  <td>27017</td>
                  <td>127.0.0.1:27017</td>
                  <td>{clusterHealth?.mongo.online ? `${clusterHealth.mongo.latencyMs} ms` : '-'}</td>
                  <td>
                    {clusterHealth?.mongo.online ? (
                      <span className="badge badge-emerald"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> ONLINE</span>
                    ) : (
                      <span className="badge badge-rose"><XCircle size={12} style={{ marginRight: '4px' }} /> UNREACHABLE</span>
                    )}
                  </td>
                  <td>
                    <span className="text-muted" style={{ fontSize: '11px' }}>Log Sink</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

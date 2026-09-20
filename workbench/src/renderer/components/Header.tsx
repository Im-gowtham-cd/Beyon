import React from 'react';
import { Database, Cloud, Cpu, Server, RefreshCw } from 'lucide-react';

export interface ClusterServiceHealth {
  online: boolean;
  latencyMs: number;
  port: number;
  service: string;
  capabilities?: string[];
}

export interface ClusterHealthData {
  dolt: ClusterServiceHealth;
  floci: ClusterServiceHealth;
  ai: ClusterServiceHealth;
  backend: ClusterServiceHealth;
  redis?: ClusterServiceHealth;
  mongo?: ClusterServiceHealth;
  timestamp: string;
}

interface HeaderProps {
  clusterHealth: ClusterHealthData | null;
  onRefresh: () => void;
  refreshInterval: number;
  setRefreshInterval: (val: number) => void;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  clusterHealth,
  onRefresh,
  refreshInterval,
  setRefreshInterval,
  refreshing,
}) => {
  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <span style={{ color: 'var(--beyon-gold)' }}>B</span>
          <span style={{ color: '#ffffff' }}>Y</span>
        </div>
        <div>
          <div className="brand-title-row">
            <span className="brand-title">BEYON<span>WORKBENCH</span></span>
          </div>
          <div className="brand-subtitle">Realtime Database & Cloud Infrastructure Studio</div>
        </div>
      </div>

      <div className="service-status-bar">
        {/* Dolt Status */}
        <div className={`status-pill ${clusterHealth?.dolt.online ? 'online' : 'offline'}`}>
          <span className={`status-indicator ${clusterHealth?.dolt.online ? 'online' : 'offline'}`} />
          <Database size={13} />
          <span>Dolt (3306)</span>
          {clusterHealth?.dolt.online && <span className="badge-gold" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>{clusterHealth.dolt.latencyMs}ms</span>}
        </div>

        {/* Redis Status */}
        <div className={`status-pill ${clusterHealth?.redis?.online ? 'online' : 'offline'}`}>
          <span className={`status-indicator ${clusterHealth?.redis?.online ? 'online' : 'offline'}`} />
          <Database size={13} />
          <span>Redis (6379)</span>
          {clusterHealth?.redis?.online && <span className="badge-gold" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>{clusterHealth.redis.latencyMs}ms</span>}
        </div>

        {/* Floci Status */}
        <div className={`status-pill ${clusterHealth?.floci.online ? 'online' : 'offline'}`}>
          <span className={`status-indicator ${clusterHealth?.floci.online ? 'online' : 'offline'}`} />
          <Cloud size={13} />
          <span>Floci AWS (4566)</span>
          {clusterHealth?.floci.online && <span className="badge-gold" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>{clusterHealth.floci.latencyMs}ms</span>}
        </div>

        {/* AI Engine */}
        <div className={`status-pill ${clusterHealth?.ai.online ? 'online' : 'offline'}`}>
          <span className={`status-indicator ${clusterHealth?.ai.online ? 'online' : 'offline'}`} />
          <Cpu size={13} />
          <span>Qwen AI (8000)</span>
          {clusterHealth?.ai.online && <span className="badge-gold" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>{clusterHealth.ai.latencyMs}ms</span>}
        </div>

        {/* Backend Status */}
        <div className={`status-pill ${clusterHealth?.backend.online ? 'online' : 'offline'}`}>
          <span className={`status-indicator ${clusterHealth?.backend.online ? 'online' : 'offline'}`} />
          <Server size={13} />
          <span>Core API (8085)</span>
          {clusterHealth?.backend.online && <span className="badge-gold" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>{clusterHealth.backend.latencyMs}ms</span>}
        </div>
      </div>

      <div className="header-actions">
        <select
          aria-label="Polling interval"
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="select-compact"
        >
          <option value={3000}>Auto: 3s</option>
          <option value={5000}>Auto: 5s</option>
          <option value={10000}>Auto: 10s</option>
          <option value={30000}>Auto: 30s</option>
          <option value={0}>Manual Only</option>
        </select>

        <button
          onClick={onRefresh}
          className="action-btn primary"
          disabled={refreshing}
          title="Sync Resource State"
        >
          <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync Cluster'}</span>
        </button>
      </div>
    </header>
  );
};

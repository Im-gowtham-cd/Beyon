import React from 'react';
import {
  LayoutDashboard,
  Database,
  GitBranch,
  FolderArchive,
  Inbox,
  TableProperties,
  Radio,
  BrainCircuit,
} from 'lucide-react';

export type TabKey =
  | 'overview'
  | 'dolt-studio'
  | 'dolt-git'
  | 'floci-s3'
  | 'floci-sqs'
  | 'floci-dynamo'
  | 'floci-events'
  | 'ai-telemetry';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  counts: {
    doltTables: number;
    s3Buckets: number;
    sqsQueues: number;
    dynamoTables: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  counts,
}) => {
  return (
    <aside className="sidebar">
      <div className="nav-group-title">Cluster Overview</div>
      <div
        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveTab('overview')}
      >
        <div className="nav-item-left">
          <LayoutDashboard size={16} />
          <span>System Topology</span>
        </div>
      </div>

      <div className="nav-group-title">Dolt SQL Engine</div>
      <div
        className={`nav-item ${activeTab === 'dolt-studio' ? 'active' : ''}`}
        onClick={() => setActiveTab('dolt-studio')}
      >
        <div className="nav-item-left">
          <Database size={16} />
          <span>Table Studio</span>
        </div>
        <span className="nav-badge">{counts.doltTables} tbls</span>
      </div>

      <div
        className={`nav-item ${activeTab === 'dolt-git' ? 'active' : ''}`}
        onClick={() => setActiveTab('dolt-git')}
      >
        <div className="nav-item-left">
          <GitBranch size={16} />
          <span>Dolt Git History</span>
        </div>
      </div>

      <div className="nav-group-title">Floci AWS Cloud</div>
      <div
        className={`nav-item ${activeTab === 'floci-s3' ? 'active' : ''}`}
        onClick={() => setActiveTab('floci-s3')}
      >
        <div className="nav-item-left">
          <FolderArchive size={16} />
          <span>S3 Buckets</span>
        </div>
        <span className="nav-badge">{counts.s3Buckets}</span>
      </div>

      <div
        className={`nav-item ${activeTab === 'floci-sqs' ? 'active' : ''}`}
        onClick={() => setActiveTab('floci-sqs')}
      >
        <div className="nav-item-left">
          <Inbox size={16} />
          <span>SQS Queues</span>
        </div>
        <span className="nav-badge">{counts.sqsQueues}</span>
      </div>

      <div
        className={`nav-item ${activeTab === 'floci-dynamo' ? 'active' : ''}`}
        onClick={() => setActiveTab('floci-dynamo')}
      >
        <div className="nav-item-left">
          <TableProperties size={16} />
          <span>DynamoDB</span>
        </div>
        <span className="nav-badge">{counts.dynamoTables}</span>
      </div>

      <div
        className={`nav-item ${activeTab === 'floci-events' ? 'active' : ''}`}
        onClick={() => setActiveTab('floci-events')}
      >
        <div className="nav-item-left">
          <Radio size={16} />
          <span>EventBridge & SNS</span>
        </div>
      </div>

      <div className="nav-group-title">AI & Intelligence</div>
      <div
        className={`nav-item ${activeTab === 'ai-telemetry' ? 'active' : ''}`}
        onClick={() => setActiveTab('ai-telemetry')}
      >
        <div className="nav-item-left">
          <BrainCircuit size={16} />
          <span>Qwen AI Engine</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="cluster-meta-row">
          <span>Cluster Region</span>
          <span>us-east-1</span>
        </div>
        <div className="cluster-meta-row">
          <span>Dolt DB</span>
          <span>beyon</span>
        </div>
        <div className="cluster-meta-row">
          <span>AI Model</span>
          <span>qwen3.5:4b</span>
        </div>
      </div>
    </aside>
  );
};

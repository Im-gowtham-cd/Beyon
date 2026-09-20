import React, { useState, useEffect, useCallback } from 'react';
import { Header, ClusterHealthData } from './components/Header';
import { Sidebar, TabKey } from './components/Sidebar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { DoltStudioTab } from './components/tabs/DoltStudioTab';
import { DoltGitTab } from './components/tabs/DoltGitTab';
import { RedisStudioTab } from './components/tabs/RedisStudioTab';
import { FlociS3Tab } from './components/tabs/FlociS3Tab';
import { FlociSqsTab } from './components/tabs/FlociSqsTab';
import { FlociDynamoTab } from './components/tabs/FlociDynamoTab';
import { FlociEventBridgeTab } from './components/tabs/FlociEventBridgeTab';
import { AiTelemetryTab } from './components/tabs/AiTelemetryTab';
import { SkillAnalysisChatTab } from './components/tabs/SkillAnalysisChatTab';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [clusterHealth, setClusterHealth] = useState<ClusterHealthData | null>(null);
  const [counts, setCounts] = useState({
    doltTables: 0,
    redisKeys: 0,
    s3Buckets: 0,
    sqsQueues: 0,
    dynamoTables: 0,
  });
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [refreshing, setRefreshing] = useState(false);

  // Fast lightweight health check (TCP sockets only, takes ~15ms without blocking)
  const fetchHealth = useCallback(async () => {
    if (!window.workbenchApi) return;
    try {
      const health = await window.workbenchApi.getClusterHealth();
      setClusterHealth(health);
    } catch {
      // ignore
    }
  }, []);

  // Full resource counts query (runs on initial mount or manual Sync click)
  const syncAllResources = useCallback(async () => {
    if (!window.workbenchApi) return;
    setRefreshing(true);
    try {
      const [health, tablesRes, redisRes, s3Res, sqsRes, dynamoRes] = await Promise.allSettled([
        window.workbenchApi.getClusterHealth(),
        window.workbenchApi.getDoltTables(),
        window.workbenchApi.getRedisStatus(),
        window.workbenchApi.listS3Buckets(),
        window.workbenchApi.listSqsQueues(),
        window.workbenchApi.listDynamoTables(),
      ]);

      if (health.status === 'fulfilled') {
        setClusterHealth(health.value);
      }

      setCounts({
        doltTables: tablesRes.status === 'fulfilled' && tablesRes.value.success ? tablesRes.value.tables.length : 0,
        redisKeys: redisRes.status === 'fulfilled' && redisRes.value.success ? redisRes.value.totalKeys : 0,
        s3Buckets: s3Res.status === 'fulfilled' && s3Res.value.success ? s3Res.value.buckets.length : 0,
        sqsQueues: sqsRes.status === 'fulfilled' && sqsRes.value.success ? sqsRes.value.queues.length : 0,
        dynamoTables: dynamoRes.status === 'fulfilled' && dynamoRes.value.success ? dynamoRes.value.tables.length : 0,
      });
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    syncAllResources();
  }, [syncAllResources]);

  // Periodic health polling (lightweight TCP only)
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchHealth, refreshInterval]);

  return (
    <div className="app-container">
      <Header
        clusterHealth={clusterHealth}
        onRefresh={syncAllResources}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        refreshing={refreshing}
      />

      <div className="workspace-body">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
        />

        <main className="content-area">
          {activeTab === 'overview' && (
            <OverviewTab
              clusterHealth={clusterHealth}
              counts={counts}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'dolt-studio' && <DoltStudioTab />}

          {activeTab === 'dolt-git' && <DoltGitTab />}

          {activeTab === 'redis-studio' && <RedisStudioTab />}

          {activeTab === 'floci-s3' && <FlociS3Tab />}

          {activeTab === 'floci-sqs' && <FlociSqsTab />}

          {activeTab === 'floci-dynamo' && <FlociDynamoTab />}

          {activeTab === 'floci-events' && <FlociEventBridgeTab />}

          {activeTab === 'skill-chat' && <SkillAnalysisChatTab />}

          {activeTab === 'ai-telemetry' && <AiTelemetryTab />}
        </main>
      </div>
    </div>
  );
};

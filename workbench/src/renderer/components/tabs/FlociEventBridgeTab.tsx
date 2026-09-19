import React, { useState, useEffect } from 'react';
import { Radio, Send, RefreshCw, Bell, GitMerge, AlertCircle } from 'lucide-react';

interface EventRuleItem {
  Name: string;
  Arn: string;
  EventPattern: string;
  State: string;
}

interface SnsTopicItem {
  TopicArn: string;
}

export const FlociEventBridgeTab: React.FC = () => {
  const [rules, setRules] = useState<EventRuleItem[]>([]);
  const [topics, setTopics] = useState<SnsTopicItem[]>([]);
  const [source, setSource] = useState('beyon.assessment');
  const [detailType, setDetailType] = useState('ASSESSMENT_COMPLETED');
  const [detailJson, setDetailJson] = useState('{\n  "attemptId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",\n  "studentId": "00000000-0000-0000-0000-000000000001",\n  "score": 92.5\n}');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const [rulesRes, topicsRes] = await Promise.all([
        window.workbenchApi.listEventBridgeRules(),
        window.workbenchApi.listSnsTopics(),
      ]);
      if (rulesRes.success) setRules(rulesRes.rules || []);
      if (topicsRes.success) setTopics(topicsRes.topics || []);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublishEvent = async () => {
    setPublishing(true);
    setStatusMsg(null);
    try {
      const res = await window.workbenchApi.putEventBridgeEvent({
        source: source.trim(),
        detailType: detailType.trim(),
        detail: detailJson.trim(),
      });
      if (res.success) {
        setStatusMsg('Event published successfully to beyon.events bus');
      } else {
        setStatusMsg(`Failed to publish event: ${res.error}`);
      }
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>EventBridge & SNS Pub/Sub Engine</h1>
          <p>Event routing rules on beyon.events bus and active SNS notification topics</p>
        </div>
        <div className="tab-header-actions">
          <button onClick={loadData} disabled={loading} className="action-btn">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', color: 'var(--color-sky)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* EventBridge Rules */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <GitMerge size={16} />
              <span>EventBridge Rules (beyon.events)</span>
            </div>
            <span className="badge badge-sky">{rules.length} rules</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>State</th>
                  <th>Event Pattern</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.Name}>
                    <td style={{ fontWeight: 600 }}>{r.Name}</td>
                    <td><span className="badge badge-emerald">{r.State}</span></td>
                    <td style={{ fontSize: '11px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.EventPattern || 'All'}
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No rules configured on bus
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SNS Topics */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <Bell size={16} />
              <span>SNS Notification Topics</span>
            </div>
            <span className="badge badge-amber">{topics.length} topics</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic Name</th>
                  <th>Topic ARN</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => {
                  const topicName = t.TopicArn.split(':').pop() || t.TopicArn;
                  return (
                    <tr key={t.TopicArn}>
                      <td style={{ fontWeight: 600, color: 'var(--color-amber)' }}>{topicName}</td>
                      <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.TopicArn}</td>
                    </tr>
                  );
                })}
                {topics.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No SNS topics configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Event Publisher Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Radio size={16} />
            <span>Emit Test Event (beyon.events)</span>
          </div>
        </div>
        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                EVENT SOURCE
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="input-text"
                placeholder="e.g. beyon.assessment"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                DETAIL TYPE
              </label>
              <input
                type="text"
                value={detailType}
                onChange={(e) => setDetailType(e.target.value)}
                className="input-text"
                placeholder="e.g. ASSESSMENT_COMPLETED"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              EVENT DETAIL (JSON)
            </label>
            <textarea
              value={detailJson}
              onChange={(e) => setDetailJson(e.target.value)}
              className="code-editor"
              style={{ height: '100px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handlePublishEvent}
              disabled={publishing}
              className="action-btn"
              style={{ backgroundColor: 'var(--color-sky)', color: '#000000', fontWeight: 600, borderColor: 'transparent' }}
            >
              <Send size={13} />
              <span>{publishing ? 'Publishing Event...' : 'Publish to beyon.events'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

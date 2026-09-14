import React, { useState, useEffect } from 'react';
import { Inbox, Send, Trash2, RefreshCw, Eye, AlertCircle } from 'lucide-react';

interface SqsQueueItem {
  url: string;
  name: string;
  visible: number;
  inFlight: number;
  delayed: number;
}

export const FlociSqsTab: React.FC = () => {
  const [queues, setQueues] = useState<SqsQueueItem[]>([]);
  const [selectedQueueUrl, setSelectedQueueUrl] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [testPayload, setTestPayload] = useState<string>('{\n  "event": "BENCHMARK_PROCTOR_PING",\n  "timestamp": "2026-09-14T14:30:00Z"\n}');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadQueues = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await window.workbenchApi.listSqsQueues();
      if (res.success && res.queues) {
        setQueues(res.queues);
        if (!selectedQueueUrl && res.queues.length > 0) {
          setSelectedQueueUrl(res.queues[0].url);
        }
      }
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const peekMessages = async (url: string) => {
    if (!url) return;
    try {
      const res = await window.workbenchApi.peekSqsMessages(url);
      if (res.success) {
        setMessages(res.messages || []);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    loadQueues();
  }, []);

  useEffect(() => {
    if (selectedQueueUrl) {
      peekMessages(selectedQueueUrl);
    }
  }, [selectedQueueUrl]);

  const handleSendMessage = async () => {
    if (!selectedQueueUrl || !testPayload.trim()) return;
    setSending(true);
    try {
      const res = await window.workbenchApi.sendSqsMessage({
        queueUrl: selectedQueueUrl,
        messageBody: testPayload.trim(),
      });
      if (res.success) {
        setStatusMsg('Message published successfully to SQS');
        peekMessages(selectedQueueUrl);
        loadQueues();
      } else {
        setStatusMsg(`Failed to send message: ${res.error}`);
      }
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setSending(false);
    }
  };

  const handlePurgeQueue = async () => {
    if (!selectedQueueUrl) return;
    if (!confirm('Are you sure you want to purge all messages from this queue?')) return;
    try {
      const res = await window.workbenchApi.purgeSqsQueue(selectedQueueUrl);
      if (res.success) {
        setStatusMsg('Queue purged successfully');
        setMessages([]);
        loadQueues();
      } else {
        setStatusMsg(`Purge error: ${res.error}`);
      }
    } catch (err: any) {
      setStatusMsg(err.message);
    }
  };

  const selectedQueue = queues.find((q) => q.url === selectedQueueUrl);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-left">
          <h1>Floci SQS Message Queues</h1>
          <p>Real-time queue depth monitoring, message inspector, and publisher for Floci AWS SQS</p>
        </div>
        <div className="tab-header-actions">
          <button onClick={loadQueues} disabled={loading} className="action-btn">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh Queues</span>
          </button>
        </div>
      </div>

      <div className="split-pane">
        {/* Left Pane: Queues List */}
        <div className="pane-left" style={{ width: '340px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            SQS QUEUES ({queues.length})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {queues.map((q) => (
              <div
                key={q.url}
                className={`list-item-btn ${selectedQueueUrl === q.url ? 'selected' : ''}`}
                onClick={() => setSelectedQueueUrl(q.url)}
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '10px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Inbox size={14} style={{ color: 'var(--color-indigo)' }} />
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.name}
                    </span>
                  </div>
                  <span className={`badge ${q.visible > 0 ? 'badge-amber' : 'badge-sky'}`}>
                    {q.visible} msgs
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>In-flight: {q.inFlight}</span>
                  <span>Delayed: {q.delayed}</span>
                </div>
              </div>
            ))}
            {queues.length === 0 && !loading && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No SQS queues discovered
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Message Viewer & Dispatcher */}
        <div className="pane-right">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Inbox size={16} style={{ color: 'var(--color-indigo)' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                {selectedQueue?.name || 'Select a queue'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => peekMessages(selectedQueueUrl)} className="action-btn">
                <Eye size={13} />
                <span>Peek Messages</span>
              </button>
              <button onClick={handlePurgeQueue} className="action-btn" style={{ color: 'var(--color-rose)' }}>
                <Trash2 size={13} />
                <span>Purge</span>
              </button>
            </div>
          </div>

          {statusMsg && (
            <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--color-sky)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={14} />
              <span>{statusMsg}</span>
            </div>
          )}

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>
            {/* Publish test message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                PUBLISH TEST MESSAGE
              </div>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="code-editor"
                style={{ height: '80px' }}
                placeholder="JSON or text payload to enqueue..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSendMessage} disabled={sending} className="action-btn" style={{ backgroundColor: 'var(--color-indigo)', color: '#ffffff', borderColor: 'transparent' }}>
                  <Send size={13} />
                  <span>{sending ? 'Publishing...' : 'Send to Queue'}</span>
                </button>
              </div>
            </div>

            {/* Peeker / In-flight Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                PEEKED MESSAGES ({messages.length})
              </div>
              <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                {messages.map((m, idx) => (
                  <div key={m.MessageId || idx} style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <span>Message ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{m.MessageId}</strong></span>
                      <span>MD5: {m.MD5OfBody?.slice(0, 8)}</span>
                    </div>
                    <pre style={{ margin: 0, padding: '8px', background: '#050811', borderRadius: '4px', fontSize: '12px', color: '#38bdf8', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(m.Body), null, 2);
                        } catch {
                          return m.Body;
                        }
                      })()}
                    </pre>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No messages visible in queue (queue may be empty or in-flight)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

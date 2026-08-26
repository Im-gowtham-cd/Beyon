import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { DiscussionThread, DiscussionReply } from '../types/community';
import styles from './Community.module.css';

export function DiscussionsPage() {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { communityApi.getThreads().then(setThreads).catch(() => {}).finally(() => setLoading(false)); }, []);

  const selectThread = async (thread: DiscussionThread) => {
    setSelectedThread(thread);
    const r = await communityApi.getReplies(thread.id);
    setReplies(r);
  };

  const handleReply = async () => {
    if (!newReply.trim() || !selectedThread) return;
    const r = await communityApi.addReply(selectedThread.id, newReply);
    setReplies([...replies, r]);
    setNewReply('');
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const thread = await communityApi.createThread('general', newTitle, newContent);
    setThreads([thread, ...threads]);
    setShowCreate(false);
    setNewTitle('');
    setNewContent('');
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading discussions...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Discussions</h1>
        <button className={styles.createBtn} onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : '+ New Thread'}</button>
      </div>

      {showCreate && (
        <div className={styles.createForm}>
          <input className={styles.createInput} placeholder="Thread title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <textarea className={styles.createTextarea} placeholder="Describe your question or topic..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} />
          <button className={styles.createBtn} onClick={handleCreate}>Create Thread</button>
        </div>
      )}

      {!selectedThread ? (
        <div className={styles.threadList}>
          {threads.map(t => (
            <div className={styles.threadCard} key={t.id} onClick={() => selectThread(t)}>
              <div className={styles.threadHeader}>
                <span className={styles.threadTitle}>{t.title}</span>
                {t.solved && <span className={styles.solvedBadge}>✓ Solved</span>}
              </div>
              <div className={styles.threadMeta}>{t.replyCount} replies · {t.viewCount} views</div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className={styles.backBtn} onClick={() => setSelectedThread(null)}>← Back to threads</button>
          <div className={styles.threadDetail}>
            <h2>{selectedThread.title}</h2>
            <p className={styles.threadContent}>{selectedThread.content}</p>
          </div>
          <div className={styles.repliesSection}>
            {replies.map(r => (
              <div className={`${styles.replyItem} ${r.isAcceptedAnswer ? styles.replyAccepted : ''}`} key={r.id}>
                <div className={styles.replyContent}>{r.content}</div>
                <div className={styles.replyMeta}>{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
          <div className={styles.replyInput}>
            <textarea placeholder="Write your reply..." value={newReply} onChange={e => setNewReply(e.target.value)} rows={3} />
            <button className={styles.createBtn} onClick={handleReply}>Reply</button>
          </div>
        </div>
      )}
    </div>
  );
}

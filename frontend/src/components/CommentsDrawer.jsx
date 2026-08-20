import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { soundFX } from '../utils/audio';

export default function CommentsDrawer({ comments = [], onAddComment }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    soundFX.playClick();
    onAddComment(content);
    setContent('');
  };

  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(0, 0, 0, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>
            No comments yet. Start the trainer discussion!
          </p>
        ) : (
          comments.map((c, i) => (
            <div
              key={c.id || i}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#f87171' }}>
                  {c.trainer_name || 'Trainer'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Comment Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a trainer comment..."
          className="liquid-glass-input"
          style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '10px 16px', borderRadius: '12px' }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

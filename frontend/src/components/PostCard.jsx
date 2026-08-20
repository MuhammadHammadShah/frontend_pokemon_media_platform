import React, { useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import TypeBadge from './TypeBadge';
import ReactionPicker from './ReactionPicker';
import CommentsDrawer from './CommentsDrawer';
import { soundFX } from '../utils/audio';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = url.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

export default function PostCard({
  post,
  currentUserId,
  onReact,
  onAddComment,
  onDelete
}) {
  const [showComments, setShowComments] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isTCG = post.category === 'TCG Card';

  const mediaUrl = getMediaUrl(post.url || post.image_url);

  const handleMouseMove = (e) => {
    if (!isTCG) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTilt({
      x: ((y - centerY) / centerY) * -10,
      y: ((x - centerX) / centerX) * 10
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <article
      style={{
        background: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '22px',
        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        marginBottom: '22px',
        overflow: 'hidden',
        transform: isTCG ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
        transition: isTCG ? 'transform 0.1s ease-out' : 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className={isTCG ? 'holo-shimmer' : ''}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Post Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.1rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
          }}>
            {(post.trainer_name || post.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.96rem', color: '#ffffff', lineHeight: 1.2 }}>
              {post.trainer_name || post.email?.split('@')[0] || 'Trainer'}
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                {new Date(post.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span style={{
                fontSize: '0.68rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '2px 8px',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontWeight: 700
              }}>
                {post.category || 'General'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(post.pokemon_type1 || post.pokemon_type) && (
            <TypeBadge type={post.pokemon_type1 || post.pokemon_type} />
          )}
          {currentUserId && (post.user_id === currentUserId || post.is_owner) && (
            <button
              onClick={() => { soundFX.playClick(); onDelete(post.id); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px'
              }}
              className="hover:text-red-400"
              title="Delete Post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Caption if present */}
      {post.caption && (
        <div style={{ padding: '14px 20px', fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.5 }}>
          {post.caption}
        </div>
      )}

      {/* Post Image Media Attachment */}
      {mediaUrl && (
        <div style={{
          width: '100%',
          maxHeight: '560px',
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={mediaUrl}
            alt={post.caption || 'Pokemon Media'}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '560px',
              objectFit: 'contain'
            }}
            loading="lazy"
            onError={(e) => {
              console.error('Image load error for URL:', mediaUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Actions & Reactions Bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.22)'
      }}>
        {/* Real Pokéballs Reaction Picker */}
        <ReactionPicker
          reactions={post.reactions || {}}
          userReaction={post.user_reaction}
          onReact={(type) => onReact(post.id, type)}
        />

        <button
          onClick={() => { soundFX.playClick(); setShowComments(!showComments); }}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.15s ease'
          }}
          className="hover:bg-white/15"
        >
          <MessageCircle size={15} />
          <span>{post.comments_count || post.comments?.length || 0} Comments</span>
        </button>
      </div>

      {showComments && (
        <CommentsDrawer
          comments={post.recent_comments || post.comments || []}
          onAddComment={(content) => onAddComment(post.id, content)}
        />
      )}
    </article>
  );
}

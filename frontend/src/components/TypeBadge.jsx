import React from 'react';
import { TYPE_COLORS } from '../utils/typeColors';

export default function TypeBadge({ type, size = 'md' }) {
  if (!type) return null;
  const config = TYPE_COLORS[type] || { bg: '#64748b', text: '#FFFFFF', glow: 'rgba(100, 116, 139, 0.4)', icon: '🏷️' };
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs font-semibold' 
    : 'px-2.5 py-1 text-xs font-bold';

  return (
    <span
      className={`poke-badge ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        boxShadow: `0 0 10px ${config.glow}`
      }}
    >
      <span className="mr-0.5">{config.icon}</span>
      {type}
    </span>
  );
}

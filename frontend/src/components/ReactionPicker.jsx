import React from 'react';
import { soundFX } from '../utils/audio';

import pokeballImg from '../assets/reactions/pokeball.png';
import greatballImg from '../assets/reactions/greatball.png';
import ultraballImg from '../assets/reactions/ultraball.png';
import masterballImg from '../assets/reactions/masterball.png';
import cherishballImg from '../assets/reactions/cherishball.png';

const REACTION_BALLS = [
  { type: 'pokeball', img: pokeballImg, label: 'Pokéball', color: '#ef4444' },
  { type: 'greatball', img: greatballImg, label: 'Great Ball', color: '#3b82f6' },
  { type: 'ultraball', img: ultraballImg, label: 'Ultra Ball', color: '#eab308' },
  { type: 'masterball', img: masterballImg, label: 'Master Ball', color: '#a855f7' },
  { type: 'fire', img: cherishballImg, label: 'Cherish Ball', color: '#f97316' }
];

export default function ReactionPicker({ reactions = {}, userReaction, onReact }) {
  // Support both Dict format { "pokeball": 2 } and Array format [ { reaction_type: "pokeball" } ]
  const getCount = (type) => {
    if (Array.isArray(reactions)) {
      return reactions.filter(r => r.reaction_type === type).length;
    }
    return reactions[type] || 0;
  };

  const totalCount = Array.isArray(reactions)
    ? reactions.length
    : Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      borderRadius: '24px',
      padding: '4px 10px',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Total Catch Counter Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(239, 68, 68, 0.22)',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        padding: '3px 10px',
        borderRadius: '14px',
        fontSize: '0.82rem',
        fontWeight: 800,
        color: '#ffffff'
      }}>
        <img
          src={pokeballImg}
          alt="Caught"
          style={{ width: '16px', height: '16px', objectFit: 'contain', imageRendering: 'pixelated' }}
        />
        <span>{totalCount}</span>
      </div>

      {/* Individual Pokéball Reaction Sprites */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {REACTION_BALLS.map((ball) => {
          const isSelected = userReaction === ball.type;
          const count = getCount(ball.type);
          return (
            <button
              key={ball.type}
              onClick={() => { soundFX.playCatch(); onReact(ball.type); }}
              title={`${ball.label} (${count})`}
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? `1.5px solid ${ball.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isSelected ? `0 0 12px ${ball.color}90` : 'none'
              }}
              className="hover:scale-125"
            >
              <img
                src={ball.img}
                alt={ball.label}
                style={{
                  width: '22px',
                  height: '22px',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

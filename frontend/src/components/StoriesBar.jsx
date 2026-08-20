import React from 'react';
import { soundFX } from '../utils/audio';

const STARTERS = [
  { name: 'Pikachu', id: 25, type: 'Electric' },
  { name: 'Charizard', id: 6, type: 'Fire' },
  { name: 'Bulbasaur', id: 1, type: 'Grass' },
  { name: 'Squirtle', id: 7, type: 'Water' },
  { name: 'Gengar', id: 94, type: 'Ghost' },
  { name: 'Lucario', id: 448, type: 'Fighting' },
  { name: 'Eevee', id: 133, type: 'Normal' },
  { name: 'Mew', id: 151, type: 'Psychic' },
  { name: 'Mewtwo', id: 150, type: 'Psychic' },
  { name: 'Greninja', id: 658, type: 'Water' },
  { name: 'Infernape', id: 392, type: 'Fire' },
  { name: 'Rayquaza', id: 384, type: 'Dragon' }
];

export default function StoriesBar({ onSelectPokemon }) {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '20px',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        padding: '14px 20px',
        marginBottom: '20px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Star Badge Indicator */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.14)',
          paddingRight: '16px'
        }}>
          <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' }}>⭐</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.08em' }}>
            PARTNERS
          </span>
        </div>

        {/* Pokémon Avatars */}
        {STARTERS.map((poke) => (
          <div
            key={poke.name}
            onClick={() => { soundFX.playClick(); onSelectPokemon(poke.name); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              padding: '2px 4px'
            }}
            className="hover:scale-110"
          >
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(15, 23, 42, 0.7) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '5px',
              overflow: 'hidden'
            }}>
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`}
                alt={poke.name}
                style={{
                  width: '46px',
                  height: '46px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))'
                }}
                loading="lazy"
              />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f1f5f9', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {poke.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

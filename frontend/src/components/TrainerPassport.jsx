import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Edit3, Check, X, Search, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { pokeapi } from '../services/pokeapi';

// Import Anime Kanto Badges
import boulderBadge from '../assets/badges/boulder.png';
import cascadeBadge from '../assets/badges/cascade.png';
import thunderBadge from '../assets/badges/thunder.png';
import rainbowBadge from '../assets/badges/rainbow.png';
import soulBadge from '../assets/badges/soul.png';
import marshBadge from '../assets/badges/marsh.png';
import volcanoBadge from '../assets/badges/volcano.png';
import earthBadge from '../assets/badges/earth.png';

const KANTO_BADGES = [
  { name: 'Boulder Badge', gym: 'Pewter Gym', type: 'Rock', img: boulderBadge, color: '#94a3b8' },
  { name: 'Cascade Badge', gym: 'Cerulean Gym', type: 'Water', img: cascadeBadge, color: '#38bdf8' },
  { name: 'Thunder Badge', gym: 'Vermilion Gym', type: 'Electric', img: thunderBadge, color: '#facc15' },
  { name: 'Rainbow Badge', gym: 'Celadon Gym', type: 'Grass', img: rainbowBadge, color: '#4ade80' },
  { name: 'Soul Badge', gym: 'Fuchsia Gym', type: 'Poison', img: soulBadge, color: '#c084fc' },
  { name: 'Marsh Badge', gym: 'Saffron Gym', type: 'Psychic', img: marshBadge, color: '#f472b6' },
  { name: 'Volcano Badge', gym: 'Cinnabar Gym', type: 'Fire', img: volcanoBadge, color: '#fb923c' },
  { name: 'Earth Badge', gym: 'Viridian Gym', type: 'Ground', img: earthBadge, color: '#eab308' },
];

const POPULAR_PARTNERS = [
  { name: 'Pikachu', id: 25 },
  { name: 'Charizard', id: 6 },
  { name: 'Gengar', id: 94 },
  { name: 'Lucario', id: 448 },
  { name: 'Greninja', id: 658 },
  { name: 'Mew', id: 151 },
  { name: 'Mewtwo', id: 150 },
  { name: 'Infernape', id: 392 },
  { name: 'Eevee', id: 133 },
  { name: 'Rayquaza', id: 384 },
  { name: 'Blastoise', id: 9 },
  { name: 'Venusaur', id: 3 }
];

export default function TrainerPassport({ trainerProfile, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(trainerProfile?.trainer_name || 'Ash Ketchum');
  const [bio, setBio] = useState(trainerProfile?.bio || 'Aiming to be the very best Pokémon Master!');
  const [partner, setPartner] = useState(trainerProfile?.partner_pokemon || trainerProfile?.starter_pokemon || 'Pikachu');
  const [avatarUrl, setAvatarUrl] = useState(trainerProfile?.avatar_url || '');
  const [pokemonArtwork, setPokemonArtwork] = useState('');
  
  // Custom Avatar Mode: 'pokemon' or 'custom'
  const [avatarMode, setAvatarMode] = useState('pokemon');
  const [pokeSearch, setPokeSearch] = useState('');
  const [unlockedBadges, setUnlockedBadges] = useState([0, 1, 2]);

  // Load Pokédex Official Artwork for partner Pokémon
  useEffect(() => {
    const currentPartner = partner || 'Pikachu';
    pokeapi.fetchPokemonDetails(currentPartner.toLowerCase())
      .then(details => {
        if (details?.officialArt) {
          setPokemonArtwork(details.officialArt);
        } else {
          // Fallback to official-artwork repo
          setPokemonArtwork(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`);
        }
      })
      .catch(() => {
        setPokemonArtwork(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`);
      });
  }, [partner]);

  const handleSave = () => {
    soundFX.playClick();
    onUpdateProfile({
      trainer_name: name,
      bio: bio,
      starter_pokemon: partner,
      favorite_pokemon: partner,
      avatar_url: avatarMode === 'custom' ? avatarUrl : ''
    });
    setIsEditing(false);
  };

  const handleBadgeClick = (index) => {
    soundFX.playBadge();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (!unlockedBadges.includes(index)) {
      setUnlockedBadges([...unlockedBadges, index]);
    } else {
      setUnlockedBadges(unlockedBadges.filter(i => i !== index));
    }
  };

  const handleSelectPartner = async (pokeName) => {
    soundFX.playCatch();
    setPartner(pokeName);
    const details = await pokeapi.fetchPokemonDetails(pokeName.toLowerCase());
    if (details?.officialArt) {
      setPokemonArtwork(details.officialArt);
    }
  };

  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  // Determine displayed avatar image
  const displayAvatar = (trainerProfile?.avatar_url || avatarUrl)
    ? (trainerProfile?.avatar_url || avatarUrl)
    : (pokemonArtwork || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        padding: '32px',
        marginBottom: '32px'
      }}
    >
      {/* Trainer ID Header Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        paddingBottom: '28px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          {/* Circular Frosted Avatar with Pokédex Starter Artwork */}
          <div style={{
            width: '92px',
            height: '92px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 0 20px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              src={displayAvatar}
              alt="Trainer Avatar"
              style={{
                width: '84%',
                height: '84%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {trainerProfile?.trainer_name || name}
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#0f172a',
                fontWeight: 900,
                fontSize: '0.78rem',
                padding: '3px 10px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
              }}>
                LVL {trainerProfile?.level || 4}
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.94rem', marginTop: '5px', maxWidth: '480px' }}>
              {trainerProfile?.bio || bio}
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
              <span style={{
                fontSize: '0.82rem',
                color: '#f8fafc',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '3px 10px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ⭐ Partner: <strong style={{ color: '#facc15' }}>{trainerProfile?.starter_pokemon || partner}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          style={{
            background: isEditing
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'rgba(255, 255, 255, 0.08)',
            border: isEditing
              ? '1px solid rgba(34, 197, 94, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.92rem',
            padding: '10px 18px',
            borderRadius: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isEditing ? '0 4px 16px rgba(34, 197, 94, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease'
          }}
          className="hover:scale-105"
        >
          {isEditing ? <><Check size={17} /> Save Changes</> : <><Edit3 size={17} /> Edit Profile</>}
        </button>
      </div>

      {/* Edit Profile Studio Drawer */}
      {isEditing && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#f59e0b' }} />
            Edit Trainer Details & Avatar
          </h3>

          {/* Mode Switcher: Pokédex Artwork or Custom Upload */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => { soundFX.playClick(); setAvatarMode('pokemon'); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: avatarMode === 'pokemon' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(255, 255, 255, 0.06)',
                border: avatarMode === 'pokemon' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                transition: 'all 0.2s ease'
              }}
            >
              Pokédex Starter Avatar
            </button>
            <button
              type="button"
              onClick={() => { soundFX.playClick(); setAvatarMode('custom'); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: avatarMode === 'custom' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.06)',
                border: avatarMode === 'custom' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                transition: 'all 0.2s ease'
              }}
            >
              Upload Custom Image
            </button>
          </div>

          {avatarMode === 'pokemon' ? (
            /* Choose Pokémon Partner Avatar */
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '10px' }}>
                SELECT POKÉMON PARTNER (SETS POKÉDEX AVATAR)
              </label>
              
              {/* Quick Popular Pokémon Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {POPULAR_PARTNERS.map(p => (
                  <div
                    key={p.name}
                    onClick={() => handleSelectPartner(p.name)}
                    style={{
                      padding: '8px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: partner.toLowerCase() === p.name.toLowerCase() ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: partner.toLowerCase() === p.name.toLowerCase() ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover:scale-105"
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                      alt={p.name}
                      style={{ width: '42px', height: '42px', objectFit: 'contain', margin: '0 auto' }}
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Pokémon Name Input */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={pokeSearch}
                  onChange={(e) => setPokeSearch(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && pokeSearch.trim()) {
                      e.preventDefault();
                      await handleSelectPartner(pokeSearch.trim());
                      setPokeSearch('');
                    }
                  }}
                  placeholder="Or type any Pokémon name and press Enter (e.g. Snorlax, Garchomp, Sylveon)..."
                  className="liquid-glass-input"
                  style={{ width: '100%', padding: '10px 14px 10px 40px', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          ) : (
            /* Upload Custom Avatar Image */
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '8px' }}>
                UPLOAD CUSTOM PROFILE IMAGE / PHOTO
              </label>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  position: 'relative',
                  flex: 1
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarUpload}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  <Upload size={24} style={{ color: '#3b82f6', margin: '0 auto 4px' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>Choose Image File</span>
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Or paste direct image URL..."
                    className="liquid-glass-input"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Name & Bio Input Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                TRAINER NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="liquid-glass-input"
                style={{ width: '100%', padding: '10px 14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                PARTNER POKÉMON NAME
              </label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                className="liquid-glass-input"
                style={{ width: '100%', padding: '10px 14px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
              TRAINER BIO / MOTTO
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="liquid-glass-input"
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>
        </div>
      )}

      {/* Kanto Gym Badges Case with Authentic Anime Cartoon Images */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Award size={24} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
            Kanto Gym Badges Showcase
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>
            ({unlockedBadges.length} / {KANTO_BADGES.length} Unlocked)
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '14px'
        }}>
          {KANTO_BADGES.map((badge, idx) => {
            const isUnlocked = unlockedBadges.includes(idx);
            return (
              <div
                key={badge.name}
                onClick={() => handleBadgeClick(idx)}
                style={{
                  padding: '16px 12px',
                  borderRadius: '18px',
                  background: isUnlocked
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: isUnlocked
                    ? `1.5px solid ${badge.color}`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: isUnlocked
                    ? `0 0 20px ${badge.color}50, inset 0 1px 1px rgba(255,255,255,0.4)`
                    : 'none',
                  opacity: isUnlocked ? 1 : 0.4
                }}
                className="hover:scale-105"
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  margin: '0 auto 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: isUnlocked
                    ? `drop-shadow(0 0 10px ${badge.color}90)`
                    : 'grayscale(100%) opacity(40%)'
                }}>
                  <img
                    src={badge.img}
                    alt={badge.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isUnlocked ? '#ffffff' : '#94a3b8' }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: badge.color, marginTop: '2px', fontWeight: 700 }}>
                  {badge.gym}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

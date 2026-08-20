import React, { useState, useEffect } from 'react';
import { PlusSquare, BookOpen, User, LogOut } from 'lucide-react';
import { soundFX } from '../utils/audio';
import pokeball3D from '../assets/pokeball-3d.png';
import { pokeapi } from '../services/pokeapi';

export default function Navbar({
  currentUser,
  trainerProfile,
  onOpenUpload,
  onOpenPokedex,
  onTabChange,
  activeTab,
  onLogout
}) {
  const [partnerArt, setPartnerArt] = useState('');

  useEffect(() => {
    const partner = trainerProfile?.starter_pokemon || trainerProfile?.partner_pokemon || 'Pikachu';
    if (!trainerProfile?.avatar_url) {
      pokeapi.fetchPokemonDetails(partner.toLowerCase())
        .then(details => {
          if (details?.officialArt) {
            setPartnerArt(details.officialArt);
          }
        })
        .catch(() => {});
    }
  }, [trainerProfile]);

  const avatarSrc = trainerProfile?.avatar_url || partnerArt || pokeball3D;

  return (
    <header className="liquid-glass-nav" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px',
      marginBottom: '28px'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo Branding */}
        <div
          onClick={() => { soundFX.playClick(); onTabChange('feed'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))'
          }}>
            <img src={pokeball3D} alt="PokéSocial" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1
            }}>
              Poké<span style={{ color: '#ef4444' }}>Social</span>
            </h1>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
              TRAINER NETWORK
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Post Studio Button */}
          <button
            onClick={() => { soundFX.playClick(); onOpenUpload(); }}
            className="btn-primary"
            style={{ fontSize: '0.88rem', padding: '8px 16px' }}
          >
            <PlusSquare size={17} />
            <span>Post Studio</span>
          </button>

          {/* Pokédex Explorer Button */}
          <button
            onClick={() => { soundFX.playClick(); onOpenPokedex(); }}
            className="btn-secondary"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.88rem',
              padding: '8px 14px'
            }}
          >
            <BookOpen size={17} />
            <span>Pokédex</span>
          </button>

          {/* Profile Passport Toggle */}
          <button
            onClick={() => { soundFX.playClick(); onTabChange(activeTab === 'profile' ? 'feed' : 'profile'); }}
            className="btn-secondary"
            style={{
              background: activeTab === 'profile' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              borderColor: activeTab === 'profile' ? '#3b82f6' : 'rgba(255, 255, 255, 0.14)',
              fontSize: '0.88rem',
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={avatarSrc}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <span>{trainerProfile?.trainer_name || 'Passport'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => { soundFX.playClick(); onLogout(); }}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.2)'
            }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import pokeball3D from '../assets/pokeball-3d.png';
import { soundFX } from '../utils/audio';

export default function AuthModal({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    soundFX.playClick();
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
      soundFX.playCatch();
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '36px 32px',
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          textAlign: 'center'
        }}
      >
        {/* Realistic 3D Pokéball PNG Asset */}
        <div style={{
          width: '88px',
          height: '88px',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 25px rgba(56, 189, 248, 0.45))',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'; soundFX.playClick(); }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
        onClick={() => soundFX.playCatch()}
        >
          <img
            src={pokeball3D}
            alt="3D Pokéball"
            style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }}
          />
        </div>

        {/* Branding Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Poké<span style={{ color: '#ef4444' }}>Social</span>
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginBottom: '24px' }}>
          The Premier Social Network for Pokémon Trainers
        </p>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.45)',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => { soundFX.playClick(); setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isLogin ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
              color: isLogin ? '#ffffff' : '#94a3b8',
              boxShadow: isLogin ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            Trainer Login
          </button>
          <button
            type="button"
            onClick={() => { soundFX.playClick(); setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: !isLogin ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
              color: !isLogin ? '#ffffff' : '#94a3b8',
              boxShadow: !isLogin ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            New Trainer
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Trainer Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ash.ketchum@pallettown.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <span>Connecting to PokéCenter...</span>
            ) : isLogin ? (
              <>🚀 Enter PokéSocial</>
            ) : (
              <>⚡ Begin Trainer Journey</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, X, Volume2, Shield, Swords, Heart, Zap } from 'lucide-react';
import TypeBadge from './TypeBadge';
import { pokeapi } from '../services/pokeapi';
import { soundFX } from '../utils/audio';

export default function PokedexModal({ isOpen, onClose }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialPokemon();
    }
  }, [isOpen]);

  const loadInitialPokemon = async () => {
    try {
      setLoading(true);
      const list = await pokeapi.getPokemonList(40);
      setPokemonList(list);
      if (list.length > 0) {
        const details = await pokeapi.getPokemonDetails(list[0].rawName || list[0].name);
        setSelectedPokemon(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    try {
      setLoading(true);
      const details = await pokeapi.getPokemonDetails(searchTerm.toLowerCase().trim());
      if (details) setSelectedPokemon(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (name) => {
    soundFX.playClick();
    try {
      setLoading(true);
      const details = await pokeapi.getPokemonDetails(name);
      if (details) setSelectedPokemon(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playCry = () => {
    if (selectedPokemon?.cryAudio) {
      const audio = new Audio(selectedPokemon.cryAudio);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } else {
      soundFX.playCatch();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} className="liquid-glass-overlay">
      <div className="liquid-glass" style={{
        width: '100%',
        maxWidth: '880px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔴</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>National Pokédex</h2>
          </div>
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            className="hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: '450px' }}>
          {/* Left Side: Search & List */}
          <div style={{
            width: '320px',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px'
          }}>
            <form onSubmit={handleSearch} style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="liquid-glass-input"
                  style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: '0.86rem' }}
                />
              </div>
            </form>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pokemonList.map((p) => (
                <div
                  key={p.name}
                  onClick={() => handleSelect(p.rawName || p.name)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedPokemon?.name.toLowerCase() === p.name.toLowerCase() ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedPokemon?.name.toLowerCase() === p.name.toLowerCase() ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize', color: '#ffffff' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    #{String(p.id).padStart(3, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Detailed Radar Card */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {selectedPokemon ? (
              <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto 16px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={selectedPokemon.officialArt}
                    alt={selectedPokemon.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.6))' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, textTransform: 'capitalize', color: '#ffffff' }}>
                    {selectedPokemon.name}
                  </h3>
                  <button
                    onClick={playCry}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', padding: '6px', color: '#f59e0b', cursor: 'pointer' }}
                    title="Play Pokémon Cry"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                  {selectedPokemon.types.map(t => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>

                {/* Base Stats Radar Bars */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', marginBottom: '12px', letterSpacing: '0.05em' }}>
                    BASE STATS
                  </div>
                  {Object.entries(selectedPokemon.stats).map(([stat, val]) => (
                    <div key={stat} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'uppercase' }}>{stat}</span>
                        <span>{val}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (val / 160) * 100)}%`,
                          height: '100%',
                          background: stat === 'hp' ? '#ef4444' : stat === 'attack' ? '#f59e0b' : stat === 'defense' ? '#3b82f6' : '#10b981',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ margin: 'auto', color: '#94a3b8' }}>Select a Pokémon from the directory</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

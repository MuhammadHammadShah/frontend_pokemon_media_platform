import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Volume2, Shield, Swords, Heart, Zap, Sparkles, Filter } from 'lucide-react';
import TypeBadge from './TypeBadge';
import { pokeapi } from '../services/pokeapi';
import { soundFX } from '../utils/audio';

const GENERATIONS = [
  { label: 'All', start: 1, end: 1025 },
  { label: 'Gen 1 Kanto', start: 1, end: 151 },
  { label: 'Gen 2 Johto', start: 152, end: 251 },
  { label: 'Gen 3 Hoenn', start: 252, end: 386 },
  { label: 'Gen 4 Sinnoh', start: 387, end: 493 },
  { label: 'Gen 5 Unova', start: 494, end: 649 },
  { label: 'Gen 6 Kalos', start: 650, end: 721 },
  { label: 'Gen 7 Alola', start: 722, end: 809 },
  { label: 'Gen 8 Galar', start: 810, end: 905 },
  { label: 'Gen 9 Paldea', start: 906, end: 1025 },
];

export default function PokedexModal({ isOpen, onClose }) {
  const [allPokemon, setAllPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGen, setSelectedGen] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);

  // Load all 1025 National Pokédex entries on open
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      pokeapi.fetchAllPokemonNames()
        .then(async (list) => {
          setAllPokemon(list);
          if (list.length > 0 && !selectedPokemon) {
            const first = await pokeapi.fetchPokemonDetails(list[0].id);
            setSelectedPokemon(first);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Filtered Pokémon based on Generation and Search
  const filteredList = useMemo(() => {
    const gen = GENERATIONS[selectedGen];
    let list = allPokemon.filter(p => p.id >= gen.start && p.id <= gen.end);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.rawName.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }
    return list;
  }, [allPokemon, selectedGen, searchTerm]);

  // Reset pagination count on search/gen change
  useEffect(() => {
    setVisibleCount(60);
  }, [selectedGen, searchTerm]);

  const handleSelectPokemon = async (pokemon) => {
    soundFX.playClick();
    setDetailsLoading(true);
    try {
      const details = await pokeapi.fetchPokemonDetails(pokemon.id || pokemon.rawName);
      if (details) {
        setSelectedPokemon(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const playCry = () => {
    if (selectedPokemon?.cryAudio) {
      const audio = new Audio(selectedPokemon.cryAudio);
      audio.volume = 0.5;
      audio.play().catch(() => soundFX.playBadge());
    } else {
      soundFX.playBadge();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '92vh',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '26px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(239, 68, 68, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 12px #ef4444, inset 0 1px 2px rgba(255,255,255,0.8)'
            }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              National Pokédex <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>(1,025 Pokémon)</span>
            </h2>
          </div>

          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            className="hover:scale-110"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Generation Bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search all 1,025 Pokémon by Name or Pokédex # (e.g. 25, Charizard, Greninja)..."
              className="liquid-glass-input"
              style={{ width: '100%', padding: '10px 14px 10px 42px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Generation Scroll Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {GENERATIONS.map((gen, idx) => (
              <button
                key={gen.label}
                onClick={() => { soundFX.playClick(); setSelectedGen(idx); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: selectedGen === idx ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedGen === idx ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  boxShadow: selectedGen === idx ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {gen.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Split Content (List on Left, Details on Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Pokémon Grid / List */}
          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <Sparkles size={24} style={{ color: '#ef4444', animation: 'spin 1.5s linear infinite', margin: '0 auto 8px' }} />
                <span>Loading National Dex...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                No Pokémon found matching "{searchTerm}"
              </div>
            ) : (
              <>
                {filteredList.slice(0, visibleCount).map((p) => {
                  const isSelected = selectedPokemon?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPokemon(p)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSelected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.12s ease'
                      }}
                      className="hover:bg-white/10"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.sprite}
                          alt={p.name}
                          style={{ width: '36px', height: '36px', objectFit: 'contain', imageRendering: 'pixelated' }}
                          loading="lazy"
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                          {p.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: isSelected ? '#fca5a5' : '#64748b', fontWeight: 700 }}>
                        {p.dexNumber}
                      </span>
                    </div>
                  );
                })}

                {visibleCount < filteredList.length && (
                  <button
                    onClick={() => setVisibleCount(v => v + 60)}
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                    className="hover:bg-white/15"
                  >
                    Load More ({filteredList.length - visibleCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>

          {/* Pokémon Detail Showcase */}
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            {selectedPokemon ? (
              <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                {/* Visual Showcase Card */}
                <div style={{
                  background: 'radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '22px',
                  padding: '24px',
                  textAlign: 'center',
                  position: 'relative',
                  marginBottom: '20px'
                }}>
                  <div style={{ position: 'absolute', top: '16px', left: '18px', fontSize: '0.9rem', fontWeight: 900, color: '#94a3b8' }}>
                    {selectedPokemon.dexNumber}
                  </div>

                  <button
                    onClick={playCry}
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '16px',
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                    className="hover:scale-110"
                    title="Play Pokémon Cry"
                  >
                    <Volume2 size={18} />
                  </button>

                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={selectedPokemon.officialArt}
                      alt={selectedPokemon.name}
                      style={{
                        maxHeight: '170px',
                        maxWidth: '170px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.6))',
                        animation: 'floatSlow 4s ease-in-out infinite'
                      }}
                    />
                  </div>

                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '12px' }}>
                    {selectedPokemon.name}
                  </h3>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                    {selectedPokemon.types?.map(t => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '14px', fontSize: '0.86rem', color: '#cbd5e1' }}>
                    <span><strong>Height:</strong> {selectedPokemon.height} m</span>
                    <span><strong>Weight:</strong> {selectedPokemon.weight} kg</span>
                  </div>
                </div>

                {/* Base Stats Breakdown */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  padding: '20px'
                }}>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                    Base Combat Statistics
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'HP', val: selectedPokemon.stats?.hp, max: 255, color: '#22c55e' },
                      { label: 'Attack', val: selectedPokemon.stats?.attack, max: 200, color: '#ef4444' },
                      { label: 'Defense', val: selectedPokemon.stats?.defense, max: 230, color: '#3b82f6' },
                      { label: 'Sp. Atk', val: selectedPokemon.stats?.spAtk, max: 200, color: '#f97316' },
                      { label: 'Sp. Def', val: selectedPokemon.stats?.spDef, max: 230, color: '#a855f7' },
                      { label: 'Speed', val: selectedPokemon.stats?.speed, max: 200, color: '#eab308' },
                    ].map(stat => (
                      <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '70px', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8' }}>
                          {stat.label}
                        </span>
                        <span style={{ width: '32px', fontSize: '0.8rem', fontWeight: 900, color: '#ffffff', textAlign: 'right' }}>
                          {stat.val || 50}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, ((stat.val || 50) / stat.max) * 100)}%`,
                            height: '100%',
                            background: stat.color,
                            borderRadius: '6px',
                            boxShadow: `0 0 8px ${stat.color}80`
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                Select any Pokémon from the Pokédex to view full details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

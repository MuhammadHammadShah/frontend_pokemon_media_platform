import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { soundFX } from '../utils/audio';

const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const CATEGORIES = ['TCG Card', 'Fan Art', 'Battle Clip', 'General'];

export default function CreatePostModal({ isOpen, onClose, onUploadSuccess, token }) {
  const [caption, setCaption] = useState('');
  const [pokemonType, setPokemonType] = useState('Fire');
  const [category, setCategory] = useState('TCG Card');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an image to share!');
      return;
    }
    setLoading(true);
    soundFX.playClick();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('pokemon_type', pokemonType);
    formData.append('category', category);

    try {
      await onUploadSuccess(formData);
      soundFX.playCatch();
      onClose();
      setCaption('');
      setFile(null);
      setPreview('');
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check your network.');
    } finally {
      setLoading(false);
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
        maxWidth: '560px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>✨</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>Trainer Studio</h3>
          </div>
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            className="hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Drag and Drop Zone */}
          <div style={{
            border: '2px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            marginBottom: '20px',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '12px' }} />
            ) : (
              <div>
                <Upload size={36} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  Drop your Pokémon card or artwork here
                </p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              CAPTION / POKÉDEX NOTE
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Just pulled a Holographic Shadowless Charizard!"
              className="liquid-glass-input"
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          {/* Category & Type Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="liquid-glass-input"
                style={{ width: '100%', padding: '10px 14px', background: '#0b0f19' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                ELEMENTAL TYPE
              </label>
              <select
                value={pokemonType}
                onChange={(e) => setPokemonType(e.target.value)}
                className="liquid-glass-input"
                style={{ width: '100%', padding: '10px 14px', background: '#0b0f19' }}
              >
                {POKEMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '1rem' }}
          >
            {loading ? 'Transmitting to Feed...' : '⚡ Publish PokéPost'}
          </button>
        </form>
      </div>
    </div>
  );
}

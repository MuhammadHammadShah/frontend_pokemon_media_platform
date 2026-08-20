import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PokemonBackground from './components/PokemonBackground';
import StoriesBar from './components/StoriesBar';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import PokedexModal from './components/PokedexModal';
import TrainerPassport from './components/TrainerPassport';
import AuthModal from './components/AuthModal';
import TypeBadge from './components/TypeBadge';
import { TYPE_COLORS } from './utils/typeColors';
import { api } from './services/api';
import { soundFX } from './utils/audio';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('pokesocial_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'profile'

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPokedexModal, setShowPokedexModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Load User & Trainer Profile
  useEffect(() => {
    if (token) {
      api.getCurrentUser(token)
        .then(user => {
          setCurrentUser(user);
          return api.getTrainerProfile(token, user.id);
        })
        .then(setTrainerProfile)
        .catch(() => {
          localStorage.removeItem('pokesocial_token');
          setToken(null);
        });
    }
  }, [token]);

  // Load Feed
  const loadFeed = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.getFeed(token, {
        search,
        category: categoryFilter,
        pokemon_type: typeFilter
      });
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadFeed();
    }
  }, [token, categoryFilter, typeFilter, search]);

  const handleLogin = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('pokesocial_token', res.access_token);
    setToken(res.access_token);
  };

  const handleRegister = async (email, password) => {
    await api.register(email, password);
    await handleLogin(email, password);
  };

  const handleLogout = () => {
    localStorage.removeItem('pokesocial_token');
    setToken(null);
    setCurrentUser(null);
    setTrainerProfile(null);
  };

  const handleReact = async (postId, reactionType) => {
    try {
      await api.reactToPost(token, postId, reactionType);
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      await api.addComment(token, postId, content);
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(token, postId);
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const updated = await api.updateTrainerProfile(token, profileData);
      setTrainerProfile(prev => ({ ...prev, ...updated }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <>
        <PokemonBackground />
        <AuthModal onLogin={handleLogin} onRegister={handleRegister} />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px', position: 'relative' }}>
      <PokemonBackground />

      <Navbar
        currentUser={currentUser}
        trainerProfile={trainerProfile}
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenPokedex={() => setShowPokedexModal(true)}
        onTabChange={setActiveTab}
        activeTab={activeTab}
        onLogout={handleLogout}
      />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 1 }}>
        {activeTab === 'profile' ? (
          <TrainerPassport
            trainerProfile={trainerProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        ) : (
          <>
            {/* Featured Starters / Stories */}
            <StoriesBar onSelectPokemon={(name) => setSearch(name)} />

            {/* Apple Liquid Glass Filter Bar */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.52)',
                backdropFilter: 'blur(24px) saturate(190%)',
                WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '20px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                padding: '16px 20px',
                marginBottom: '22px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search Pokémon, cards, or trainers..."
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '10px 16px',
                    fontSize: '0.92rem',
                    background: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
                  }}
                />

                {/* Category Glass Pills */}
                {['All', 'TCG Card', 'Fan Art', 'Battle Clip', 'General'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { soundFX.playClick(); setCategoryFilter(cat); }}
                    style={{
                      background: categoryFilter === cat
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(12px)',
                      border: categoryFilter === cat
                        ? '1px solid #ef4444'
                        : '1px solid rgba(255, 255, 255, 0.14)',
                      color: 'white',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: categoryFilter === cat
                        ? '0 4px 14px rgba(239, 68, 68, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)'
                        : '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Elemental Types Horizontal Scroll */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                <button
                  onClick={() => { soundFX.playClick(); setTypeFilter('All'); }}
                  style={{
                    background: typeFilter === 'All' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                    color: typeFilter === 'All' ? '#0f172a' : '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  ALL TYPES
                </button>
                {Object.keys(TYPE_COLORS).map(type => (
                  <button
                    key={type}
                    onClick={() => { soundFX.playClick(); setTypeFilter(type); }}
                    style={{
                      background: typeFilter === type ? TYPE_COLORS[type].bg : 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(8px)',
                      color: typeFilter === type ? TYPE_COLORS[type].text : '#cbd5e1',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '5px 12px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: typeFilter === type ? `0 2px 10px ${TYPE_COLORS[type].bg}` : 'none'
                    }}
                  >
                    {TYPE_COLORS[type].icon} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Stream */}
            {loading ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                textAlign: 'center',
                padding: '50px 20px',
                color: '#94a3b8'
              }}>
                <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>⚡</div>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: '#f1f5f9' }}>Scanning Pokédex feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '50px 30px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '3rem' }}>🔴</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '12px', color: '#ffffff' }}>
                  No PokéPosts Found
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '8px 0 20px 0' }}>
                  Be the first trainer to share a card pull, battle clip, or fan artwork!
                </p>
                <button onClick={() => setShowUploadModal(true)} className="btn-primary">
                  Share First Capture
                </button>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                  onReact={handleReact}
                  onAddComment={handleAddComment}
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={async (formData) => {
          await api.uploadPost(token, formData);
          loadFeed();
        }}
        token={token}
      />

      <PokedexModal
        isOpen={showPokedexModal}
        onClose={() => setShowPokedexModal(false)}
      />
    </div>
  );
}

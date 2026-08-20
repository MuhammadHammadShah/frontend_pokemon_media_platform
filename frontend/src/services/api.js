const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getHeaders(token, isMultipart = false) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/jwt/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed. Check your credentials.');
    }
    return res.json();
  },

  async register(email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed.');
    }
    return res.json();
  },

  async getCurrentUser(token) {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  async getFeed(token, params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.pokemon_type && params.pokemon_type !== 'All') query.append('pokemon_type', params.pokemon_type);
    if (params.search) query.append('search', params.search);

    const url = `${API_BASE}/feed?${query.toString()}`;
    const res = await fetch(url, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch feed');
    return res.json();
  },

  async uploadPost(token, formData) {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(token, true),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async reactToPost(token, postId, reactionType) {
    const res = await fetch(`${API_BASE}/posts/${postId}/react`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ reaction_type: reactionType })
    });
    if (!res.ok) throw new Error('Failed to react');
    return res.json();
  },

  async addComment(token, postId, content) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  async deletePost(token, postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
  },

  async getTrainerProfile(token, userId) {
    const res = await fetch(`${API_BASE}/trainers/${userId}`, {
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch trainer profile');
    return res.json();
  },

  async updateTrainerProfile(token, profileData) {
    const res = await fetch(`${API_BASE}/trainers/me`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error('Failed to update trainer profile');
    return res.json();
  }
};

const POKE_CACHE = new Map();
let ALL_NAMES_CACHE = null;

export async function fetchAllPokemonNames() {
  if (ALL_NAMES_CACHE && ALL_NAMES_CACHE.length >= 1000) {
    return ALL_NAMES_CACHE;
  }
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    if (res.ok) {
      const data = await res.json();
      ALL_NAMES_CACHE = data.results.map((p, idx) => {
        const id = idx + 1;
        return {
          id: id,
          dexNumber: `#${String(id).padStart(4, '0')}`,
          name: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' '),
          rawName: p.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        };
      });
      return ALL_NAMES_CACHE;
    }
  } catch (err) {
    console.error('PokeAPI all names fetch error:', err);
  }

  // Fallback if network fails
  return Array.from({ length: 151 }, (_, i) => ({
    id: i + 1,
    dexNumber: `#${String(i + 1).padStart(4, '0')}`,
    name: `Pokemon #${i + 1}`,
    rawName: String(i + 1),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`,
    artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`
  }));
}

export async function fetchPokemonDetails(nameOrId) {
  if (!nameOrId) return null;
  const key = String(nameOrId).toLowerCase().trim().replace(/\s+/g, '-');
  if (POKE_CACHE.has(key)) return POKE_CACHE.get(key);

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    if (res.ok) {
      const data = await res.json();
      const types = data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
      const details = {
        id: data.id,
        dexNumber: `#${String(data.id).padStart(4, '0')}`,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1).replace(/-/g, ' '),
        height: (data.height / 10).toFixed(1),
        weight: (data.weight / 10).toFixed(1),
        types: types,
        type1: types[0] || 'Normal',
        type2: types[1] || null,
        officialArt: data.sprites?.other?.['official-artwork']?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
        animatedSprite: data.sprites?.other?.showdown?.front_default || data.sprites?.front_default,
        cryAudio: data.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
        stats: {
          hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 50,
          attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
          defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
          spAtk: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50,
          spDef: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 50,
          speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 50
        }
      };
      POKE_CACHE.set(key, details);
      POKE_CACHE.set(String(data.id), details);
      return details;
    }
  } catch (err) {
    console.error(`PokeAPI details error for ${nameOrId}:`, err);
  }
  return null;
}

export const pokeapi = {
  fetchAllPokemonNames,
  fetchPokemonDetails,
  getPokemonList: async (limit = 1025) => {
    const all = await fetchAllPokemonNames();
    return limit ? all.slice(0, limit) : all;
  },
  getPokemonDetails: fetchPokemonDetails
};

export default pokeapi;

const POKE_CACHE = new Map();
let ALL_NAMES_CACHE = null;

export async function fetchAllPokemonNames() {
  if (ALL_NAMES_CACHE) return ALL_NAMES_CACHE;
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    if (res.ok) {
      const data = await res.json();
      ALL_NAMES_CACHE = data.results.map((p, idx) => ({
        id: idx + 1,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        rawName: p.name
      }));
      return ALL_NAMES_CACHE;
    }
  } catch (err) {
    console.error('PokeAPI names fetch error:', err);
  }
  return [
    { id: 25, name: 'Pikachu', rawName: 'pikachu' },
    { id: 6, name: 'Charizard', rawName: 'charizard' },
    { id: 1, name: 'Bulbasaur', rawName: 'bulbasaur' },
    { id: 7, name: 'Squirtle', rawName: 'squirtle' },
    { id: 94, name: 'Gengar', rawName: 'gengar' },
    { id: 448, name: 'Lucario', rawName: 'lucario' },
    { id: 133, name: 'Eevee', rawName: 'eevee' },
    { id: 150, name: 'Mewtwo', rawName: 'mewtwo' }
  ];
}

export async function fetchPokemonDetails(nameOrId) {
  if (!nameOrId) return null;
  const key = String(nameOrId).toLowerCase().trim();
  if (POKE_CACHE.has(key)) return POKE_CACHE.get(key);

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    if (res.ok) {
      const data = await res.json();
      const types = data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
      const details = {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        height: data.height / 10,
        weight: data.weight / 10,
        types: types,
        type1: types[0] || 'Normal',
        type2: types[1] || null,
        officialArt: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default,
        animatedSprite: data.sprites?.other?.showdown?.front_default || data.sprites?.front_default,
        cryAudio: data.cries?.latest || null,
        stats: {
          hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 50,
          attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
          defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
          speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 50
        }
      };
      POKE_CACHE.set(key, details);
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
  getPokemonList: async (limit = 30) => {
    const all = await fetchAllPokemonNames();
    return all.slice(0, limit);
  },
  getPokemonDetails: fetchPokemonDetails
};

export default pokeapi;

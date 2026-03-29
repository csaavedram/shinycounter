export function getPokemonForGame(pokemons, game) {
  if (!game || !Array.isArray(game.dexRange) || game.dexRange.length !== 2) {
    return pokemons
  }

  const [minDex, maxDex] = game.dexRange
  return pokemons.filter((pokemon) => pokemon.id >= minDex && pokemon.id <= maxDex)
}

export function getShinySpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
}

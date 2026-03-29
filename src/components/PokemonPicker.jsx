import { useMemo, useState } from 'react'
import { getShinySpriteUrl } from '../utils/pokemon'

export function PokemonPicker({ label, pokemons, selectedId, onSelect }) {
  const hasSelection = selectedId !== null && selectedId !== undefined && selectedId !== ''
  const selectedPokemon = useMemo(
    () => (hasSelection ? pokemons.find((pokemon) => pokemon.id === Number(selectedId)) || null : null),
    [pokemons, selectedId, hasSelection],
  )
  const [query, setQuery] = useState(() => (selectedPokemon ? selectedPokemon.name : ''))
  const [open, setOpen] = useState(false)

  const filteredPokemons = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return pokemons

    return pokemons.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(term) ||
        String(pokemon.id).includes(term.replace('#', '')),
    )
  }, [pokemons, query])

  function pickPokemon(pokemon) {
    onSelect(pokemon.id)
    setQuery(pokemon.name)
    setOpen(false)
  }

  return (
    <div className="grid w-full gap-1 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <div className="relative w-full" onBlur={() => window.setTimeout(() => setOpen(false), 100)}>
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Type name or dex number"
          value={query}
        />

        {open && (
          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            {filteredPokemons.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">No Pokemon found.</p>
            ) : (
              <ul className="space-y-1">
                {filteredPokemons.map((pokemon) => (
                  <li key={pokemon.id}>
                    <button
                      className={[
                        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition',
                        pokemon.id === selectedPokemon?.id ? 'bg-amber-100' : 'hover:bg-slate-100',
                      ].join(' ')}
                      onClick={() => pickPokemon(pokemon)}
                      type="button"
                    >
                      <img
                        alt={`${pokemon.name} shiny sprite`}
                        className="h-10 w-10 rounded-lg bg-slate-900 p-1"
                        loading="lazy"
                        src={getShinySpriteUrl(pokemon.id)}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{pokemon.name}</p>
                        <p className="text-xs text-slate-500">#{String(pokemon.id).padStart(4, '0')}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <span className="text-xs text-slate-600">
        {filteredPokemons.length} available in current game
      </span>
    </div>
  )
}

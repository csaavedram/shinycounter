import { useMemo, useState } from 'react'
import { METHOD_LABELS } from '../data/games'
import { PokemonPicker } from './PokemonPicker'
import { getPokemonForGame, getShinySpriteUrl } from '../utils/pokemon'

function createDefaultModifiers(game, method) {
  return {
    shinyCharm: false,
    sparklingPower: 0,
    outbreak: method === 'outbreak',
    research: method === 'research' ? 'none' : 'none',
  }
}

function normalizeDraft(draft, games, pokemons) {
  const game = games.find((item) => item.id === draft.gameId) || games[0]
  const method = game.methods.includes(draft.method) ? draft.method : game.methods[0]
  const gamePokemons = getPokemonForGame(pokemons, game)
  const hasValidPokemonSelection = gamePokemons.some((pokemon) => pokemon.id === Number(draft.pokemonId))
  const pokemonId = hasValidPokemonSelection ? Number(draft.pokemonId) : null
  const modifiers = createDefaultModifiers(game, method)

  return {
    ...draft,
    gameId: game.id,
    pokemonId,
    method,
    modifiers: {
      ...modifiers,
      shinyCharm: game.mechanics.shinyCharm ? Boolean(draft.modifiers.shinyCharm) : false,
      sparklingPower: game.mechanics.sparklingPower
        ? Number(draft.modifiers.sparklingPower || 0)
        : 0,
      outbreak: method === 'outbreak' ? Boolean(draft.modifiers.outbreak) : false,
      research: method === 'research' ? draft.modifiers.research || 'none' : 'none',
    },
  }
}

export function HuntList({ games, pokemons, hunts, selectedHuntId, onSelect, onCreate, onDelete, onMissingPokemon }) {
  const [draft, setDraft] = useState(() => ({
    pokemonId: null,
    gameId: games[0]?.id ?? '',
    method: games[0]?.methods?.[0] ?? 'encounters',
    modifiers: {
      shinyCharm: false,
      sparklingPower: 0,
      outbreak: false,
      research: 'none',
    },
  }))

  const selectedGame = useMemo(
    () => games.find((game) => game.id === draft.gameId) || games[0],
    [games, draft.gameId],
  )
  const availablePokemons = useMemo(
    () => getPokemonForGame(pokemons, selectedGame),
    [pokemons, selectedGame],
  )
  const gameNameById = useMemo(
    () => Object.fromEntries(games.map((game) => [game.id, game.name])),
    [games],
  )

  function patchDraft(next) {
    setDraft((current) => normalizeDraft({ ...current, ...next }, games, pokemons))
  }

  function patchModifier(key, value) {
    setDraft((current) => normalizeDraft({ ...current, modifiers: { ...current.modifiers, [key]: value } }, games, pokemons))
  }

  function createHunt(event) {
    event.preventDefault()

    if (!draft.pokemonId) {
      onMissingPokemon()
      return
    }

    const pokemon = pokemons.find((item) => item.id === Number(draft.pokemonId))
    if (!pokemon) return

    onCreate({
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      gameId: draft.gameId,
      method: draft.method,
      modifiers: {
        shinyCharm: Boolean(draft.modifiers.shinyCharm),
        sparklingPower: Number(draft.modifiers.sparklingPower || 0),
        outbreak: Boolean(draft.modifiers.outbreak),
        research: draft.modifiers.research || 'none',
      },
    })
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr]">
      <article className="rounded-3xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:p-5">
        <h2 className="font-display text-2xl text-slate-900 sm:text-3xl">New Hunt</h2>
        <form className="mt-4 grid gap-3" onSubmit={createHunt}>
          <PokemonPicker
            key={`${selectedGame.id}-${draft.pokemonId}`}
            label="Pokemon"
            onSelect={(pokemonId) => patchDraft({ pokemonId })}
            pokemons={availablePokemons}
            selectedId={draft.pokemonId}
          />

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Game
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={draft.gameId}
              onChange={(event) => patchDraft({ gameId: event.target.value })}
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Method
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={draft.method}
              onChange={(event) => patchDraft({ method: event.target.value })}
            >
              {selectedGame.methods.map((method) => (
                <option key={method} value={method}>
                  {METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </label>

          {selectedGame.mechanics.shinyCharm && (
            <label className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                checked={draft.modifiers.shinyCharm}
                onChange={(event) => patchModifier('shinyCharm', event.target.checked)}
                type="checkbox"
              />
              Shiny Charm
            </label>
          )}

          {selectedGame.mechanics.sparklingPower && (
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Sparkling Power
              <select
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={draft.modifiers.sparklingPower}
                onChange={(event) => patchModifier('sparklingPower', Number(event.target.value))}
              >
                <option value={0}>None</option>
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
              </select>
            </label>
          )}

          {selectedGame.mechanics.outbreak && draft.method === 'outbreak' && (
            <label className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                checked={draft.modifiers.outbreak}
                onChange={(event) => patchModifier('outbreak', event.target.checked)}
                type="checkbox"
              />
              Outbreak bonus active
            </label>
          )}

          {selectedGame.mechanics.research && draft.method === 'research' && (
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Research
              <select
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={draft.modifiers.research}
                onChange={(event) => patchModifier('research', event.target.value)}
              >
                <option value="none">None</option>
                <option value="level10">Research Level 10</option>
                <option value="perfect">Perfect Research</option>
              </select>
            </label>
          )}

          <button className="mt-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 sm:text-base" type="submit">
            Start Hunt
          </button>
        </form>
      </article>

      <article className="rounded-3xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:p-5">
        <h2 className="font-display text-2xl text-slate-900 sm:text-3xl">Active Hunts</h2>
        {hunts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 sm:text-base">No active hunts yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:gap-3 md:grid-cols-2">
            {hunts.map((hunt) => (
              <li
                className={[
                  'grid gap-2 rounded-2xl border p-2 transition sm:p-3 md:grid-cols-[64px_1fr_auto]',
                  hunt.id === selectedHuntId
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 bg-slate-50/90 hover:border-slate-300',
                ].join(' ')}
                key={hunt.id}
              >
                <img
                  alt={`${hunt.pokemonName} shiny sprite`}
                  className="h-12 w-12 justify-self-center rounded-xl bg-slate-900/90 p-1 sm:h-14 sm:w-14"
                  loading="lazy"
                  src={getShinySpriteUrl(hunt.pokemonId)}
                />
                <button
                  className="text-left"
                  onClick={() => onSelect(hunt.id)}
                  type="button"
                >
                  <p className="text-sm font-semibold text-slate-900 sm:text-base">{hunt.pokemonName}</p>
                  <p className="text-xs text-slate-500">{gameNameById[hunt.gameId] || hunt.gameId}</p>
                  <p className="text-xs text-slate-600 sm:text-sm">{hunt.count.toLocaleString()} encounters</p>
                  <p className="text-xs text-slate-500">{METHOD_LABELS[hunt.method]}</p>
                </button>
                <button
                  className="rounded-xl border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 sm:px-3 sm:text-sm"
                  onClick={() => onDelete(hunt.id)}
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

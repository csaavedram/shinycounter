import { useMemo, useState } from 'react'
import { METHOD_LABELS } from '../data/games'
import { PokemonPicker } from './PokemonPicker'
import { getPokemonForGame } from '../utils/pokemon'
import { parseDurationToMs } from '../utils/time'

function ModalFrame({ open, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:p-6">
        <h3 className="font-display text-2xl text-slate-900 sm:text-3xl">{title}</h3>
        <div className="mt-3 sm:mt-4">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  return (
    <ModalFrame open={open} title={title}>
      <p className="text-sm text-slate-600 sm:text-base">{message}</p>
      <div className="mt-4 flex justify-end gap-2 sm:mt-6 sm:gap-3">
        <button className="rounded-xl border border-slate-300 px-3 py-1 text-sm font-medium sm:px-4 sm:py-2" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="rounded-xl bg-red-600 px-3 py-1 text-sm font-semibold text-white sm:px-4 sm:py-2"
          onClick={onConfirm}
          type="button"
        >
          Confirm
        </button>
      </div>
    </ModalFrame>
  )
}

export function AlertModal({ open, title, message, onClose }) {
  return (
    <ModalFrame open={open} title={title}>
      <p className="text-sm text-slate-600 sm:text-base">{message}</p>
      <div className="mt-4 flex justify-end sm:mt-6">
        <button className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-semibold text-white sm:px-4 sm:py-2" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </ModalFrame>
  )
}

export function CelebrationModal({ open, capture, onClose }) {
  return (
    <ModalFrame open={open} title="🎉 Congratulations!">
      {capture && (
        <div className="space-y-1 text-sm text-slate-700 sm:space-y-2 sm:text-base">
          <p className="text-base font-semibold text-slate-900 sm:text-xl">{capture.pokemonName} is shiny!</p>
          <p>Encounters: {capture.encounters.toLocaleString()}</p>
          <p>Total time: {capture.totalTime}</p>
        </div>
      )}
      <div className="mt-4 flex justify-end sm:mt-6">
        <button className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-semibold text-white sm:px-4 sm:py-2" onClick={onClose} type="button">
          Close
        </button>
      </div>
    </ModalFrame>
  )
}

function getGame(gameId, games) {
  return games.find((game) => game.id === gameId) || games[0]
}

export function ManualCaptureModal({ open, pokemons, games, onSubmit, onClose, onMissingPokemon }) {
  const [timeError, setTimeError] = useState('')
  const [form, setForm] = useState(() => ({
    pokemonId: null,
    gameId: games[0]?.id ?? '',
    method: games[0]?.methods?.[0] ?? 'encounters',
    encounters: 1,
    time: '00:00:00',
    date: new Date().toISOString().slice(0, 16),
    shinyCharm: false,
  }))

  const selectedGame = useMemo(() => getGame(form.gameId, games), [form.gameId, games])
  const availablePokemons = useMemo(
    () => getPokemonForGame(pokemons, selectedGame),
    [pokemons, selectedGame],
  )

  function patchForm(next) {
    setForm((current) => {
      const merged = { ...current, ...next }
      const game = getGame(merged.gameId, games)

      if (!game.methods.includes(merged.method)) {
        merged.method = game.methods[0]
      }

      const gamePokemons = getPokemonForGame(pokemons, game)
      if (!gamePokemons.some((pokemon) => pokemon.id === Number(merged.pokemonId))) {
        merged.pokemonId = null
      }

      return merged
    })
  }

  function submitManualCapture(event) {
    event.preventDefault()

    if (!form.pokemonId) {
      onMissingPokemon()
      return
    }

    const totalMs = parseDurationToMs(form.time)
    if (totalMs == null) {
      setTimeError('Time must use HH:mm:ss format')
      return
    }

    setTimeError('')

    onSubmit({
      pokemonId: Number(form.pokemonId),
      gameId: form.gameId,
      method: form.method,
      encounters: Math.max(1, Number(form.encounters) || 1),
      totalMs,
      date: new Date(form.date).toISOString(),
      shinyCharm: Boolean(form.shinyCharm),
    })

    onClose()
  }

  return (
    <ModalFrame open={open} title="Add Capture Manually">
      <form className="grid gap-3" onSubmit={submitManualCapture}>
        <PokemonPicker
          key={`${selectedGame.id}-${form.pokemonId}`}
          label="Pokemon"
          onSelect={(pokemonId) => patchForm({ pokemonId })}
          pokemons={availablePokemons}
          selectedId={form.pokemonId}
        />

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Game
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={form.gameId}
            onChange={(event) => patchForm({ gameId: event.target.value })}
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
            value={form.method}
            onChange={(event) => patchForm({ method: event.target.value })}
          >
            {selectedGame.methods.map((method) => (
              <option key={method} value={method}>
                {METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Encounters
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            min="1"
            type="number"
            value={form.encounters}
            onChange={(event) => patchForm({ encounters: event.target.value })}
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Time (HH:mm:ss)
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={form.time}
            onChange={(event) => {
              setTimeError('')
              patchForm({ time: event.target.value })
            }}
          />
          {timeError && <span className="text-xs font-medium text-red-600">{timeError}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Date
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            type="datetime-local"
            value={form.date}
            onChange={(event) => patchForm({ date: event.target.value })}
          />
        </label>

        <label className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            checked={form.shinyCharm}
            onChange={(event) => patchForm({ shinyCharm: event.target.checked })}
            type="checkbox"
          />
          Used Shiny Charm
        </label>

        <div className="mt-3 flex justify-end gap-2 sm:mt-4 sm:gap-3">
          <button className="rounded-xl border border-slate-300 px-3 py-1 text-sm font-medium sm:px-4 sm:py-2" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-semibold text-white sm:px-4 sm:py-2" type="submit">
            Save Capture
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

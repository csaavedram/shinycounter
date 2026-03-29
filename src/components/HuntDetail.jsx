import { useCallback, useEffect, useMemo, useState } from 'react'
import { METHOD_LABELS } from '../data/games'
import { getShinySpriteUrl } from '../utils/pokemon'
import { getCumulativeProbability } from '../utils/probability'
import { formatDuration } from '../utils/time'

function canUseSpaceKey(target) {
  const tagName = target?.tagName?.toLowerCase()
  return !['input', 'textarea', 'select', 'button'].includes(tagName)
}

export function HuntDetail({ hunt, game, onPatch, onReset, onMarkFound }) {
  const [now, setNow] = useState(hunt.startTime)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const increment = useCallback(
    (amount) => {
      onPatch(hunt.id, {
        count: Math.max(0, hunt.count + amount),
      })
    },
    [hunt.id, hunt.count, onPatch],
  )

  useEffect(() => {
    function onKeyDown(event) {
      if (event.code !== 'Space') return
      if (!canUseSpaceKey(event.target)) return
      event.preventDefault()
      increment(1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [increment])

  const timer = formatDuration(now - hunt.startTime)
  const probability = useMemo(
    () => getCumulativeProbability(hunt.count, game, hunt),
    [hunt, game],
  )

  return (
    <article className="rounded-3xl bg-white/95 p-6 shadow-xl ring-1 ring-slate-200 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-4">
          <img
            alt={`${hunt.pokemonName} shiny sprite`}
            className="h-20 w-20 rounded-2xl bg-slate-950 p-2"
            src={getShinySpriteUrl(hunt.pokemonId)}
          />
          <div>
            <h2 className="font-display text-4xl text-slate-900">{hunt.pokemonName}</h2>
            <p className="text-slate-600">{game.name} · {METHOD_LABELS[hunt.method]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => setShowStats((current) => !current)}
            type="button"
          >
            {showStats ? 'Hide Hunt Stats' : 'Show Hunt Stats'}
          </button>
          <button
            className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
            onClick={() => onReset(hunt.id)}
            type="button"
          >
            Reset Counter
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-6 py-8 text-center text-amber-200 shadow-inner">
        <p className="font-display text-7xl tracking-wide md:text-8xl">{hunt.count.toLocaleString()}</p>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-amber-100/80">Encounters</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            className="rounded-2xl border border-amber-300/50 px-4 py-2 text-xl font-bold"
            onClick={() => increment(-1)}
            type="button"
          >
            -1
          </button>
          <button
            className="rounded-2xl bg-amber-300 px-8 py-3 text-2xl font-extrabold text-slate-950"
            onClick={() => increment(1)}
            type="button"
          >
            +1
          </button>
        </div>
        <p className="mt-3 text-xs text-amber-100/70">Press SPACE to increment quickly</p>
      </div>

      {showStats && (
        <div className="mt-4 grid gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Timer</p>
            <p className="font-mono text-xl text-slate-900">{timer}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rolls</p>
            <p className="font-mono text-xl text-slate-900">{probability.rolls} / {probability.denominator}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current odds</p>
            <p className="font-mono text-xl text-slate-900">1 / {probability.odds.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cumulative probability</p>
            <p className="font-mono text-xl text-slate-900">{(probability.chance * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}

      <button
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-4 py-3 text-lg font-bold text-emerald-950"
        onClick={() => onMarkFound(hunt.id)}
        type="button"
      >
        Mark as Shiny Found
      </button>
    </article>
  )
}

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
    <article className="rounded-3xl bg-white/95 p-4 shadow-xl ring-1 ring-slate-200 backdrop-blur md:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start md:gap-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            alt={`${hunt.pokemonName} shiny sprite`}
            className="h-16 w-16 rounded-2xl bg-slate-950 p-2 sm:h-20 sm:w-20"
            src={getShinySpriteUrl(hunt.pokemonId)}
          />
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-slate-900 sm:text-3xl md:text-4xl">{hunt.pokemonName}</h2>
            <p className="truncate text-xs text-slate-600 sm:text-sm">{game.name} · {METHOD_LABELS[hunt.method]}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button
            className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 sm:px-4 sm:py-2 sm:text-sm"
            onClick={() => setShowStats((current) => !current)}
            type="button"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            className="rounded-xl border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 sm:px-4 sm:py-2 sm:text-sm"
            onClick={() => onReset(hunt.id)}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-6 text-center text-amber-200 shadow-inner sm:mt-6 sm:px-6 sm:py-8 md:mt-8">
        <p className="font-display text-4xl tracking-wide sm:text-5xl md:text-7xl lg:text-8xl">{hunt.count.toLocaleString()}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-amber-100/80 sm:mt-2">Encounters</p>
        <div className="mt-4 flex items-center justify-center gap-2 sm:mt-6 sm:gap-3">
          <button
            className="rounded-2xl border border-amber-300/50 px-3 py-1 text-lg font-bold sm:px-4 sm:py-2 md:text-xl"
            onClick={() => increment(-1)}
            type="button"
          >
            -1
          </button>
          <button
            className="rounded-2xl bg-amber-300 px-6 py-2 text-xl font-extrabold text-slate-950 sm:px-8 sm:py-3 md:text-2xl"
            onClick={() => increment(1)}
            type="button"
          >
            +1
          </button>
        </div>
        <p className="mt-2 text-xs text-amber-100/70 sm:mt-3">Press SPACE to increment quickly</p>
      </div>

      {showStats && (
        <div className="mt-3 grid gap-3 rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:mt-4 sm:p-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Timer</p>
            <p className="font-mono text-lg text-slate-900 sm:text-xl">{timer}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rolls</p>
            <p className="font-mono text-lg text-slate-900 sm:text-xl">{probability.rolls} / {probability.denominator}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current odds</p>
            <p className="font-mono text-lg text-slate-900 sm:text-xl">1 / {probability.odds.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cumulative probability</p>
            <p className="font-mono text-lg text-slate-900 sm:text-xl">{(probability.chance * 100).toFixed(2)}%</p>
          </div>
        </div>
      )}

      <button
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-4 py-2 text-base font-bold text-emerald-950 sm:mt-6 sm:py-3 md:text-lg"
        onClick={() => onMarkFound(hunt.id)}
        type="button"
      >
        Mark as Shiny Found
      </button>
    </article>
  )
}

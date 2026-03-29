import { METHOD_LABELS } from '../data/games'
import { getShinySpriteUrl } from '../utils/pokemon'
import { formatDate } from '../utils/time'

export function Captures({ captures, onAddManual, onDeleteCapture }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
        <h2 className="font-display text-2xl text-slate-900 sm:text-3xl md:text-4xl">Captures</h2>
        <button
          className="w-full rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 sm:w-auto"
          onClick={onAddManual}
          type="button"
        >
          Add Capture
        </button>
      </div>

      {captures.length === 0 ? (
        <article className="rounded-3xl bg-white/90 p-6 text-center text-sm text-slate-500 shadow-xl ring-1 ring-slate-200 sm:p-8">
          No captures yet. Good luck on your next hunt.
        </article>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {captures.map((capture) => (
            <article
              className="rounded-3xl bg-white/90 p-3 shadow-xl ring-1 ring-slate-200 sm:p-4"
              key={`${capture.pokemonId}-${capture.date}-${capture.encounters}`}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <img
                    alt={`${capture.pokemonName} shiny sprite`}
                    className="h-16 w-16 flex-shrink-0 rounded-xl bg-slate-950 p-1 sm:h-20 sm:w-20"
                    loading="lazy"
                    src={getShinySpriteUrl(capture.pokemonId)}
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg text-slate-900 sm:text-2xl truncate">{capture.pokemonName}</p>
                    <p className="text-xs text-slate-500 sm:text-sm truncate">{capture.gameName}</p>
                  </div>
                </div>
                <button
                  className="flex-shrink-0 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 sm:px-3"
                  onClick={() => onDeleteCapture(capture)}
                  type="button"
                >
                  Delete
                </button>
              </div>

              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs sm:mt-3 sm:gap-y-2 sm:text-sm">
                <dt className="text-slate-500">Method</dt>
                <dd className="text-right font-semibold text-slate-900">{METHOD_LABELS[capture.method] || capture.method}</dd>
                <dt className="text-slate-500">Encounters</dt>
                <dd className="text-right font-semibold text-slate-900">{capture.encounters.toLocaleString()}</dd>
                <dt className="text-slate-500">Total time</dt>
                <dd className="text-right font-semibold text-slate-900">{capture.totalTime}</dd>
                <dt className="text-slate-500">Date</dt>
                <dd className="text-right font-semibold text-slate-900">{formatDate(capture.date)}</dd>
                <dt className="text-slate-500">Shiny Charm</dt>
                <dd className="text-right font-semibold text-slate-900">
                  {capture.modifiers?.shinyCharm ? 'Yes' : 'No'}
                </dd>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

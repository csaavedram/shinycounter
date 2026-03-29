import { METHOD_LABELS } from '../data/games'
import { getShinySpriteUrl } from '../utils/pokemon'
import { formatDate } from '../utils/time'

export function Captures({ captures, onAddManual, onDeleteCapture }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-4xl text-slate-900">Captures</h2>
        <button
          className="rounded-xl bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-600"
          onClick={onAddManual}
          type="button"
        >
          Add Capture Manually
        </button>
      </div>

      {captures.length === 0 ? (
        <article className="rounded-3xl bg-white/90 p-8 text-center text-slate-500 shadow-xl ring-1 ring-slate-200">
          No captures yet. Good luck on your next hunt.
        </article>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {captures.map((capture) => (
            <article
              className="rounded-3xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-200"
              key={`${capture.pokemonId}-${capture.date}-${capture.encounters}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    alt={`${capture.pokemonName} shiny sprite`}
                    className="h-20 w-20 rounded-xl bg-slate-950 p-1"
                    loading="lazy"
                    src={getShinySpriteUrl(capture.pokemonId)}
                  />
                  <div>
                    <p className="font-display text-2xl text-slate-900">{capture.pokemonName}</p>
                    <p className="text-sm text-slate-500">{capture.gameName}</p>
                  </div>
                </div>
                <button
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => onDeleteCapture(capture)}
                  type="button"
                >
                  Delete
                </button>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
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

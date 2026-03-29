import { useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Captures } from './components/Captures'
import { HuntDetail } from './components/HuntDetail'
import { HuntList } from './components/HuntList'
import { AlertModal, CelebrationModal, ConfirmModal, ManualCaptureModal } from './components/Modals'
import { Navigation } from './components/Navigation'
import { GAMES } from './data/games'
import pokemon from './data/pokemon.json'
import { getEffectiveRate } from './utils/probability'
import { exportStorage, importStorage, loadStorage, saveStorage } from './utils/storage'
import { formatDuration } from './utils/time'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`
}

function mergeGamesWithDefaults(storedGames) {
  const knownIds = new Set(GAMES.map((game) => game.id))
  const customGames = (storedGames || []).filter((game) => !knownIds.has(game.id))
  return [...GAMES, ...customGames]
}

function App() {
  const [data, setData] = useState(() => {
    const loaded = loadStorage(GAMES)
    return {
      ...loaded,
      games: mergeGamesWithDefaults(loaded.games),
    }
  })
  const [selectedHuntId, setSelectedHuntId] = useState(() => data.hunts[0]?.id ?? null)
  const [resetTarget, setResetTarget] = useState(null)
  const [showManualCapture, setShowManualCapture] = useState(false)
  const [celebrationCapture, setCelebrationCapture] = useState(null)
  const [captureDeleteTarget, setCaptureDeleteTarget] = useState(null)
  const [importCandidate, setImportCandidate] = useState(null)
  const [showStorageInfo, setShowStorageInfo] = useState(false)
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '' })
  const importInputRef = useRef(null)

  useEffect(() => {
    saveStorage(data)
  }, [data])

  const activeHuntId = useMemo(() => {
    const found = data.hunts.some((hunt) => hunt.id === selectedHuntId)
    if (found) return selectedHuntId
    return data.hunts[0]?.id ?? null
  }, [data.hunts, selectedHuntId])

  const selectedHunt = useMemo(
    () => data.hunts.find((hunt) => hunt.id === activeHuntId) || null,
    [data.hunts, activeHuntId],
  )

  const selectedGame = useMemo(() => {
    if (!selectedHunt) return null
    return data.games.find((game) => game.id === selectedHunt.gameId) || null
  }, [data.games, selectedHunt])

  function addHunt(payload) {
    const now = Date.now()
    const newHunt = {
      id: createId(),
      pokemonId: payload.pokemonId,
      pokemonName: payload.pokemonName,
      gameId: payload.gameId,
      method: payload.method,
      count: 0,
      startTime: now,
      modifiers: payload.modifiers,
    }

    setData((current) => ({ ...current, hunts: [newHunt, ...current.hunts] }))
    setSelectedHuntId(newHunt.id)
  }

  function showMissingPokemonModal() {
    setAlertModal({
      open: true,
      title: 'Pokemon Not Selected',
      message: 'Please select a Pokemon before continuing.',
    })
  }

  function patchHunt(huntId, patch) {
    setData((current) => ({
      ...current,
      hunts: current.hunts.map((hunt) => (hunt.id === huntId ? { ...hunt, ...patch } : hunt)),
    }))
  }

  function deleteHunt(huntId) {
    setData((current) => ({
      ...current,
      hunts: current.hunts.filter((hunt) => hunt.id !== huntId),
    }))
  }

  function resetHuntCounter(huntId) {
    patchHunt(huntId, { count: 0, startTime: Date.now() })
  }

  function markAsFound(huntId) {
    const hunt = data.hunts.find((item) => item.id === huntId)
    if (!hunt) return

    const game = data.games.find((item) => item.id === hunt.gameId)
    if (!game) return

    const now = Date.now()
    const elapsed = now - hunt.startTime
    const effectiveRate = getEffectiveRate(game, hunt)

    const capture = {
      pokemonId: hunt.pokemonId,
      pokemonName: hunt.pokemonName,
      gameName: game.name,
      method: hunt.method,
      encounters: hunt.count,
      totalTime: formatDuration(elapsed),
      date: new Date(now).toISOString(),
      modifiers: hunt.modifiers,
      effectiveRate,
    }

    setData((current) => ({
      ...current,
      captures: [capture, ...current.captures],
      hunts: current.hunts.filter((item) => item.id !== huntId),
    }))

    setCelebrationCapture(capture)
  }

  function addManualCapture(payload) {
    const game = data.games.find((item) => item.id === payload.gameId)
    const entry = pokemon.find((item) => item.id === payload.pokemonId)
    if (!game || !entry) return

    const capture = {
      pokemonId: entry.id,
      pokemonName: entry.name,
      gameName: game.name,
      method: payload.method,
      encounters: payload.encounters,
      totalTime: formatDuration(payload.totalMs),
      date: payload.date,
      modifiers: {
        shinyCharm: payload.shinyCharm,
      },
      effectiveRate: null,
    }

    setData((current) => ({
      ...current,
      captures: [capture, ...current.captures],
    }))
  }

  function deleteCapture(targetCapture) {
    setCaptureDeleteTarget(targetCapture)
  }

  function confirmDeleteCapture() {
    if (!captureDeleteTarget) return

    setData((current) => ({
      ...current,
      captures: current.captures.filter(
        (capture) =>
          !(
            capture.pokemonId === captureDeleteTarget.pokemonId &&
            capture.date === captureDeleteTarget.date &&
            capture.encounters === captureDeleteTarget.encounters
          ),
      ),
    }))

    setCaptureDeleteTarget(null)
  }

  function onImportChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    importStorage(file, {
      onInvalidData: () => {
        setAlertModal({
          open: true,
          title: 'Import Failed',
          message: 'Invalid file format. Expected { games: [], hunts: [], captures: [] }.',
        })
      },
      onValidData: (nextData) => {
        setImportCandidate(nextData)
      },
    })

    event.target.value = ''
  }

  return (
    <div className="min-h-screen bg-page px-3 py-4 text-slate-800 sm:px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-col justify-between gap-3 rounded-[2rem] bg-white/85 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:mb-6 sm:flex-row sm:items-center sm:gap-4 sm:p-4 md:p-6">
          <div className="min-w-0">
            <h1 className="font-display text-2xl tracking-wide text-slate-950 sm:text-4xl md:text-6xl">Shiny Hunter Counter</h1>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm md:text-base">Your shiny grind partner.</p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-1 rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-200 sm:justify-end sm:gap-2 sm:p-2">
            <Navigation />
            <button
              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-amber-400 px-2 text-xs font-semibold text-slate-900 hover:bg-amber-300 sm:h-10 sm:gap-2 sm:px-3 sm:text-sm"
              onClick={() => setShowStorageInfo(true)}
              title="Save data to JSON"
              type="button"
            >
              <svg aria-hidden="true" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.414A2 2 0 0 0 17.414 6l-3.414-3.414A2 2 0 0 0 12.586 2H4zm5 1h2v4h3l-4 4-4-4h3V4z" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 sm:h-10 sm:gap-2 sm:px-3 sm:text-sm"
              onClick={() => importInputRef.current?.click()}
              title="Load data from JSON"
              type="button"
            >
              <svg aria-hidden="true" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.414A2 2 0 0 0 17.414 6l-3.414-3.414A2 2 0 0 0 12.586 2H4zm6 2 4 4h-3v3H9V9H6l4-4z" />
              </svg>
              <span className="hidden sm:inline">Load</span>
            </button>
            <input
              accept="application/json"
              className="hidden"
              onChange={onImportChange}
              ref={importInputRef}
              type="file"
            />
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-5 animate-rise">
                <HuntList
                  games={data.games}
                  hunts={data.hunts}
                  onCreate={addHunt}
                  onDelete={deleteHunt}
                  onMissingPokemon={showMissingPokemonModal}
                  onSelect={setSelectedHuntId}
                  pokemons={pokemon}
                  selectedHuntId={activeHuntId}
                />
                {selectedHunt && selectedGame ? (
                  <HuntDetail
                    game={selectedGame}
                    hunt={selectedHunt}
                    onMarkFound={markAsFound}
                    onPatch={patchHunt}
                    onReset={setResetTarget}
                  />
                ) : (
                  <article className="rounded-3xl bg-white/85 p-8 text-center text-slate-500 shadow-xl ring-1 ring-violet-200/70">
                    Choose a hunt to start counting.
                  </article>
                )}
              </div>
            }
          />

          <Route
            path="/captures"
            element={<div className="animate-rise"><Captures captures={data.captures} onAddManual={() => setShowManualCapture(true)} onDeleteCapture={deleteCapture} /></div>}
          />
        </Routes>

        <footer className="mt-6 rounded-3xl bg-slate-950/95 p-3 text-xs text-slate-300 ring-1 ring-slate-700 sm:mt-8 sm:p-4 sm:text-sm">
          This is a fan-made project and is not affiliated with Nintendo, Game Freak, or The Pokemon Company. Pokemon is a trademark of its respective owners. Data and sprites from PokeAPI. 
          Made by <a className="text-blue-400 hover:text-blue-300" href="https://github.com/csaavedram" target="_blank" rel="noopener noreferrer">
            csaavedram
          </a>
        </footer>
      </div>

      <ConfirmModal
        message="This will reset your encounter count to 0."
        onCancel={() => setResetTarget(null)}
        onConfirm={() => {
          if (resetTarget) {
            resetHuntCounter(resetTarget)
          }
          setResetTarget(null)
        }}
        open={Boolean(resetTarget)}
        title="Reset Counter"
      />

      <ConfirmModal
        message={captureDeleteTarget ? `Delete capture for ${captureDeleteTarget.pokemonName}?` : ''}
        onCancel={() => setCaptureDeleteTarget(null)}
        onConfirm={confirmDeleteCapture}
        open={Boolean(captureDeleteTarget)}
        title="Delete Capture"
      />

      <ConfirmModal
        message="This will overwrite your current data with the imported file. Your current hunts and captures will be replaced and cannot be recovered unless you have another backup. Continue?"
        onCancel={() => setImportCandidate(null)}
        onConfirm={() => {
          if (!importCandidate) return
          const normalized = {
            ...importCandidate,
            games: mergeGamesWithDefaults(importCandidate.games),
          }
          setData(normalized)
          setSelectedHuntId(importCandidate.hunts[0]?.id ?? null)
          setImportCandidate(null)
        }}
        open={Boolean(importCandidate)}
        title="⚠️ Overwrite Data?"
      />

      <AlertModal
        message={alertModal.message}
        onClose={() => setAlertModal({ open: false, title: '', message: '' })}
        open={alertModal.open}
        title={alertModal.title}
      />

      <CelebrationModal
        capture={celebrationCapture}
        onClose={() => setCelebrationCapture(null)}
        open={Boolean(celebrationCapture)}
      />

      <ManualCaptureModal
        games={data.games}
        onClose={() => setShowManualCapture(false)}
        onMissingPokemon={showMissingPokemonModal}
        onSubmit={addManualCapture}
        open={showManualCapture}
        pokemons={pokemon}
      />

      {showStorageInfo && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:p-6">
            <h3 className="font-display text-2xl text-slate-900 sm:text-3xl">Data Storage Information</h3>
            <div className="mt-3 space-y-3 text-sm text-slate-700 sm:mt-4 sm:text-base">
              <div>
                <p className="font-semibold text-slate-900">Automatic Storage</p>
                <p className="mt-1">Your hunt data is automatically saved to browser localStorage. Changes sync instantly.</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-200">
                <p className="font-semibold text-amber-950">⚠️ Important Warning</p>
                <p className="mt-1 text-amber-900">localStorage data can be lost if you:</p>
                <ul className="mt-1 ml-4 list-disc space-y-1 text-amber-900">
                  <li>Clear your browser cache</li>
                  <li>Clear cookies and site data</li>
                  <li>Use private/incognito browsing mode</li>
                  <li>Reinstall the browser</li>
                  <li>Reach storage limit</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Backup Your Data</p>
                <p className="mt-1">Click the <span className="font-mono font-semibold">Save</span> button regularly to download a JSON backup file that you can safely store and restore later.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Restore from Backup</p>
                <p className="mt-1">Use the <span className="font-mono font-semibold">Load</span> button to import a previously saved JSON file.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
              <button
                className="flex-1 rounded-xl bg-sky-700 px-3 py-2 text-sm font-semibold text-white sm:px-4"
                onClick={() => {
                  exportStorage(data)
                  setShowStorageInfo(false)
                }}
                type="button"
              >
                Save Backup Now
              </button>
              <button
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium sm:px-4"
                onClick={() => setShowStorageInfo(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

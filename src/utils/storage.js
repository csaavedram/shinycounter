const STORAGE_KEY = 'shiny-counter-data-v1'

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function validateDataShape(data) {
  if (!data || typeof data !== 'object') {
    return false
  }

  if (!Array.isArray(data.games) || !Array.isArray(data.hunts) || !Array.isArray(data.captures)) {
    return false
  }

  return true
}

export function loadStorage(defaultGames) {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return {
      games: defaultGames,
      hunts: [],
      captures: [],
    }
  }

  const parsed = safeJsonParse(raw, null)

  if (!validateDataShape(parsed)) {
    return {
      games: defaultGames,
      hunts: [],
      captures: [],
    }
  }

  return {
    games: parsed.games.length ? parsed.games : defaultGames,
    hunts: parsed.hunts,
    captures: parsed.captures,
  }
}

export function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportStorage(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'shiny-counter-data.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function importStorage(file, { onValidData, onInvalidData }) {
  const reader = new FileReader()

  reader.onload = () => {
    const parsed = safeJsonParse(reader.result, null)

    if (!validateDataShape(parsed)) {
      onInvalidData()
      return
    }

    onValidData(parsed)
  }

  reader.readAsText(file)
}

export function formatDuration(totalMs) {
  const safeMs = Math.max(0, totalMs)
  const totalSeconds = Math.floor(safeMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function parseDurationToMs(value) {
  const [hours, minutes, seconds] = String(value || '')
    .split(':')
    .map((part) => Number(part))

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    hours < 0 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null
  }

  return ((hours * 60 + minutes) * 60 + seconds) * 1000
}

export function formatDate(value) {
  return new Date(value).toLocaleString()
}

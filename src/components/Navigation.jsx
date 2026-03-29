import { NavLink } from 'react-router-dom'

function navClassName({ isActive }) {
  return [
    'rounded-full px-2 py-1 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm',
    isActive
      ? 'bg-sky-700 text-white shadow-md shadow-sky-700/25'
      : 'bg-white text-slate-700 hover:bg-amber-100',
  ].join(' ')
}

export function Navigation() {
  return (
    <nav className="flex items-center gap-1 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200 sm:gap-2 sm:p-2">
      <NavLink className={navClassName} to="/">
        Hunts
      </NavLink>
      <NavLink className={navClassName} to="/captures">
        Captures
      </NavLink>
    </nav>
  )
}

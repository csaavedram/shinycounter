import { NavLink } from 'react-router-dom'

function navClassName({ isActive }) {
  return [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-sky-700 text-white shadow-md shadow-sky-700/25'
      : 'bg-white text-slate-700 hover:bg-amber-100',
  ].join(' ')
}

export function Navigation() {
  return (
    <nav className="flex items-center gap-2 rounded-full bg-slate-100 p-2 ring-1 ring-slate-200">
      <NavLink className={navClassName} to="/">
        Hunts
      </NavLink>
      <NavLink className={navClassName} to="/captures">
        Captures
      </NavLink>
    </nav>
  )
}

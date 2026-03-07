import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

// ── Iconos SVG ─────────────────────────────────────────────────────────────────

const IconHome   = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0h4m-4 0H7m10-6v8m0 0h2m-2 0h-2" /></svg>
const IconList   = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
const IconRepeat = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
const IconChart  = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>

// ── Items de navegación ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',   Icon: IconHome   },
  { href: '/expenses',  label: 'Gastos',      Icon: IconList   },
  { href: '/recurring', label: 'Recurrentes', Icon: IconRepeat },
  { href: '/analysis',  label: 'Análisis',    Icon: IconChart  },
] as const

// ── Navigation ─────────────────────────────────────────────────────────────────

export default function Navigation() {
  const { signOut }  = useAuth()
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* ── Navbar superior (solo móvil) ─────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-base-100 border-b border-base-200 flex items-center justify-between px-4">
        <span className="font-bold text-lg text-primary">Finanzly</span>
        <button
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="btn btn-ghost btn-sm btn-square"
        >
          <IconLogout />
        </button>
      </header>

      {/* ── Barra inferior (solo móvil) ──────────────────────────────────── */}
      <nav aria-label="Navegación principal" className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-base-100 border-t border-base-200 flex">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                active ? 'text-primary' : 'text-base-content/50 hover:text-base-content'
              }`}
            >
              <Icon />
              <span className="font-medium">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── Sidebar (solo desktop) ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-base-100 border-r border-base-200 z-40">
        <div className="px-6 py-6 shrink-0">
          <span className="font-bold text-2xl text-primary">Finanzly</span>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <Icon />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="px-3 pb-6 shrink-0">
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/70 hover:bg-error/10 hover:text-error transition-colors"
          >
            <IconLogout />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// ── AppLayout ──────────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navigation />
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  )
}

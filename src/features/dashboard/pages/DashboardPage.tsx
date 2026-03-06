import { Link }                from 'react-router-dom'
import { MonthSummaryCard }   from '../components/MonthSummaryCard'
import { CategoryDonutChart } from '../components/CategoryDonutChart'
import { MonthlyBarChart }    from '../components/MonthlyBarChart'
import { RecentExpensesList } from '../components/RecentExpensesList'

// ── Helper: saludo según hora del día ─────────────────────────────────────────

function greeting(): string {
  const hour = new Date().getHours()
  if (hour >= 6  && hour < 12) return 'Buenos días'
  if (hour >= 12 && hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto max-w-4xl px-4 py-6 pb-12 flex flex-col gap-6">

        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {greeting()}, Finanzly 👋
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Aquí está tu resumen financiero
            </p>
          </div>
          <Link to="/expenses/new" className="btn btn-primary btn-sm whitespace-nowrap">
            + Agregar gasto
          </Link>
        </div>

        {/* Resumen del mes — ancho completo */}
        <section aria-label="Resumen del mes">
          <MonthSummaryCard />
        </section>

        {/* Gráficas — 2 columnas en desktop, apiladas en móvil */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <section aria-label="Desglose por categoría">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-base">Por categoría</h2>
                <CategoryDonutChart />
              </div>
            </div>
          </section>

          <section aria-label="Tendencia mensual">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-base">Últimos 6 meses</h2>
                <MonthlyBarChart />
              </div>
            </div>
          </section>

        </div>

        {/* Gastos recientes — ancho completo */}
        <section aria-label="Gastos recientes">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-base">Gastos recientes</h2>
              <RecentExpensesList />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

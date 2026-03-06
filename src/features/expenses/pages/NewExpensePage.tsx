import { useNavigate } from 'react-router-dom'
import { ExpenseForm } from '../components/ExpenseForm'

// ── Componente ────────────────────────────────────────────────────────────────

export function NewExpensePage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto max-w-lg px-4 pt-6 pb-12">

      {/* Encabezado con botón de retroceso */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle"
          onClick={() => navigate('/expenses')}
          aria-label="Volver a Mis Gastos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Nuevo Gasto</h1>
      </div>

      <ExpenseForm
        onSuccess={() => navigate('/expenses')}
        onCancel={() => navigate('/expenses')}
      />

    </div>
  )
}
